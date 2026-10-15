const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { assignVariant, isExperimentLive, specHash } = require('../src/flags/assign');
const registry = require('../src/experiments/registry');
const { analyze } = require('../src/experiments/analyze');
const { buildExperiment, DEFAULT_DESIGNS } = require('../src/experiments/propose');

const engagement = { synthetic: true, funnels: { overall: [] } };
const gaps = { evaluations: [] };
const codebase = { events: [], pseudonymousIdConfigured: false, consentModeConfigured: false };

function proposed() {
  return buildExperiment('pacing', DEFAULT_DESIGNS.pacing, { id: 'EXP-001-test', gaps, engagement, codebase });
}

function running(overrides = {}) {
  const exp = { ...proposed(), prerequisites: [] };
  const approved = registry.approve(exp, 'Lauren');
  return { ...registry.start(approved), startedAt: '2026-10-01T00:00:00Z', ...overrides };
}

test('generated experiment specs are valid', () => {
  assert.deepEqual(registry.validate(proposed()), []);
  const q = buildExperiment('question_quality', DEFAULT_DESIGNS.question_quality, { id: 'EXP-002-test', gaps, engagement, codebase });
  assert.deepEqual(registry.validate(q), []);
  assert.equal(q.status, 'proposed');
  assert.equal(q.approval, null);
});

test('approval is blocked while prerequisites are open', () => {
  assert.throws(() => registry.approve(proposed(), 'Lauren'), /Prerequisites not met/);
});

test('approval requires a named human', () => {
  assert.throws(() => registry.approve({ ...proposed(), prerequisites: [] }, ''), /human approver/);
});

test('nobody is assigned to an unapproved experiment', () => {
  const exp = { ...proposed(), status: 'running' };
  assert.equal(isExperimentLive(exp), false);
  assert.equal(assignVariant('user-1', exp), null);
});

test('assignment is deterministic and close to 50/50', () => {
  const exp = running();
  assert.equal(isExperimentLive(exp), true);
  let treat = 0;
  for (let i = 0; i < 20000; i++) {
    const v = assignVariant(`anon-${i}`, exp);
    assert.equal(v, assignVariant(`anon-${i}`, exp));
    if (v === 'treatment') treat++;
  }
  assert.ok(Math.abs(treat / 20000 - 0.5) < 0.015, `treatment share ${treat / 20000}`);
});

test('editing the spec after approval disables the experiment', () => {
  const exp = running();
  const edited = { ...exp, primaryMetric: { ...exp.primaryMetric, direction: 'decrease' } };
  assert.notEqual(specHash(edited), exp.approval.specHash);
  assert.equal(isExperimentLive(edited), false);
  assert.equal(assignVariant('anon-1', edited), null);
});

test('registry round-trips through disk', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'qb-exp-'));
  const exp = proposed();
  registry.save(exp, dir);
  assert.equal(registry.load('EXP-001', dir).id, exp.id);
  assert.equal(registry.loadAll(dir).length, 1);
});

function snap(asOf, cUnits, tUnits, cPrimary, tPrimary, guard = {}) {
  const g = (side) => ({
    premature_exit_rate: { successes: guard[side]?.premature_exit_rate ?? Math.round((side === 'c' ? cUnits : tUnits) * 0.15) },
    next_day_return: { successes: Math.round((side === 'c' ? cUnits : tUnits) * 0.1) },
    client_error_rate: { successes: Math.round((side === 'c' ? cUnits : tUnits) * 0.03) },
  });
  return { asOf, variants: { control: { units: cUnits, primary: { successes: cPrimary }, guardrails: g('c') }, treatment: { units: tUnits, primary: { successes: tPrimary }, guardrails: g('t') } } };
}

test('analysis: sample-ratio mismatch pauses', () => {
  const r = analyze(running(), snap('2026-10-20', 1000, 1300, 600, 800));
  assert.equal(r.recommendation, 'pause');
});

test('analysis: no primary-metric call before minimum runtime', () => {
  const r = analyze(running(), snap('2026-10-05', 1000, 1000, 600, 750));
  assert.equal(r.recommendation, 'continue');
  assert.match(r.reason, /Below minimum runtime/);
});

test('analysis: guardrail harm recommends revert even early', () => {
  const r = analyze(running(), snap('2026-10-05', 2000, 2000, 1200, 1250, { t: { premature_exit_rate: 500 } }));
  assert.equal(r.recommendation, 'revert');
});

test('analysis: clear improvement after min runtime recommends keep', () => {
  const r = analyze(running(), snap('2026-10-20', 1500, 1500, 900, 1080));
  assert.equal(r.recommendation, 'keep');
  assert.ok(r.primary.diff > 0);
});

test('analysis: null result at the cap is inconclusive', () => {
  const exp = running();
  const n = exp.stoppingRule.maxUnitsPerArm;
  const r = analyze(exp, snap('2026-11-20', n, n, Math.round(n * 0.6), Math.round(n * 0.6) + 3));
  assert.equal(r.recommendation, 'inconclusive');
});

test('analysis: always-valid p carries forward and never increases', () => {
  const exp = running();
  const first = analyze(exp, snap('2026-10-20', 1500, 1500, 900, 1000));
  const second = analyze(exp, snap('2026-10-21', 1600, 1600, 960, 960), first.state);
  assert.ok(second.primary.alwaysValidP <= first.primary.alwaysValidP);
});
