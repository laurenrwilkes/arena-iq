// Question bank integrity: structure, metadata, and what battles may select.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { REPO_ROOT } = require('../src/config');
const { extractConstants } = require('../src/inspect/codebase');

const qmod = require(path.join(REPO_ROOT, 'server/questions.js'));
const META = require(path.join(REPO_ROOT, 'server/question-meta.js'));
const { validateQuestionBank, minimumsFrom } = require(path.join(REPO_ROOT, 'server/validate-questions.js'));

// The match settings, read from the server source so this test can't drift.
const settings = extractConstants(path.join(REPO_ROOT, 'server/index.js'), /TACTICAL_COMPOSITION|QUESTIONS_PER_MATCH/);

test('question bank passes all structural and metadata checks', () => {
  const minimums = minimumsFrom(settings);
  assert.ok(minimums['quant.easy'] >= 1 && minimums['ib.easy'] >= 1, 'match settings were found in server/index.js');
  assert.deepEqual(validateQuestionBank({ minimums }), []);
});

test('battles never select inactive or non-trading quant questions', () => {
  const banned = new Set([...Object.keys(META.inactive), ...Object.keys(META.tracks)]);
  for (const tier of ['easy', 'medium', 'hard']) {
    for (let i = 0; i < 400; i++) {
      for (const q of qmod.getRandomQuestions('quant', tier, 4)) assert.ok(!banned.has(q.id), `${q.id} drawn for quant.${tier}`);
      const one = qmod.getRandomQuestion('quant', tier);
      assert.ok(one && !banned.has(one.id), `${one?.id} from getRandomQuestion`);
    }
  }
});

test('inactive questions keep their ids and content (history stays resolvable)', () => {
  const all = Object.values(qmod.QUESTIONS).flatMap(t => Object.values(t).flat());
  for (const id of Object.keys(META.inactive)) {
    const q = all.find(x => x.id === id);
    assert.ok(q, `${id} still exists`);
    assert.equal(q.active, false);
    assert.ok(q.description && (q.answer !== undefined || q.testCases));
  }
});

test('original titles stay server-side and match the review metadata', () => {
  for (const [id, t] of Object.entries(META.titles)) {
    assert.equal(qmod.ORIGINAL_TITLES[id], t.was);
    const q = Object.values(qmod.QUESTIONS).flatMap(x => Object.values(x).flat()).find(x => x.id === id);
    assert.equal(q.title, t.title);
    // No field of the served object carries the original title. (Its wording may
    // still appear inside a prompt that names the quantity it asks for, e.g.
    // "What is the Macaulay Duration?" — that is part of the question.)
    assert.ok(!Object.values(q).includes(t.was) && !('originalTitle' in q), `${id}: original title served to players`);
  }
});

test('validator catches broken questions', () => {
  const easy = qmod.QUESTIONS.quant.easy;
  const backup = easy.slice();
  try {
    easy.push({ ...easy[0] });                                           // duplicate id
    easy.push({ id: 'zz1', type: 'numeric', title: 'X', description: 'Y', tolerance: 0, track: 'trading', active: true }); // no answer
    easy.push({ id: 'zz2', type: 'essay', title: 'X', description: 'Y', track: 'trading', active: true });            // bad type
    easy.push({ id: 'zz3', type: 'numeric', title: '', description: '', answer: 1, tolerance: 0, track: 'mystery', active: true });
    const errors = validateQuestionBank().join('\n');
    assert.match(errors, /duplicate id/);
    assert.match(errors, /zz1: missing or non-numeric answer/);
    assert.match(errors, /zz2: invalid type/);
    assert.match(errors, /zz3: missing title/);
    assert.match(errors, /zz3: unknown track/);
  } finally {
    easy.length = 0; easy.push(...backup);
  }
});
