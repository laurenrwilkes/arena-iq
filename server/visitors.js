// Visitors for the admin Visitors page, built from game_events. Only visitors
// with analytics consent have events, so only they appear.
//
// Each visitor's events are split into visits: a new visit starts after more
// than 30 minutes without activity. Per visit: length, the site sections they
// went to, the questions they did, whether they made an account during it, and
// whether they came back within 7 days of it.

const SESSION_GAP_MS = 30 * 60 * 1000;
const RETURN_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

const SECTIONS = {
  '/': 'Questions', '/index.html': 'Questions', '/play.html': 'Battle', '/games.html': 'Games',
  '/mentalmath.html': 'Mental Math', '/careers.html': 'Jobs', '/problems.html': 'Questions',
};

function sectionFor(path) {
  return SECTIONS[path] || path || 'Other';
}

function parseProps(raw) {
  try { return raw ? JSON.parse(raw) : {}; } catch (_) { return {}; }
}

function splitVisits(evs) {
  const visits = [];
  for (const e of evs) {
    const cur = visits[visits.length - 1];
    if (cur && e.t - cur[cur.length - 1].t <= SESSION_GAP_MS) cur.push(e);
    else visits.push([e]);
  }
  return visits;
}

function summarizeVisit(evs, titles) {
  // Where they went after landing: page sections (collapsing repeats) and
  // practice questions they opened.
  const clicks = [];
  let landing = null;
  for (const e of evs) {
    let label = null;
    if (e.event === 'page_view') {
      const section = sectionFor(e.props.path);
      if (landing === null) { landing = section; continue; }
      label = section;
    } else if (e.event === 'question_presented' && e.props.game === 'practice') {
      label = 'Question';
    }
    if (label && clicks[clicks.length - 1] !== label) clicks.push(label);
  }

  // Questions in the order seen, tagged with where they were asked (practice
  // page or a battle); 'correct' beats 'wrong' beats 'viewed'.
  const questions = new Map();
  for (const e of evs) {
    if (!e.question_id) continue;
    const source = e.props.game === 'battle' ? 'battle' : 'questions';
    const key = `${source}:${e.question_id}`;
    if (e.event === 'question_presented' && !questions.has(key)) questions.set(key, { id: e.question_id, source, status: 'viewed' });
    if (e.event === 'question_answered') {
      const q = questions.get(key) || { id: e.question_id, source, status: 'viewed' };
      q.status = e.props.correct || q.status === 'correct' ? 'correct' : 'wrong';
      questions.set(key, q);
    }
  }

  // Battles in the order started. Each ends as won / lost / draw, quit (left
  // the page mid-battle, with the phase they were in), or unknown (no end
  // event: still playing, or the browser closed without telling us).
  const battles = new Map();
  for (const e of evs) {
    const id = e.game_session_id || e.props.game_session_id;
    if (e.event === 'battle_started' && id) {
      battles.set(id, { result: 'unknown', opponent: e.props.opponent_type || null, difficulty: e.props.difficulty || null });
    } else if (e.event === 'battle_finished' && battles.has(id)) {
      Object.assign(battles.get(id), {
        result: e.props.is_draw ? 'draw' : e.props.won ? 'won' : 'lost',
        score: e.props.your_score ?? null, opponentScore: e.props.opponent_score ?? null,
        decidedBySpeed: !!e.props.decided_by_speed,
        seconds: Number.isFinite(e.props.duration_ms) ? Math.round(e.props.duration_ms / 1000) : null,
      });
    } else if (e.event === 'game_abandoned' && e.props.game === 'battle' && battles.has(id)) {
      Object.assign(battles.get(id), {
        result: 'quit', quitDuring: e.props.phase || null,
        seconds: Number.isFinite(e.props.elapsed_ms) ? Math.round(e.props.elapsed_ms / 1000) : null,
      });
    }
  }

  return {
    start: new Date(evs[0].t).toISOString(),
    seconds: Math.round((evs[evs.length - 1].t - evs[0].t) / 1000),
    landing,
    clicks,
    firstClick: clicks[0] || null,
    lastClick: clicks[clicks.length - 1] || null,
    questions: [...questions.values()].map(q => ({ ...q, title: titles[q.id] || q.id })),
    battles: [...battles.values()],
    madeAccount: evs.some(e => e.event === 'account_created'),
    signedIn: evs.some(e => e.event === 'page_view' && e.props.signed_in === true),
    // "Used" means did something, not just opened the page.
    usedQuestions: evs.some(e => e.event === 'question_presented' && e.props.game === 'practice'),
    usedBattle: evs.some(e => e.event === 'battle_started'),
  };
}

function battleCounts(battles) {
  const c = { started: battles.length, finished: 0, won: 0, quit: 0 };
  for (const b of battles) {
    if (['won', 'lost', 'draw'].includes(b.result)) c.finished++;
    if (b.result === 'won') c.won++;
    if (b.result === 'quit') c.quit++;
  }
  return c;
}

// events: [{ anon_id, received_at, event, question_id, props }] sorted by anon_id, received_at.
function buildVisitors(events, titles, now = Date.now()) {
  const byVisitor = new Map();
  for (const e of events) {
    if (!byVisitor.has(e.anon_id)) byVisitor.set(e.anon_id, []);
    byVisitor.get(e.anon_id).push({ ...e, t: Date.parse(e.received_at), props: parseProps(e.props) });
  }

  const visitors = [];
  for (const [anonId, evs] of byVisitor) {
    const raw = splitVisits(evs);
    const visits = raw.map((v, i) => {
      const start = v[0].t;
      const next = raw[i + 1];
      const returned = next && next[0].t - start <= RETURN_WINDOW_MS;
      return {
        number: i + 1,
        ...summarizeVisit(v, titles),
        returnedWithin7Days: returned ? 'yes' : (now - start < RETURN_WINDOW_MS ? 'waiting' : 'no'),
      };
    });
    const last = visits[visits.length - 1];
    visitors.push({
      visitor: anonId,
      visitCount: visits.length,
      firstVisit: visits[0].start,
      lastVisit: last.start,
      hasAccount: visits.some(v => v.madeAccount || v.signedIn),
      usedQuestions: visits.some(v => v.usedQuestions),
      usedBattle: visits.some(v => v.usedBattle),
      battles: battleCounts(visits.flatMap(v => v.battles)),
      visits: visits.reverse(),          // newest first
    });
  }
  return visitors.sort((a, b) => b.lastVisit.localeCompare(a.lastVisit));
}

module.exports = { buildVisitors, battleCounts, SESSION_GAP_MS };
