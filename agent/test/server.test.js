// Tests for the server-side experiment pieces that ship to production:
// snapshot metrics, clarifications, and the approval attestation rules.
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSnapshot } = require('../../server/experimentMetrics');
const { loadQuestionBank, auditQuestions } = require('../src/inspect/questions');
const registry = require('../src/experiments/registry');
const { buildExperiment, DEFAULT_DESIGNS } = require('../src/experiments/propose');

const exp = {
  id: 'EXP-001-test', variants: [{ key: 'control' }, { key: 'treatment' }],
  primaryMetric: { id: 'bot_battle_completion' },
  guardrails: [{ id: 'premature_exit_rate' }, { id: 'next_day_return' }, { id: 'client_error_rate' }],
};
const row = (anon_id, received_at, event, props = {}, question_id = null) => ({ anon_id, received_at, event, question_id, props: JSON.stringify(props) });

test('snapshot counts units per arm and applies metric definitions', () => {
  const rows = [
    row('a', '2026-10-01T10:00:00Z', 'experiment_exposure', { experiment_id: 'EXP-001-test', variant: 'control' }),
    row('a', '2026-10-01T10:02:00Z', 'game_abandoned', { game: 'battle', opponent_type: 'bot', submitted: 0 }),
    row('b', '2026-10-01T11:00:00Z', 'experiment_exposure', { experiment_id: 'EXP-001-test', variant: 'treatment' }),
    row('b', '2026-10-01T11:03:00Z', 'battle_finished', {}),
    row('b', '2026-10-03T09:00:00Z', 'game_started', {}),
    row('c', '2026-10-01T12:00:00Z', 'experiment_exposure', { experiment_id: 'EXP-001-test', variant: 'treatment' }),
    row('c', '2026-10-01T12:01:00Z', 'client_error', {}),
    row('d', '2026-10-01T12:00:00Z', 'game_started', {}), // never exposed: ignored
  ];
  const s = buildSnapshot(exp, rows, '2026-10-04');
  assert.equal(s.variants.control.units, 1);
  assert.equal(s.variants.treatment.units, 2);
  assert.equal(s.variants.control.primary.successes, 0);      // a abandoned a bot battle
  assert.equal(s.variants.treatment.primary.successes, 2);
  assert.equal(s.variants.control.guardrails.premature_exit_rate.successes, 1);
  assert.equal(s.variants.treatment.guardrails.next_day_return.successes, 1); // b came back 2 days later
  assert.equal(s.variants.treatment.guardrails.client_error_rate.successes, 1);
  assert.deepEqual(s.unknownMetrics, []);
});

test('approved format clarifications are in the question bank and no longer flagged', () => {
  const bank = loadQuestionBank();
  const all = Object.values(bank).flatMap(t => Object.values(t).flat());
  const ids = ['qm46', 'qm47', 'qm49', 'qm52', 'qm54', 'qm55', 'qm62', 'qh37', 'qh43', 'qh46', 'qh49'];
  for (const id of ids) assert.match(all.find(q => q.id === id).description, /decimal places/, id);
  const audit = auditQuestions(bank, {});
  const stillFlagged = audit.flagged.filter(r => ids.includes(r.id) && r.issues.some(i => i.code === 'no_rounding_instruction'));
  assert.deepEqual(stillFlagged.map(r => r.id), []);
});

test('approval can attest review prerequisites but never instrumentation ones', () => {
  const ctx = { gaps: { evaluations: [] }, engagement: { synthetic: true, funnels: { overall: [] } }, codebase: { events: [{ name: 'experiment_exposure', params: [] }], pseudonymousIdConfigured: true, consentModeConfigured: true } };
  const e = buildExperiment('pacing', DEFAULT_DESIGNS.pacing, { id: 'EXP-001-x', ...ctx });
  assert.throws(() => registry.approve(e, 'Lauren', '', ['metric:opponent_type_mix']), /Only review/);
  const noMetrics = { ...e, prerequisites: e.prerequisites.filter(p => !p.id.startsWith('metric:')) };
  const approved = registry.approve(noMetrics, 'Lauren', '', ['review:code']);
  assert.equal(approved.status, 'approved');
  assert.equal(approved.prerequisites.find(p => p.id === 'review:code').attestedBy, 'Lauren');
});
