// Experiment monitoring and decision procedure. Pure function of the spec,
// the cumulative snapshot, and the prior analysis state, so every
// recommendation is reproducible.
//
// Snapshot shape (cumulative since start, per variant):
//   { asOf: '2026-10-20', variants: {
//       control:   { units: 1200, primary: { successes: 410 }, guardrails: { quit_rate: { successes: 90 } } },
//       treatment: { units: 1185, primary: { successes: 455 }, guardrails: { quit_rate: { successes: 88 } } } } }
// For every metric `successes` counts units with the event; the denominator is `units`.
const stats = require('../stats');

const SRM_THRESHOLD = 0.001;

function daysBetween(a, b) {
  return Math.floor((new Date(b) - new Date(a)) / 86400000);
}

function analyze(exp, snapshot, prior = {}) {
  if (exp.status !== 'running') {
    return { recommendation: 'none', reason: `Experiment is ${exp.status}; only running experiments are analysed.` };
  }
  const rule = exp.stoppingRule;
  const control = snapshot.variants.control;
  const treatmentKey = exp.variants.find(v => v.key !== 'control').key;
  const treatment = snapshot.variants[treatmentKey];
  const daysRunning = daysBetween(exp.startedAt, snapshot.asOf);
  const result = { asOf: snapshot.asOf, daysRunning, units: { control: control.units, [treatmentKey]: treatment.units }, checks: [] };

  // 1. Sample-ratio mismatch invalidates everything downstream.
  const weights = exp.variants.map(v => v.weight ?? 1);
  const srm = stats.sampleRatioMismatch(exp.variants.map(v => snapshot.variants[v.key].units), weights);
  result.srm = srm;
  if (srm.p < SRM_THRESHOLD) {
    return { ...result, recommendation: 'pause', reason: `Sample-ratio mismatch (p=${srm.p.toExponential(2)}). Assignment or exposure logging is broken; results are not interpretable until fixed.` };
  }

  // 2. Guardrails: one always-valid test per guardrail, evaluated at every
  // look. Harm is checked even before the minimum runtime, because stopping
  // for harm early is cheap and the mSPRT keeps the error rate valid.
  const priorP = prior.alwaysValidP || {};
  const nextP = {};
  result.guardrails = [];
  for (const g of exp.guardrails) {
    const c = { successes: control.guardrails[g.id].successes, n: control.units };
    const t = { successes: treatment.guardrails[g.id].successes, n: treatment.units };
    const d = stats.diffInProportions(c, t);
    const p = stats.alwaysValidP(c, t, g.tau ?? rule.tau, priorP[g.id] ?? 1);
    nextP[g.id] = p;
    const harmful = g.harmDirection === 'increase' ? d.diff > 0 : d.diff < 0;
    const breached = harmful && p < (g.alpha ?? rule.alpha);
    result.guardrails.push({ id: g.id, ...d, alwaysValidP: p, harmful, breached });
  }
  const breach = result.guardrails.find(g => g.breached);

  // 3. Primary metric.
  const pc = { successes: control.primary.successes, n: control.units };
  const pt = { successes: treatment.primary.successes, n: treatment.units };
  const primary = stats.diffInProportions(pc, pt);
  const pPrimary = stats.alwaysValidP(pc, pt, rule.tau, priorP.__primary ?? 1);
  nextP.__primary = pPrimary;
  result.primary = {
    id: exp.primaryMetric.id, ...primary, alwaysValidP: pPrimary,
    controlCI: stats.wilsonInterval(pc.successes, pc.n), treatmentCI: stats.wilsonInterval(pt.successes, pt.n),
  };
  result.state = { alwaysValidP: nextP };

  if (breach) {
    return { ...result, recommendation: 'revert', reason: `Guardrail "${breach.id}" moved in the harmful direction with always-valid p=${breach.alwaysValidP.toFixed(4)}.` };
  }

  const minUnits = Math.min(control.units, treatment.units);
  if (daysRunning < rule.minDaysRunning || minUnits < rule.minUnitsPerArm) {
    return { ...result, recommendation: 'continue', reason: `Below minimum runtime (${daysRunning}/${rule.minDaysRunning} days, ${minUnits}/${rule.minUnitsPerArm} units per arm). Not interpreting the primary metric yet.` };
  }

  const wantedSign = exp.primaryMetric.direction === 'increase' ? 1 : -1;
  if (pPrimary < rule.alpha) {
    const good = Math.sign(primary.diff) === wantedSign;
    return {
      ...result,
      recommendation: good ? 'keep' : 'revert',
      reason: good
        ? `Primary metric improved (${fmtPct(primary.diff)} absolute, always-valid p=${pPrimary.toFixed(4)}). Guardrails clear. Recommend keeping, pending human review.`
        : `Primary metric moved the wrong way (${fmtPct(primary.diff)} absolute, always-valid p=${pPrimary.toFixed(4)}).`,
    };
  }

  if (daysRunning >= rule.maxDays || minUnits >= rule.maxUnitsPerArm) {
    return { ...result, recommendation: 'inconclusive', reason: `Reached the planned cap without a detectable effect. Observed difference ${fmtPct(primary.diff)} (95% CI ${fmtPct(primary.lower)} to ${fmtPct(primary.upper)}). Either the effect is smaller than the MDE or the metric is too noisy. Revise or add instrumentation.` };
  }

  return { ...result, recommendation: 'continue', reason: `No decision yet (always-valid p=${pPrimary.toFixed(3)}). Keep collecting.` };
}

function fmtPct(x) {
  return `${x >= 0 ? '+' : ''}${(x * 100).toFixed(2)}pp`;
}

module.exports = { analyze, SRM_THRESHOLD };
