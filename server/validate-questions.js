// Structural checks for the question bank and its editorial metadata.
// Run: node server/validate-questions.js   (also run at server boot and in tests)
const { QUESTIONS, ORIGINAL_TITLES, battlePool } = require('./questions');
const META = require('./question-meta');

const TYPES = new Set(['numeric', 'code']);
const TRACKS = new Set(['trading', 'corporate_finance', 'stochastic_calculus', 'fundamentals', 'coding', 'investment_banking']);
// Titles must not name the method or the famous problem.
const LEAKY_TITLE = /bayes|ruin|kelly|law of total|markov|poisson|geometric dist|binomial|capm|sharpe|put-call|itô|ito's|brownian|reflection|mgf|chebyshev|jensen|antithetic|black-scholes|duration|monty hall|order statistics|stopping time|quadratic variation|delta|vega|risk-neutral|birthday/i;

// minimums: { 'quant.easy': 3, ... } — how many questions one match draws per pool.
function validateQuestionBank({ minimums = {} } = {}) {
  const errors = [];
  const err = (id, msg) => errors.push(`${id}: ${msg}`);
  const seen = new Map();
  const byId = {};

  for (const [cat, tiers] of Object.entries(QUESTIONS)) {
    for (const [tier, list] of Object.entries(tiers)) {
      for (const q of list) {
        const where = `${cat}.${tier}`;
        const id = q.id || `(missing id in ${where})`;
        if (!q.id || typeof q.id !== 'string') err(id, 'missing id');
        if (seen.has(q.id)) err(id, `duplicate id (also in ${seen.get(q.id)})`);
        seen.set(q.id, where);
        byId[q.id] = { ...q, cat, tier };

        if (!q.title || !String(q.title).trim()) err(id, 'missing title');
        if (!q.description || !String(q.description).trim()) err(id, 'missing description');
        if (!TYPES.has(q.type)) err(id, `invalid type "${q.type}"`);
        if (q.type === 'numeric') {
          if (typeof q.answer !== 'number' || !Number.isFinite(q.answer)) err(id, 'missing or non-numeric answer');
          if (typeof q.tolerance !== 'number' || !(q.tolerance >= 0)) err(id, 'missing or invalid tolerance');
        }
        if (q.type === 'code') {
          if (!q.functionName) err(id, 'missing functionName');
          if (!Array.isArray(q.testCases) || !q.testCases.length) err(id, 'missing test cases');
          else if (q.testCases.some(tc => !('input' in tc) || !('expected' in tc))) err(id, 'test case without input/expected');
        }
        if (!TRACKS.has(q.track)) err(id, `unknown track "${q.track}"`);
        if (q.active && cat === 'quant' && q.track === 'trading' && LEAKY_TITLE.test(q.title)) err(id, `player-facing title names the method: "${q.title}"`);
      }
    }
  }

  // Metadata must point at real questions and stay in sync with the source.
  for (const [id, t] of Object.entries(META.titles)) {
    if (!byId[id]) { err(id, 'titles: unknown question id'); continue; }
    if (!t.title) err(id, 'titles: empty title');
    if (t.was !== ORIGINAL_TITLES[id]) err(id, `titles: "was" (${t.was}) no longer matches questions.js (${ORIGINAL_TITLES[id]})`);
  }
  for (const [id, x] of Object.entries(META.inactive)) {
    if (!byId[id]) { err(id, 'inactive: unknown question id'); continue; }
    if (!x.reason) err(id, 'inactive: reason required');
    if (x.keep && (!byId[x.keep] || !byId[x.keep].active)) err(id, `inactive: kept duplicate ${x.keep} is missing or inactive`);
  }
  for (const [id, track] of Object.entries(META.tracks)) {
    if (!byId[id]) err(id, 'tracks: unknown question id');
    else if (!TRACKS.has(track)) err(id, `tracks: unknown track "${track}"`);
  }

  // The battle pool must never serve inactive or non-trading questions, and
  // must hold enough questions for a match.
  for (const [cat, tiers] of Object.entries(QUESTIONS)) {
    for (const tier of Object.keys(tiers)) {
      const pool = battlePool(cat, tier);
      for (const q of pool) {
        if (!q.active) err(q.id, `inactive question in ${cat}.${tier} battle pool`);
        if (cat === 'quant' && q.track !== 'trading') err(q.id, `${q.track} question in quant.${tier} battle pool`);
      }
      const need = minimums[`${cat}.${tier}`] || 0;
      if (pool.length < need) err(`${cat}.${tier}`, `battle pool has ${pool.length} questions, a match needs ${need}`);
    }
  }
  return errors;
}

// Pool minimums implied by the server's match settings.
function minimumsFrom({ TACTICAL_COMPOSITION, QUESTIONS_PER_MATCH }) {
  const m = {};
  for (const comp of Object.values(TACTICAL_COMPOSITION || {})) {
    for (const [tier, n] of comp.mix) m[`quant.${tier}`] = Math.max(m[`quant.${tier}`] || 0, n);
  }
  for (const tier of ['easy', 'medium', 'hard']) {
    m[`ib.${tier}`] = Math.max(m[`ib.${tier}`] || 0, QUESTIONS_PER_MATCH || 0);
    m[`tech.${tier}`] = Math.max(m[`tech.${tier}`] || 0, 1);
  }
  return m;
}

module.exports = { validateQuestionBank, minimumsFrom, LEAKY_TITLE, TRACKS };

if (require.main === module) {
  const errors = validateQuestionBank();
  if (errors.length) { console.error(`${errors.length} problem(s):\n- ${errors.join('\n- ')}`); process.exit(1); }
  console.log('Question bank OK');
}
