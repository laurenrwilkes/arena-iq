// Feature flags for A/B experiments. Specs live in agent/experiments/*.json;
// a spec only serves treatment while it is running AND still matches the
// hash a human approved (see agent/src/flags/assign.js). Everything else
// gets the default (control) experience.
const fs = require('fs');
const path = require('path');
const { assignVariant, isExperimentLive } = require('../agent/src/flags/assign');

// QB_EXPERIMENTS_DIR is for local integration tests only.
const EXPERIMENTS_DIR = process.env.QB_EXPERIMENTS_DIR || path.join(__dirname, '..', 'agent', 'experiments');
const ANON_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function loadExperiments() {
  try {
    return fs.readdirSync(EXPERIMENTS_DIR).filter(f => f.endsWith('.json'))
      .map(f => JSON.parse(fs.readFileSync(path.join(EXPERIMENTS_DIR, f), 'utf8')));
  } catch (_) {
    return [];
  }
}

const experiments = loadExperiments();

function isValidAnonId(id) {
  return typeof id === 'string' && ANON_ID_RE.test(id);
}

function find(prefix) {
  return experiments.find(e => e.id.startsWith(prefix));
}

// Returns { id, variant } or null when the unit isn't in a live experiment.
function variantFor(prefix, anonId) {
  if (!isValidAnonId(anonId)) return null;
  const exp = find(prefix);
  if (!exp) return null;
  const variant = assignVariant(anonId, exp);
  return variant ? { id: exp.id, variant } : null;
}

function liveAssignments(anonId) {
  const out = {};
  for (const exp of experiments) {
    if (!isExperimentLive(exp)) continue;
    const v = variantFor(exp.id, anonId);
    if (v) out[v.id] = v.variant;
  }
  return out;
}

module.exports = { experiments, isValidAnonId, variantFor, liveAssignments };
