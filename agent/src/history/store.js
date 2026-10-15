// Append-only experiment history (JSONL). Every observation, proposed metric,
// hypothesis, code change, assignment, result, decision and follow-up
// question is a line; nothing is rewritten, so the log is an audit trail.
const fs = require('fs');
const path = require('path');
const { DATA_DIR } = require('../config');

const TYPES = ['observation', 'metric_proposal', 'hypothesis', 'code_change', 'assignment', 'result', 'decision', 'follow_up', 'approval'];

function historyFile(dir = DATA_DIR) {
  return path.join(dir, 'history.jsonl');
}

function append(type, data, { runId = null, dir = DATA_DIR } = {}) {
  if (!TYPES.includes(type)) throw new Error(`Unknown history type: ${type}`);
  fs.mkdirSync(dir, { recursive: true });
  const entry = { ts: new Date().toISOString(), type, runId, data };
  fs.appendFileSync(historyFile(dir), JSON.stringify(entry) + '\n');
  return entry;
}

function readAll({ dir = DATA_DIR, type } = {}) {
  const file = historyFile(dir);
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean)
    .map(line => { try { return JSON.parse(line); } catch { return null; } })
    .filter(e => e && (!type || e.type === type));
}

// Summarise past decisions per hypothesis key so the next run can
// deprioritise ideas that were already settled and revisit ones that ended
// inconclusive for lack of instrumentation.
function priorOutcomesByKey({ dir = DATA_DIR } = {}) {
  const out = {};
  for (const e of readAll({ dir, type: 'decision' })) {
    const key = e.data?.hypothesisKey;
    if (!key) continue;
    (out[key] = out[key] || []).push({ ts: e.ts, decision: e.data.decision, reason: e.data.reason, experimentId: e.data.experimentId });
  }
  return out;
}

module.exports = { TYPES, append, readAll, priorOutcomesByKey, historyFile };
