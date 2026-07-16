const TOTAL_QUESTIONS = 80;
const TOTAL_SECONDS = 8 * 60;

let currentUser = null;

const STATE = {
  phase: 'menu', // menu | rules | game | result
  questions: [],
  index: 0,
  correct: 0,
  answered: 0,
  skipped: 0,
  timeLeft: TOTAL_SECONDS,
  timerInterval: null,
  startedAt: null,
};

async function init() {
  currentUser = await Auth.fetchMe();
  updateNavUser();
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

// ── RENDER ────────────────────────────────────────────────────────────────────
function render() {
  const app = document.getElementById('app');
  if (STATE.phase === 'menu') app.innerHTML = renderMenu();
  else if (STATE.phase === 'rules') app.innerHTML = renderRules();
  else if (STATE.phase === 'game') app.innerHTML = renderGame();
  else if (STATE.phase === 'result') app.innerHTML = renderResult();
  if (STATE.phase === 'game') {
    const input = document.getElementById('mm-input');
    if (input) input.focus();
  }
}

function renderMenu() {
  return `
  <div class="games-container">
    <div class="games-header">
      <div class="section-tag">Games</div>
      <h1 style="margin-bottom:8px">Speed drills &amp; mental math</h1>
      <p style="color:var(--t2);font-size:0.9rem">Practice the timed mental math tests used in real trading-firm interviews. Free, no account needed.</p>
    </div>
    <div class="game-grid">
      <div class="game-card lift-hover" role="button" tabindex="0" aria-label="Optiver 80 in 8 — mental math speed test" onclick="goToRules()" onkeydown="if(event.key==='Enter')goToRules()">
        <div class="game-card-icon">🧮</div>
        <div class="game-card-name">Optiver 80 in 8</div>
        <div class="game-card-sub">80 mental math questions in 8 minutes. Addition, subtraction, multiplication, division, and percentages — no calculator.</div>
        <div class="game-card-meta">
          <span class="game-tag">Mental Math</span>
          <span class="game-tag">8:00</span>
        </div>
      </div>
      <div class="game-card coming-soon" aria-hidden="true">
        <div class="game-card-icon">🎯</div>
        <div class="game-card-name">More games coming soon</div>
        <div class="game-card-sub">Got a speed test or brain teaser you'd like to see added? More drills are on the way.</div>
      </div>
    </div>
  </div>`;
}

function renderRules() {
  return `
  <div class="mm-setup">
    <div class="section-tag" style="justify-content:center;display:flex">Optiver 80 in 8</div>
    <h1>80 questions. 8 minutes. No calculator.</h1>
    <p>A single continuous mental math sprint — answer as many of the 80 questions as you can before the clock runs out. Press Enter to submit and move to the next question.</p>
    <div class="mm-rules">
      <ul>
        <li>• Mix of addition, subtraction, multiplication, division, and percentages</li>
        <li>• One 8:00 countdown for the whole test — no per-question limit</li>
        <li>• Press <strong>Enter</strong> to submit an answer, or click <strong>Skip</strong> to move on</li>
        <li>• The test ends automatically at 80 questions or when time runs out</li>
      </ul>
    </div>
    <div style="display:flex;gap:12px;justify-content:center">
      <button class="btn btn-outline" onclick="goToMenu()">← Back</button>
      <button class="btn btn-primary btn-lg" onclick="startGame()">Start Test →</button>
    </div>
  </div>`;
}

function renderGame() {
  const q = STATE.questions[STATE.index];
  const timerClass = STATE.timeLeft <= 30 ? 'mm-timer low' : 'mm-timer';
  return `
  <div class="mm-topbar">
    <div class="mm-progress">${STATE.index + 1} / ${TOTAL_QUESTIONS}</div>
    <div class="${timerClass}">${formatTime(STATE.timeLeft)}</div>
    <div class="mm-score">${STATE.correct} correct</div>
  </div>
  <div class="mm-game-area">
    <div class="mm-question">${q.text} = ?</div>
    <div class="mm-input-row">
      <input type="text" inputmode="numeric" id="mm-input" class="mm-input" autocomplete="off"
        onkeydown="if(event.key==='Enter') submitAnswer()" />
      <button class="btn btn-outline" onclick="skipQuestion()">Skip →</button>
    </div>
    <div class="mm-hint">Press Enter to submit</div>
  </div>`;
}

function renderResult() {
  const accuracy = STATE.answered > 0 ? Math.round((STATE.correct / STATE.answered) * 100) : 0;
  const timeUsed = TOTAL_SECONDS - STATE.timeLeft;
  return `
  <div class="mm-result">
    <div class="section-tag" style="justify-content:center;display:flex">Test Complete</div>
    <h1>Optiver 80 in 8 — Results</h1>
    <div class="mm-result-score" style="color:var(--green)">${STATE.correct}<span style="color:var(--t3);font-size:2rem">/${TOTAL_QUESTIONS}</span></div>
    <div class="mm-result-grid">
      <div class="mm-stat"><div class="mm-stat-value">${STATE.answered}</div><div class="mm-stat-label">Answered</div></div>
      <div class="mm-stat"><div class="mm-stat-value">${STATE.skipped}</div><div class="mm-stat-label">Skipped</div></div>
      <div class="mm-stat"><div class="mm-stat-value">${accuracy}%</div><div class="mm-stat-label">Accuracy</div></div>
    </div>
    <div class="mm-stat" style="max-width:220px;margin:0 auto 28px">
      <div class="mm-stat-value">${formatTime(timeUsed)}</div>
      <div class="mm-stat-label">Time Used</div>
    </div>
    <div class="mm-result-actions">
      <button class="btn btn-outline" onclick="goToMenu()">← Back to Games</button>
      <button class="btn btn-primary" onclick="startGame()">Try Again</button>
    </div>
  </div>`;
}

// ── NAVIGATION ────────────────────────────────────────────────────────────────
function goToMenu() {
  clearInterval(STATE.timerInterval);
  STATE.phase = 'menu';
  render();
}

function goToRules() {
  clearInterval(STATE.timerInterval);
  STATE.phase = 'rules';
  render();
}

// ── GAME LOGIC ────────────────────────────────────────────────────────────────
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeQuestion(type) {
  switch (type) {
    case 'add': {
      const a = randInt(100, 999), b = randInt(100, 999);
      return { text: `${a} + ${b}`, answer: a + b };
    }
    case 'sub': {
      let a = randInt(100, 999), b = randInt(10, 999);
      if (b > a) { const t = a; a = b; b = t; }
      return { text: `${a} − ${b}`, answer: a - b };
    }
    case 'mul': {
      const a = randInt(11, 99), b = randInt(2, 12);
      return { text: `${a} × ${b}`, answer: a * b };
    }
    case 'div': {
      const divisor = randInt(2, 12), quotient = randInt(4, 99);
      return { text: `${divisor * quotient} ÷ ${divisor}`, answer: quotient };
    }
    case 'pct': {
      const percents = [5, 10, 15, 20, 25, 50, 75];
      const pct = percents[randInt(0, percents.length - 1)];
      const base = randInt(1, 25) * 20;
      return { text: `${pct}% of ${base}`, answer: (pct * base) / 100 };
    }
  }
}

function generateQuestions(n) {
  const types = ['add', 'sub', 'mul', 'div', 'pct'];
  const arr = [];
  for (let i = 0; i < n; i++) arr.push(makeQuestion(types[i % types.length]));
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function startGame() {
  STATE.questions = generateQuestions(TOTAL_QUESTIONS);
  STATE.index = 0;
  STATE.correct = 0;
  STATE.answered = 0;
  STATE.skipped = 0;
  STATE.timeLeft = TOTAL_SECONDS;
  STATE.phase = 'game';
  render();
  clearInterval(STATE.timerInterval);
  STATE.timerInterval = setInterval(() => {
    STATE.timeLeft--;
    const timerEl = document.querySelector('.mm-timer');
    if (timerEl) {
      timerEl.textContent = formatTime(STATE.timeLeft);
      timerEl.className = STATE.timeLeft <= 30 ? 'mm-timer low' : 'mm-timer';
    }
    if (STATE.timeLeft <= 0) endGame();
  }, 1000);
}

function nextQuestion() {
  STATE.index++;
  if (STATE.index >= TOTAL_QUESTIONS) { endGame(); return; }
  render();
}

function submitAnswer() {
  const input = document.getElementById('mm-input');
  if (!input) return;
  const raw = input.value.trim();
  if (raw === '') { skipQuestion(); return; }

  const val = parseFloat(raw);
  const q = STATE.questions[STATE.index];
  const correct = !isNaN(val) && Math.abs(val - q.answer) < 1e-9;

  STATE.answered++;
  if (correct) STATE.correct++;

  input.disabled = true;
  input.classList.add(correct ? 'flash-correct' : 'flash-wrong');
  setTimeout(() => {
    if (input) { input.value = ''; input.disabled = false; }
    nextQuestion();
  }, 250);
}

function skipQuestion() {
  const input = document.getElementById('mm-input');
  STATE.skipped++;
  if (input) input.disabled = true;
  setTimeout(() => nextQuestion(), 100);
}

function endGame() {
  clearInterval(STATE.timerInterval);
  STATE.phase = 'result';
  render();
}

init();
