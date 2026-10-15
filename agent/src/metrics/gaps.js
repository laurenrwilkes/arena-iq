// Gap analysis: for every metric, which required events/params are missing
// from the code, and which params are not queryable in GA4.
const { METRICS, FOUNDATIONS } = require('./catalog');

function evaluateMetric(metric, codeEvents, ga4, codebase = {}) {
  const byName = Object.fromEntries(codeEvents.map(e => [e.name, e]));
  const missing = [];
  const notRegistered = [];
  for (const req of metric.requiredEvents) {
    const ev = byName[req.event];
    if (!ev) { missing.push({ event: req.event, params: req.params, reason: 'event not emitted anywhere' }); continue; }
    const absent = req.params.filter(p => !ev.params.includes(p));
    if (absent.length) missing.push({ event: req.event, params: absent, reason: 'event exists but lacks params' });
    if (ga4 && ga4.registeredParams) {
      const unreg = req.params.filter(p => ev.params.includes(p) && !ga4.registeredParams.includes(p));
      if (unreg.length) notRegistered.push({ event: req.event, params: unreg });
    }
  }
  if (metric.serverSide && !codebase.server?.flagsPersisted) missing.push({ event: '(server)', params: [], reason: metric.serverSide });

  let status;
  if (missing.length === 0 && notRegistered.length === 0) status = 'measurable';
  else if (missing.length === 0) status = 'partial';           // emitted but not queryable by param
  else if (metric.requiredEvents.some(r => byName[r.event])) status = 'partial';
  else status = 'missing';
  if (metric.requiredEvents.length === 0) status = 'measurable';

  return { id: metric.id, name: metric.name, kind: metric.kind, status, missing, notRegistered };
}

// Collapse all per-metric gaps into a de-duplicated instrumentation plan:
// one entry per event with the union of params it needs and which metrics
// it unlocks.
function instrumentationPlan(evaluations, codebase) {
  const byEvent = {};
  for (const ev of evaluations) {
    const metric = METRICS.find(m => m.id === ev.id);
    for (const gap of ev.missing) {
      if (gap.event === '(server)') continue;
      const entry = byEvent[gap.event] || (byEvent[gap.event] = { event: gap.event, params: new Set(), unlocks: new Set(), where: new Set(), exists: false });
      gap.params.forEach(p => entry.params.add(p));
      entry.unlocks.add(metric.id);
      if (metric.where) entry.where.add(metric.where);
      entry.exists = entry.exists || gap.reason !== 'event not emitted anywhere';
    }
  }
  const events = Object.values(byEvent).map(e => ({
    event: e.event,
    action: e.exists ? 'add_params' : 'new_event',
    params: [...e.params].sort(),
    unlocks: [...e.unlocks],
    where: [...e.where],
    locations: codebase.events.find(x => x.name === e.event)?.locations || [],
  })).sort((a, b) => b.unlocks.length - a.unlocks.length);

  const foundations = FOUNDATIONS.map(f => ({
    ...f,
    alreadyDone: (f.id === 'consent_mode' && codebase.consentModeConfigured)
      || (f.id === 'anon_id' && codebase.pseudonymousIdConfigured),
  }));
  const serverChanges = evaluations.flatMap(e => e.missing.filter(g => g.event === '(server)').map(g => ({ metric: e.id, change: g.reason })));
  return { foundations, events, serverChanges };
}

function analyzeGaps(codebase, ga4) {
  const evaluations = METRICS.map(m => evaluateMetric(m, codebase.events, ga4, codebase));
  return { evaluations, plan: instrumentationPlan(evaluations, codebase) };
}

module.exports = { analyzeGaps, evaluateMetric };
