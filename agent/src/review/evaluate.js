// Deterministic checks shown beside a question proposal. They flag problems
// for the reviewer; they do not judge whether a question is good.
const path = require('path');
const { REPO_ROOT } = require('../config');
const { auditNumeric, finalStepNumber, wordCount } = require('../inspect/questions');

function bank() {
  return require(path.join(REPO_ROOT, 'server', 'questions.js'));
}

const tokens = s => new Set(String(s || '').replace(/<[^>]+>/g, ' ').toLowerCase().match(/[a-z0-9]+/g) || []);
function jaccard(a, b) {
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter || 1);
}

function evaluateQuestion(p) {
  const q = p.question;
  const checks = [];
  const add = (id, label, status, detail) => checks.push({ id, label, status, detail });

  const step = finalStepNumber(q);
  if (step == null) add('final-step', 'Final worked step matches the answer', 'warn', 'Could not read a number from the last step; check by hand.');
  else add('final-step', 'Final worked step matches the answer', Math.abs(step - q.answer) <= Math.max(q.tolerance, 1e-9) ? 'pass' : 'fail', `Last step ends in ${step}; stored answer ${q.answer} (tolerance ${q.tolerance}).`);

  const issues = auditNumeric(q).filter(i => i.code !== 'missing_explanation' || !q.explanation);
  const precision = issues.filter(i => /rounding|tolerance/.test(i.code));
  add('precision', 'Unit and precision are stated and consistent with the tolerance', precision.length ? 'fail' : 'pass',
    precision.length ? precision.map(i => i.detail).join('; ') : 'No rounding or tolerance conflicts found.');
  if (!q.explanation) add('explanation', 'Has an explanation', 'warn', 'No explanation text.');

  const { LEAKY_TITLE } = require(path.join(REPO_ROOT, 'server', 'validate-questions.js'));
  add('title', 'Title does not reveal the method', LEAKY_TITLE.test(q.title) ? 'fail' : 'pass', `"${q.title}"`);
  if (/hint:/i.test(q.description)) add('hint', 'No method hint in the visible text', 'warn', 'Description contains "Hint:".');

  const words = wordCount(q.description);
  add('length', 'Reading load', words > 120 ? 'warn' : 'pass', `${words} words in the prompt.`);

  // Closest existing questions (excluding the one being replaced).
  const { QUESTIONS, ORIGINAL_TITLES } = bank();
  const me = tokens(q.description);
  const near = Object.values(QUESTIONS).flatMap(t => Object.values(t).flat())
    .filter(x => x.id !== p.replaces)
    .map(x => ({ id: x.id, title: x.title, score: jaccard(me, tokens(x.description)) }))
    .sort((a, b) => b.score - a.score).slice(0, 3);
  const top = near[0];
  add('similarity', 'Not a near-duplicate of an existing question', top && top.score > 0.6 ? 'warn' : 'pass',
    near.map(n => `${n.id} "${n.title}" ${(n.score * 100).toFixed(0)}%`).join(' · '));

  let current = null;
  if (p.replaces) {
    const old = Object.values(QUESTIONS).flatMap(t => Object.values(t).flat()).find(x => x.id === p.replaces);
    if (!old) add('replaces', `Replaces ${p.replaces}`, 'fail', 'That question does not exist.');
    else {
      current = { id: old.id, title: old.title, originalTitle: ORIGINAL_TITLES[old.id], description: old.description, answer: old.answer, tolerance: old.tolerance, steps: old.steps, explanation: old.explanation };
      add('answer-change', 'Answer change versus the live question', old.answer === q.answer ? 'pass' : 'info', `${old.answer} → ${q.answer}${old.answer === q.answer ? ' (unchanged)' : ''}`);
    }
  }
  return { checks, current, similar: near };
}

module.exports = { evaluateQuestion, jaccard };
