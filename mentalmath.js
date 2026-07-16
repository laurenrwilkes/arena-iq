const GAME_DURATION = 120;
const RING_RADIUS = 52;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

let currentUser = null;
let audioCtx = null;

const DIFFICULTY_META = {
  easy: { name: 'Easy', icon: '🌱', desc: 'Two-digit addition/subtraction and simple multiplication/division.' },
  medium: { name: 'Medium', icon: '🎯', desc: 'Everything in Easy, plus 2-digit × 2-digit and trickier subtraction.' },
  hard: { name: 'Hard', icon: '🔥', desc: 'Everything in Medium, plus decimals and percentages.' },
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
};

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

function getUserStats() {
  const blank = { gamesPlayed: 0, highScores: { easy: 0, medium: 0, hard: 0 } };
  if (!currentUser) return blank;
  try {
    const raw = localStorage.getItem(statsKey());
    if (!raw) return blank;
    const parsed = JSON.parse(raw);
    return {
      gamesPlayed: parsed.gamesPlayed || 0,
      highScores: { easy: 0, medium: 0, hard: 0, ...(parsed.highScores || {}) },
    };
  } catch {
    return blank;
  }
}

function saveUserStats(stats) {
  if (!currentUser) return;
  try { localStorage.setItem(statsKey(), JSON.stringify(stats)); } catch {}
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

function niceDecimal() {
  const whole = randInt(1, 20);
  const fracs = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.25, 0.75];
  const frac = fracs[randInt(0, fracs.length - 1)];
  return Math.round((whole + frac) * 100) / 100;
}

function genDecimalAddSub() {
  const op = Math.random() < 0.5 ? '+' : '−';
  let a = niceDecimal(), b = niceDecimal();
  if (op === '−' && b > a) { const t = a; a = b; b = t; }
  let answer = op === '+' ? a + b : a - b;
  answer = Math.round(answer * 100) / 100;
  return { text: `${fmtNum(a)} ${op} ${fmtNum(b)}`, answer };
}

function genDecimalMul() {
  const fracs = [0.5, 0.25, 0.75, 0.1, 0.2, 0.4, 0.6, 0.8];
  const decimalNum = Math.round((randInt(1, 9) + fracs[randInt(0, fracs.length - 1)]) * 100) / 100;
  const multiplier = randInt(2, 9);
  const answer = Math.round(decimalNum * multiplier * 100) / 100;
  return { text: `${fmtNum(decimalNum)} × ${multiplier}`, answer };
}

function genPercent() {
  const percents = [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90];
  const pct = percents[randInt(0, percents.length - 1)];
  const base = randInt(1, 25) * 20;
  return { text: `${pct}% of ${base}`, answer: (pct * base) / 100 };
}

const GENERATORS = {
  easy: [genAdd, genSub, genMul, genDiv],
  medium: [genAdd, genSub, genMul, genDiv, genMul2x2, genSubAdvanced],
  hard: [genAdd, genSub, genMul, genDiv, genMul2x2, genSubAdvanced, genDecimalAddSub, genDecimalMul, genPercent],
};

function generateProblem(difficulty) {
  const pool = GENERATORS[difficulty];
  return pool[randInt(0, pool.length - 1)]();
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

// ── RENDER ────────────────────────────────────────────────────────────────────
function render() {
  const app = document.getElementById('app');
  if (!app) return;
  let html = '';
  if (STATE.view !== 'playing') html += renderTabs();
  if (STATE.activeTab === 'stats') html += renderStatsView();
  else if (STATE.view === 'select') html += renderSelect();
  else if (STATE.view === 'playing') html += renderPlaying();
  else if (STATE.view === 'gameover') html += renderGameOver();
  app.innerHTML = html;

  if (STATE.activeTab === 'play' && STATE.view === 'playing') {
    const input = document.getElementById('mmc-input');
    if (input) input.focus();
    updateRingDom();
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
  const diffs = ['easy', 'medium', 'hard'];
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
      <h1 style="margin-bottom:8px">Pick your difficulty</h1>
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
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle class="mmc-ring-bg" cx="60" cy="60" r="${RING_RADIUS}"></circle>
          <circle id="mmc-ring-fg" class="mmc-ring-fg" cx="60" cy="60" r="${RING_RADIUS}"
            stroke-dasharray="${RING_CIRCUMFERENCE}" stroke-dashoffset="0"></circle>
        </svg>
        <div id="mmc-ring-time" class="mmc-ring-time">${formatTime(STATE.timeLeft)}</div>
      </div>
      <div class="mmc-question">${q.text} = ?</div>
      <div class="mmc-input-row">
        <input type="text" inputmode="decimal" id="mmc-input" class="mmc-input" autocomplete="off" oninput="checkLiveAnswer(this)" />
      </div>
      <div style="font-size:0.78rem;color:var(--t3)">Type the answer — it advances automatically when correct</div>
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
    <h1>Time's up!</h1>
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
        <h1 style="margin-bottom:8px">Track your progress</h1>
      </div>
      <div class="mmc-guest-note">
        You're playing as a guest — scores aren't saved.<br/>
        <button class="btn btn-primary" style="margin-top:14px" onclick="showAuthModal(user => { currentUser = user; updateNavUser(); onAuthChanged(); })">Log In / Sign Up</button>
      </div>
    </div>`;
  }

  const stats = getUserStats();
  const diffs = ['easy', 'medium', 'hard'];
  const diffColor = { easy: 'var(--green)', medium: 'var(--gold)', hard: 'var(--red)' };
  const hsCards = diffs.map(d => {
    const meta = DIFFICULTY_META[d];
    return `
      <div class="mmc-hs-card">
        <div class="mmc-hs-diff" style="color:${diffColor[d]}">${meta.icon} ${meta.name}</div>
        <div class="mmc-hs-score">${stats.highScores[d] || 0}</div>
      </div>`;
  }).join('');

  const bestOverall = Math.max(stats.highScores.easy || 0, stats.highScores.medium || 0, stats.highScores.hard || 0);
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
      <h1 style="margin-bottom:8px">${currentUser.username}'s progress</h1>
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
  STATE.problem = generateProblem(difficulty);
  STATE.score = 0;
  STATE.timeLeft = GAME_DURATION;
  STATE.isNewHighScore = false;
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
  let v = el.value.replace(/[^0-9.\-]/g, '');
  v = v.replace(/(?!^)-/g, '');
  const dot = v.indexOf('.');
  if (dot !== -1) v = v.slice(0, dot + 1) + v.slice(dot + 1).replace(/\./g, '');
  el.value = v;
}

function checkLiveAnswer(el) {
  sanitizeInput(el);
  const raw = el.value.trim();
  if (raw === '' || raw === '-' || raw === '.') return;

  const val = parseFloat(raw);
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
  if (window.confirm('Quit this challenge? Your current run will end.')) endGame();
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
