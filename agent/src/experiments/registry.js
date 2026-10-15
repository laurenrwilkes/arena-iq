// Experiment specs live as one JSON file each in agent/experiments/.
// Lifecycle: proposed -> approved -> running -> concluded (keep | revert | inconclusive)
// Only a human can move proposed -> approved (`qb-agent approve`), and the
// approval is bound to a hash of the spec.
const fs = require('fs');
const path = require('path');
const { EXPERIMENTS_DIR } = require('../config');
const { specHash, isExperimentLive } = require('../flags/assign');

const STATUSES = ['proposed', 'approved', 'running', 'paused', 'concluded'];

function validate(exp) {
  const errors = [];
  const req = (cond, msg) => { if (!cond) errors.push(msg); };
  req(/^EXP-\d{3}/.test(exp.id || ''), 'id must look like EXP-001-slug');
  req(STATUSES.includes(exp.status), `status must be one of ${STATUSES.join(', ')}`);
  req(exp.hypothesis && exp.hypothesis.statement, 'hypothesis.statement is required');
  req(exp.unit === 'anon_id', "unit must be 'anon_id' (pseudonymous, consistent assignment)");
  req(Array.isArray(exp.variants) && exp.variants.length >= 2, 'need at least two variants');
  req(exp.variants?.some(v => v.key === 'control'), "one variant must have key 'control'");
  req(exp.primaryMetric && typeof exp.primaryMetric === 'object' && !Array.isArray(exp.primaryMetric), 'exactly one primaryMetric object');
  req(exp.primaryMetric?.direction === 'increase' || exp.primaryMetric?.direction === 'decrease', 'primaryMetric.direction must be increase|decrease');
  req(Array.isArray(exp.guardrails) && exp.guardrails.length >= 1, 'at least one guardrail metric');
  for (const g of exp.guardrails || []) req(g.harmDirection === 'increase' || g.harmDirection === 'decrease', `guardrail ${g.id}: harmDirection must be increase|decrease`);
  const s = exp.stoppingRule || {};
  req(s.method === 'msprt', "stoppingRule.method must be 'msprt' (always-valid sequential test)");
  for (const k of ['alpha', 'tau', 'minDaysRunning', 'maxDays', 'minUnitsPerArm', 'maxUnitsPerArm']) req(typeof s[k] === 'number', `stoppingRule.${k} must be a number`);
  req(exp.evaluationPlan && exp.evaluationPlan.length > 0, 'evaluationPlan is required');
  return errors;
}

function load(id, dir = EXPERIMENTS_DIR) {
  const file = fileFor(id, dir);
  if (!file) throw new Error(`No experiment matching ${id}`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function loadAll(dir = EXPERIMENTS_DIR) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort()
    .map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
}

function fileFor(id, dir = EXPERIMENTS_DIR) {
  if (!fs.existsSync(dir)) return null;
  const f = fs.readdirSync(dir).find(f => f.endsWith('.json') && (f === `${id}.json` || f.startsWith(`${id}`)));
  return f ? path.join(dir, f) : null;
}

function save(exp, dir = EXPERIMENTS_DIR) {
  const errors = validate(exp);
  if (errors.length) throw new Error(`Invalid experiment ${exp.id}:\n- ${errors.join('\n- ')}`);
  fs.mkdirSync(dir, { recursive: true });
  const file = fileFor(exp.id, dir) || path.join(dir, `${exp.id}.json`);
  fs.writeFileSync(file, JSON.stringify(exp, null, 2) + '\n');
  return file;
}

// `attest` lets the approver confirm human-review prerequisites (ids starting
// with "review:"). Instrumentation prerequisites can't be attested: they are
// recomputed from the code on every agent run.
function approve(exp, approvedBy, note = '', attest = []) {
  if (!approvedBy) throw new Error('approve requires the name of the human approver');
  if (exp.status !== 'proposed') throw new Error(`Can only approve a proposed experiment (is ${exp.status})`);
  const bad = attest.filter(id => !id.startsWith('review:'));
  if (bad.length) throw new Error(`Only review:* prerequisites can be attested (got ${bad.join(', ')})`);
  const prerequisites = (exp.prerequisites || []).map(p => attest.includes(p.id) ? { ...p, satisfied: true, attestedBy: approvedBy } : p);
  const unmet = prerequisites.filter(p => !p.satisfied);
  if (unmet.length) throw new Error(`Prerequisites not met:\n- ${unmet.map(p => `${p.description} [${p.id}]`).join('\n- ')}`);
  return { ...exp, prerequisites, status: 'approved', approval: { approvedBy, approvedAt: new Date().toISOString(), note, attested: attest, specHash: specHash(exp) } };
}

// Called once the approved code has been deployed. Refuses if the spec was
// edited after approval.
function start(exp) {
  if (exp.status !== 'approved') throw new Error(`Can only start an approved experiment (is ${exp.status})`);
  const running = { ...exp, status: 'running', startedAt: new Date().toISOString() };
  if (!isExperimentLive(running)) throw new Error('Spec changed since approval; re-approve before starting.');
  return running;
}

module.exports = { STATUSES, validate, load, loadAll, save, approve, start, fileFor };
