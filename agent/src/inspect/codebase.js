// Static inspection of the QuantBattle repo: which analytics events exist
// (with which params), which pages load GA4, whether consent and
// pseudonymous ids are handled, what the server persists, and the game
// pacing constants. Purely deterministic: regex + evaluating literal values.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { REPO_ROOT } = require('../config');

const CLIENT_FILES_RE = /\.(js|html)$/;
const SKIP_DIRS = new Set(['node_modules', '.git', 'agent', '.agents', '.claude', 'server']);

function listClientFiles(root) {
  return fs.readdirSync(root, { withFileTypes: true })
    .filter(d => d.isFile() && CLIENT_FILES_RE.test(d.name))
    .map(d => d.name)
    .concat(fs.readdirSync(root, { withFileTypes: true })
      .filter(d => d.isDirectory() && !SKIP_DIRS.has(d.name))
      .flatMap(d => listClientFiles(path.join(root, d.name)).map(f => path.join(d.name, f))));
}

function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
}

// analytics.js helpers that emit a fixed event and add params of their own.
// Call-site object literals contribute the remaining params.
const WRAPPERS = {
  presentQuestion: { event: 'question_presented', implicit: ['question_id'] },
  firstInput: { event: 'question_first_input', implicit: ['question_id', 'ms_since_presented'] },
  answerQuestion: { event: 'question_answered', implicit: ['question_id', 'response_ms', 'attempts'] },
  abandonGame: { event: 'game_abandoned', implicit: ['game_session_id', 'game', 'reason', 'elapsed_ms'], withGameContext: true },
  startWait: { event: 'wait_started', implicit: ['wait_type', 'game_session_id'] },
  endWait: { event: 'wait_ended', implicit: ['wait_type', 'game_session_id', 'wait_ms', 'outcome'] },
  postGameAction: { event: 'post_game_action', implicit: ['game_session_id', 'game', 'action', 'ms_since_result'] },
  exposure: { event: 'experiment_exposure', implicit: ['experiment_id', 'variant'] },
};

const keysOf = (objText = '') => [...objText.matchAll(/([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g)].map(x => x[1]);

// trackEvent('name', {...}), QBAnalytics.track('name', {...}), the wrapper
// helpers above, and server-side logServerEvent(anon, 'name', {...}, {...}).
function findTrackedEvents(root) {
  const events = {};
  const add = (name, params, loc) => {
    const ev = events[name] || (events[name] = { name, params: new Set(), locations: [] });
    params.forEach(p => ev.params.add(p));
    ev.locations.push(loc);
  };
  const gameContext = new Set();
  const wrapperSites = [];

  for (const file of listClientFiles(root)) {
    const text = fs.readFileSync(path.join(root, file), 'utf8');
    const direct = /(?:trackEvent|QBAnalytics\.track)\(\s*['"]([a-z0-9_]+)['"]\s*(?:,\s*(?:Object\.assign\()?\{([^}]*)\})?/g;
    let m;
    while ((m = direct.exec(text))) add(m[1], keysOf(m[2]), `${file}:${lineOf(text, m.index)}`);

    const wrap = /QBAnalytics\.(\w+)\(([^;]*?)\);/g;
    while ((m = wrap.exec(text))) {
      const [, fn, args] = m;
      const objs = [...args.matchAll(/\{([^}]*)\}/g)].map(x => x[1]).join(',');
      if (fn === 'startGame' || fn === 'updateGame') keysOf(objs).forEach(k => gameContext.add(k));
      if (WRAPPERS[fn]) wrapperSites.push({ fn, params: keysOf(objs), loc: `${file}:${lineOf(text, m.index)}` });
    }
  }
  for (const s of wrapperSites) {
    const w = WRAPPERS[s.fn];
    add(w.event, [...w.implicit, ...s.params, ...(w.withGameContext ? gameContext : [])], s.loc);
  }

  const serverFile = path.join(root, 'server', 'index.js');
  if (fs.existsSync(serverFile)) {
    const text = fs.readFileSync(serverFile, 'utf8');
    const re = /logServerEvent\([^,]+,\s*'([a-z0-9_]+)'([^;]*)\);/g;
    let m;
    while ((m = re.exec(text))) add(m[1], keysOf(m[2]), `server/index.js:${lineOf(text, m.index)}`);
  }
  return Object.values(events).map(e => ({ ...e, params: [...e.params].sort() }));
}

function findGaPages(root) {
  const pages = listClientFiles(root).filter(f => f.endsWith('.html'));
  return pages.map(p => {
    const text = fs.readFileSync(path.join(root, p), 'utf8');
    const isRedirectStub = text.length < 600 && /http-equiv=["']refresh|location\.(href|replace)/i.test(text);
    return {
      page: p,
      hasGtag: /googletagmanager\.com\/gtag\/js/.test(text),
      hasConsentDefault: /gtag\(\s*['"]consent['"]\s*,\s*['"]default['"]/.test(text),
      setsUserId: /user_id/.test(text),
      isRedirectStub,
    };
  });
}

// Evaluate `const NAME = <literal>;` from a source file without executing the
// file. Only literals (numbers, arrays, objects) survive; anything referencing
// other identifiers is skipped.
function extractConstants(file, namePattern) {
  const text = fs.readFileSync(file, 'utf8');
  const out = {};
  const re = /^const\s+([A-Z][A-Z0-9_]*)\s*=\s*([\s\S]*?);\s*(?:\/\/.*)?$/gm;
  let m;
  while ((m = re.exec(text))) {
    if (!namePattern.test(m[1])) continue;
    try { out[m[1]] = vm.runInNewContext(`(${m[2]})`, Object.create(null), { timeout: 50 }); } catch (_) { /* non-literal */ }
  }
  return out;
}

function inspectServer(root) {
  const serverFile = path.join(root, 'server', 'index.js');
  const dbFile = path.join(root, 'server', 'db.js');
  const server = fs.readFileSync(serverFile, 'utf8');
  const db = fs.readFileSync(dbFile, 'utf8');

  const tables = {};
  for (const m of db.matchAll(/CREATE TABLE IF NOT EXISTS (\w+)\s*\(([\s\S]*?)\n\s*\);/g)) {
    tables[m[1]] = m[2].split('\n').map(l => l.trim().split(/\s+/)[0]).filter(c => c && /^[a-z_0-9]+$/.test(c) && !['--'].includes(c));
  }

  const flagHandler = (server.match(/app\.post\('\/api\/flag'[\s\S]*?\n\}\);/) || [''])[0];
  const socketEvents = [...server.matchAll(/socket\.on\('([a-z_]+)'/g)].map(m => m[1]);
  const inlineTimeLimits = (() => {
    const m = server.match(/const timeLimits = (\{[^}]*\})/);
    try { return m ? vm.runInNewContext(`(${m[1]})`) : null; } catch { return null; }
  })();

  return {
    tables,
    socketEvents: [...new Set(socketEvents)],
    flagsPersisted: /db\.|INSERT/i.test(flagHandler),
    flagsLoggedToConsoleOnly: /console\.log/.test(flagHandler) && !/db\.|INSERT/i.test(flagHandler),
    matchesRecordedOnlyForRegisteredPairs: /if \(game\.p1\.userId && game\.p2\.userId\)/.test(server),
    matchHasDurationColumn: (tables.matches || []).some(c => /duration|ended_at|started_at/.test(c)),
    // Bot battles resolve as soon as the human finishes, for everyone (not gated by an experiment variant).
    botWaitRemoved: (() => {
      const fn = (server.match(/function maybeResolveBotEarly[\s\S]*?\n\}/) || [''])[0];
      return !!fn && !/variant/.test(fn) && /maybeResolveBotEarly\(game, socket\.id\)/.test(server);
    })(),
    constants: { ...extractConstants(serverFile, /DURATION|COMPOSITION|DELAY|ACCURACY|ACTIVITY|QUESTIONS_PER_MATCH/), CODE_BATTLE_TIME_LIMITS: inlineTimeLimits },
  };
}

// Turn constants into concrete pacing facts. These are statements about the
// code, not about user behaviour.
function pacingModel(server, client) {
  const facts = [];
  const c = server.constants;
  if (c.BLITZ_DURATION && c.TACTICAL_COMPOSITION) {
    for (const [diff, comp] of Object.entries(c.TACTICAL_COMPOSITION)) {
      const nQ = comp.mix.reduce((s, [, n]) => s + n, 0);
      facts.push({
        id: `pacing.quant_battle.${diff}`,
        statement: `Quant Battle (${diff}): fixed ${c.BLITZ_DURATION}s blitz phase that never ends early, then up to ${comp.timeLimit}s for ${nQ} tactical questions; worst case ${Math.round((c.BLITZ_DURATION + comp.timeLimit) / 60)} min per match.`,
        maxSeconds: c.BLITZ_DURATION + comp.timeLimit,
      });
    }
  }
  if (c.BOT_DELAY && server.botWaitRemoved) {
    facts.push({ id: 'pacing.bot_wait_removed', statement: 'Bot battles (tech/IB) end as soon as the player has submitted everything; the bot result is drawn immediately with unchanged odds (no forced wait).' });
  } else if (c.BOT_DELAY) {
    for (const [diff, [lo, hi]] of Object.entries(c.BOT_DELAY)) {
      facts.push({
        id: `pacing.bot_wait.${diff}`,
        statement: `Bot battles (${diff}, tech/IB): after a wrong or non-perfect submission the player waits for the bot's simulated finish, uniformly ${lo}-${hi}s after match start, with no interaction available.`,
        minSeconds: lo, maxSeconds: hi,
      });
    }
  }
  if (client.BOT_FALLBACK_SECONDS != null) {
    facts.push({ id: 'pacing.matchmaking', statement: `Matchmaking falls back to a bot after ${client.BOT_FALLBACK_SECONDS}s, so most battles are likely against bots. battle_started does not record opponent type, so GA4 cannot confirm this.`, seconds: client.BOT_FALLBACK_SECONDS });
  }
  if (client.GAME_DURATION) facts.push({ id: 'pacing.mental_math', statement: `Mental Math Challenge: fixed ${client.GAME_DURATION}s round.`, seconds: client.GAME_DURATION });
  if (client.TOTAL_SECONDS) facts.push({ id: 'pacing.optiver_80_in_8', statement: `Optiver 80-in-8: ${client.TOTAL_QUESTIONS} questions in ${client.TOTAL_SECONDS / 60} min; the run only ends at the timer or after the final question.`, seconds: client.TOTAL_SECONDS });
  return facts;
}

function inspectCodebase(root = REPO_ROOT) {
  const events = findTrackedEvents(root);
  const pages = findGaPages(root);
  const server = inspectServer(root);
  const client = {
    ...extractConstants(path.join(root, 'game.js'), /SECONDS/),
    ...extractConstants(path.join(root, 'mentalmath.js'), /DURATION/),
    ...extractConstants(path.join(root, 'games.js'), /TOTAL_/),
  };
  const clientText = listClientFiles(root).map(f => fs.readFileSync(path.join(root, f), 'utf8')).join('\n');
  const mm = fs.existsSync(path.join(root, 'mentalmath.js')) ? fs.readFileSync(path.join(root, 'mentalmath.js'), 'utf8') : '';
  const quitFn = (mm.match(/function quitGame\(\)[\s\S]*?\n\}/) || [''])[0];
  return {
    events,
    pages,
    server,
    clientConstants: client,
    pacing: pacingModel(server, client),
    consentModeConfigured: pages.filter(p => p.hasGtag).every(p => p.hasConsentDefault) && pages.some(p => p.hasGtag),
    pseudonymousIdConfigured: /qb_anon_id/.test(clientText),
    quitCountedAsComplete: !!quitFn && !/abandonGame/.test(quitFn),
  };
}

module.exports = { inspectCodebase, findTrackedEvents, extractConstants, pacingModel };
