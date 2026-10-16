// Deterministic question-bank audit. It flags *candidates* for human review;
// it does not decide that a question is wrong. Behavioural quality signals
// (solve rate, time-to-answer, abandonment, disputes) need the new
// instrumentation and are joined in once that data exists.
const path = require('path');
const { REPO_ROOT } = require('../config');

function stripHtml(s = '') {
  return s.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ');
}

function wordCount(s) {
  return stripHtml(s).split(/\s+/).filter(Boolean).length;
}

// Last number in the final worked step, e.g. "$230M ÷ 112.5M ≈ $2.04" -> 2.04
function finalStepNumber(q) {
  const last = q.steps?.[q.steps.length - 1]?.value;
  if (!last) return null;
  let cleaned = last.replace(/[−–]/g, '-').replace(/[$€£]/g, '').replace(/,(?=\d{3})/g, '');
  // Drop parenthetical asides, innermost first so nested parens go too.
  for (let prev; prev !== cleaned;) { prev = cleaned; cleaned = cleaned.replace(/\([^()]*\)/g, ' '); }
  const rhs = cleaned.split(/=|≈|→/).pop();
  // Symbolic results (σ²/2, ...) can't be compared numerically.
  if (/[α-ωΑ-Ω²³]/.test(rhs)) return null;
  const frac = rhs.match(/(-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*$/);
  if (frac && Number(frac[2]) !== 0) return Number(frac[1]) / Number(frac[2]);
  const nums = [...rhs.matchAll(/-?\d+(?:\.\d+)?/g)].map(m => parseFloat(m[0]));
  return nums.length ? nums[nums.length - 1] : null;
}

function roundingDecimals(description) {
  const m = stripHtml(description).match(/to\s+(?:the\s+nearest\s+)?(\d+|one|two|three|four)\s+(?:decimal\s+)?(?:places|decimals|dp)\b/i);
  if (!m) return /nearest (whole|integer|cent)/i.test(description) ? 0 : null;
  return { one: 1, two: 2, three: 3, four: 4 }[m[1].toLowerCase()] ?? Number(m[1]);
}

function auditNumeric(q, tier) {
  const issues = [];
  const step = finalStepNumber(q);
  const tol = q.tolerance ?? 0;
  if (step != null && Math.abs(step - q.answer) > Math.max(tol, 1e-9)) {
    // Allow percentage <-> fraction representations (e.g. 0.25 vs 25).
    const scaled = [step / 100, step * 100].some(s => Math.abs(s - q.answer) <= Math.max(tol, 1e-9));
    if (!scaled) issues.push({ code: 'answer_step_mismatch', severity: 'high', detail: `answer ${q.answer} but final worked step ends in ${step}` });
  }
  const dp = roundingDecimals(q.description);
  // Short exact decimals (0.25) are unambiguous; 3+ decimals imply rounding.
  const decimals = (String(q.answer).split('.')[1] || '').length;
  const acceptsFraction = /decimal or fraction|as a fraction/i.test(q.description);
  if (decimals >= 3 && dp == null && !acceptsFraction) issues.push({ code: 'no_rounding_instruction', severity: 'medium', detail: `non-integer answer ${q.answer} with no rounding instruction (tolerance ${tol})` });
  if (dp != null && tol < 0.5 * 10 ** -dp - 1e-12) issues.push({ code: 'tolerance_stricter_than_rounding', severity: 'high', detail: `asks for ${dp} dp but tolerance ${tol} < ${0.5 * 10 ** -dp}` });
  if (q.answer !== 0 && tol / Math.abs(q.answer) > 0.05) issues.push({ code: 'tolerance_very_loose', severity: 'low', detail: `tolerance ${tol} is ${(100 * tol / Math.abs(q.answer)).toFixed(1)}% of answer` });
  if (!q.explanation) issues.push({ code: 'missing_explanation', severity: 'medium' });
  if (!q.steps?.length) issues.push({ code: 'missing_steps', severity: 'low' });
  return issues;
}

function auditCode(q) {
  const issues = [];
  if ((q.testCases || []).length < 3) issues.push({ code: 'few_test_cases', severity: 'medium', detail: `${(q.testCases || []).length} test cases` });
  if (!q.examples?.length) issues.push({ code: 'missing_examples', severity: 'low' });
  if (!q.pythonStarter) issues.push({ code: 'missing_python_starter', severity: 'low' });
  return issues;
}

function auditQuestions(QUESTIONS, battleConfig = {}) {
  const flat = [];
  for (const [category, tiers] of Object.entries(QUESTIONS)) {
    for (const [tier, list] of Object.entries(tiers)) {
      for (const q of list) flat.push({ ...q, category, tier });
    }
  }

  // Reading load relative to tier: flag easy/beginner questions whose word
  // count is in the top 10% of the whole category.
  const byCat = {};
  flat.forEach(q => { (byCat[q.category] = byCat[q.category] || []).push(wordCount(q.description)); });
  const p90 = Object.fromEntries(Object.entries(byCat).map(([c, arr]) => {
    const s = arr.slice().sort((a, b) => a - b);
    return [c, s[Math.floor(s.length * 0.9)]];
  }));

  const seenTitles = {}, seenDesc = {};
  const results = flat.map(q => {
    const issues = q.type === 'numeric' ? auditNumeric(q, q.tier) : auditCode(q);
    const words = wordCount(q.description);
    if (['beginner', 'easy'].includes(q.tier) && words > p90[q.category]) {
      issues.push({ code: 'heavy_reading_for_tier', severity: 'low', detail: `${words} words in a ${q.tier} question (category p90 = ${p90[q.category]})` });
    }
    const t = (q.title || '').toLowerCase().trim();
    const d = stripHtml(q.description).toLowerCase().replace(/\s+/g, ' ').trim();
    if (seenTitles[t]) issues.push({ code: 'duplicate_title', severity: 'low', detail: `same title as ${seenTitles[t]}` }); else seenTitles[t] = q.id;
    if (seenDesc[d]) issues.push({ code: 'duplicate_description', severity: 'medium', detail: `same text as ${seenDesc[d]}` }); else seenDesc[d] = q.id;
    return { id: q.id, category: q.category, tier: q.tier, type: q.type, title: q.title, words, issues };
  });

  // Pool sizes vs how many questions a battle draws: small pools mean
  // returning players see repeats quickly.
  const pools = {};
  flat.forEach(q => { pools[`${q.category}.${q.tier}`] = (pools[`${q.category}.${q.tier}`] || 0) + 1; });
  const repeatRisk = [];
  const perMatch = battleConfig.QUESTIONS_PER_MATCH;
  if (perMatch) {
    for (const [key, n] of Object.entries(pools)) {
      if (!key.startsWith('ib.')) continue;
      repeatRisk.push({ pool: key, size: n, drawnPerMatch: perMatch, note: n <= perMatch ? 'every match serves the entire pool (identical questions each time)' : `~${(n / perMatch).toFixed(1)} matches before a full repeat` });
    }
  }
  if (battleConfig.TACTICAL_COMPOSITION) {
    for (const [diff, comp] of Object.entries(battleConfig.TACTICAL_COMPOSITION)) {
      for (const [tier, k] of comp.mix) {
        const n = pools[`quant.${tier}`] || 0;
        // P(a given question repeats in the next match) = k / n
        repeatRisk.push({ pool: `quant.${tier}`, battle: `quant.${diff}`, size: n, drawnPerMatch: k, note: `${(100 * k / n).toFixed(1)}% chance any given question reappears next match` });
      }
    }
  }

  const flagged = results.filter(r => r.issues.length);
  const counts = {};
  flagged.forEach(r => r.issues.forEach(i => { counts[i.code] = (counts[i.code] || 0) + 1; }));

  return {
    totalQuestions: flat.length,
    pools,
    issueCounts: counts,
    highSeverity: flagged.filter(r => r.issues.some(i => i.severity === 'high')),
    flagged,
    repeatRisk,
  };
}

function loadQuestionBank(root = REPO_ROOT) {
  return require(path.join(root, 'server', 'questions.js')).QUESTIONS;
}

module.exports = { auditQuestions, auditNumeric, loadQuestionBank, finalStepNumber, roundingDecimals, wordCount };
