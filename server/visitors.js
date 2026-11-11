// One row per anonymous visitor for the admin Visitors page, built from
// game_events. Only visitors with analytics consent have events, so only they
// appear. "First visit" is the visitor's first session: events until a gap of
// more than 30 minutes. Clicks and questions describe that first session;
// "made account" and "returned" look at everything since.

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

// events: [{ anon_id, received_at, event, question_id, props }] sorted by anon_id, received_at.
function buildVisitorRows(events, titles, now = Date.now()) {
  const byVisitor = new Map();
  for (const e of events) {
    if (!byVisitor.has(e.anon_id)) byVisitor.set(e.anon_id, []);
    byVisitor.get(e.anon_id).push({ ...e, t: Date.parse(e.received_at), props: parseProps(e.props) });
  }

  const rows = [];
  for (const [anonId, evs] of byVisitor) {
    let end = 0;
    while (end + 1 < evs.length && evs[end + 1].t - evs[end].t <= SESSION_GAP_MS) end++;
    const first = evs.slice(0, end + 1);
    const later = evs.slice(end + 1);

    // Where they went after landing: page sections (collapsing repeats) and
    // practice questions they opened.
    const clicks = [];
    let landing = null;
    for (const e of first) {
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

    const questions = [];
    for (const e of first) {
      if (e.event === 'question_presented' && e.question_id && !questions.includes(e.question_id)) questions.push(e.question_id);
    }
    const title = id => titles[id] || id;

    const firstAt = first[0].t;
    const returned = later.some(e => e.t - firstAt <= RETURN_WINDOW_MS);
    rows.push({
      visitor: anonId,
      firstVisit: new Date(firstAt).toISOString(),
      sessionSeconds: Math.round((first[first.length - 1].t - firstAt) / 1000),
      landing,
      firstClick: clicks[0] || null,
      clicks,
      lastClick: clicks[clicks.length - 1] || null,
      firstQuestion: questions.length ? title(questions[0]) : null,
      questions: questions.map(title),
      lastQuestion: questions.length ? title(questions[questions.length - 1]) : null,
      madeAccount: evs.some(e => e.event === 'account_created'),
      returnedWithin7Days: returned ? 'yes' : (now - firstAt < RETURN_WINDOW_MS ? 'waiting' : 'no'),
    });
  }
  return rows.sort((a, b) => b.firstVisit.localeCompare(a.firstVisit));
}

module.exports = { buildVisitorRows, SESSION_GAP_MS };
