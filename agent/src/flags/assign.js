// Deterministic, stateless variant assignment. Isomorphic (no Node APIs) so
// the same file can later be served to the browser and required by the
// server, guaranteeing both sides agree on a unit's variant.
//
// The unit id must be pseudonymous: a random UUID stored in localStorage
// (`qb_anon_id`), never an email, username or IP address.

function fnv1a32(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return fmix32(h);
}

// MurmurHash3 finaliser. Raw FNV-1a has weak avalanche on similar inputs
// ("anon-1", "anon-2", ...), which skewed splits measurably in tests.
function fmix32(h) {
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

// Uniform float in [0, 1) for a (unit, experiment, salt) triple. Two different
// salts give independent buckets, so traffic eligibility and variant choice
// don't correlate with each other or across experiments.
function bucket(unitId, experimentId, salt) {
  return fnv1a32(`${experimentId}:${salt}:${unitId}`) / 4294967296;
}

// Returns the variant key, or null if the unit is outside the experiment's
// traffic allocation (they get the default experience and are not logged).
function assignVariant(unitId, experiment) {
  if (!unitId) return null;
  if (!isExperimentLive(experiment)) return null;
  const traffic = experiment.trafficAllocation ?? 1;
  if (bucket(unitId, experiment.id, 'traffic') >= traffic) return null;

  const variants = experiment.variants;
  const total = variants.reduce((s, v) => s + (v.weight ?? 1), 0);
  const x = bucket(unitId, experiment.id, 'variant') * total;
  let acc = 0;
  for (const v of variants) {
    acc += v.weight ?? 1;
    if (x < acc) return v.key;
  }
  return variants[variants.length - 1].key;
}

// The production gate. An experiment only serves treatment traffic when a
// named human approved it AND the spec has not changed since that approval.
function isExperimentLive(experiment) {
  return !!(experiment
    && experiment.status === 'running'
    && experiment.approval
    && experiment.approval.approvedBy
    && experiment.approval.specHash
    && experiment.approval.specHash === specHash(experiment));
}

// Hash over the fields that define *what users experience and how it is
// judged*. Editing any of them after approval silently disables the
// experiment until it is re-approved.
function specHash(experiment) {
  const { id, hypothesis, variants, trafficAllocation, primaryMetric, guardrails, stoppingRule, unit } = experiment;
  return fnv1a32(stableStringify({ id, hypothesis, variants, trafficAllocation, primaryMetric, guardrails, stoppingRule, unit })).toString(16);
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

const api = { fnv1a32, bucket, assignVariant, isExperimentLive, specHash, stableStringify };
if (typeof module !== 'undefined') module.exports = api;
if (typeof window !== 'undefined') window.QBFlags = api;
