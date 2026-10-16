// Review dashboard: proposal rules, decisions, preview harness and API.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const P = require('../src/review/proposals');
const previews = require('../src/review/previews');
const { evaluateQuestion } = require('../src/review/evaluate');
const { createServer } = require('../src/review/server');
const history = require('../src/history/store');

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'qb-review-'));
const realProposals = () => P.list(path.join(__dirname, '..', 'proposals'));

function sandbox() {
  const dir = tmp(), historyDir = tmp();
  // Fresh, undecided copies: tests must not depend on real review decisions.
  for (const p of realProposals()) fs.writeFileSync(path.join(dir, `${p.id}.json`), JSON.stringify({ ...p, status: 'in_review', reviews: [], deployment: { status: 'not_deployed' }, outcomes: [] }));
  return { dir, historyDir };
}

test('seeded proposals are valid', () => {
  const all = realProposals();
  assert.ok(all.length >= 3);
  for (const p of all) assert.deepEqual(P.validate(p), [], p.id);
});

test('measured evidence must cite a source and date; predictions must state uncertainty', () => {
  const ux = realProposals().find(p => p.type === 'ux');
  const bad = { ...ux, evidence: [{ kind: 'measured', statement: 'x' }], prediction: { expectedEffect: 'up' } };
  const errors = P.validate(bad).join('\n');
  assert.match(errors, /measured evidence needs a source and an asOf date/);
  assert.match(errors, /uncertainty/);
  assert.match(P.validate({ ...ux, evidence: [{ kind: 'fact', statement: 'x' }] }).join('\n'), /evidence kind/);
});

test('decisions are recorded with reviewer and feedback, and never deploy', () => {
  const { dir, historyDir } = sandbox();
  assert.throws(() => P.decide('q-001-qh2-capped-doubling', { decision: 'ship', by: 'L' }, { dir, historyDir }), /approve \| reject \| revise/);
  assert.throws(() => P.decide('q-001-qh2-capped-doubling', { decision: 'revise', by: 'L' }, { dir, historyDir }), /say what to revise/);
  const p = P.decide('q-001-qh2-capped-doubling', { decision: 'approve', feedback: 'Looks right', by: 'Lauren' }, { dir, historyDir });
  assert.equal(p.status, 'approved');
  assert.equal(p.deployment.status, 'not_deployed');
  assert.equal(p.reviews.at(-1).feedback, 'Looks right');
  const h = history.readAll({ dir: historyDir, type: 'decision' });
  assert.equal(h.length, 1);
  assert.equal(h[0].data.proposalId, 'q-001-qh2-capped-doubling');
});

test('decisions use the proposal\'s own options; "Other" needs a note', () => {
  const { dir, historyDir } = sandbox();
  assert.throws(() => P.decide('q-002-qm75-truel-decision', { option: 'nope', by: 'L' }, { dir, historyDir }), /unknown option/);
  assert.throws(() => P.decide('q-002-qm75-truel-decision', { option: 'other', by: 'L' }, { dir, historyDir }), /say what you want/);
  const kept = P.decide('q-002-qm75-truel-decision', { option: 'keep', by: 'Lauren' }, { dir, historyDir });
  assert.equal(kept.status, 'rejected');
  assert.equal(kept.reviews.at(-1).label, 'Keep as it is');
  const ux = P.decide('ux-001-teaser-after-first-visit', { option: 'track-first', by: 'Lauren' }, { dir, historyDir });
  assert.equal(ux.status, 'revision_requested', 'a revise-type option without needsFeedback needs no note');
  for (const p of realProposals()) assert.ok(p.decision.options.some(o => o.id === 'other'), `${p.id} offers Other`);
});

test('only approved proposals can be tested or deployed; outcomes are recorded', () => {
  const { dir, historyDir } = sandbox();
  assert.throws(() => P.recordDeployment('ux-001-teaser-after-first-visit', { status: 'deployed', by: 'L' }, { dir, historyDir }), /only approved/);
  P.decide('ux-001-teaser-after-first-visit', { decision: 'approve', by: 'L' }, { dir, historyDir });
  const d = P.recordDeployment('ux-001-teaser-after-first-visit', { status: 'deployed', ref: 'abc123', by: 'L' }, { dir, historyDir });
  assert.equal(d.deployment.status, 'deployed');
  const o = P.recordOutcome('ux-001-teaser-after-first-visit', { metric: 'first_visit_practice_rate', value: '0.41', source: 'event store' }, { dir, historyDir });
  assert.equal(o.outcomes.length, 1);
  assert.deepEqual(P.historyFor('ux-001-teaser-after-first-visit', { historyDir }).map(e => e.type), ['decision', 'deployment', 'outcome']);
});

test('question evaluation passes for the seeded fixes and flags a mismatched answer', () => {
  for (const p of realProposals().filter(p => p.type === 'question')) {
    const e = evaluateQuestion(p);
    assert.deepEqual(e.checks.filter(c => c.status === 'fail').map(c => c.id), [], p.id);
    assert.ok(e.current, 'shows the live question it replaces');
  }
  const p = realProposals().find(x => x.id === 'q-001-qh2-capped-doubling');
  const wrong = evaluateQuestion({ ...p, question: { ...p.question, answer: 13675 } });
  assert.equal(wrong.checks.find(c => c.id === 'final-step').status, 'fail');
});

test('preview harness strips GA4 and Sentry, labels pages, and injects the question', () => {
  const dir = tmp();
  fs.mkdirSync(path.join(dir, 'server'));
  fs.writeFileSync(path.join(dir, 'index.html'), `<head>\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-TEST"></script>\n<script>window.__SENTRY_DSN__ = 'https://secret@sentry.io/1';</script>\n</head><body></body>`);
  fs.writeFileSync(path.join(dir, 'server', 'questions.js'), `const QUESTIONS = { quant: { hard: [{ id: 'qh2', title: 'old' }] } };\nfunction getRandomQuestions(c, d, n) { return QUESTIONS[c][d].slice(0, n); }\nmodule.exports = { QUESTIONS, getRandomQuestions };\n`);
  const p = realProposals().find(x => x.id === 'q-001-qh2-capped-doubling');
  previews.applyHarness(dir, { label: 'test', question: p });
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  assert.ok(!html.includes('googletagmanager.com/gtag/js'));
  assert.ok(html.includes("window.__SENTRY_DSN__ = '';") && !html.includes('secret@sentry'));
  assert.ok(html.includes('PREVIEW · test') && html.includes('selectProblem(id)'));
  const mod = require(path.join(dir, 'server', 'questions.js'));
  assert.deepEqual(mod.QUESTIONS.quant.hard.map(q => [q.id, q.title, q.answer]), [['qh2', 'Doubling Until a Six, Capped', 41026]]);
  assert.equal(mod.getRandomQuestions('quant', 'hard', 4)[0].answer, 41026);
});

test('UX branch is exactly one change on its base', () => {
  const ux = realProposals().find(p => p.type === 'ux');
  const b = previews.branchInfo(ux.base, ux.branch);
  assert.ok(b.ok, b.error);
  assert.equal(b.singleChange, true);
  assert.match(b.diff, /brainteaser\.js/);
});

test('dashboard API lists proposals and records decisions', async () => {
  const { dir, historyDir } = sandbox();
  const server = createServer({ dir, historyDir }).listen(0, '127.0.0.1');
  await new Promise(r => server.once('listening', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const list = await (await fetch(`${base}/api/proposals`)).json();
    assert.equal(list.length, realProposals().length);
    const detail = await (await fetch(`${base}/api/proposals/ux-001-teaser-after-first-visit`)).json();
    assert.equal(detail.branch.singleChange, true);
    const bad = await fetch(`${base}/api/proposals/ux-001-teaser-after-first-visit/decision`, { method: 'POST', body: JSON.stringify({ decision: 'revise', by: 'L' }) });
    assert.equal(bad.status, 400);
    const ok = await (await fetch(`${base}/api/proposals/ux-001-teaser-after-first-visit/decision`, { method: 'POST', body: JSON.stringify({ option: 'other', feedback: 'Try a smaller banner instead', by: 'Lauren' }) })).json();
    assert.equal(ok.proposal.status, 'revision_requested');
    assert.equal(ok.history.at(-1).data.label, 'Other');
    assert.equal(ok.history.at(-1).data.feedback, 'Try a smaller banner instead');
    assert.equal((await fetch(`${base}/api/proposals/nope`)).status, 404);
  } finally { server.close(); }
});
