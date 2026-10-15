// Deterministic statistics. No LLM output ever flows into these numbers.
//
// Sequential testing uses the mixture SPRT (mSPRT, Johari et al. 2017) with a
// normal mixing distribution. It yields "always-valid" p-values: the agent may
// look at results after every daily snapshot without inflating the false
// positive rate, which is what makes autonomous monitoring safe.

function normalCdf(x) {
  // Abramowitz & Stegun 7.1.26 via erf; accurate to ~1e-7.
  const t = 1 / (1 + 0.3275911 * Math.abs(x) / Math.SQRT2);
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-(x * x) / 2);
  return x >= 0 ? (1 + y) / 2 : (1 - y) / 2;
}

function normalQuantile(p) {
  // Acklam's rational approximation; relative error < 1.2e-9.
  if (p <= 0 || p >= 1) throw new RangeError('p must be in (0, 1)');
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const lo = 0.02425, hi = 1 - lo;
  let q, r;
  if (p < lo) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p > hi) {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  q = p - 0.5; r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

function wilsonInterval(successes, n, confidence = 0.95) {
  if (n === 0) return { rate: null, lower: null, upper: null };
  const z = normalQuantile(1 - (1 - confidence) / 2);
  const p = successes / n;
  const denom = 1 + z * z / n;
  const centre = (p + z * z / (2 * n)) / denom;
  const half = (z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))) / denom;
  return { rate: p, lower: Math.max(0, centre - half), upper: Math.min(1, centre + half) };
}

// Fixed-horizon difference in proportions (treatment - control) with a Wald CI.
// Reported for context only; decisions use the sequential test below.
function diffInProportions(control, treatment, confidence = 0.95) {
  const pA = control.successes / control.n;
  const pB = treatment.successes / treatment.n;
  const se = Math.sqrt(pA * (1 - pA) / control.n + pB * (1 - pB) / treatment.n);
  const z = normalQuantile(1 - (1 - confidence) / 2);
  const diff = pB - pA;
  return { control: pA, treatment: pB, diff, relativeLift: pA > 0 ? diff / pA : null, se, lower: diff - z * se, upper: diff + z * se };
}

// mSPRT likelihood ratio for H0: diff = 0 with mixing variance tau^2.
// tau should be on the scale of effects you care about; we use the MDE.
function msprtLikelihoodRatio(control, treatment, tau) {
  const { diff, se } = diffInProportions(control, treatment);
  const V = se * se;
  if (!(V > 0)) return 1;
  const t2 = tau * tau;
  return Math.sqrt(V / (V + t2)) * Math.exp((t2 * diff * diff) / (2 * V * (V + t2)));
}

// Always-valid p-value. `previousP` is the running minimum carried across
// snapshots (p_n = min(p_{n-1}, 1 / Lambda_n)), so it only ever decreases.
function alwaysValidP(control, treatment, tau, previousP = 1) {
  const lr = msprtLikelihoodRatio(control, treatment, tau);
  return Math.min(previousP, 1 / Math.max(lr, 1e-300), 1);
}

// Sample-ratio mismatch: chi-square goodness of fit against planned weights.
// A tiny p (< 0.001) means assignment or logging is broken, not a real effect.
function sampleRatioMismatch(counts, weights) {
  const total = counts.reduce((a, b) => a + b, 0);
  const wSum = weights.reduce((a, b) => a + b, 0);
  let chi2 = 0;
  counts.forEach((c, i) => {
    const expected = total * weights[i] / wSum;
    if (expected > 0) chi2 += (c - expected) ** 2 / expected;
  });
  const df = counts.length - 1;
  return { chi2, df, p: chiSquareSurvival(chi2, df) };
}

function chiSquareSurvival(x, df) {
  if (df === 1) return 2 * (1 - normalCdf(Math.sqrt(x)));
  // Wilson-Hilferty approximation for df > 1.
  const z = (Math.cbrt(x / df) - (1 - 2 / (9 * df))) / Math.sqrt(2 / (9 * df));
  return 1 - normalCdf(z);
}

// Per-arm sample size for a two-sided two-proportion test at fixed horizon.
// Used to plan maxUnitsPerArm; the sequential test typically stops earlier on
// real effects but needs a cap so null experiments end as "inconclusive".
function sampleSizePerArm(baselineRate, mdeAbsolute, alpha = 0.05, power = 0.8) {
  const p1 = baselineRate, p2 = baselineRate + mdeAbsolute;
  if (p2 <= 0 || p2 >= 1) throw new RangeError('baseline + MDE must be inside (0, 1)');
  const pBar = (p1 + p2) / 2;
  const zA = normalQuantile(1 - alpha / 2), zB = normalQuantile(power);
  const n = (zA * Math.sqrt(2 * pBar * (1 - pBar)) + zB * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))) ** 2 / (mdeAbsolute ** 2);
  return Math.ceil(n);
}

module.exports = {
  normalCdf, normalQuantile, wilsonInterval, diffInProportions,
  msprtLikelihoodRatio, alwaysValidP, sampleRatioMismatch, chiSquareSurvival, sampleSizePerArm,
};
