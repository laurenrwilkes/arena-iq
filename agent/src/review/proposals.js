// Review proposals: question-quality changes and single-change UX branches.
// One JSON file per proposal in agent/proposals/. A decision never deploys
// anything: approval only authorises a controlled test or a reviewed
// deployment, which is recorded separately (`qb-agent proposal deployed`).
const fs = require('fs');
const path = require('path');
const { AGENT_ROOT, DATA_DIR } = require('../config');
const history = require('../history/store');

const PROPOSALS_DIR = process.env.QB_PROPOSALS_DIR || path.join(AGENT_ROOT, 'proposals');
const DECISIONS = { approve: 'approved', reject: 'rejected', revise: 'revision_requested' };
const EVIDENCE_KINDS = ['measured', 'code', 'speculative'];
const DEPLOYMENT_STATES = ['not_deployed', 'controlled_test', 'deployed', 'rolled_back'];

function validate(p) {
  const errors = [];
  const req = (cond, msg) => { if (!cond) errors.push(msg); };
  req(/^(q|ux)-\d{3}-[a-z0-9-]+$/.test(p.id || ''), 'id must look like q-001-slug or ux-001-slug');
  req(p.type === 'question' || p.type === 'ux', 'type must be question or ux');
  req(p.title, 'title is required');
  req(p.summary, 'summary is required');
  if (p.type === 'question') {
    const q = p.question || {};
    req(['beginner', 'easy', 'medium', 'hard'].includes(p.tier), 'tier must be beginner|easy|medium|hard');
    req(q.title && q.description, 'question.title and question.description are required');
    req(q.type === 'numeric', 'only numeric questions are supported');
    req(typeof q.answer === 'number' && Number.isFinite(q.answer), 'question.answer must be a number');
    req(typeof q.tolerance === 'number' && q.tolerance >= 0, 'question.tolerance must be >= 0');
    req(Array.isArray(q.steps) && q.steps.length > 0, 'question.steps (the solution) are required');
    req(p.reasoningPattern, 'reasoningPattern is required');
    req(Array.isArray(p.sources), 'sources[] is required (may be empty, never invented)');
    req(p.authenticity && p.authenticity.rationale, 'authenticity.rationale is required');
  }
  if (p.type === 'ux') {
    req(/^proposal\//.test(p.branch || ''), 'branch must be proposal/...');
    req(p.base, 'base branch is required');
    req(p.hypothesis, 'hypothesis is required');
    req(Array.isArray(p.evidence) && p.evidence.length, 'evidence[] is required');
    for (const e of p.evidence || []) {
      req(EVIDENCE_KINDS.includes(e.kind), `evidence kind must be one of ${EVIDENCE_KINDS.join(', ')}`);
      if (e.kind === 'measured') req(e.source && e.asOf, 'measured evidence needs a source and an asOf date');
    }
    req(p.prediction && p.prediction.expectedEffect && p.prediction.uncertainty, 'prediction needs expectedEffect and uncertainty');
    req(p.successMetric && p.successMetric.definition, 'successMetric.definition is required');
    req(p.affectedFlow && p.affectedFlow.path, 'affectedFlow.path is required');
  }
  return errors;
}

function file(id, dir = PROPOSALS_DIR) { return path.join(dir, `${id}.json`); }

function list(dir = PROPOSALS_DIR) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort()
    .map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
}

function load(id, dir = PROPOSALS_DIR) {
  const f = file(id, dir);
  if (!fs.existsSync(f)) throw new Error(`No proposal ${id}`);
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}

function save(p, dir = PROPOSALS_DIR) {
  const errors = validate(p);
  if (errors.length) throw new Error(`Invalid proposal ${p.id}:\n- ${errors.join('\n- ')}`);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file(p.id, dir), JSON.stringify(p, null, 2) + '\n');
  return p;
}

// Record a human review decision. Does not deploy anything.
function decide(id, { decision, feedback = '', by }, { dir = PROPOSALS_DIR, historyDir = DATA_DIR } = {}) {
  if (!DECISIONS[decision]) throw new Error('decision must be approve | reject | revise');
  if (!by) throw new Error('a reviewer name is required');
  if (decision === 'revise' && !feedback.trim()) throw new Error('say what to revise');
  const p = load(id, dir);
  const entry = { decision, status: DECISIONS[decision], feedback: feedback.trim(), by, at: new Date().toISOString() };
  p.reviews = [...(p.reviews || []), entry];
  p.status = entry.status;
  p.deployment = p.deployment || { status: 'not_deployed' };
  save(p, dir);
  history.append('decision', { proposalId: id, proposalType: p.type, ...entry, note: decision === 'approve' ? 'Authorises a controlled test or reviewed deployment; nothing was deployed.' : undefined }, { dir: historyDir });
  return p;
}

function recordDeployment(id, { status, ref = '', note = '', by }, { dir = PROPOSALS_DIR, historyDir = DATA_DIR } = {}) {
  if (!DEPLOYMENT_STATES.includes(status)) throw new Error(`status must be one of ${DEPLOYMENT_STATES.join(', ')}`);
  if (!by) throw new Error('a name is required');
  const p = load(id, dir);
  if (status !== 'not_deployed' && p.status !== 'approved') throw new Error('only approved proposals can be tested or deployed');
  p.deployment = { status, ref, note, by, at: new Date().toISOString() };
  save(p, dir);
  history.append('deployment', { proposalId: id, ...p.deployment }, { dir: historyDir });
  return p;
}

function recordOutcome(id, { metric, value, note = '', source = '' }, { dir = PROPOSALS_DIR, historyDir = DATA_DIR } = {}) {
  if (!metric) throw new Error('metric is required');
  const p = load(id, dir);
  const o = { metric, value, note, source, at: new Date().toISOString() };
  p.outcomes = [...(p.outcomes || []), o];
  save(p, dir);
  history.append('outcome', { proposalId: id, ...o }, { dir: historyDir });
  return p;
}

function historyFor(id, { historyDir = DATA_DIR } = {}) {
  return history.readAll({ dir: historyDir }).filter(e => e.data && e.data.proposalId === id);
}

module.exports = { PROPOSALS_DIR, DECISIONS, EVIDENCE_KINDS, DEPLOYMENT_STATES, validate, list, load, save, decide, recordDeployment, recordOutcome, historyFor };
