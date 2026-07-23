// Welcome overlay — a skyscraper logic puzzle shown once per day on the homepage.
// Purely additive: the question browser underneath is already fully loaded and
// visible, and every path out of this modal (X, overlay click, Escape, either CTA)
// dismisses it until the next calendar day, via localStorage.
const BRAINTEASER_SEEN_KEY = 'qb_daily_puzzle_last_shown';
const BT_SIZE = 4;

function btTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Deterministic PRNG seeded from today's date, so everyone gets the same puzzle
// on a given day (a real "daily" puzzle) without needing a server round-trip.
function btSeededRandom(seedStr) {
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

function btShuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateSkyscraperPuzzle(n = BT_SIZE, rng = Math.random) {
  // Cyclic base Latin square, then randomize row order, column order, and value labels
  // so each day gets a different (still guaranteed-valid) puzzle.
  const base = [];
  for (let r = 0; r < n; r++) {
    const row = [];
    for (let c = 0; c < n; c++) row.push(((r + c) % n) + 1);
    base.push(row);
  }
  const rowOrder = btShuffle([...Array(n).keys()], rng);
  const colOrder = btShuffle([...Array(n).keys()], rng);
  const valueMap = btShuffle([...Array(n).keys()].map(v => v + 1), rng);

  const solution = rowOrder.map(r =>
    colOrder.map(c => valueMap[base[r][c] - 1])
  );

  return { solution, clues: computeSkyscraperClues(solution) };
}

function btCountVisible(line) {
  let count = 0, tallest = 0;
  for (const h of line) {
    if (h > tallest) { count++; tallest = h; }
  }
  return count;
}

function computeSkyscraperClues(grid) {
  const n = grid.length;
  const top = [], bottom = [], left = [], right = [];
  for (let c = 0; c < n; c++) {
    const col = grid.map(row => row[c]);
    top.push(btCountVisible(col));
    bottom.push(btCountVisible([...col].reverse()));
  }
  for (let r = 0; r < n; r++) {
    left.push(btCountVisible(grid[r]));
    right.push(btCountVisible([...grid[r]].reverse()));
  }
  return { top, bottom, left, right };
}

function validateSkyscraperGrid(grid, clues) {
  const n = grid.length;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!grid[r][c] || grid[r][c] < 1 || grid[r][c] > n) return { valid: false, reason: 'incomplete' };
    }
  }
  const expected = new Set([...Array(n).keys()].map(v => v + 1));
  for (let r = 0; r < n; r++) {
    if (new Set(grid[r]).size !== n || ![...grid[r]].every(v => expected.has(v))) return { valid: false, reason: 'rows' };
  }
  for (let c = 0; c < n; c++) {
    const col = grid.map(row => row[c]);
    if (new Set(col).size !== n || !col.every(v => expected.has(v))) return { valid: false, reason: 'cols' };
  }
  const actual = computeSkyscraperClues(grid);
  for (const dir of ['top', 'bottom', 'left', 'right']) {
    for (let i = 0; i < n; i++) {
      if (actual[dir][i] !== clues[dir][i]) return { valid: false, reason: 'clues' };
    }
  }
  return { valid: true };
}

function closeBrainteaser() {
  try { localStorage.setItem(BRAINTEASER_SEEN_KEY, btTodayKey()); } catch (_) {}
  document.getElementById('bt-modal')?.remove();
  document.removeEventListener('keydown', btEscapeHandler);
}

function btEscapeHandler(e) {
  if (e.key === 'Escape') closeBrainteaser();
}

function btCheckSolution(puzzle) {
  const n = puzzle.solution.length;
  const grid = [];
  for (let r = 0; r < n; r++) {
    const row = [];
    for (let c = 0; c < n; c++) {
      const val = parseInt(document.getElementById(`bt-cell-${r}-${c}`)?.value, 10);
      row.push(Number.isFinite(val) ? val : 0);
    }
    grid.push(row);
  }
  const result = validateSkyscraperGrid(grid, puzzle.clues);
  const feedback = document.getElementById('bt-feedback');
  if (result.valid) {
    feedback.innerHTML = '🎉 Solved it! Nice work.';
    feedback.className = 'bt-feedback bt-feedback-success';
    document.getElementById('bt-check-btn').style.display = 'none';
  } else {
    const messages = {
      incomplete: 'Fill in every square first — each one takes a number 1–4.',
      rows: 'Each row needs 1, 2, 3, and 4 with no repeats.',
      cols: 'Each column needs 1, 2, 3, and 4 with no repeats.',
      clues: 'Rows and columns look right, but the edge counts don’t match yet.',
    };
    feedback.innerHTML = `Not quite — ${messages[result.reason] || 'try again.'}`;
    feedback.className = 'bt-feedback bt-feedback-error';
  }
}

function btCellInput(el, n) {
  el.value = el.value.replace(/[^1-9]/g, '').slice(0, 1);
  if (el.value && (parseInt(el.value, 10) < 1 || parseInt(el.value, 10) > n)) el.value = '';
}

function renderBrainteaserGrid(puzzle) {
  const n = puzzle.solution.length;
  const { top, bottom, left, right } = puzzle.clues;
  let html = '<div class="bt-grid" style="grid-template-columns:repeat(' + (n + 2) + ',1fr)">';
  html += '<div class="bt-cell bt-clue"></div>';
  for (let c = 0; c < n; c++) html += `<div class="bt-cell bt-clue">${top[c]}</div>`;
  html += '<div class="bt-cell bt-clue"></div>';

  for (let r = 0; r < n; r++) {
    html += `<div class="bt-cell bt-clue">${left[r]}</div>`;
    for (let c = 0; c < n; c++) {
      html += `<input class="bt-cell bt-input" id="bt-cell-${r}-${c}" type="text" inputmode="numeric" maxlength="1" aria-label="Row ${r + 1}, column ${c + 1}" oninput="btCellInput(this, ${n})" />`;
    }
    html += `<div class="bt-cell bt-clue">${right[r]}</div>`;
  }

  html += '<div class="bt-cell bt-clue"></div>';
  for (let c = 0; c < n; c++) html += `<div class="bt-cell bt-clue">${bottom[c]}</div>`;
  html += '<div class="bt-cell bt-clue"></div>';
  html += '</div>';
  return html;
}

function showBrainteaser() {
  if (document.getElementById('bt-modal')) return;
  const today = btTodayKey();
  const rng = btSeededRandom('quantbattle-skyscraper-' + today);
  const puzzle = generateSkyscraperPuzzle(BT_SIZE, rng);

  const modal = document.createElement('div');
  modal.id = 'bt-modal';
  modal.innerHTML = `
    <div class="bt-overlay" id="bt-overlay" role="dialog" aria-modal="true" aria-labelledby="bt-title">
      <div class="bt-box">
        <button class="bt-close" id="bt-close-btn" aria-label="Close">&times;</button>
        <h2 id="bt-title">🧩 Daily Brain Teaser</h2>
        <p class="bt-sub">Skyscraper puzzle — place 1–4 in every row and column with no repeats. Each edge number is how many buildings you'd see from that side (taller ones hide shorter ones behind them).</p>
        ${renderBrainteaserGrid(puzzle)}
        <div class="bt-feedback" id="bt-feedback"></div>
        <button class="btn btn-primary" id="bt-check-btn" style="width:100%;justify-content:center;margin-top:8px" onclick="btCheckSolution(window._btPuzzle)">Check Solution</button>
        <div class="bt-cta-row">
          <a href="games.html" class="btn btn-outline" style="width:100%;justify-content:center">More Brain Teasers →</a>
          <button class="btn btn-ghost" style="width:100%;justify-content:center" onclick="closeBrainteaser()">Skip to Quant Questions</button>
        </div>
      </div>
    </div>`;

  const style = document.createElement('style');
  style.textContent = `
    .bt-overlay { position:fixed;inset:0;background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px; }
    .bt-box { position:relative;background:var(--glass-bg-strong);backdrop-filter:var(--glass-blur);-webkit-backdrop-filter:var(--glass-blur);border:1px solid var(--glass-border);border-radius:var(--r2);padding:32px;width:100%;max-width:420px;box-shadow:var(--shadow),var(--glow); }
    .bt-close { position:absolute;top:16px;right:16px;background:none;border:none;font-size:1.6rem;line-height:1;color:var(--t3);cursor:pointer;padding:4px; }
    .bt-close:hover { color:var(--t1); }
    .bt-box h2 { font-size:1.15rem;margin-bottom:8px;color:var(--t1); }
    .bt-sub { font-size:0.82rem;color:var(--t2);line-height:1.5;margin-bottom:20px; }
    .bt-grid { display:grid;gap:4px;margin:0 auto 8px;max-width:320px; }
    .bt-cell { aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:0.95rem;font-weight:700;min-width:0; }
    .bt-clue { color:var(--t2);font-weight:600; }
    .bt-input { background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--t1);text-align:center;outline:none;min-height:44px; }
    .bt-input:focus { border-color:var(--purple); }
    .bt-feedback { min-height:20px;font-size:0.85rem;text-align:center;margin:8px 0;font-weight:600; }
    .bt-feedback-success { color:var(--green); }
    .bt-feedback-error { color:var(--red); }
    .bt-cta-row { display:flex;flex-direction:column;gap:10px;margin-top:16px; }
  `;
  modal.appendChild(style);
  document.body.appendChild(modal);
  window._btPuzzle = puzzle;

  document.getElementById('bt-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeBrainteaser();
  });
  document.getElementById('bt-close-btn').addEventListener('click', closeBrainteaser);
  document.addEventListener('keydown', btEscapeHandler);
  document.getElementById('bt-cell-0-0')?.focus();
}

function initBrainTeaser() {
  let lastShown = null;
  try { lastShown = localStorage.getItem(BRAINTEASER_SEEN_KEY); } catch (_) {}
  if (lastShown !== btTodayKey()) showBrainteaser();
}
