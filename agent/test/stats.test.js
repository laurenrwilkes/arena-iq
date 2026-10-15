const test = require('node:test');
const assert = require('node:assert/strict');
const s = require('../src/stats');

test('normal quantile / cdf round-trip', () => {
  assert.ok(Math.abs(s.normalQuantile(0.975) - 1.959964) < 1e-5);
  assert.ok(Math.abs(s.normalCdf(1.959964) - 0.975) < 1e-6);
  assert.ok(Math.abs(s.normalQuantile(0.001) + 3.090232) < 1e-5);
});

test('wilson interval contains the point estimate and stays in [0,1]', () => {
  const w = s.wilsonInterval(0, 20);
  assert.equal(w.lower, 0);
  assert.ok(w.upper > 0 && w.upper < 0.2);
  const w2 = s.wilsonInterval(50, 100);
  assert.ok(w2.lower < 0.5 && w2.upper > 0.5);
});

test('sample size matches the textbook two-proportion value', () => {
  // 50% -> 60%, alpha .05 two-sided, power .8: ~385-390 per arm.
  const n = s.sampleSizePerArm(0.5, 0.1);
  assert.ok(n >= 380 && n <= 395, `got ${n}`);
});

test('SRM detects a broken split and passes a fair one', () => {
  assert.ok(s.sampleRatioMismatch([5000, 5050], [1, 1]).p > 0.1);
  assert.ok(s.sampleRatioMismatch([5000, 5600], [1, 1]).p < 0.001);
});

function rng(seed) {
  let x = seed >>> 0;
  return () => { x = (Math.imul(x, 1664525) + 1013904223) >>> 0; return x / 4294967296; };
}

test('mSPRT keeps the false-positive rate under alpha with daily peeking; naive z-test does not', () => {
  const r = rng(42);
  const sims = 400, looks = 30, perLook = 100, p = 0.3, alpha = 0.05;
  let msprtFP = 0, naiveFP = 0;
  const zCrit = s.normalQuantile(1 - alpha / 2);
  for (let k = 0; k < sims; k++) {
    let a = 0, b = 0, n = 0, avp = 1, msprtHit = false, naiveHit = false;
    for (let l = 0; l < looks; l++) {
      for (let i = 0; i < perLook; i++) { if (r() < p) a++; if (r() < p) b++; }
      n += perLook;
      const c = { successes: a, n }, t = { successes: b, n };
      avp = s.alwaysValidP(c, t, 0.05, avp);
      if (avp < alpha) msprtHit = true;
      const d = s.diffInProportions(c, t);
      if (Math.abs(d.diff / d.se) > zCrit) naiveHit = true;
    }
    if (msprtHit) msprtFP++;
    if (naiveHit) naiveFP++;
  }
  assert.ok(msprtFP / sims <= alpha, `mSPRT FPR ${msprtFP / sims}`);
  assert.ok(naiveFP / sims > 0.1, `naive peeking FPR ${naiveFP / sims} should be inflated`);
});

test('mSPRT detects a real effect', () => {
  const c = { successes: 3000, n: 10000 }, t = { successes: 3400, n: 10000 };
  assert.ok(s.alwaysValidP(c, t, 0.03) < 0.001);
});
