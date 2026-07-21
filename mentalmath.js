const GAME_DURATION = 120;
const VERBAL_QUESTION_SECONDS = 10;
const RING_RADIUS = 52;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

let currentUser = null;
let audioCtx = null;

const DIFFICULTY_META = {
  easy: { name: 'Easy', icon: '🌱', desc: 'Two-digit addition/subtraction and simple multiplication/division.' },
  medium: { name: 'Medium', icon: '🎯', desc: 'Everything in Easy, plus 2-digit × 2-digit and trickier subtraction.' },
  hard: { name: 'Hard', icon: '🔥', desc: '3-digit addition/subtraction, 2-digit × 2-digit multiplication, and multi-digit division.' },
  special: { name: 'Specialty', icon: '🧮', desc: 'A dedicated mixed-skills challenge: fractions, decimals, and percentages.' },
  verbal: { name: 'Verbal Interview', icon: '🎤', desc: '5 spoken questions, 10 seconds each — no numbers on screen. Just listen and answer.' },
};

const MOCK_LEADERBOARD = [
  { name: 'Ada_Lovelace', score: 55 },
  { name: 'ByteSized', score: 42 },
  { name: 'QuantumLeap', score: 35 },
  { name: 'MentalGiant', score: 22 },
  { name: 'CalcKid', score: 14 },
];

const STATE = {
  activeTab: 'play', // play | stats
  view: 'select', // select | playing | gameover
  difficulty: null,
  selectedDifficulty: null,
  problem: null,
  score: 0,
  timeLeft: GAME_DURATION,
  timerInterval: null,
  isNewHighScore: false,
  // Verbal Interview mode — a fixed 5-question sequence, not the continuous timer above.
  verbalQuestions: [],
  verbalIndex: 0,
  verbalAnswers: [],
  verbalCorrectFlags: [],
  verbalTimeLeft: VERBAL_QUESTION_SECONDS,
  verbalInterval: null,
};

// Speech is disruptive if it keeps talking after the player navigates away.
window.addEventListener('beforeunload', () => { try { speechSynthesis.cancel(); } catch {} });

// ── INIT ──────────────────────────────────────────────────────────────────────
async function init() {
  currentUser = await Auth.fetchMe();
  updateNavUser();
  render();
}

function onAuthChanged() {
  render();
}

function updateNavUser() {
  const nameEl = document.getElementById('nav-username');
  const loginEl = document.getElementById('nav-login');
  const menuName = document.getElementById('profile-menu-name');
  const menuElo = document.getElementById('profile-menu-elo');
  if (currentUser) {
    if (nameEl) { nameEl.style.display = 'flex'; nameEl.textContent = currentUser.username.charAt(0).toUpperCase(); }
    if (loginEl) loginEl.style.display = 'none';
    if (menuName) menuName.textContent = currentUser.username;
    if (menuElo) menuElo.textContent = `${currentUser.elo.toLocaleString()} ELO`;
  } else {
    if (nameEl) nameEl.style.display = 'none';
    if (loginEl) loginEl.style.display = '';
  }
}

// ── PERSISTENCE (per logged-in site account; guests aren't saved) ───────────
function statsKey() {
  return `mm_stats_${(currentUser?.username || '').toLowerCase()}`;
}

function defaultStatsState() {
  return { gamesPlayed: 0, highScores: { easy: 0, medium: 0, hard: 0, special: 0, verbal: 0 } };
}

function getUserStats() {
  const defaults = defaultStatsState();
  if (!currentUser) return defaults;
  
  // Lazy hydrate from localStorage with proper schema validation
  const stored = hydrateFromStorage(statsKey(), defaults);
  
  // Ensure highScores object has all difficulty keys (handles schema migrations)
  if (!stored.highScores || typeof stored.highScores !== 'object') {
    stored.highScores = defaults.highScores;
  }
  for (const diff of ['easy', 'medium', 'hard', 'special', 'verbal']) {
    if (!(diff in stored.highScores)) stored.highScores[diff] = 0;
  }
  
  logProfileEngine(`Hydrated mental math stats for user: ${currentUser.username}`, { gamesPlayed: stored.gamesPlayed, highScores: stored.highScores });
  return stored;
}

function saveUserStats(stats) {
  if (!currentUser) return;
  persistToStorage(statsKey(), stats, defaultStatsState());
}

function getHighScore(difficulty) {
  return getUserStats().highScores[difficulty] || 0;
}

function resetUserData() {
  if (!currentUser) return;
  if (!window.confirm('Reset your Mental Math Challenge stats (games played and high scores)? This cannot be undone.')) return;
  try { localStorage.removeItem(statsKey()); } catch {}
  render();
}

// ── PROBLEM GENERATION ───────────────────────────────────────────────────────
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fmtNum(n) {
  return Number(n.toFixed(2)).toString();
}

function genAdd() {
  const a = randInt(10, 99), b = randInt(10, 99);
  return { text: `${a} + ${b}`, answer: a + b };
}

function genSub() {
  let a = randInt(10, 99), b = randInt(10, 99);
  if (b > a) { const t = a; a = b; b = t; }
  return { text: `${a} − ${b}`, answer: a - b };
}

function genMul() {
  const a = randInt(1, 100), b = randInt(1, 12);
  return { text: `${a} × ${b}`, answer: a * b };
}

function genDiv() {
  const a = randInt(1, 100), b = randInt(1, 12);
  const c = a * b;
  return { text: `${c} ÷ ${b}`, answer: a };
}

function genMul2x2() {
  const a = randInt(10, 99), b = randInt(10, 99);
  return { text: `${a} × ${b}`, answer: a * b };
}

function genSubAdvanced() {
  let a = randInt(100, 999), b = randInt(10, 999);
  if (b > a) { const t = a; a = b; b = t; }
  return { text: `${a} − ${b}`, answer: a - b };
}

// ── HARD MODE: 3-digit ± 3-digit, 2x2 multiplication (reuses genMul2x2), ────
// and 3-to-4-digit ÷ 2-digit-divisor (always a clean integer answer).
function genHard3DigitAddSub() {
  const op = Math.random() < 0.5 ? '+' : '−';
  let a = randInt(100, 999), b = randInt(100, 999);
  if (op === '−' && b > a) { const t = a; a = b; b = t; }
  const answer = op === '+' ? a + b : a - b;
  return { text: `${a} ${op} ${b}`, answer };
}

function genHardDiv() {
  const x = randInt(10, 99), y = randInt(10, 99);
  const z = x * y; // always 100–9801, i.e. always 3 or 4 digits
  return { text: `${z} ÷ ${x}`, answer: y };
}

// ── SPECIALTY MODE: fractions, decimals, percentages ────────────────────────
function niceDecimal() {
  const whole = randInt(1, 20);
  const cents = randInt(0, 99); // hundredths, so values land on up to 2 decimal places
  return Math.round((whole + cents / 100) * 100) / 100;
}

function genDecimalAddSub() {
  const op = Math.random() < 0.5 ? '+' : '−';
  let a = niceDecimal(), b = niceDecimal();
  if (op === '−' && b > a) { const t = a; a = b; b = t; }
  let answer = op === '+' ? a + b : a - b;
  answer = Math.round(answer * 100) / 100;
  return { text: `${fmtNum(a)} ${op} ${fmtNum(b)}`, answer };
}

function genPercent() {
  const percents = [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90];
  const pct = percents[randInt(0, percents.length - 1)];
  const base = randInt(1, 25) * 20;
  return { text: `${pct}% of ${base}`, answer: (pct * base) / 100 };
}

function genFraction() {
  const denominators = [2, 3, 4, 5, 6, 8, 10];
  const d = denominators[randInt(0, denominators.length - 1)];
  const op = Math.random() < 0.5 ? '+' : '−';
  let n1 = randInt(1, d - 1), n2 = randInt(1, d - 1);
  if (op === '−' && n2 > n1) { const t = n1; n1 = n2; n2 = t; }
  const answer = op === '+' ? (n1 + n2) / d : (n1 - n2) / d;
  return { text: `${n1}/${d} ${op} ${n2}/${d}`, answer };
}

const GENERATORS = {
  easy: [genAdd, genSub, genMul, genDiv],
  medium: [genAdd, genSub, genMul, genDiv, genMul2x2, genSubAdvanced],
  hard: [genHard3DigitAddSub, genMul2x2, genHardDiv],
  special: [genFraction, genDecimalAddSub, genPercent],
};

function generateProblem(difficulty) {
  const pool = GENERATORS[difficulty];
  return pool[randInt(0, pool.length - 1)]();
}

// ── VERBAL INTERVIEW MODE: a fixed 5-question sequence (add/sub, 3x mult, ──
// percent), spoken aloud instead of shown on screen.
function genVerbalAddSub3Digit() {
  const op = Math.random() < 0.5 ? '+' : '−';
  let a = randInt(100, 999), b = randInt(100, 999);
  if (op === '−' && b > a) { const t = a; a = b; b = t; }
  return { text: `${a} ${op} ${b}`, answer: op === '+' ? a + b : a - b };
}

function genVerbalPercent3Digit() {
  const percents = [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90];
  const pct = percents[randInt(0, percents.length - 1)];
  const base = randInt(5, 49) * 20; // multiple of 20, 100-980 — keeps the % answer a clean whole number
  return { text: `${pct}% of ${base}`, answer: (pct * base) / 100 };
}

function generateVerbalSequence() {
  return [genVerbalAddSub3Digit(), genMul2x2(), genMul2x2(), genMul2x2(), genVerbalPercent3Digit()];
}

function toSpokenQuestion(text) {
  const spoken = text
    .replace(/×/g, 'times')
    .replace(/−/g, 'minus')
    .replace(/\+/g, 'plus')
    .replace(/%/g, 'percent');
  return `What is ${spoken}?`;
}

// ── AUDIO ─────────────────────────────────────────────────────────────────────
function getAudioCtx() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  return audioCtx;
}

function beep(freq, dur, type, vol) {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  } catch {}
}

function playCorrectSound() {
  beep(660, 0.09, 'sine', 0.12);
}

// ── SPEECH (Verbal Interview mode) ───────────────────────────────────────────
function speakText(text) {
  if (!('speechSynthesis' in window)) return false;
  try {
    speechSynthesis.cancel(); // avoid overlapping queued utterances from a prior question
    speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    return true;
  } catch {
    return false;
  }
}

function speakCurrentVerbalQuestion() {
  const q = STATE.verbalQuestions[STATE.verbalIndex];
  if (q) speakText(toSpokenQuestion(q.text));
}

function replayVerbalAudio() {
  speakCurrentVerbalQuestion();
}

// ── RENDER ────────────────────────────────────────────────────────────────────
function render() {
  const app = document.getElementById('app');
  if (!app) return;
  let html = '';
  if (STATE.view !== 'playing') html += renderTabs();
  if (STATE.activeTab === 'stats') html += renderStatsView();
  else if (STATE.view === 'select') html += renderSelect();
  else if (STATE.view === 'playing') html += (STATE.difficulty === 'verbal' ? renderVerbalPlaying() : renderPlaying());
  else if (STATE.view === 'gameover') html += (STATE.difficulty === 'verbal' ? renderVerbalGameOver() : renderGameOver());
  app.innerHTML = html;

  if (STATE.activeTab === 'play' && STATE.view === 'playing') {
    const input = document.getElementById('mmc-input');
    if (input) input.focus();
    if (STATE.difficulty === 'verbal') updateVerbalRingDom(); else updateRingDom();
  }
}

function setActiveTab(tab) {
  STATE.activeTab = tab;
  render();
}

function renderTabs() {
  return `
  <div class="mmc-tabs">
    <button class="mmc-tab-btn ${STATE.activeTab === 'play' ? 'active' : ''}" onclick="setActiveTab('play')">🎮 Mental Math Challenge</button>
    <button class="mmc-tab-btn ${STATE.activeTab === 'stats' ? 'active' : ''}" onclick="setActiveTab('stats')">👤 Profile &amp; Stats</button>
  </div>`;
}

function renderSelect() {
  const diffs = ['easy', 'medium', 'hard', 'special', 'verbal'];
  const cards = diffs.map(d => {
    const meta = DIFFICULTY_META[d];
    const selected = STATE.selectedDifficulty === d ? 'selected' : '';
    let hsHtml;
    if (currentUser) {
      const hs = getHighScore(d);
      hsHtml = hs > 0
        ? `<div class="diff-highscore">🏆 High Score: ${hs} correct</div>`
        : `<div class="diff-highscore none">No high score yet</div>`;
    } else {
      hsHtml = `<div class="diff-highscore none">Log in to save high scores</div>`;
    }
    return `
      <div class="diff-card ${selected}" role="button" tabindex="0" aria-label="${meta.name} difficulty" onclick="selectDifficulty('${d}')" onkeydown="if(event.key==='Enter')selectDifficulty('${d}')">
        <div class="diff-icon">${meta.icon}</div>
        <div class="diff-name">${meta.name}</div>
        <div class="diff-sub">${meta.desc}</div>
        ${hsHtml}
      </div>`;
  }).join('');

  const startDisabled = !STATE.selectedDifficulty;

  return `
  <div class="mmc-container">
    <div class="mmc-header">
      <div class="section-tag">Mental Math Challenge</div>
      <h2 style="margin-bottom:8px">Pick your difficulty</h2>
      <p style="color:var(--t2);font-size:0.9rem">2 minutes on the clock. Type the answer — get it right and you'll move on automatically. Your score is just the number you get correct.${currentUser ? '' : ' Log in from the nav above to save your high scores.'}</p>
    </div>
    <div class="diff-grid">${cards}</div>
    <div style="text-align:center">
      <button class="btn btn-primary btn-lg" ${startDisabled ? 'disabled' : ''} style="${startDisabled ? 'opacity:0.4;cursor:not-allowed' : ''}" onclick="startGame('${STATE.selectedDifficulty || ''}')">Start Challenge →</button>
    </div>
  </div>`;
}

function selectDifficulty(d) {
  STATE.selectedDifficulty = d;
  render();
}

function renderPlaying() {
  const q = STATE.problem;
  const meta = DIFFICULTY_META[STATE.difficulty];
  return `
  <div style="position:relative">
    <div class="mmc-topbar">
      <div class="mmc-topbar-stat">
        <div class="mmc-topbar-label">Difficulty</div>
        <div class="mmc-topbar-value">${meta.icon} ${meta.name}</div>
      </div>
      <div class="mmc-topbar-stat">
        <div class="mmc-topbar-label">Correct</div>
        <div class="mmc-topbar-value" id="mmc-score-value">${STATE.score}</div>
      </div>
    </div>
    <button class="btn btn-ghost mmc-quit" onclick="quitGame()" aria-label="Quit challenge">✕ Quit</button>
    <div class="mmc-play-area">
      <div class="mmc-ring-wrap">
        <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
          <circle class="mmc-ring-bg" cx="60" cy="60" r="${RING_RADIUS}"></circle>
          <circle id="mmc-ring-fg" class="mmc-ring-fg" cx="60" cy="60" r="${RING_RADIUS}"
            stroke-dasharray="${RING_CIRCUMFERENCE}" stroke-dashoffset="0"></circle>
        </svg>
        <div id="mmc-ring-time" class="mmc-ring-time">${formatTime(STATE.timeLeft)}</div>
      </div>
      <div class="mmc-question">${q.text} = ?</div>
      <div class="mmc-input-row">
        <input type="text" inputmode="${STATE.difficulty === 'special' ? 'text' : 'decimal'}" id="mmc-input" class="mmc-input" autocomplete="off" oninput="checkLiveAnswer(this)" />
      </div>
      <div style="font-size:0.78rem;color:var(--t3)">
        ${STATE.difficulty === 'special'
          ? 'Type the answer as a decimal or fraction (e.g. 0.75 or 3/4) — it advances automatically when correct'
          : 'Type the answer — it advances automatically when correct'}
      </div>
    </div>
  </div>`;
}

function renderVerbalPlaying() {
  const q = STATE.verbalQuestions[STATE.verbalIndex];
  const meta = DIFFICULTY_META.verbal;
  const total = STATE.verbalQuestions.length;
  const speechSupported = 'speechSynthesis' in window;
  const listenLine = speechSupported
    ? '🔊 Listen carefully — no numbers on screen'
    : `Speech playback isn't supported here: ${q.text} = ?`;
  return `
  <div style="position:relative">
    <div class="mmc-topbar">
      <div class="mmc-topbar-stat">
        <div class="mmc-topbar-label">${meta.icon} Question</div>
        <div class="mmc-topbar-value">${STATE.verbalIndex + 1} of ${total}</div>
      </div>
      <div class="mmc-topbar-stat">
        <div class="mmc-topbar-label">Correct</div>
        <div class="mmc-topbar-value" id="mmc-score-value">${STATE.score}</div>
      </div>
    </div>
    <button class="btn btn-ghost mmc-quit" onclick="quitGame()" aria-label="Quit challenge">✕ Quit</button>
    <div class="mmc-play-area">
      <div class="mmc-ring-wrap">
        <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
          <circle class="mmc-ring-bg" cx="60" cy="60" r="${RING_RADIUS}"></circle>
          <circle id="mmc-ring-fg" class="mmc-ring-fg" cx="60" cy="60" r="${RING_RADIUS}"
            stroke-dasharray="${RING_CIRCUMFERENCE}" stroke-dashoffset="0"></circle>
        </svg>
        <div id="mmc-ring-time" class="mmc-ring-time">${STATE.verbalTimeLeft}</div>
      </div>
      <div class="mmc-question" style="font-size:1.15rem;color:var(--t2)">
        ${speechSupported ? '' : '⚠️ '}${listenLine}
      </div>
      <div class="mmc-input-row">
        <input type="text" inputmode="decimal" id="mmc-input" class="mmc-input" autocomplete="off"
          onkeydown="if(event.key==='Enter') submitVerbalAnswer()" />
      </div>
      <div style="display:flex;gap:10px">
        <button class="btn btn-outline" onclick="replayVerbalAudio()">🔁 Replay Audio</button>
        <button class="btn btn-primary" onclick="submitVerbalAnswer()">Submit</button>
      </div>
    </div>
  </div>`;
}

function updateVerbalRingDom() {
  const fg = document.getElementById('mmc-ring-fg');
  const timeText = document.getElementById('mmc-ring-time');
  if (!fg || !timeText) return;
  const fraction = Math.max(0, STATE.verbalTimeLeft) / VERBAL_QUESTION_SECONDS;
  fg.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - fraction));
  fg.classList.toggle('warn', STATE.verbalTimeLeft <= 3);
  timeText.textContent = String(Math.max(0, STATE.verbalTimeLeft));
}

function startVerbalTimer() {
  clearInterval(STATE.verbalInterval);
  STATE.verbalTimeLeft = VERBAL_QUESTION_SECONDS;
  updateVerbalRingDom();
  STATE.verbalInterval = setInterval(() => {
    STATE.verbalTimeLeft--;
    updateVerbalRingDom();
    if (STATE.verbalTimeLeft <= 0) recordVerbalAnswer(null);
  }, 1000);
}

function submitVerbalAnswer() {
  const input = document.getElementById('mmc-input');
  const raw = input ? input.value.trim() : '';
  recordVerbalAnswer(raw === '' ? null : raw);
}

function recordVerbalAnswer(raw) {
  clearInterval(STATE.verbalInterval);
  const q = STATE.verbalQuestions[STATE.verbalIndex];
  const val = raw === null ? NaN : parseFloat(raw);
  const correct = !isNaN(val) && Math.abs(val - q.answer) < 0.005;

  STATE.verbalAnswers.push(raw);
  STATE.verbalCorrectFlags.push(correct);
  if (correct) STATE.score++;

  STATE.verbalIndex++;
  if (STATE.verbalIndex >= STATE.verbalQuestions.length) {
    endVerbalGame();
  } else {
    render();
    speakCurrentVerbalQuestion();
    startVerbalTimer();
  }
}

function startVerbalGame() {
  STATE.verbalQuestions = generateVerbalSequence();
  STATE.verbalIndex = 0;
  STATE.verbalAnswers = [];
  STATE.verbalCorrectFlags = [];
  STATE.score = 0;
  STATE.view = 'playing';
  render();
  speakCurrentVerbalQuestion();
  startVerbalTimer();
}

function endVerbalGame() {
  clearInterval(STATE.verbalInterval);
  try { speechSynthesis.cancel(); } catch {}
  STATE.view = 'gameover';
  if (currentUser) {
    const stats = getUserStats();
    stats.gamesPlayed++;
    const prevBest = stats.highScores.verbal || 0;
    STATE.isNewHighScore = STATE.score > prevBest;
    stats.highScores.verbal = Math.max(prevBest, STATE.score);
    saveUserStats(stats);
  }
  render();
  if (STATE.isNewHighScore) launchConfetti();
}

function renderVerbalGameOver() {
  const meta = DIFFICULTY_META.verbal;
  const total = STATE.verbalQuestions.length;
  const badge = STATE.isNewHighScore ? `<div class="mmc-badge-new">🏆 New High Score!</div>` : '';
  const saveNote = currentUser ? '' : `<p style="color:var(--t3);font-size:0.82rem;margin-bottom:16px">Log in from the nav above to save this score.</p>`;
  const reviewRows = STATE.verbalQuestions.map((q, i) => {
    const raw = STATE.verbalAnswers[i];
    const userAnswer = raw === null || raw === undefined ? '(no answer)' : raw;
    const correct = STATE.verbalCorrectFlags[i];
    return `
      <div class="mmc-hs-card" style="text-align:left">
        <div style="font-size:0.78rem;color:var(--t3);margin-bottom:4px">Question ${i + 1}</div>
        <div style="font-family:'JetBrains Mono',monospace;font-weight:700;margin-bottom:6px">${q.text} = ?</div>
        <div style="font-size:0.85rem;color:${correct ? 'var(--green)' : 'var(--red)'}">
          Your answer: ${userAnswer} ${correct ? '✓' : `✗ (correct: ${fmtNum(q.answer)})`}
        </div>
      </div>`;
  }).join('');

  return `
  <div class="mmc-result">
    <div class="section-tag" style="justify-content:center;display:flex">${meta.icon} ${meta.name} — Complete</div>
    ${badge}
    <h2>Interview Complete</h2>
    <div class="mmc-result-score">${STATE.score}<span style="color:var(--t3);font-size:1.6rem">/${total}</span></div>
    <div style="color:var(--t3);font-size:0.82rem;margin-top:-18px;margin-bottom:8px">correct answers</div>
    ${saveNote}
    <div class="mmc-section-label">Review</div>
    <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:28px">${reviewRows}</div>
    <div class="mmc-result-actions">
      <button class="btn btn-outline" onclick="backToSelect()">Change Difficulty</button>
      <button class="btn btn-primary" onclick="startGame('verbal')">Try Again →</button>
    </div>
  </div>`;
}

function renderGameOver() {
  const meta = DIFFICULTY_META[STATE.difficulty];
  const timeUsed = GAME_DURATION - Math.max(0, STATE.timeLeft);
  const avgSec = STATE.score > 0 ? (timeUsed / STATE.score).toFixed(1) : '—';
  const badge = STATE.isNewHighScore ? `<div class="mmc-badge-new">🏆 New High Score!</div>` : '';
  const saveNote = currentUser ? '' : `<p style="color:var(--t3);font-size:0.82rem;margin-bottom:16px">Log in from the nav above to save this score.</p>`;
  return `
  <div class="mmc-result">
    <div class="section-tag" style="justify-content:center;display:flex">${meta.icon} ${meta.name} — Complete</div>
    ${badge}
    <h2>Time's up!</h2>
    <div class="mmc-result-score">${STATE.score}</div>
    <div style="color:var(--t3);font-size:0.82rem;margin-top:-18px;margin-bottom:8px">correct answers</div>
    <div class="mmc-stat-grid">
      <div class="mmc-stat"><div class="mmc-stat-value">${formatTime(timeUsed)}</div><div class="mmc-stat-label">Time Used</div></div>
      <div class="mmc-stat"><div class="mmc-stat-value">${avgSec}s</div><div class="mmc-stat-label">Avg / Question</div></div>
    </div>
    ${saveNote}
    <div class="mmc-result-actions">
      <button class="btn btn-outline" onclick="backToSelect()">Change Difficulty</button>
      <button class="btn btn-primary" onclick="startGame('${STATE.difficulty}')">Try Again →</button>
    </div>
  </div>`;
}

function renderStatsView() {
  if (!currentUser) {
    return `
    <div class="mmc-container">
      <div class="mmc-header">
        <div class="section-tag">Profile &amp; Stats</div>
        <h2 style="margin-bottom:8px">Track your progress</h2>
      </div>
      <div class="mmc-guest-note">
        You're playing as a guest — scores aren't saved.<br/>
        <button class="btn btn-primary" style="margin-top:14px" onclick="showAuthModal(user => { currentUser = user; updateNavUser(); onAuthChanged(); })">Log In / Sign Up</button>
      </div>
    </div>`;
  }

  const stats = getUserStats();
  const diffs = ['easy', 'medium', 'hard', 'special', 'verbal'];
  const diffColor = { easy: 'var(--green)', medium: 'var(--gold)', hard: 'var(--red)', special: 'var(--purple-l)', verbal: 'var(--cyan)' };
  const hsCards = diffs.map(d => {
    const meta = DIFFICULTY_META[d];
    return `
      <div class="mmc-hs-card">
        <div class="mmc-hs-diff" style="color:${diffColor[d]}">${meta.icon} ${meta.name}</div>
        <div class="mmc-hs-score">${stats.highScores[d] || 0}</div>
      </div>`;
  }).join('');

  const bestOverall = Math.max(stats.highScores.easy || 0, stats.highScores.medium || 0, stats.highScores.hard || 0, stats.highScores.special || 0, stats.highScores.verbal || 0);
  const board = [...MOCK_LEADERBOARD, { name: currentUser.username, score: bestOverall, you: true }]
    .sort((a, b) => b.score - a.score);
  const lbRows = board.map((row, i) => `
    <div class="mmc-lb-row ${row.you ? 'you' : ''}">
      <div class="mmc-lb-rank">#${i + 1}</div>
      <div class="mmc-lb-name">${row.you ? `${row.name} (you)` : row.name}</div>
      <div class="mmc-lb-score">${row.score}</div>
    </div>`).join('');

  return `
  <div class="mmc-container">
    <div class="mmc-header">
      <div class="section-tag">Profile &amp; Stats</div>
      <h2 style="margin-bottom:8px">${currentUser.username}'s progress</h2>
    </div>
    <div class="mmc-stats-grid">
      <div class="mmc-bigstat"><div class="mmc-bigstat-value">${stats.gamesPlayed}</div><div class="mmc-bigstat-label">Games Played</div></div>
      <div class="mmc-bigstat"><div class="mmc-bigstat-value">${bestOverall}</div><div class="mmc-bigstat-label">Best Score</div></div>
    </div>
    <div class="mmc-section-label">High Scores</div>
    <div class="mmc-hs-grid">${hsCards}</div>
    <div class="mmc-section-label">Leaderboard</div>
    <div style="margin-bottom:28px">${lbRows}</div>
    <button class="btn btn-outline" onclick="resetUserData()">🗑 Reset My Data</button>
  </div>`;
}

// ── GAME LOOP ─────────────────────────────────────────────────────────────────
function formatTime(totalSeconds) {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

function startGame(difficulty) {
  if (!difficulty) return;
  STATE.difficulty = difficulty;
  STATE.isNewHighScore = false;
  if (difficulty === 'verbal') { startVerbalGame(); return; }

  STATE.problem = generateProblem(difficulty);
  STATE.score = 0;
  STATE.timeLeft = GAME_DURATION;
  STATE.view = 'playing';
  render();

  clearInterval(STATE.timerInterval);
  STATE.timerInterval = setInterval(() => {
    STATE.timeLeft--;
    updateRingDom();
    if (STATE.timeLeft <= 0) endGame();
  }, 1000);
}

function updateRingDom() {
  const fg = document.getElementById('mmc-ring-fg');
  const timeText = document.getElementById('mmc-ring-time');
  if (!fg || !timeText) return;
  const fraction = Math.max(0, STATE.timeLeft) / GAME_DURATION;
  fg.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - fraction));
  fg.classList.toggle('warn', STATE.timeLeft <= 10);
  timeText.textContent = formatTime(STATE.timeLeft);
}

function sanitizeInput(el) {
  let v = el.value.replace(/[^0-9./\-]/g, '');
  v = v.replace(/(?!^)-/g, '');
  const slash = v.indexOf('/');
  if (slash !== -1) v = v.slice(0, slash + 1) + v.slice(slash + 1).replace(/\//g, '');
  const dot = v.indexOf('.');
  if (dot !== -1) v = v.slice(0, dot + 1) + v.slice(dot + 1).replace(/\./g, '');
  el.value = v;
}

// Accepts plain decimals ("0.75") as well as fraction strings ("3/4") — any
// fraction mathematically equivalent to the answer (e.g. "6/8") passes too,
// since both sides are compared as plain numbers.
function parseAnswerInput(raw) {
  if (raw.includes('/')) {
    const [numStr, denStr] = raw.split('/');
    const num = parseFloat(numStr), den = parseFloat(denStr);
    if (isNaN(num) || isNaN(den) || den === 0) return NaN;
    return num / den;
  }
  return parseFloat(raw);
}

function checkLiveAnswer(el) {
  sanitizeInput(el);
  const raw = el.value.trim();
  if (raw === '' || raw === '-' || raw === '.' || raw === '/') return;

  const val = parseAnswerInput(raw);
  if (isNaN(val)) return;
  if (Math.abs(val - STATE.problem.answer) >= 0.005) return;

  STATE.score++;
  playCorrectSound();
  el.classList.add('correct');
  el.disabled = true;

  const scoreEl = document.getElementById('mmc-score-value');
  if (scoreEl) scoreEl.textContent = STATE.score;

  setTimeout(() => {
    if (STATE.view !== 'playing') return;
    STATE.problem = generateProblem(STATE.difficulty);
    render();
  }, 200);
}

function quitGame() {
  if (!window.confirm('Quit this challenge? Your current run will end.')) return;
  if (STATE.difficulty === 'verbal') endVerbalGame(); else endGame();
}

function endGame() {
  clearInterval(STATE.timerInterval);
  STATE.view = 'gameover';
  if (currentUser) {
    const stats = getUserStats();
    stats.gamesPlayed++;
    const prevBest = stats.highScores[STATE.difficulty] || 0;
    STATE.isNewHighScore = STATE.score > prevBest;
    stats.highScores[STATE.difficulty] = Math.max(prevBest, STATE.score);
    saveUserStats(stats);
  }
  render();
  if (STATE.isNewHighScore) launchConfetti();
}

function backToSelect() {
  if (STATE.difficulty === 'verbal') {
    clearInterval(STATE.verbalInterval);
    try { speechSynthesis.cancel(); } catch {}
  }
  STATE.view = 'select';
  render();
}

// ── CONFETTI ──────────────────────────────────────────────────────────────────
function launchConfetti() {
  const colors = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#38bdf8'];
  for (let i = 0; i < 48; i++) {
    const el = document.createElement('div');
    el.className = 'mmc-confetti-piece';
    el.style.left = `${Math.random() * 100}vw`;
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.animationDuration = `${1.8 + Math.random() * 1.4}s`;
    el.style.animationDelay = `${Math.random() * 0.4}s`;
    el.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3600);
  }
}

init();
