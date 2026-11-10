// Daily warm-up: five quick mental math questions shown once per day on the
// homepage, from a visitor's second visit on. Finishing it counts toward the
// practice streak (via recordWarmupDay in index.html). Every path out of the
// modal (X, overlay click, Escape, Skip, Start practicing) hides it until tomorrow.
const WARMUP_SEEN_KEY = 'qb_warmup_last_shown';
const WARMUP_LENGTH = 5;

function wuTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Seeded from the date, so everyone gets the same warm-up on a given day.
function wuSeededRandom(seedStr) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822519);
    h = Math.imul(h ^ (h >>> 13), 3266489917);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

function wuQuestion(type, rng) {
  const int = (min, max) => Math.floor(rng() * (max - min + 1)) + min;
  switch (type) {
    case 'add': { const a = int(23, 89), b = int(17, 79); return { text: `${a} + ${b}`, answer: a + b }; }
    case 'sub': { const a = int(52, 99), b = int(13, a - 10); return { text: `${a} − ${b}`, answer: a - b }; }
    case 'mul': { const a = int(12, 29), b = int(3, 9); return { text: `${a} × ${b}`, answer: a * b }; }
    case 'div': { const d = int(3, 9), q = int(7, 19); return { text: `${d * q} ÷ ${d}`, answer: q }; }
    default: {
      const pct = [10, 20, 25, 50, 75][int(0, 4)], base = int(2, 16) * 20;
      return { text: `${pct}% of ${base}`, answer: (pct * base) / 100 };
    }
  }
}

function wuQuestions() {
  const rng = wuSeededRandom('quantbattle-warmup-' + wuTodayKey());
  const types = ['add', 'sub', 'mul', 'div', 'pct'];
  for (let i = types.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [types[i], types[j]] = [types[j], types[i]];
  }
  return types.slice(0, WARMUP_LENGTH).map(t => wuQuestion(t, rng));
}

const WU = { questions: [], index: 0, correct: 0, startedAt: 0, busy: false };

function closeWarmup() {
  try { localStorage.setItem(WARMUP_SEEN_KEY, wuTodayKey()); } catch (_) {}
  document.getElementById('wu-modal')?.remove();
  document.removeEventListener('keydown', wuEscapeHandler);
}

function skipWarmup() {
  trackEvent('warmup_skipped', { question_index: WU.index });
  closeWarmup();
}

function wuEscapeHandler(e) {
  if (e.key === 'Escape') closeWarmup();
}

function wuRenderQuestion() {
  const q = WU.questions[WU.index];
  const dots = WU.questions.map((_, i) => `<span class="wu-dot${i < WU.index ? ' done' : i === WU.index ? ' now' : ''}"></span>`).join('');
  document.getElementById('wu-body').innerHTML = `
    <div class="wu-dots" aria-label="Question ${WU.index + 1} of ${WU.questions.length}">${dots}</div>
    <div class="wu-question">${q.text} = ?</div>
    <form class="wu-form" onsubmit="event.preventDefault(); wuSubmit()">
      <input id="wu-input" class="wu-input" type="text" inputmode="numeric" enterkeyhint="go" autocomplete="off" aria-label="Your answer" />
      <button type="submit" class="btn btn-primary">Submit</button>
    </form>
    <div class="wu-feedback" id="wu-feedback"></div>
    <button class="btn btn-ghost wu-skip" onclick="skipWarmup()">Skip warm-up</button>`;
  document.getElementById('wu-input').focus();
}

function wuSubmit() {
  const input = document.getElementById('wu-input');
  if (!input || WU.busy || input.value.trim() === '') return;
  WU.busy = true;
  const q = WU.questions[WU.index];
  const correct = Math.abs(parseFloat(input.value) - q.answer) < 1e-9;
  if (correct) WU.correct++;
  input.disabled = true;
  input.classList.add(correct ? 'right' : 'wrong');
  document.getElementById('wu-feedback').textContent = correct ? 'Correct' : `Answer: ${q.answer}`;
  setTimeout(() => {
    WU.busy = false;
    WU.index++;
    if (WU.index < WU.questions.length) wuRenderQuestion();
    else wuFinish();
  }, correct ? 350 : 1100);
}

function wuFinish() {
  const secs = Math.round((Date.now() - WU.startedAt) / 1000);
  const streak = typeof recordWarmupDay === 'function' ? recordWarmupDay() : 0;
  trackEvent('warmup_completed', { correct: WU.correct, seconds: secs, streak });
  const prompt = typeof streakPromptHtml === 'function' ? streakPromptHtml() : '';
  document.getElementById('wu-body').innerHTML = `
    <div class="wu-result">${WU.correct}/${WU.questions.length}</div>
    <p class="wu-sub" style="text-align:center">in ${secs}s${streak ? ` · 🔥 ${streak}-day streak` : ''}</p>
    ${prompt}
    <button class="btn ${prompt ? 'btn-outline' : 'btn-primary'}" style="width:100%;justify-content:center;margin-top:12px" onclick="closeWarmup()">Start practicing →</button>`;
}

function showWarmup() {
  if (document.getElementById('wu-modal')) return;
  Object.assign(WU, { questions: wuQuestions(), index: 0, correct: 0, startedAt: Date.now(), busy: false });

  const modal = document.createElement('div');
  modal.id = 'wu-modal';
  modal.innerHTML = `
    <div class="wu-overlay" id="wu-overlay" role="dialog" aria-modal="true" aria-labelledby="wu-title">
      <div class="wu-box">
        <button class="wu-close" id="wu-close-btn" aria-label="Close">&times;</button>
        <h2 id="wu-title">⚡ Daily warm-up</h2>
        <p class="wu-sub">Five quick mental math questions. Finish to keep your streak going.</p>
        <div id="wu-body"></div>
      </div>
    </div>`;

  const style = document.createElement('style');
  style.textContent = `
    .wu-overlay { position:fixed;inset:0;background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px; }
    .wu-box { position:relative;background:var(--glass-bg-strong);backdrop-filter:var(--glass-blur);-webkit-backdrop-filter:var(--glass-blur);border:1px solid var(--glass-border);border-radius:var(--r2);padding:28px 24px;width:100%;max-width:400px;box-shadow:var(--shadow),var(--glow); }
    .wu-close { position:absolute;top:12px;right:12px;background:none;border:none;font-size:1.6rem;line-height:1;color:var(--t3);cursor:pointer;padding:6px; }
    .wu-close:hover { color:var(--t1); }
    .wu-box h2 { font-size:1.15rem;margin-bottom:6px;color:var(--t1); }
    .wu-sub { font-size:0.85rem;color:var(--t2);line-height:1.5;margin-bottom:18px; }
    .wu-dots { display:flex;gap:6px;justify-content:center;margin-bottom:18px; }
    .wu-dot { width:10px;height:10px;border-radius:50%;background:var(--border); }
    .wu-dot.done { background:var(--purple); }
    .wu-dot.now { background:var(--purple);opacity:0.45; }
    .wu-question { font-family:'JetBrains Mono',monospace;font-size:2rem;font-weight:800;text-align:center;margin-bottom:18px;color:var(--t1); }
    .wu-form { display:flex;gap:8px; }
    .wu-input { flex:1;min-width:0;padding:12px 14px;font-size:1.3rem;font-weight:700;text-align:center;font-family:'JetBrains Mono',monospace;background:var(--bg);border:2px solid var(--border);border-radius:var(--r);color:var(--t1);outline:none; }
    .wu-input:focus { border-color:var(--purple); }
    .wu-input.right { border-color:var(--green); }
    .wu-input.wrong { border-color:var(--red); }
    .wu-feedback { min-height:22px;text-align:center;font-size:0.85rem;font-weight:600;color:var(--t2);margin:10px 0 4px; }
    .wu-skip { width:100%;justify-content:center; }
    .wu-result { font-family:'JetBrains Mono',monospace;font-size:3rem;font-weight:900;text-align:center;color:var(--green); }
  `;
  modal.appendChild(style);
  document.body.appendChild(modal);
  wuRenderQuestion();
  trackEvent('warmup_shown');

  document.getElementById('wu-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeWarmup();
  });
  document.getElementById('wu-close-btn').addEventListener('click', closeWarmup);
  document.addEventListener('keydown', wuEscapeHandler);
}

function initWarmup() {
  // First-time visitors go straight to the practice questions; the warm-up
  // starts from their second visit.
  let seenBefore = null;
  try {
    seenBefore = localStorage.getItem('qb_seen_homepage');
    localStorage.setItem('qb_seen_homepage', '1');
  } catch (_) {}
  if (!seenBefore) return;

  let lastShown = null;
  try { lastShown = localStorage.getItem(WARMUP_SEEN_KEY); } catch (_) {}
  if (lastShown !== wuTodayKey()) showWarmup();
}
