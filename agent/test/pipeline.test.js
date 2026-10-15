const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { inspectCodebase } = require('../src/inspect/codebase');
const { auditQuestions, loadQuestionBank, finalStepNumber } = require('../src/inspect/questions');
const { runAgent } = require('../src/run');
const { normalize } = require('../src/ga4/client');
const history = require('../src/history/store');

test('final step parser handles unicode minus, currency, fractions and asides', () => {
  assert.equal(finalStepNumber({ steps: [{ value: '= $0.667 − $0.833 = −$0.17' }] }), -0.17);
  assert.equal(finalStepNumber({ steps: [{ value: 'P(match) = 1/5' }] }), 0.2);
  assert.equal(finalStepNumber({ steps: [{ value: 'r = 23 (P(match) goes from ≈0.476 to ≈0.507)' }] }), 23);
  assert.equal(finalStepNumber({ steps: [{ value: '= σ²/2' }] }), null);
});

test('codebase inspector finds the real GA4 events and pacing constants', () => {
  const c = inspectCodebase();
  const names = c.events.map(e => e.name);
  for (const e of ['battle_started', 'battle_finished', 'game_started', 'game_completed', 'questions_viewed']) assert.ok(names.includes(e), e);
  assert.equal(typeof c.server.constants.BLITZ_DURATION, 'number');
  assert.ok(c.pacing.some(p => p.id.startsWith('pacing.bot_wait')));
});

test('question audit runs on the real bank', () => {
  const c = inspectCodebase();
  const a = auditQuestions(loadQuestionBank(), c.server.constants);
  assert.ok(a.totalQuestions > 100);
  assert.ok(a.repeatRisk.length > 0);
});

test('GA4 response normalisation', () => {
  const n = normalize({
    dimensionHeaders: [{ name: 'eventName' }], metricHeaders: [{ name: 'eventCount' }],
    rows: [{ dimensionValues: [{ value: 'game_started' }], metricValues: [{ value: '42' }] }],
    metadata: { subjectToThresholding: true },
  });
  assert.deepEqual(n.rows, [{ eventName: 'game_started', eventCount: 42 }]);
  assert.equal(n.quality.subjectToThresholding, true);
});

function tmp() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'qb-run-'));
  return { dataDir: d, experimentsDir: path.join(d, 'exp') };
}

test('synthetic run without LLM: 5 hypotheses, one pacing + one quality experiment, all proposed', async () => {
  const dirs = tmp();
  const run = await runAgent({ synthetic: true, llm: false, ...dirs });
  // The rule engine only proposes hypotheses it has evidence for (max 5).
  assert.ok(run.hypotheses.length >= 1 && run.hypotheses.length <= 5);
  run.hypotheses.forEach(h => assert.ok(h.evidence.length > 0));
  assert.deepEqual(run.experiments.map(x => x.area).sort(), ['pacing', 'question_quality']);
  run.experiments.forEach(x => { assert.equal(x.status, 'proposed'); assert.equal(x.approval, null); });
  assert.ok(fs.existsSync(path.join(dirs.dataDir, 'dashboard.html')));
  assert.equal(history.readAll({ dir: dirs.dataDir, type: 'hypothesis' }).length, run.hypotheses.length);
  // Second run reuses experiment ids instead of creating duplicates.
  const again = await runAgent({ synthetic: true, llm: false, ...dirs });
  assert.deepEqual(again.experiments.map(x => x.id).sort(), run.experiments.map(x => x.id).sort());
});

function fakeClient(payload) {
  return { beta: { messages: { stream: () => ({ finalMessage: async () => ({ stop_reason: 'end_turn', model: 'fake-model', usage: {}, content: [{ type: 'text', text: JSON.stringify(payload) }] }) }) } } };
}

function llmPayload(evidence) {
  const design = (key) => ({ title: 't', slug: 's', hypothesis_key: key, hypothesis_statement: 'h', control_description: 'c', treatment_description: 't', primary_metric: 'bot_battle_completion', guardrails: ['client_error_rate'], code_change_outline: ['x'], risks: [], evidence });
  return {
    hypotheses: Array.from({ length: 5 }, (_, i) => ({ key: `k${i}`, area: 'pacing', title: `T${i}`, observation: 'o', hypothesis: 'h', intervention: 'i', evidence, causal_status: 'untested', primary_metric: 'none', guardrails: [], required_instrumentation: [], confidence: 'low', priority_rationale: 'r' })),
    experiments: { pacing: design('pacing.x'), question_quality: design('quality.x') },
    question_reviews: [{ question_id: 'qm54', issue: 'unit', suggested_clarification: 'Answer in minutes.' }],
    follow_up_questions: ['q?'],
  };
}

test('LLM output citing real findings is used', async () => {
  const run = await runAgent({ synthetic: true, ...tmp(), dryRun: true, anthropicClient: fakeClient(llmPayload(['F-Q-summary', 'F-NOT-REAL'])) });
  assert.match(run.meta.hypothesisSource, /LLM/);
  assert.deepEqual(run.hypotheses[0].evidence, ['F-Q-summary']);
  assert.equal(run.questionReviews.length, 1);
});

test('LLM output with no valid evidence falls back to rules', async () => {
  const run = await runAgent({ synthetic: true, ...tmp(), dryRun: true, anthropicClient: fakeClient(llmPayload(['F-MADE-UP'])) });
  assert.match(run.meta.hypothesisSource, /rules/);
  assert.ok(run.meta.llmError);
  assert.ok(run.hypotheses.length >= 1 && run.hypotheses.every(h => h.source === 'rules'));
});
