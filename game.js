const SERVER = window.location.origin;
let socket = null;
let currentUser = null;
let queueTimer = null;

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
    STATE.question = data.question;
    STATE.timeLimit = data.timeLimit;
    STATE.timeLeft = data.timeLimit;
    STATE.opponent = data.opponent;
    STATE.myAnswerCorrect = null;
    STATE.testsRun = false;
    STATE.numericChecked = false;
    STATE.numericCheckCorrect = false;
    render();
    startTimer();
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
        <div class="option-card" onclick="selectOption('category','tech',this)">
          <div class="opt-icon">💻</div><div class="opt-name">Tech / Coding</div><div class="opt-sub">Write a JavaScript function</div>
        </div>
        <div class="option-card" onclick="selectOption('category','quant',this)">
          <div class="opt-icon">📊</div><div class="opt-name">Quant Finance</div><div class="opt-sub">Calculate the exact answer</div>
        </div>
        <div class="option-card" onclick="selectOption('category','ib',this)">
          <div class="opt-icon">🏦</div><div class="opt-name">Investment Banking</div><div class="opt-sub">Work through the model</div>
        </div>
      </div>
    </div>
    <div class="setup-step">
      <div class="step-label">2 — Difficulty</div>
      <div class="option-grid" id="diff-grid">
        <div class="option-card" onclick="selectOption('difficulty','easy',this)">
          <div class="opt-icon" style="font-size:1.5rem">🟢</div><div class="opt-name" style="color:var(--green)">Easy</div><div class="opt-sub">5 min limit</div>
        </div>
        <div class="option-card" onclick="selectOption('difficulty','medium',this)">
          <div class="opt-icon" style="font-size:1.5rem">🟡</div><div class="opt-name" style="color:var(--gold)">Medium</div><div class="opt-sub">8 min limit</div>
        </div>
        <div class="option-card" onclick="selectOption('difficulty','hard',this)">
          <div class="opt-icon" style="font-size:1.5rem">🔴</div><div class="opt-name" style="color:var(--red)">Hard</div><div class="opt-sub">12 min limit</div>
        </div>
      </div>
    </div>
    <div class="setup-step">
      <div class="step-label">3 — Mode</div>
      <div class="option-grid" id="mode-grid">
        <div class="option-card" onclick="selectOption('mode','ranked',this)">
          <div class="opt-icon">⚔️</div><div class="opt-name">1v1 Ranked</div><div class="opt-sub">ELO matchmaking</div>
        </div>
        <div class="option-card" onclick="selectOption('mode','private',this)">
          <div class="opt-icon">🔗</div><div class="opt-name">Challenge a Friend</div><div class="opt-sub">Private room with link</div>
        </div>
      </div>
    </div>
    <div id="private-room-section" style="display:none;margin-bottom:24px">
      <div class="setup-step" style="margin-bottom:0">
        <div class="step-label">Private Room</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:20px;text-align:center;cursor:pointer" onclick="createPrivateRoom()">
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

function selectOption(field, val, el) {
  const grids = { category:'cat-grid', difficulty:'diff-grid', mode:'mode-grid' };
  document.querySelectorAll(`#${grids[field]} .option-card`).forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  STATE[field] = val;
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
  const labels = { tech:'Tech', quant:'Quant Finance', ib:'IB' };
  if (status && ready) status.textContent = `${labels[STATE.category]} · ${STATE.difficulty} · ${STATE.mode}`;
}

// ── MATCHMAKING ───────────────────────────────────────────────────────────────
function renderMatchmaking() {
  const labels = { tech:'Tech / Coding', quant:'Quant Finance', ib:'Investment Banking' };
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
  const q = STATE.question;
  return q.type === 'code' ? renderCodeGame(q) : renderNumericGame(q);
}

function gameHeader(q) {
  const catColors = { tech:'var(--green)', quant:'var(--cyan)', ib:'var(--gold)' };
  const catLabels = { tech:'💻 Tech', quant:'📊 Quant Finance', ib:'🏦 IB' };
  const oppName = STATE.opponent?.username || 'Opponent';
  const playerLabel = currentUser ? `${currentUser.username} · ${currentUser.elo} ELO` : 'You';
  const oppLabel = `${oppName} · ${STATE.opponent?.elo || 1200} ELO`;
  return `
    <div class="game-topbar">
      <div class="game-info">
        <span class="info-pill" style="border-color:${catColors[STATE.category]};color:${catColors[STATE.category]}">${catLabels[STATE.category]}</span>
        <span class="info-pill">${STATE.difficulty}</span>
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
          <div style="font-size:0.78rem;color:var(--t3);font-weight:600">JavaScript</div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-ghost" style="padding:6px 14px;font-size:0.8rem" onclick="resetCode()">Reset</button>
          </div>
        </div>
        <textarea id="code-editor" class="code-editor" spellcheck="false">${q.starter || ''}</textarea>
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
  if (ta && STATE.question?.starter) ta.value = STATE.question.starter;
  const out = document.getElementById('test-output');
  if (out) { out.style.display = 'none'; out.innerHTML = ''; }
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

function runTests() {
  const q = STATE.question;
  const code = document.getElementById('code-editor')?.value || '';
  const output = document.getElementById('test-output');
  if (!output) return;
  output.style.display = 'block';

  const cases = q.testCases || [];
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

function submitCode() {
  const q = STATE.question;
  const code = document.getElementById('code-editor')?.value || '';

  // Run all visible + hidden cases
  const allCases = [...(q.testCases || []), ...(q.hiddenCases || [])];
  let allPassed = true;
  for (const tc of allCases) {
    const { ok, result } = runUserCode(code, q.functionName, tc.input);
    if (!ok || !compareResult(result, tc.expected, q.comparator)) { allPassed = false; break; }
  }

  lockEditor();
  if (!allPassed) {
    // Show hidden test failure
    const output = document.getElementById('test-output');
    if (output) {
      output.style.display = 'block';
      output.innerHTML += `<div class="tc-row tc-fail">❌ Failed a hidden test case — submitted as incorrect.</div>`;
    }
  }

  socket?.emit('submit_answer', { gameId: STATE.gameId, correct: allPassed });
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
          <input type="number" id="numeric-input" class="answer-input" placeholder="0.00" step="any"
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
        <details class="steps-details">
          <summary>💡 Show hint</summary>
          <div class="steps-body">${hintSteps}</div>
        </details>` : ''}
    </div>
  </div>`;
}

function checkNumeric() {
  const q = STATE.question;
  const input = document.getElementById('numeric-input');
  const feedback = document.getElementById('numeric-feedback');
  if (!input || !feedback) return;

  const val = parseFloat(input.value);
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
  const val = parseFloat(input?.value);
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

  socket?.emit('submit_answer', { gameId: STATE.gameId, correct });
  STATE.myAnswerCorrect = correct;
  const feedback = document.getElementById('numeric-feedback');
  if (feedback) feedback.innerHTML = '<span style="color:var(--t2)">⏳ Submitted — waiting for result...</span>';
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
  const isDraw = !d.youWin && d.winnerId === null;
  const eloChange = d.eloChange ?? 0;
  const eloColor = eloChange >= 0 ? 'var(--green)' : 'var(--red)';

  const guestCTA = !currentUser ? `
    <div style="margin:20px 0;padding:20px 24px;background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.25);border-radius:var(--r);text-align:center">
      <div style="font-weight:700;margin-bottom:6px">Want to save your ELO rating?</div>
      <div style="font-size:0.85rem;color:var(--t2);margin-bottom:14px">Create a free account to track your ELO, appear on the leaderboard, and challenge friends.</div>
      <button class="btn btn-primary" onclick="showAuthModal(user => { currentUser = user; updateNavUser(); })">Create Free Account →</button>
    </div>` : '';

  return `
  <div class="result-container">
    <div class="result-banner ${isDraw?'draw':win?'win':'loss'}">
      <div class="result-icon">${isDraw?'🤝':win?'🏆':'💀'}</div>
      <h2>${isDraw?"Draw!":win?"You Won!":"You Lost"}</h2>
      <p style="color:var(--t2);margin:8px 0">${isDraw?'Neither solved it correctly.':`${win?'You':'Your opponent'} submitted the correct answer first.`}</p>
      ${currentUser ? `<div class="elo-change ${eloChange>=0?'pos':'neg'}">${eloChange>=0?'+':''}${eloChange} ELO → ${d.newElo}</div>` : ''}
    </div>

    ${guestCTA}
    ${win && currentUser && currentUser.wins > 0 && currentUser.wins % 5 === 0 ? `
    <div style="margin:0 0 20px;padding:14px 20px;background:rgba(124,58,237,0.07);border:1px solid rgba(124,58,237,0.2);border-radius:var(--r);display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap">
      <div style="font-size:0.88rem;color:var(--t2)">🎨 <strong style="color:var(--t1)">${currentUser.wins} wins</strong> — customize how you look on the leaderboard</div>
      <a href="shop.html" class="btn btn-ghost" style="font-size:0.82rem;padding:7px 14px;flex-shrink:0">Visit Shop →</a>
    </div>` : ''}

    <div class="result-grid">
      <div class="result-card">
        <div class="panel-label">💡 Explanation</div>
        <div style="font-size:0.9rem;color:var(--t1);line-height:1.8">${d.explanation || q.explanation}</div>
        ${q.type === 'numeric' && q.steps ? `
          <div style="margin-top:16px">
            <div class="panel-label">Step-by-step</div>
            ${q.steps.map(s=>`<div class="step-row"><span class="step-label">${s.label}</span><span class="step-value">${s.value}</span></div>`).join('')}
          </div>` : ''}
      </div>
      <div class="result-card">
        <div class="panel-label">📊 Match Stats</div>
        <div class="summary-row"><span>Problem</span><strong>${q.title}</strong></div>
        <div class="summary-row"><span>Your answer</span><strong style="color:${STATE.myAnswerCorrect?'var(--green)':'var(--red)'}">${STATE.myAnswerCorrect?'✅ Correct':'❌ Incorrect'}</strong></div>
        <div class="summary-row"><span>Result</span><strong>${isDraw?'Draw':win?'Win':'Loss'}</strong></div>
        ${currentUser ? `
        <div class="summary-row"><span>ELO change</span><strong style="color:${eloColor}">${eloChange>=0?'+':''}${eloChange}</strong></div>
        <div class="summary-row"><span>New ELO</span><strong>${d.newElo}</strong></div>` : ''}
      </div>
    </div>
    <div class="result-actions">
      <button class="btn btn-primary btn-lg" onclick="rematch()">⚔️ Play Again</button>
      <button class="btn btn-outline btn-lg" onclick="backToSetup()">🔄 New Battle</button>
      <a href="leaderboard.html" class="btn btn-ghost btn-lg">🏆 Leaderboard</a>
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
  STATE.phase = 'setup';
  STATE.myAnswerCorrect = null;
  render();
}

document.addEventListener('DOMContentLoaded', init);
