const SERVER = window.location.origin;
let socket = null;
let currentUser = null;
let queueTimer = null;
const FLAG_ICON = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>';

const STATE = {
  phase: 'setup',   // setup | matchmaking | game | result
  category: null,
  difficulty: null,
  mode: null,
  gameId: null,
  question: null,
  timeLimit: 0,
  timeLeft: 0,
  timerInterval: null,
  myAnswerCorrect: null,
  opponent: null,
  resultData: null,
  testsRun: false,
  numericChecked: false,
  numericCheckCorrect: false,
  language: 'javascript',
  multiQuestion: false,
  questions: [],
  questionIndex: 0,
  myScore: 0,
  oppSubmitted: 0,
  hintUsed: false,

  // Quant battle: two-phase (Blitz → Tactical)
  isQuantBattle: false,
  battlePhase: 'blitz', // blitz | tactical
  blitzQuestion: null,
  blitzScore: 0,
  blitzOppScore: 0,
  blitzDuration: 120,
  blitzTimeLeft: 120,
  blitzInterval: null,
  blitzPointWon: false,
  tacticalQuestions: [],
  tacticalAnswers: {},
  tacticalIndex: 0,
  tacticalTimeLimit: 0,
  tacticalTimeLeft: 0,
  tacticalInterval: null,
  tacticalSubmitted: false,
};

// ── INIT ──────────────────────────────────────────────────────────────────────
async function init() {
  currentUser = await Auth.fetchMe();
  const params = new URLSearchParams(window.location.search);
  STATE.pendingRoomCode = params.get('room');
  connectSocket();
  render();
}

function connectSocket() {
  const token = Auth.getToken();
  socket = io(SERVER, { auth: token ? { token } : {}, reconnection: true, reconnectionAttempts: 5, timeout: 5000 });
  socket.on('connect', () => updateServerBanner(true));
  socket.on('disconnect', () => updateServerBanner(false));
  socket.on('connect_error', () => updateServerBanner(false));

  socket.on('match_found', (data) => {
    clearInterval(queueTimer);
    STATE.phase = 'game';
    STATE.gameId = data.gameId;
    STATE.opponent = data.opponent;
    STATE.myAnswerCorrect = null;
    STATE.isQuantBattle = !!data.isQuantBattle;

    if (STATE.isQuantBattle) {
      STATE.battlePhase = 'blitz';
      STATE.blitzQuestion = { text: data.blitzQuestion };
      STATE.blitzScore = 0;
      STATE.blitzOppScore = 0;
      STATE.blitzDuration = data.blitzDuration;
      STATE.blitzTimeLeft = data.blitzDuration;
      render();
      startBlitzTimer();
      return;
    }

    STATE.multiQuestion = data.multiQuestion || false;
    STATE.questions = data.questions || [data.question];
    STATE.questionIndex = 0;
    STATE.question = STATE.questions[0];
    STATE.timeLimit = data.timeLimit;
    STATE.timeLeft = data.timeLimit;
    STATE.myScore = 0;
    STATE.oppSubmitted = 0;
    STATE.hintUsed = false;
    STATE.testsRun = false;
    STATE.numericChecked = false;
    STATE.numericCheckCorrect = false;
    render();
    startTimer();
  });

  socket.on('blitz_question', ({ correct, yourScore, question }) => {
    STATE.blitzScore = yourScore;
    STATE.blitzQuestion = { text: question };
    const qEl = document.getElementById('blitz-question');
    if (qEl) qEl.textContent = `${question} = ?`;
    const scoreEl = document.getElementById('blitz-score');
    if (scoreEl) scoreEl.textContent = yourScore;
    const input = document.getElementById('blitz-input');
    if (input) { input.value = ''; input.focus(); }
  });

  socket.on('blitz_opponent_update', ({ opponentScore }) => {
    STATE.blitzOppScore = opponentScore;
    const el = document.getElementById('blitz-opp-score');
    if (el) el.textContent = opponentScore;
  });

  socket.on('phase2_start', (data) => {
    clearInterval(STATE.blitzInterval);
    STATE.battlePhase = 'tactical';
    STATE.blitzPointWon = !!data.blitzPointWon;
    STATE.tacticalQuestions = data.questions || [];
    STATE.tacticalAnswers = {};
    STATE.tacticalIndex = 0;
    STATE.tacticalTimeLimit = data.timeLimit;
    STATE.tacticalTimeLeft = data.timeLimit;
    STATE.tacticalSubmitted = false;
    render();
    startTacticalTimer();
  });

  socket.on('opponent_progress', ({ submitted }) => {
    STATE.oppSubmitted = submitted;
    const total = STATE.questions.length;
    const el = document.getElementById('opp-status');
    if (el) {
      el.textContent = `${STATE.opponent?.username || 'Opponent'}: ${submitted}/${total} submitted`;
      el.style.color = 'var(--gold)';
    }
  });

  socket.on('opponent_activity', ({ message }) => {
    const el = document.getElementById('opp-status');
    if (el) { el.textContent = `⚙️ Opponent is ${message}`; el.style.color = 'var(--cyan)'; }
  });

  socket.on('opponent_answered', () => {
    const el = document.getElementById('opp-status');
    if (el) { el.textContent = '✅ Opponent submitted'; el.style.color = 'var(--gold)'; }
  });

  socket.on('game_result', (data) => {
    clearInterval(STATE.timerInterval);
    clearInterval(STATE.blitzInterval);
    clearInterval(STATE.tacticalInterval);
    STATE.phase = 'result';
    STATE.resultData = data;
    if (currentUser && data.newElo) currentUser.elo = data.newElo;
    render();
    updateNavUser();
  });

  socket.on('private_room_created', ({ code }) => {
    const el = document.getElementById('room-code-display');
    if (!el) return;
    el.innerHTML = `
      <div style="margin-top:20px;padding:20px;background:var(--card2);border:1px solid var(--border);border-radius:var(--r);text-align:center">
        <div style="font-size:0.72rem;color:var(--t3);font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Your Room Code</div>
        <div style="font-size:2.5rem;font-weight:900;letter-spacing:8px;background:var(--grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent">${code}</div>
        <button class="btn btn-outline" style="margin-top:16px;width:100%;justify-content:center" onclick="copyInviteLink('${code}')">📋 Copy Invite Link</button>
        <div style="margin-top:12px;font-size:0.8rem;color:var(--t3)">Waiting for friend to join...</div>
      </div>`;
  });

  socket.on('error', ({ message }) => alert(`Error: ${message}`));
}

function updateServerBanner(online) {
  const el = document.getElementById('server-warn');
  if (el) el.style.display = online ? 'none' : 'flex';
}

function copyInviteLink(code) {
  const url = `${window.location.origin}/play.html?room=${code}`;
  navigator.clipboard.writeText(url).then(() => alert(`Copied!\n${url}`));
}

// ── RENDER ────────────────────────────────────────────────────────────────────
function render() {
  const app = document.getElementById('app');
  if (STATE.phase === 'setup') app.innerHTML = renderSetup();
  else if (STATE.phase === 'matchmaking') app.innerHTML = renderMatchmaking();
  else if (STATE.phase === 'game') app.innerHTML = renderGame();
  else if (STATE.phase === 'result') app.innerHTML = renderResult();
  updateNavUser();
  if (STATE.phase === 'setup' && STATE.pendingRoomCode) {
    setTimeout(() => {
      const el = document.getElementById('join-code-input');
      if (el) el.value = STATE.pendingRoomCode;
    }, 50);
  }
}

function updateNavUser() {
  const eloEl = document.getElementById('nav-elo');
  const nameEl = document.getElementById('nav-username');
  const loginEl = document.getElementById('nav-login');
  const menuName = document.getElementById('profile-menu-name');
  const menuElo = document.getElementById('profile-menu-elo');
  if (currentUser) {
    if (eloEl) eloEl.textContent = currentUser.elo.toLocaleString();
    if (nameEl) { nameEl.style.display = 'flex'; nameEl.textContent = currentUser.username.charAt(0).toUpperCase(); }
    if (loginEl) loginEl.style.display = 'none';
    if (menuName) menuName.textContent = currentUser.username;
    if (menuElo) menuElo.textContent = `${currentUser.elo.toLocaleString()} ELO`;
  } else {
    if (eloEl) eloEl.textContent = '—';
    if (nameEl) nameEl.style.display = 'none';
    if (loginEl) loginEl.style.display = '';
  }
}

// ── SETUP ─────────────────────────────────────────────────────────────────────
function renderSetup() {
  return `
  <div class="setup-container">
    <div class="setup-header">
      <div class="section-tag" style="text-align:center">Choose Your Battle</div>
      <h2 style="text-align:center;margin-bottom:8px">Configure your match</h2>
      <p style="text-align:center;color:var(--t2);font-size:0.9rem">Solve the problem — first correct submission wins. No account needed to play.</p>
    </div>
    <div class="setup-step">
      <div class="step-label">1 — Arena</div>
      <div class="option-grid" id="cat-grid">
        <div class="option-card lift-hover rise-in" role="button" tabindex="0" aria-label="Quant Finance — Calculate the exact answer" onclick="selectOption('category','quant',this)" onkeydown="handleOptionKey(event,this)">
          <div class="opt-icon">📊</div><div class="opt-name">Quant Finance</div><div class="opt-sub">Calculate the exact answer</div>
        </div>
        <div class="option-card lift-hover rise-in" role="button" tabindex="0" aria-label="Tech / Coding — Write a JavaScript function" onclick="selectOption('category','tech',this)" onkeydown="handleOptionKey(event,this)">
          <div class="opt-icon">💻</div><div class="opt-name">Tech / Coding</div><div class="opt-sub">Write a JavaScript function</div>
        </div>
      </div>
    </div>
    <div class="setup-step">
      <div class="step-label">2 — Difficulty</div>
      <div class="option-grid" id="diff-grid">
        <div class="option-card lift-hover rise-in" role="button" tabindex="0" aria-label="Easy" onclick="selectOption('difficulty','easy',this)" onkeydown="handleOptionKey(event,this)">
          <div class="opt-icon" style="font-size:1.5rem">🟢</div><div class="opt-name" style="color:var(--green)">Easy</div><div class="opt-sub" id="diff-sub-easy">5 min limit</div>
        </div>
        <div class="option-card lift-hover rise-in" role="button" tabindex="0" aria-label="Medium" onclick="selectOption('difficulty','medium',this)" onkeydown="handleOptionKey(event,this)">
          <div class="opt-icon" style="font-size:1.5rem">🟡</div><div class="opt-name" style="color:var(--gold)">Medium</div><div class="opt-sub" id="diff-sub-medium">8 min limit</div>
        </div>
        <div class="option-card lift-hover rise-in" role="button" tabindex="0" aria-label="Hard" onclick="selectOption('difficulty','hard',this)" onkeydown="handleOptionKey(event,this)">
          <div class="opt-icon" style="font-size:1.5rem">🔴</div><div class="opt-name" style="color:var(--red)">Hard</div><div class="opt-sub" id="diff-sub-hard">12 min limit</div>
        </div>
      </div>
    </div>
    <div class="setup-step">
      <div class="step-label">3 — Mode</div>
      <div class="option-grid" id="mode-grid">
        <div class="option-card lift-hover rise-in" role="button" tabindex="0" aria-label="1v1 Ranked — ELO matchmaking" onclick="selectOption('mode','ranked',this)" onkeydown="handleOptionKey(event,this)">
          <div class="opt-icon">⚔️</div><div class="opt-name">1v1 Ranked</div><div class="opt-sub">ELO matchmaking</div>
        </div>
        <div class="option-card lift-hover rise-in" role="button" tabindex="0" aria-label="Challenge a Friend — private room with link" onclick="selectOption('mode','private',this)" onkeydown="handleOptionKey(event,this)">
          <div class="opt-icon">🔗</div><div class="opt-name">Challenge a Friend</div><div class="opt-sub">Private room with link</div>
        </div>
      </div>
    </div>
    <div id="private-room-section" style="display:none;margin-bottom:24px">
      <div class="setup-step" style="margin-bottom:0">
        <div class="step-label">Private Room</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:20px;text-align:center;cursor:pointer" role="button" tabindex="0" aria-label="Create Room — get a code to share" onclick="createPrivateRoom()" onkeydown="handleOptionKey(event,this)">
            <div style="font-size:1.8rem;margin-bottom:8px">🏠</div>
            <div style="font-weight:700;margin-bottom:4px">Create Room</div>
            <div style="font-size:0.78rem;color:var(--t3)">Get a code to share</div>
          </div>
          <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:20px">
            <div style="font-size:0.78rem;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Enter Room Code</div>
            <div style="display:flex;gap:8px">
              <input id="join-code-input" type="text" placeholder="ABC123" maxlength="6"
                style="flex:1;padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--t1);font-size:1rem;font-weight:700;letter-spacing:4px;outline:none;text-transform:uppercase" />
              <button class="btn btn-primary" onclick="joinPrivateRoom()" style="padding:8px 16px">Join</button>
            </div>
          </div>
        </div>
        <div id="room-code-display"></div>
      </div>
    </div>
    <div style="text-align:center;margin-top:8px">
      <button class="btn btn-primary btn-lg" id="find-btn" onclick="findMatch()" disabled style="opacity:0.4;cursor:not-allowed;min-width:260px">⚔️ Find Match</button>
      <div style="margin-top:12px;font-size:0.8rem;color:var(--t3)" id="setup-status">Select arena, difficulty, and mode to continue</div>
    </div>
  </div>`;
}

function handleOptionKey(event, el) {
  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); el.click(); }
}

// Quant's timing is now two-phase (fixed 2-min Blitz + a per-difficulty
// Tactical round); Tech stays a single timed question as before.
const DIFF_TIME_LABELS = {
  quant: { easy: '2 min Blitz + 8 min Tactical', medium: '2 min Blitz + 10 min Tactical', hard: '2 min Blitz + 12 min Tactical' },
  tech: { easy: '5 min limit', medium: '8 min limit', hard: '12 min limit' },
};

function updateDifficultyLabels() {
  const labels = DIFF_TIME_LABELS[STATE.category] || DIFF_TIME_LABELS.tech;
  ['easy', 'medium', 'hard'].forEach(d => {
    const el = document.getElementById(`diff-sub-${d}`);
    if (el) el.textContent = labels[d];
  });
}

function selectOption(field, val, el) {
  const grids = { category:'cat-grid', difficulty:'diff-grid', mode:'mode-grid' };
  document.querySelectorAll(`#${grids[field]} .option-card`).forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  STATE[field] = val;
  if (field === 'category') updateDifficultyLabels();
  if (field === 'mode') {
    const sec = document.getElementById('private-room-section');
    const btn = document.getElementById('find-btn');
    if (sec) sec.style.display = val === 'private' ? 'block' : 'none';
    if (btn) btn.style.display = val === 'private' ? 'none' : '';
  }
  checkSetupReady();
}

function checkSetupReady() {
  const ready = STATE.category && STATE.difficulty && STATE.mode && STATE.mode !== 'private';
  const btn = document.getElementById('find-btn');
  if (btn) { btn.disabled = !ready; btn.style.opacity = ready ? '1' : '0.4'; btn.style.cursor = ready ? 'pointer' : 'not-allowed'; }
  const status = document.getElementById('setup-status');
  const labels = { tech:'Tech', quant:'Quant Finance' };
  if (status && ready) status.textContent = `${labels[STATE.category]} · ${STATE.difficulty} · ${STATE.mode}`;
}

// ── MATCHMAKING ───────────────────────────────────────────────────────────────
function renderMatchmaking() {
  const labels = { tech:'Tech / Coding', quant:'Quant Finance' };
  return `
  <div class="matchmaking-container">
    <div class="mm-spinner"></div>
    <h2 style="margin-top:32px">Finding your opponent...</h2>
    <p style="color:var(--t2);margin-top:8px">${labels[STATE.category]} · ${STATE.difficulty}</p>
    <p style="color:var(--t3);font-size:0.82rem;margin-top:6px">
      Matching in <span id="queue-countdown" style="color:var(--purple-l);font-weight:700">10</span>s
    </p>
    <button class="btn btn-ghost" style="margin-top:24px" onclick="cancelQueue()">Cancel</button>
  </div>`;
}

function findMatch() {
  if (!STATE.category || !STATE.difficulty) return;
  STATE.phase = 'matchmaking';
  render();

  if (socket?.connected) socket.emit('join_queue', { category: STATE.category, difficulty: STATE.difficulty });

  let remaining = 10;
  queueTimer = setInterval(() => {
    remaining--;
    const el = document.getElementById('queue-countdown');
    if (el) el.textContent = remaining;
    if (remaining <= 0) {
      clearInterval(queueTimer);
      if (socket?.connected) {
        socket.emit('request_bot_match', { category: STATE.category, difficulty: STATE.difficulty });
      }
    }
  }, 1000);
}

function cancelQueue() {
  clearInterval(queueTimer);
  socket?.emit('leave_queue');
  STATE.phase = 'setup';
  render();
}

function createPrivateRoom() {
  if (!STATE.category || !STATE.difficulty) { alert('Select arena and difficulty first'); return; }
  if (!socket?.connected) { alert('Server not connected'); return; }
  socket.emit('create_private_room', { category: STATE.category, difficulty: STATE.difficulty });
}

function joinPrivateRoom() {
  const code = (document.getElementById('join-code-input')?.value || '').trim().toUpperCase();
  if (code.length !== 6) { alert('Enter a valid 6-character code'); return; }
  if (!socket?.connected) { alert('Server not connected'); return; }
  socket.emit('join_private_room', { code });
}

// ── GAME ──────────────────────────────────────────────────────────────────────
function renderGame() {
  if (STATE.isQuantBattle) {
    return STATE.battlePhase === 'tactical' ? renderTacticalPhase() : renderBlitzPhase();
  }
  const q = STATE.question;
  return q.type === 'code' ? renderCodeGame(q) : renderNumericGame(q);
}

// ── QUANT BATTLE PHASE 1: BLITZ ──────────────────────────────────────────────
function renderBlitzPhase() {
  return `
  <div class="game-container">
    <div class="game-topbar">
      <div class="game-info">
        <span class="info-pill" style="border-color:var(--cyan);color:var(--cyan)">📊 Quant Finance</span>
        <span class="info-pill">${STATE.difficulty}</span>
        <span class="info-pill" style="border-color:var(--gold);color:var(--gold)">⚡ Phase 1 — Blitz</span>
      </div>
      <div class="game-timer-wrap">
        <div class="game-timer" id="blitz-timer">${formatTime(STATE.blitzTimeLeft)}</div>
        <div style="font-size:0.7rem;color:var(--t3);text-align:center">time left</div>
      </div>
      <div style="font-size:0.8rem;color:var(--t3)">Opponent: <span id="blitz-opp-score" style="color:var(--gold);font-weight:700">${STATE.blitzOppScore}</span> correct</div>
    </div>
    <div class="numeric-game-area">
      <div class="numeric-problem" style="text-align:center">
        <div class="problem-title">Rapid-Fire Round</div>
        <div class="problem-desc numeric-desc" style="font-size:0.85rem;color:var(--t3)">Answer as many as you can before time runs out — right or wrong, you'll get a new one immediately.</div>
      </div>
      <div class="numeric-answer-box" style="text-align:center">
        <div class="answer-label">Your Score: <span id="blitz-score" style="color:var(--green)">${STATE.blitzScore}</span> correct</div>
        <div id="blitz-question" style="font-size:2.2rem;font-weight:800;margin:18px 0;font-family:'JetBrains Mono',monospace">${STATE.blitzQuestion?.text || '...'} = ?</div>
        <div class="answer-input-row">
          <input type="text" inputmode="decimal" id="blitz-input" class="answer-input" autocomplete="off"
            onkeydown="if(event.key==='Enter') submitBlitzAnswer()" />
        </div>
        <div class="numeric-actions">
          <button class="btn btn-primary" style="flex:1" onclick="submitBlitzAnswer()">Submit →</button>
        </div>
        <div style="font-size:0.75rem;color:var(--t3);margin-top:8px">Press Enter or click Submit — you'll get a new question either way</div>
      </div>
    </div>
  </div>`;
}

function startBlitzTimer() {
  clearInterval(STATE.blitzInterval);
  STATE.blitzInterval = setInterval(() => {
    STATE.blitzTimeLeft = Math.max(0, STATE.blitzTimeLeft - 1);
    const el = document.getElementById('blitz-timer');
    if (el) {
      el.textContent = formatTime(STATE.blitzTimeLeft);
      if (STATE.blitzTimeLeft <= 15) el.style.color = 'var(--red)';
    }
    if (STATE.blitzTimeLeft <= 0) clearInterval(STATE.blitzInterval);
  }, 1000);
}

function submitBlitzAnswer() {
  const input = document.getElementById('blitz-input');
  if (!input) return;
  const value = input.value.trim();
  if (value === '') return;
  socket?.emit('submit_blitz_answer', { gameId: STATE.gameId, value });
}

// ── QUANT BATTLE PHASE 2: TACTICAL ───────────────────────────────────────────
function renderTacticalPhase() {
  const total = STATE.tacticalQuestions.length;
  const q = STATE.tacticalQuestions[STATE.tacticalIndex];
  const navPills = STATE.tacticalQuestions.map((_, i) => {
    const answered = STATE.tacticalAnswers[i] !== undefined && STATE.tacticalAnswers[i] !== '';
    const active = i === STATE.tacticalIndex;
    const style = active
      ? 'cursor:pointer;border-color:var(--purple);color:var(--purple-l);background:rgba(139,92,246,0.14)'
      : answered
        ? 'cursor:pointer;border-color:var(--green);color:var(--green)'
        : 'cursor:pointer';
    return `<button class="info-pill" style="${style}" onclick="goToTacticalQuestion(${i})">${i + 1}</button>`;
  }).join('');

  const currentVal = (STATE.tacticalAnswers[STATE.tacticalIndex] ?? '').toString().replace(/"/g, '&quot;');
  const hasPrefix = q.unit && !['%', 'days', 'rolls', 'x', 'years', 'bps', 'contracts'].includes(q.unit);
  const hasSuffix = q.unit && ['%', 'days', 'rolls', 'x', 'years', 'bps', 'contracts'].includes(q.unit);
  const backDisabled = STATE.tacticalIndex === 0;

  return `
  <div class="game-container">
    <div class="game-topbar">
      <div class="game-info">
        <span class="info-pill" style="border-color:var(--cyan);color:var(--cyan)">📊 Quant Finance</span>
        <span class="info-pill">${STATE.difficulty}</span>
        <span class="info-pill" style="border-color:var(--purple);color:var(--purple-l)">🧩 Phase 2 — Tactical</span>
      </div>
      <div class="game-timer-wrap">
        <div class="game-timer" id="tactical-timer">${formatTime(STATE.tacticalTimeLeft)}</div>
        <div style="font-size:0.7rem;color:var(--t3);text-align:center">time left</div>
      </div>
      <div style="font-size:0.8rem;color:var(--t3)">${STATE.blitzPointWon ? '🏆 You won the Blitz (+1)' : 'Opponent won the Blitz'}</div>
    </div>
    <div class="numeric-game-area">
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">${navPills}</div>
      <div class="numeric-problem">
        <div class="problem-title">${q.title}</div>
        <div class="problem-desc numeric-desc">${(q.description || '').replace(/\n/g, '<br/>')}</div>
      </div>
      <div class="numeric-answer-box">
        <div class="answer-label">Question ${STATE.tacticalIndex + 1} of ${total}</div>
        <div class="answer-input-row">
          ${hasPrefix ? `<span class="answer-prefix">${q.unit}</span>` : ''}
          <input type="text" inputmode="decimal" id="tactical-input" class="answer-input" value="${currentVal}"
            oninput="setTacticalAnswer(this.value)" />
          ${hasSuffix ? `<span class="answer-suffix">${q.unit}</span>` : ''}
        </div>
        <div class="numeric-actions">
          <button class="btn btn-outline" ${backDisabled ? 'disabled style="opacity:0.4;flex:1"' : 'style="flex:1"'} onclick="goToTacticalQuestion(${STATE.tacticalIndex - 1})">← Back</button>
          ${STATE.tacticalIndex < total - 1 ? `<button class="btn btn-outline" style="flex:1" onclick="goToTacticalQuestion(${STATE.tacticalIndex + 1})">Next →</button>` : ''}
          <button class="btn btn-primary" style="flex:2" onclick="submitTacticalResults()">Submit Final Answers →</button>
        </div>
        <div style="font-size:0.75rem;color:var(--t3);margin-top:8px;text-align:center">Navigate freely between questions — nothing locks in until you submit</div>
      </div>
    </div>
  </div>`;
}

function setTacticalAnswer(value) {
  STATE.tacticalAnswers[STATE.tacticalIndex] = value;
}

function goToTacticalQuestion(i) {
  if (i < 0 || i >= STATE.tacticalQuestions.length) return;
  STATE.tacticalIndex = i;
  const app = document.getElementById('app');
  if (app) app.innerHTML = renderTacticalPhase();
}

function startTacticalTimer() {
  clearInterval(STATE.tacticalInterval);
  STATE.tacticalInterval = setInterval(() => {
    STATE.tacticalTimeLeft = Math.max(0, STATE.tacticalTimeLeft - 1);
    const el = document.getElementById('tactical-timer');
    if (el) {
      el.textContent = formatTime(STATE.tacticalTimeLeft);
      if (STATE.tacticalTimeLeft <= 30) el.style.color = 'var(--red)';
      else if (STATE.tacticalTimeLeft <= 60) el.style.color = 'var(--gold)';
    }
    if (STATE.tacticalTimeLeft <= 0) {
      clearInterval(STATE.tacticalInterval);
      submitTacticalResults();
    }
  }, 1000);
}

function submitTacticalResults() {
  if (STATE.tacticalSubmitted) return;
  STATE.tacticalSubmitted = true;
  clearInterval(STATE.tacticalInterval);

  let correctCount = 0;
  STATE.tacticalQuestions.forEach((q, i) => {
    const val = parseAnswerValue(STATE.tacticalAnswers[i]);
    if (!isNaN(val) && Math.abs(val - q.answer) <= (q.tolerance ?? 0.01)) correctCount++;
  });

  socket?.emit('submit_tactical_results', { gameId: STATE.gameId, correctCount });

  const app = document.getElementById('app');
  if (app) app.innerHTML = `
    <div class="matchmaking-container">
      <div class="mm-spinner"></div>
      <h2 style="margin-top:32px">Submitted!</h2>
      <p style="color:var(--t2);margin-top:8px">You got ${correctCount}/${STATE.tacticalQuestions.length} correct in the Tactical round. Waiting for your opponent to finish...</p>
    </div>`;
}

function gameHeader(q) {
  const catColors = { tech:'var(--green)', quant:'var(--cyan)' };
  const catLabels = { tech:'💻 Tech', quant:'📊 Quant Finance' };
  const oppName = STATE.opponent?.username || 'Opponent';
  const playerLabel = currentUser ? `${currentUser.username} · ${currentUser.elo} ELO` : 'You';
  const oppLabel = `${oppName} · ${STATE.opponent?.elo || 1200} ELO`;
  const qProgress = STATE.multiQuestion
    ? `<span class="info-pill" style="border-color:var(--t3);color:var(--t3)">Q ${STATE.questionIndex + 1}/${STATE.questions.length}</span>`
    : '';

  return `
    <div class="game-topbar">
      <div class="game-info">
        <span class="info-pill" style="border-color:${catColors[STATE.category]};color:${catColors[STATE.category]}">${catLabels[STATE.category]}</span>
        <span class="info-pill">${STATE.difficulty}</span>
        ${qProgress}
        <button id="flag-game-btn" onclick="flagGameQuestion()" title="Flag this question as broken" style="display:inline-flex;align-items:center;gap:5px;padding:3px 8px;border-radius:6px;border:1px solid var(--border);background:transparent;color:var(--t3);font-size:0.72rem;cursor:pointer;font-family:inherit;transition:all 0.15s" onmouseover="this.style.borderColor='rgba(239,68,68,0.4)';this.style.color='var(--red)'" onmouseout="if(!this.dataset.flagged){this.style.borderColor='var(--border)';this.style.color='var(--t3)'}">${FLAG_ICON} Flag</button>
      </div>
      <div class="game-timer-wrap">
        <div class="game-timer" id="game-timer">${formatTime(STATE.timeLeft)}</div>
        <div style="font-size:0.7rem;color:var(--t3);text-align:center">time left</div>
      </div>
      <div id="opp-status" style="font-size:0.8rem;color:var(--t3)">⌛ ${oppName} is working...</div>
    </div>
    <div class="game-players-bar">
      <div class="player-you">
        <div class="p-avatar" style="background:var(--grad)">${currentUser ? currentUser.username[0].toUpperCase() : '?'}</div>
        <div class="p-name">${playerLabel}</div>
      </div>
      <div style="font-size:0.8rem;font-weight:800;color:var(--t3)">VS</div>
      <div class="player-opp">
        <div class="p-name" style="text-align:right">${oppLabel}</div>
        <div class="p-avatar" style="background:var(--grad-gold)">${oppName[0].toUpperCase()}</div>
      </div>
    </div>`;
}

// ── CODE GAME ─────────────────────────────────────────────────────────────────
function renderCodeGame(q) {
  const examples = (q.examples || []).map(ex => `
    <div class="example-block">
      <div class="ex-row"><span class="ex-label">Input:</span><code>${ex.input}</code></div>
      <div class="ex-row"><span class="ex-label">Output:</span><code>${ex.output}</code></div>
      ${ex.explanation ? `<div class="ex-row"><span class="ex-label">Explanation:</span><span style="color:var(--t2)">${ex.explanation}</span></div>` : ''}
    </div>`).join('');

  const constraints = (q.constraints || []).map(c => `<li>${c}</li>`).join('');

  return `
  <div class="game-container">
    ${gameHeader(q)}
    <div class="game-body">
      <div class="game-left" id="game-left">
        <div class="problem-title">${q.title}</div>
        <div class="problem-desc">${q.description}</div>
        ${examples ? `<div class="problem-section-label">Examples</div>${examples}` : ''}
        ${constraints ? `<div class="problem-section-label">Constraints</div><ul class="constraints-list">${constraints}</ul>` : ''}
      </div>
      <div class="game-right">
        <div class="editor-topbar">
          <div class="lang-picker">
            <button class="lang-btn ${STATE.language === 'javascript' ? 'active' : ''}" data-lang="javascript" onclick="setLanguage('javascript')">JavaScript</button>
            <button class="lang-btn ${STATE.language === 'python' ? 'active' : ''}" data-lang="python" onclick="setLanguage('python')">Python</button>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-ghost" style="padding:6px 14px;font-size:0.8rem" onclick="resetCode()">Reset</button>
          </div>
        </div>
        <textarea id="code-editor" class="code-editor" spellcheck="false">${STATE.language === 'python' ? (q.pythonStarter || '') : (q.starter || '')}</textarea>
        <div id="test-output" class="test-output" style="display:none"></div>
        <div class="editor-actions">
          <button class="btn btn-outline" id="run-btn" onclick="runTests()" style="flex:1">▶ Run Tests</button>
          <button class="btn btn-primary" id="submit-btn" onclick="submitCode()" style="flex:2">Submit →</button>
        </div>
        <div style="font-size:0.75rem;color:var(--t3);margin-top:8px;text-align:center">Pass all visible tests, then Submit to lock in your answer</div>
      </div>
    </div>
  </div>`;
}

// Tab key in editor
document.addEventListener('keydown', function(e) {
  if (e.key === 'Tab' && document.activeElement?.id === 'code-editor') {
    e.preventDefault();
    const ta = document.activeElement;
    const start = ta.selectionStart;
    ta.value = ta.value.slice(0, start) + '  ' + ta.value.slice(ta.selectionEnd);
    ta.selectionStart = ta.selectionEnd = start + 2;
  }
});

function resetCode() {
  const ta = document.getElementById('code-editor');
  if (ta && STATE.question) {
    ta.value = STATE.language === 'python' ? (STATE.question.pythonStarter || '') : (STATE.question.starter || '');
  }
  const out = document.getElementById('test-output');
  if (out) { out.style.display = 'none'; out.innerHTML = ''; }
}

function setLanguage(lang) {
  if (STATE.language === lang) return;
  STATE.language = lang;
  const q = STATE.question;
  const ta = document.getElementById('code-editor');
  if (ta && q) ta.value = lang === 'python' ? (q.pythonStarter || '') : (q.starter || '');
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  const out = document.getElementById('test-output');
  if (out) { out.style.display = 'none'; out.innerHTML = ''; }
  STATE.testsRun = false;
}

async function executeRemote(code, language, cases, comparator, fnName, includeHidden, hiddenCases) {
  const res = await fetch('/api/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language, testCases: cases, comparator, functionName: fnName, includeHidden, hiddenCases }),
  });
  if (!res.ok) throw new Error('Execution service error');
  return res.json();
}

function compareResult(got, expected, comparator) {
  if (comparator === 'sorted') {
    const sort = a => Array.isArray(a) ? [...a].sort((x,y) => x-y) : a;
    return JSON.stringify(sort(got)) === JSON.stringify(sort(expected));
  }
  return JSON.stringify(got) === JSON.stringify(expected);
}

function runUserCode(code, fnName, args) {
  try {
    const wrapped = new Function(`${code}\nreturn ${fnName};`);
    const fn = wrapped();
    const argsCopy = JSON.parse(JSON.stringify(args)); // deep clone so fn can't mutate refs
    const result = fn(...argsCopy);
    return { ok: true, result };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function runTests() {
  const q = STATE.question;
  const code = document.getElementById('code-editor')?.value || '';
  const output = document.getElementById('test-output');
  if (!output) return;
  output.style.display = 'block';

  const cases = q.testCases || [];

  if (STATE.language !== 'javascript') {
    output.innerHTML = '<div class="tc-row" style="color:var(--t3)">⏳ Running tests...</div>';
    let results, error;
    try {
      ({ results, error } = await executeRemote(code, STATE.language, cases, q.comparator, q.pythonFunctionName || q.functionName));
    } catch { error = 'Execution service unavailable'; }
    if (error && !results?.length) {
      output.innerHTML = `<div class="tc-row tc-error">❌ ${error}</div>`;
      return;
    }
    let passedCount = 0;
    const rows = (results || []).map((r, i) => {
      const tc = cases[i];
      if (r.error) return `<div class="tc-row tc-error">❌ Test ${i+1}: <span class="tc-label">${tc?.label || ''}</span> → Error: ${r.error}</div>`;
      if (r.passed) passedCount++;
      return `<div class="tc-row ${r.passed ? 'tc-pass' : 'tc-fail'}">
        ${r.passed ? '✅' : '❌'} Test ${i+1}: <span class="tc-label">${tc?.label || ''}</span>
        ${r.passed ? '' : `<span class="tc-detail">Expected <code>${JSON.stringify(tc?.expected)}</code>${r.result !== undefined ? `, got <code>${r.result}</code>` : ''}</span>`}
      </div>`;
    });
    const allPassed = passedCount === cases.length && cases.length > 0;
    output.innerHTML = rows.join('') +
      `<div class="tc-summary ${allPassed ? 'tc-all-pass' : ''}">
        ${allPassed ? `✅ All ${cases.length} tests passed — ready to submit!` : `${passedCount} / ${cases.length} tests passed`}
      </div>`;
    STATE.testsRun = allPassed;
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn && allPassed) submitBtn.style.boxShadow = '0 0 20px rgba(16,185,129,0.4)';
    return;
  }

  let passedCount = 0;
  const rows = cases.map((tc, i) => {
    const { ok, result, error } = runUserCode(code, q.functionName, tc.input);
    if (!ok) {
      return `<div class="tc-row tc-error">❌ Test ${i+1}: <span class="tc-label">${tc.label || ''}</span> → Error: ${error}</div>`;
    }
    const passed = compareResult(result, tc.expected, q.comparator);
    if (passed) passedCount++;
    return `<div class="tc-row ${passed ? 'tc-pass' : 'tc-fail'}">
      ${passed ? '✅' : '❌'} Test ${i+1}: <span class="tc-label">${tc.label || ''}</span>
      ${passed ? '' : `<span class="tc-detail">Expected <code>${JSON.stringify(tc.expected)}</code>, got <code>${JSON.stringify(result)}</code></span>`}
    </div>`;
  });

  const allPassed = passedCount === cases.length;
  output.innerHTML = rows.join('') +
    `<div class="tc-summary ${allPassed ? 'tc-all-pass' : ''}">
      ${allPassed ? `✅ All ${cases.length} tests passed — ready to submit!` : `${passedCount} / ${cases.length} tests passed`}
    </div>`;

  STATE.testsRun = allPassed;
  const submitBtn = document.getElementById('submit-btn');
  if (submitBtn && allPassed) submitBtn.style.boxShadow = '0 0 20px rgba(16,185,129,0.4)';
}

async function submitCode() {
  const q = STATE.question;
  const code = document.getElementById('code-editor')?.value || '';

  lockEditor();

  let allPassed;
  if (STATE.language !== 'javascript') {
    const output = document.getElementById('test-output');
    if (output) { output.style.display = 'block'; output.innerHTML = '<div class="tc-row" style="color:var(--t3)">⏳ Submitting...</div>'; }
    try {
      const { results, error } = await executeRemote(
        code, STATE.language, q.testCases, q.comparator,
        q.pythonFunctionName || q.functionName, true, q.hiddenCases
      );
      allPassed = !error && results?.length > 0 && results.every(r => r.passed);
    } catch { allPassed = false; }
  } else {
    const allCases = [...(q.testCases || []), ...(q.hiddenCases || [])];
    allPassed = true;
    for (const tc of allCases) {
      const { ok, result } = runUserCode(code, q.functionName, tc.input);
      if (!ok || !compareResult(result, tc.expected, q.comparator)) { allPassed = false; break; }
    }
  }

  if (!allPassed) {
    const output = document.getElementById('test-output');
    if (output) {
      output.style.display = 'block';
      output.innerHTML += `<div class="tc-row tc-fail">❌ Failed a hidden test case — submitted as incorrect.</div>`;
    }
  }

  socket?.emit('submit_answer', { gameId: STATE.gameId, correct: allPassed, hintUsed: STATE.hintUsed, questionIndex: 0, isLast: true });
  STATE.myAnswerCorrect = allPassed;

  const feedback = document.getElementById('submit-feedback');
  if (feedback) feedback.innerHTML = allPassed
    ? '<div class="feedback-ok">✅ Submitted — all tests passed! Waiting for result...</div>'
    : '<div class="feedback-wrong">❌ Submitted incorrectly. Waiting for opponent...</div>';
}

function lockEditor() {
  const ta = document.getElementById('code-editor');
  if (ta) ta.readOnly = true;
  const runBtn = document.getElementById('run-btn');
  const subBtn = document.getElementById('submit-btn');
  if (runBtn) { runBtn.disabled = true; runBtn.style.opacity = '0.4'; }
  if (subBtn) { subBtn.disabled = true; subBtn.style.opacity = '0.4'; }
  const a = document.getElementById('editor-actions');
  if (a) a.insertAdjacentHTML('afterend', '<div id="submit-feedback" style="margin-top:8px"></div>');
}

// ── NUMERIC GAME ──────────────────────────────────────────────────────────────
function renderNumericGame(q) {
  // Show all steps except the last — the last step typically reveals the final answer
  const hintSteps = (q.steps || []).slice(0, -1).map(s =>
    `<div class="step-row"><span class="step-label">${s.label}</span><span class="step-value">${s.value}</span></div>`
  ).join('');

  return `
  <div class="game-container">
    ${gameHeader(q)}
    <div class="numeric-game-area">
      <div class="numeric-problem">
        <div class="problem-title">${q.title}</div>
        <div class="problem-desc numeric-desc">${q.description}</div>
      </div>
      <div class="numeric-answer-box">
        <div class="answer-label">Your Answer</div>
        <div class="answer-input-row">
          ${q.unit && q.unit !== '' && !['%','days','rolls','x'].includes(q.unit) ? `<span class="answer-prefix">${q.unit}</span>` : ''}
          <input type="text" inputmode="decimal" id="numeric-input" class="answer-input" placeholder=""
            onkeydown="if(event.key==='Enter') checkNumeric()" />
          ${q.unit && ['%','days','rolls','x'].includes(q.unit) ? `<span class="answer-suffix">${q.unit}</span>` : ''}
        </div>
        <div id="numeric-feedback" style="min-height:28px;margin-top:8px;font-size:0.88rem;text-align:center"></div>
        <div class="numeric-actions">
          <button class="btn btn-outline" id="check-btn" onclick="checkNumeric()" style="flex:1">Check</button>
          <button class="btn btn-primary" id="num-submit-btn" onclick="submitNumeric()" style="flex:2">Submit →</button>
        </div>
        <div style="font-size:0.75rem;color:var(--t3);margin-top:8px;text-align:center">Check your answer first, or submit directly to lock it in</div>
      </div>
      ${hintSteps ? `
        <details class="steps-details" ontoggle="if(this.open) STATE.hintUsed = true">
          <summary>💡 Show hint <span style="font-size:0.72rem;color:var(--gold);margin-left:6px">(−50% ELO if you win)</span></summary>
          <div class="steps-body">${hintSteps}</div>
        </details>` : ''}
    </div>
  </div>`;
}

function parseAnswerValue(str) {
  if (str == null) return NaN;
  str = String(str).trim();
  if (str === '') return NaN;

  // mixed number, e.g. "1 1/2" or "-1 1/2"
  const mixed = str.match(/^(-?\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixed) {
    const whole = parseFloat(mixed[1]);
    const num = parseFloat(mixed[2]);
    const den = parseFloat(mixed[3]);
    if (!den) return NaN;
    const sign = whole < 0 ? -1 : 1;
    return whole + sign * (num / den);
  }

  // simple fraction, e.g. "3/4" or "-3/4"
  const frac = str.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)$/);
  if (frac) {
    const num = parseFloat(frac[1]);
    const den = parseFloat(frac[2]);
    if (!den) return NaN;
    return num / den;
  }

  return parseFloat(str);
}

function checkNumeric() {
  const q = STATE.question;
  const input = document.getElementById('numeric-input');
  const feedback = document.getElementById('numeric-feedback');
  if (!input || !feedback) return;

  const val = parseAnswerValue(input.value);
  if (isNaN(val)) { feedback.innerHTML = '<span style="color:var(--red)">Enter a number first.</span>'; return; }

  const tol = q.tolerance ?? 0.01;
  const correct = Math.abs(val - q.answer) <= tol;
  STATE.numericChecked = true;
  STATE.numericCheckCorrect = correct;

  feedback.innerHTML = correct
    ? '<span style="color:var(--green)">✅ Looking good — click Submit to lock it in.</span>'
    : '<span style="color:var(--red)">❌ Not quite — try again or submit your best guess.</span>';

  const subBtn = document.getElementById('num-submit-btn');
  if (subBtn && correct) subBtn.style.boxShadow = '0 0 20px rgba(16,185,129,0.4)';
}

function submitNumeric() {
  const q = STATE.question;
  const input = document.getElementById('numeric-input');
  const val = parseAnswerValue(input?.value);
  if (isNaN(val)) {
    const fb = document.getElementById('numeric-feedback');
    if (fb) fb.innerHTML = '<span style="color:var(--red)">Enter a number first.</span>';
    return;
  }

  const tol = q.tolerance ?? 0.01;
  const correct = Math.abs(val - q.answer) <= tol;

  const subBtn = document.getElementById('num-submit-btn');
  const checkBtn = document.getElementById('check-btn');
  if (subBtn) { subBtn.disabled = true; subBtn.style.opacity = '0.4'; }
  if (checkBtn) { checkBtn.disabled = true; checkBtn.style.opacity = '0.4'; }
  if (input) input.readOnly = true;

  const isLast = STATE.questionIndex >= STATE.questions.length - 1;
  if (correct && STATE.multiQuestion) STATE.myScore++;

  socket?.emit('submit_answer', {
    gameId: STATE.gameId, correct,
    questionIndex: STATE.questionIndex,
    hintUsed: STATE.hintUsed,
    isLast,
  });
  STATE.myAnswerCorrect = correct;

  const feedback = document.getElementById('numeric-feedback');
  if (!STATE.multiQuestion || isLast) {
    if (feedback) feedback.innerHTML = '<span style="color:var(--t2)">⏳ Submitted — waiting for result...</span>';
  } else {
    const scoreColor = correct ? 'var(--green)' : 'var(--red)';
    const scoreText = correct ? '✅ Correct!' : '❌ Incorrect';
    const nextIdx = STATE.questionIndex + 1;
    if (feedback) feedback.innerHTML = `
      <div style="text-align:center;padding:8px 0">
        <div style="color:${scoreColor};font-weight:700;margin-bottom:12px">${scoreText}</div>
        <div style="font-size:0.8rem;color:var(--t3);margin-bottom:10px">Your score: ${STATE.myScore}/${nextIdx}</div>
        <button class="btn btn-primary" onclick="nextQuestion()" style="width:100%">Next Question →</button>
      </div>`;
  }
}

function nextQuestion() {
  STATE.questionIndex++;
  STATE.question = STATE.questions[STATE.questionIndex];
  STATE.hintUsed = false;
  STATE.numericChecked = false;
  STATE.numericCheckCorrect = false;
  const app = document.getElementById('app');
  if (app) app.innerHTML = renderGame();
}

// ── TIMER ────────────────────────────────────────────────────────────────────
function startTimer() {
  clearInterval(STATE.timerInterval);
  STATE.timerInterval = setInterval(() => {
    STATE.timeLeft = Math.max(0, STATE.timeLeft - 1);
    const el = document.getElementById('game-timer');
    if (el) {
      el.textContent = formatTime(STATE.timeLeft);
      if (STATE.timeLeft <= 30) el.style.color = 'var(--red)';
      else if (STATE.timeLeft <= 60) el.style.color = 'var(--gold)';
    }
    if (STATE.timeLeft <= 0) clearInterval(STATE.timerInterval);
  }, 1000);
}

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2,'0');
  const s = (secs % 60).toString().padStart(2,'0');
  return `${m}:${s}`;
}

// ── RESULT ────────────────────────────────────────────────────────────────────
function renderResult() {
  const d = STATE.resultData;
  const q = STATE.question;
  const win = d.youWin;
  const isDraw = d.isDraw;
  const eloChange = d.eloChange ?? 0;
  const eloColor = eloChange >= 0 ? 'var(--green)' : 'var(--red)';

  const guestCTA = !currentUser ? `
    <div style="margin:20px 0;padding:20px 24px;background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.25);border-radius:var(--r);text-align:center">
      <div style="font-weight:700;margin-bottom:6px">Want to save your ELO rating?</div>
      <div style="font-size:0.85rem;color:var(--t2);margin-bottom:14px">Create a free account to track your ELO and challenge friends.</div>
      <button class="btn btn-primary" onclick="showAuthModal(user => { currentUser = user; updateNavUser(); })">Create Free Account →</button>
    </div>` : '';

  const summaryLine = STATE.isQuantBattle
    ? (isDraw ? 'Your combined Blitz + Tactical score tied with your opponent\'s.' : `${win?'You':'Your opponent'} scored higher across the Blitz and Tactical rounds.`)
    : (isDraw ? 'Neither solved it correctly.' : `${win?'You':'Your opponent'} submitted the correct answer first.`);

  const leftCard = STATE.isQuantBattle ? `
      <div class="result-card">
        <div class="panel-label">🧩 Tactical Round</div>
        ${STATE.tacticalQuestions.map((tq, i) => `<div class="summary-row"><span>${i + 1}. ${tq.title}</span><strong>${(tq.diff || '').charAt(0).toUpperCase()}${(tq.diff || '').slice(1)}</strong></div>`).join('')}
      </div>` : `
      <div class="result-card">
        <div class="panel-label">💡 Explanation</div>
        <div style="font-size:0.9rem;color:var(--t1);line-height:1.8">${d.explanation || q.explanation}</div>
        ${q.type === 'numeric' && q.steps ? `
          <div style="margin-top:16px">
            <div class="panel-label">Step-by-step</div>
            ${q.steps.map(s=>`<div class="step-row"><span class="step-label">${s.label}</span><span class="step-value">${s.value}</span></div>`).join('')}
          </div>` : ''}
      </div>`;

  const rightCard = STATE.isQuantBattle ? `
      <div class="result-card">
        <div class="panel-label">📊 Match Stats</div>
        <div class="summary-row"><span>Blitz round (Phase 1)</span><strong>${d.yourBlitzScore} correct${d.blitzPointWon ? ' 🏆 +1' : ''}</strong></div>
        <div class="summary-row"><span>Opponent Blitz</span><strong>${d.opponentBlitzScore} correct</strong></div>
        <div class="summary-row"><span>Tactical round (Phase 2)</span><strong>${d.yourTacticalScore}/${STATE.tacticalQuestions.length} correct</strong></div>
        <div class="summary-row"><span>Opponent Tactical</span><strong>${d.opponentTacticalScore}/${STATE.tacticalQuestions.length} correct</strong></div>
        <div class="summary-row"><span>Your final score</span><strong style="color:var(--purple-l)">${d.yourFinalScore}</strong></div>
        <div class="summary-row"><span>Opponent final score</span><strong>${d.opponentFinalScore}</strong></div>
        <div class="summary-row"><span>Result</span><strong>${isDraw?'Draw':win?'Win':'Loss'}</strong></div>
        ${currentUser ? `
        <div class="summary-row"><span>ELO change</span><strong style="color:${eloColor}">${eloChange>=0?'+':''}${eloChange}</strong></div>
        <div class="summary-row"><span>New ELO</span><strong>${d.newElo}</strong></div>` : ''}
      </div>` : `
      <div class="result-card">
        <div class="panel-label">📊 Match Stats</div>
        <div class="summary-row"><span>Problem</span><strong>${q.title}</strong></div>
        <div class="summary-row"><span>Your answer</span><strong style="color:${STATE.myAnswerCorrect?'var(--green)':'var(--red)'}">${STATE.myAnswerCorrect?'✅ Correct':'❌ Incorrect'}</strong></div>
        <div class="summary-row"><span>Result</span><strong>${isDraw?'Draw':win?'Win':'Loss'}</strong></div>
        ${currentUser ? `
        <div class="summary-row"><span>ELO change</span><strong style="color:${eloColor}">${eloChange>=0?'+':''}${eloChange}</strong></div>
        <div class="summary-row"><span>New ELO</span><strong>${d.newElo}</strong></div>` : ''}
      </div>`;

  return `
  <div class="result-container">
    <div class="result-banner ${isDraw?'draw':win?'win':'loss'}">
      <div class="result-icon">${isDraw?'🤝':win?'🏆':'💀'}</div>
      <h2>${isDraw?"Draw!":win?"You Won!":"You Lost"}</h2>
      <p style="color:var(--t2);margin:8px 0">${summaryLine}</p>
      ${currentUser ? `<div class="elo-change ${eloChange>=0?'pos':'neg'}">${eloChange>=0?'+':''}${eloChange} ELO → ${d.newElo}</div>` : ''}
    </div>

    ${guestCTA}

    <div class="result-grid">
      ${leftCard}
      ${rightCard}
    </div>
    <div class="result-actions">
      <button class="btn btn-primary btn-lg" onclick="rematch()">⚔️ Play Again</button>
      <button class="btn btn-outline btn-lg" onclick="backToSetup()">🔄 New Battle</button>
      <a href="index.html" class="btn btn-ghost btn-lg">📖 Practice</a>
    </div>
  </div>`;
}

function rematch() {
  STATE.myAnswerCorrect = null;
  STATE.phase = 'matchmaking';
  render();
  if (socket?.connected) socket.emit('join_queue', { category: STATE.category, difficulty: STATE.difficulty });
  let remaining = 10;
  queueTimer = setInterval(() => {
    remaining--;
    const el = document.getElementById('queue-countdown');
    if (el) el.textContent = remaining;
    if (remaining <= 0) {
      clearInterval(queueTimer);
      if (socket?.connected) socket.emit('request_bot_match', { category: STATE.category, difficulty: STATE.difficulty });
    }
  }, 1000);
}

function backToSetup() {
  clearInterval(queueTimer);
  clearInterval(STATE.timerInterval);
  clearInterval(STATE.blitzInterval);
  clearInterval(STATE.tacticalInterval);
  STATE.phase = 'setup';
  STATE.myAnswerCorrect = null;
  render();
}

// ── FLAG QUESTION ─────────────────────────────────────────────────────────────
async function flagGameQuestion() {
  const btn = document.getElementById('flag-game-btn');
  if (!btn || btn.dataset.flagged) return;
  btn.dataset.flagged = 'true';
  btn.innerHTML = `${FLAG_ICON} Flagged`;
  btn.style.borderColor = 'rgba(239,68,68,0.3)';
  btn.style.color = 'var(--red)';
  try {
    await fetch('/api/flag', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(Auth.getToken() ? { Authorization: `Bearer ${Auth.getToken()}` } : {}),
      },
      body: JSON.stringify({ questionId: STATE.question?.id, reason: 'Flagged during battle' }),
    });
  } catch (_) {}
}

document.addEventListener('DOMContentLoaded', init);
