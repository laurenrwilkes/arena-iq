// Deploy-persistence test commit — see /api/admin/stats dbBootCount/dbFirstSeenAt.
const Sentry = require('@sentry/node');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const { getRandomQuestion, getRandomQuestions } = require('./questions');

if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.2 });
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const JWT_SECRET = process.env.JWT_SECRET || 'arena-iq-dev-secret';
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Legacy/removed pages — 301 so any residual search-engine indexing or backlinks
// transfer to the current equivalent instead of dead-ending in a bare 404.
app.get('/problems.html', (req, res) => res.redirect(301, '/'));
app.get('/leaderboard.html', (req, res) => res.redirect(301, '/'));
app.get('/shop.html', (req, res) => res.redirect(301, '/'));

app.use(express.static(path.join(__dirname, '..')));

// ── SEED BOT USERS ───────────────────────────────────────────────────────────
// Realistic names + varied ELOs so the leaderboard looks real from day one
const BOT_SEEDS = [
  { username: 'jakemcallister', email: 'bot1@aiq.internal', elo: 1847 },
  { username: 'sarahchen',      email: 'bot2@aiq.internal', elo: 1623 },
  { username: 'priyankv',       email: 'bot3@aiq.internal', elo: 1756 },
  { username: 'alexweston',     email: 'bot4@aiq.internal', elo: 1412 },
  { username: 'tomchang',       email: 'bot5@aiq.internal', elo: 1589 },
  { username: 'leilani_k',      email: 'bot6@aiq.internal', elo: 1334 },
  { username: 'marcobianchi',   email: 'bot7@aiq.internal', elo: 1521 },
  { username: 'niamhoc',        email: 'bot8@aiq.internal', elo: 1289 },
  { username: 'ryanpark',       email: 'bot9@aiq.internal', elo: 1698 },
  { username: 'evazhang',       email: 'bot10@aiq.internal', elo: 1445 },
];

const botUserIds = [];
(async () => {
  const placeholder = await bcrypt.hash('bot-internal-password', 4);
  for (const b of BOT_SEEDS) {
    try {
      const r = db.createUser.run(b.username, b.email, placeholder);
      // Set the seeded ELO
      db.setElo.run(b.elo, r.lastInsertRowid);
      botUserIds.push(r.lastInsertRowid);
    } catch {
      const existing = db.getByEmail.get(b.email);
      if (existing) {
        // Update ELO if it's still at default 1200
        if (existing.elo === 1200) db.setElo.run(b.elo, existing.id);
        botUserIds.push(existing.id);
      }
    }
  }
})();

function getRandomBot() {
  const id = botUserIds[Math.floor(Math.random() * botUserIds.length)];
  return db.getUserStats.get(id);
}

// ── AUTH MIDDLEWARE ──────────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid token' }); }
}

// ── REST ROUTES ──────────────────────────────────────────────────────────────
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'All fields required' });
  if (username.length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  const hash = await bcrypt.hash(password, 10);
  try {
    const r = db.createUser.run(username.trim(), email.trim().toLowerCase(), hash);
    const user = db.getById.get(r.lastInsertRowid);
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: safeUser(user) });
  } catch (e) {
    const field = e.message?.includes('username') ? 'username' : 'email';
    res.status(409).json({ error: `That ${field} is already taken` });
  }
});

app.post('/api/login', async (req, res) => {
  const user = db.getByEmail.get(req.body.email?.trim().toLowerCase());
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });
  const ok = await bcrypt.compare(req.body.password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: safeUser(user) });
});

app.get('/api/me', authMiddleware, (req, res) => {
  const user = db.getUserStats.get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(safeUser(user));
});

app.get('/api/leaderboard', (req, res) => {
  res.json(db.getLeaderboard.all().map(safeUser));
});

app.get('/api/question', (req, res) => {
  const q = getRandomQuestion(req.query.category, req.query.difficulty);
  if (!q) return res.status(404).json({ error: 'Not found' });
  res.json(q);
});

app.get('/api/questions', (req, res) => {
  const { QUESTIONS } = require('./questions');
  const result = {};
  for (const cat of ['tech', 'quant']) {
    if (!QUESTIONS[cat]) continue;
    result[cat] = {};
    for (const diff of ['easy', 'medium', 'hard']) {
      result[cat][diff] = QUESTIONS[cat][diff] || [];
    }
  }
  res.json(result);
});

app.post('/api/flag', (req, res) => {
  const { questionId, reason } = req.body;
  if (!questionId) return res.status(400).json({ error: 'questionId required' });
  const token = req.headers.authorization?.split(' ')[1];
  let username = 'anonymous';
  try { const d = jwt.verify(token, JWT_SECRET); username = d.username || 'user'; } catch (_) {}
  console.log(`[FLAG] ${new Date().toISOString()} | question=${questionId} | user=${username} | reason=${reason || 'none'}`);
  res.json({ ok: true });
});

// ── SHOP ROUTES ──────────────────────────────────────────────────────────────
app.post('/api/shop/equip', authMiddleware, (req, res) => {
  const { type, value } = req.body;
  if (!['color', 'badge'].includes(type)) return res.status(400).json({ error: 'Invalid type' });

  // Free items anyone can equip
  const FREE_COLORS = ['default', 'cyan', 'green', 'gold'];
  const FREE_BADGES = [''];

  // Premium items (check ownership — for now, just track what they've unlocked)
  const user = db.getUserStats.get(req.user.id);
  if (type === 'color' && !FREE_COLORS.includes(value)) {
    // Check if they own it (in a real app, check purchases table)
    // For now allow — payment verification comes with Stripe webhook
  }

  db.setCosmetic.run(
    type === 'color' ? value : user.color,
    type === 'badge' ? value : user.badge,
    req.user.id
  );
  res.json({ ok: true });
});

app.post('/api/shop/use-shield', authMiddleware, (req, res) => {
  const user = db.getUserStats.get(req.user.id);
  if (!user || user.shields < 1) return res.status(400).json({ error: 'No shields remaining' });
  db.useShield.run(req.user.id);
  res.json({ ok: true, shields: user.shields - 1 });
});

// Buy a badge — grants ownership and equips it
// TODO: add Stripe payment verification before granting in production
app.post('/api/shop/buy-badge', authMiddleware, (req, res) => {
  const { badgeId } = req.body;
  const PAID_BADGES = ['shark', 'crown', 'diamond', 'lightning', 'alien'];
  if (!PAID_BADGES.includes(badgeId)) return res.status(400).json({ error: 'Invalid badge' });

  const user = db.getById.get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  let owned = [];
  try { owned = JSON.parse(user.owned_badges || '[]'); } catch (_) {}
  if (!owned.includes(badgeId)) owned.push(badgeId);

  db.setOwnedBadges.run(JSON.stringify(owned), req.user.id);
  // Auto-equip on purchase
  db.setCosmetic.run(user.color || 'default', badgeId, req.user.id);

  const updated = db.getUserStats.get(req.user.id);
  res.json({ ok: true, user: safeUser(updated) });
});

// Grant items (called after successful Stripe payment webhook)
app.post('/api/shop/grant', (req, res) => {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey || req.query.key !== adminKey) return res.status(401).json({ error: 'Unauthorized' });
  const { userId, item } = req.body;
  if (item === 'shields') db.addShields.run(3, userId);
  res.json({ ok: true });
});

// ── CODE EXECUTION ───────────────────────────────────────────────────────────
const PISTON_URL = 'https://emkc.org/api/v2/piston/execute';

function buildPythonRunner(userCode, fnName, cases, comparator) {
  const inputs = JSON.stringify(cases.map(tc => tc.input));
  const expected = JSON.stringify(cases.map(tc => tc.expected));
  return `import json

_USER_CODE = ${JSON.stringify(userCode)}
try:
    exec(_USER_CODE, globals())
except Exception as e:
    print(json.dumps([{"passed": False, "error": str(e)}] * ${cases.length}))
    exit()

def _run():
    cases = ${inputs}
    expected = ${expected}
    results = []
    for args, exp in zip(cases, expected):
        try:
            result = ${fnName}(*args)
            if "${comparator}" == "sorted":
                ok = sorted(list(result)) == sorted(list(exp))
            else:
                ok = result == exp
            results.append({"passed": ok, "result": repr(result)})
        except Exception as e:
            results.append({"passed": False, "error": str(e)})
    print(json.dumps(results))

_run()
`;
}

app.post('/api/execute', async (req, res) => {
  const { code, language, testCases, comparator, functionName, hiddenCases, includeHidden } = req.body;
  if (language !== 'python') return res.status(400).json({ error: 'Unsupported language' });

  const allCases = includeHidden ? [...(testCases || []), ...(hiddenCases || [])] : (testCases || []);
  const source = buildPythonRunner(code, functionName, allCases, comparator || 'exact');

  try {
    const resp = await fetch(PISTON_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: 'python', version: '3.10.0', files: [{ content: source }] }),
    });
    const data = await resp.json();
    const stdout = data.run?.stdout?.trim() || '';
    const stderr = data.run?.stderr?.trim() || '';
    if (!stdout) return res.json({ error: stderr || 'No output', results: [] });
    try {
      res.json({ results: JSON.parse(stdout) });
    } catch {
      res.json({ error: 'Could not parse output: ' + stdout.slice(0, 200), results: [] });
    }
  } catch {
    res.status(500).json({ error: 'Execution service unavailable' });
  }
});

function safeUser(u) {
  let ownedBadges = [];
  try { ownedBadges = JSON.parse(u.owned_badges || '[]'); } catch (_) {}
  return {
    id: u.id, username: u.username, elo: u.elo,
    wins: u.wins, losses: u.losses, draws: u.draws, win_rate: u.win_rate,
    color: u.color || 'default', badge: u.badge || '',
    shields: u.shields || 0, ownedBadges,
  };
}

// ── GAME STATE ───────────────────────────────────────────────────────────────
const queues = {};
const games = {};
const privateRooms = {};

function queueKey(cat, diff) { return `${cat}-${diff}`; }
function makeGameId() { return Math.random().toString(36).slice(2, 10); }
function makeRoomCode() { return Math.random().toString(36).slice(2, 8).toUpperCase(); }

// ── QUANT BATTLE: PHASE 1 BLITZ MATH GENERATION ──────────────────────────────
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function blitzAdd() { const a = randInt(10, 99), b = randInt(10, 99); return { text: `${a} + ${b}`, answer: a + b }; }
function blitzSub() { let a = randInt(10, 99), b = randInt(10, 99); if (b > a) { const t = a; a = b; b = t; } return { text: `${a} − ${b}`, answer: a - b }; }
function blitzMul() { const a = randInt(1, 100), b = randInt(1, 12); return { text: `${a} × ${b}`, answer: a * b }; }
function blitzDiv() { const a = randInt(1, 100), b = randInt(1, 12); const c = a * b; return { text: `${c} ÷ ${b}`, answer: a }; }
function blitzMul2x2() { const a = randInt(10, 99), b = randInt(10, 99); return { text: `${a} × ${b}`, answer: a * b }; }
function blitzSubAdvanced() { let a = randInt(100, 999), b = randInt(10, 999); if (b > a) { const t = a; a = b; b = t; } return { text: `${a} − ${b}`, answer: a - b }; }
function blitzHard3DigitAddSub() {
  const op = Math.random() < 0.5 ? '+' : '−';
  let a = randInt(100, 999), b = randInt(100, 999);
  if (op === '−' && b > a) { const t = a; a = b; b = t; }
  return { text: `${a} ${op} ${b}`, answer: op === '+' ? a + b : a - b };
}
function blitzHardDiv() { const x = randInt(10, 99), y = randInt(10, 99); const z = x * y; return { text: `${z} ÷ ${x}`, answer: y }; }

const BLITZ_GENERATORS = {
  easy: [blitzAdd, blitzSub, blitzMul, blitzDiv],
  medium: [blitzAdd, blitzSub, blitzMul, blitzDiv, blitzMul2x2, blitzSubAdvanced],
  hard: [blitzHard3DigitAddSub, blitzMul2x2, blitzHardDiv],
};

function generateBlitzQuestion(difficulty) {
  const pool = BLITZ_GENERATORS[difficulty] || BLITZ_GENERATORS.easy;
  return pool[randInt(0, pool.length - 1)]();
}

// ── QUANT BATTLE: PHASE 2 TACTICAL PROBLEM SET ───────────────────────────────
const BLITZ_DURATION = 120; // seconds
const TACTICAL_COMPOSITION = {
  easy:   { mix: [['easy', 3], ['medium', 1]], timeLimit: 480 },
  medium: { mix: [['easy', 2], ['medium', 2]], timeLimit: 600 },
  hard:   { mix: [['easy', 1], ['medium', 2], ['hard', 1]], timeLimit: 720 },
};

function buildTacticalSet(category, difficulty) {
  const comp = TACTICAL_COMPOSITION[difficulty] || TACTICAL_COMPOSITION.easy;
  let combined = [];
  for (const [diff, count] of comp.mix) {
    combined = combined.concat(getRandomQuestions(category, diff, count).map(q => ({ ...q, diff })));
  }
  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = combined[i]; combined[i] = combined[j]; combined[j] = t;
  }
  return combined;
}

const MULTI_Q_CATEGORIES = new Set(['quant', 'ib']);
const QUESTIONS_PER_MATCH = 3;

function startGame(p1, p2, category, difficulty) {
  if (category === 'quant') return startQuantBattle(p1, p2, difficulty);

  const timeLimits = { easy: 300, medium: 480, hard: 720 };
  const gameId = makeGameId();
  const multiQuestion = MULTI_Q_CATEGORIES.has(category);

  let questions;
  if (multiQuestion) {
    questions = getRandomQuestions(category, difficulty, QUESTIONS_PER_MATCH);
    if (questions.length < QUESTIONS_PER_MATCH) return null;
  } else {
    const q = getRandomQuestion(category, difficulty);
    if (!q) return null;
    questions = [q];
  }

  const playerProgress = {
    [p1.id]: { submitted: 0, score: 0, finished: false, finishTime: null, hintUsed: false },
    [p2.id]: { submitted: 0, score: 0, finished: false, finishTime: null, hintUsed: false },
  };

  games[gameId] = {
    p1, p2,
    question: questions[0],
    questions,
    multiQuestion,
    category, difficulty,
    answers: {},
    playerProgress,
    startTime: Date.now(),
    timeLimit: timeLimits[difficulty] || 300,
    timer: null,
    ended: false,
  };

  const basePayload = { gameId, question: questions[0], timeLimit: timeLimits[difficulty] || 300, multiQuestion, totalQuestions: questions.length };
  const multiPayload = multiQuestion ? { questions } : {};
  if (!p1.isBot) io.to(p1.id).emit('match_found', { ...basePayload, ...multiPayload, opponent: { username: p2.username, elo: p2.elo } });
  if (!p2.isBot) io.to(p2.id).emit('match_found', { ...basePayload, ...multiPayload, opponent: { username: p1.username, elo: p1.elo } });

  games[gameId].timer = setTimeout(() => {
    const g = games[gameId];
    if (!g?.ended) {
      if (g.multiQuestion) {
        const pp1 = g.playerProgress[p1.id];
        const pp2 = g.playerProgress[p2.id];
        const s1 = pp1?.score || 0, s2 = pp2?.score || 0;
        if (s1 > s2) endGame(gameId, p1.id);
        else if (s2 > s1) endGame(gameId, p2.id);
        else endGame(gameId, null);
      } else {
        endGame(gameId, null);
      }
    }
  }, (timeLimits[difficulty] + 5) * 1000);

  return gameId;
}

// ── QUANT BATTLE: TWO-PHASE MATCH (Blitz → Tactical) ────────────────────────
// Bots don't play live, so their entire performance (both phases) is
// simulated synchronously the moment the match is created — this keeps the
// live timers and phase transitions identical regardless of opponent type.
function simulateBotIfNeeded(game, difficulty) {
  const acc = BOT_ACCURACY[difficulty] || BOT_ACCURACY.easy;
  const blitzThroughput = { easy: 40, medium: 28, hard: 18 };
  const attempts = blitzThroughput[difficulty] || 30;
  const n = game.tacticalQuestions.length;

  for (const player of [game.p1, game.p2]) {
    if (!player.isBot) continue;
    game.blitz[player.id].score = Math.max(0, Math.round(attempts * acc * (0.85 + Math.random() * 0.3)));
    const tacticalScore = Array.from({ length: n }, () => (Math.random() < acc ? 1 : 0)).reduce((a, b) => a + b, 0);
    game.tacticalProgress[player.id].score = tacticalScore;
    game.tacticalProgress[player.id].finished = true;
  }
}

function startQuantBattle(p1, p2, difficulty) {
  const gameId = makeGameId();
  const comp = TACTICAL_COMPOSITION[difficulty] || TACTICAL_COMPOSITION.easy;
  const tacticalQuestions = buildTacticalSet('quant', difficulty);
  const expectedCount = comp.mix.reduce((sum, [, count]) => sum + count, 0);
  if (tacticalQuestions.length < expectedCount) return null;
  const tacticalTimeLimit = comp.timeLimit;

  games[gameId] = {
    p1, p2,
    category: 'quant', difficulty,
    isQuantBattle: true,
    phase: 'blitz',
    blitz: {
      [p1.id]: { question: generateBlitzQuestion(difficulty), score: 0 },
      [p2.id]: { question: generateBlitzQuestion(difficulty), score: 0 },
    },
    blitzPoints: null,
    tacticalQuestions,
    tacticalTimeLimit,
    tacticalProgress: {
      [p1.id]: { score: 0, finished: false },
      [p2.id]: { score: 0, finished: false },
    },
    blitzTimer: null,
    tacticalTimer: null,
    ended: false,
  };
  const game = games[gameId];
  simulateBotIfNeeded(game, difficulty);

  const payloadFor = (self, opp) => ({
    gameId,
    isQuantBattle: true,
    blitzDuration: BLITZ_DURATION,
    blitzQuestion: game.blitz[self.id].question.text,
    opponent: { username: opp.username, elo: opp.elo },
  });
  if (!p1.isBot) io.to(p1.id).emit('match_found', payloadFor(p1, p2));
  if (!p2.isBot) io.to(p2.id).emit('match_found', payloadFor(p2, p1));

  game.blitzTimer = setTimeout(() => endBlitzPhase(gameId), BLITZ_DURATION * 1000);

  return gameId;
}

function endBlitzPhase(gameId) {
  const game = games[gameId];
  if (!game || game.ended || game.phase !== 'blitz') return;
  clearTimeout(game.blitzTimer);
  game.phase = 'tactical';

  const s1 = game.blitz[game.p1.id].score;
  const s2 = game.blitz[game.p2.id].score;
  game.blitzPoints = { [game.p1.id]: 0, [game.p2.id]: 0 };
  if (s1 > s2) game.blitzPoints[game.p1.id] = 1;
  else if (s2 > s1) game.blitzPoints[game.p2.id] = 1;

  const payloadFor = (selfId, oppId) => ({
    questions: game.tacticalQuestions,
    timeLimit: game.tacticalTimeLimit,
    yourBlitzScore: game.blitz[selfId].score,
    opponentBlitzScore: game.blitz[oppId].score,
    blitzPointWon: game.blitzPoints[selfId] === 1,
  });
  if (!game.p1.isBot) io.to(game.p1.id).emit('phase2_start', payloadFor(game.p1.id, game.p2.id));
  if (!game.p2.isBot) io.to(game.p2.id).emit('phase2_start', payloadFor(game.p2.id, game.p1.id));

  game.tacticalTimer = setTimeout(() => {
    if (!games[gameId]?.ended) finishQuantBattle(gameId);
  }, (game.tacticalTimeLimit + 5) * 1000);
}

function finishQuantBattle(gameId) {
  const game = games[gameId];
  if (!game || game.ended) return;

  const p1Final = (game.blitzPoints?.[game.p1.id] || 0) + (game.tacticalProgress[game.p1.id]?.score || 0);
  const p2Final = (game.blitzPoints?.[game.p2.id] || 0) + (game.tacticalProgress[game.p2.id]?.score || 0);
  game.finalScores = { [game.p1.id]: p1Final, [game.p2.id]: p2Final };

  let winnerSocketId = null;
  if (p1Final > p2Final) winnerSocketId = game.p1.id;
  else if (p2Final > p1Final) winnerSocketId = game.p2.id;

  endGame(gameId, winnerSocketId);
}

// winnerSocketId = socket.id of winner, or null for draw
function endGame(gameId, winnerSocketId) {
  const game = games[gameId];
  if (!game || game.ended) return;
  game.ended = true;
  clearTimeout(game.timer);
  clearTimeout(game.blitzTimer);
  clearTimeout(game.tacticalTimer);

  const p1Wins = winnerSocketId !== null && winnerSocketId === game.p1.id;
  const p2Wins = winnerSocketId !== null && winnerSocketId === game.p2.id;
  const isDraw = !p1Wins && !p2Wins;

  // Only update ELO when both players have real accounts
  let eloResult = { p1: { eloChange: 0, newElo: game.p1.elo }, p2: { eloChange: 0, newElo: game.p2.elo } };
  if (game.p1.userId && game.p2.userId) {
    const dbWinnerId = p1Wins ? game.p1.userId : p2Wins ? game.p2.userId : null;
    const winnerSocketId = p1Wins ? game.p1.id : p2Wins ? game.p2.id : null;
    const winnerHintUsed = winnerSocketId
      ? (game.isQuantBattle
          ? false
          : game.multiQuestion
            ? game.playerProgress[winnerSocketId]?.hintUsed
            : game.hintUsed?.[winnerSocketId])
      : false;
    const questionIdForRecord = game.isQuantBattle
      ? game.tacticalQuestions.map(q => q.id).join(',')
      : game.question.id;
    eloResult = db.applyMatchResult(
      game.p1.userId, game.p2.userId, dbWinnerId,
      { category: game.category, difficulty: game.difficulty, questionId: questionIdForRecord, winnerHintUsed: !!winnerHintUsed }
    );
  }

  function payloadFor(self, opp, youWin) {
    const elo = self === game.p1 ? eloResult.p1 : eloResult.p2;
    const base = { youWin, isDraw, eloChange: elo.eloChange, newElo: elo.newElo };
    if (game.isQuantBattle) {
      return {
        ...base,
        isQuantBattle: true,
        yourBlitzScore: game.blitz[self.id].score,
        opponentBlitzScore: game.blitz[opp.id].score,
        blitzPointWon: game.blitzPoints?.[self.id] === 1,
        yourTacticalScore: game.tacticalProgress[self.id]?.score || 0,
        opponentTacticalScore: game.tacticalProgress[opp.id]?.score || 0,
        yourFinalScore: game.finalScores?.[self.id] ?? 0,
        opponentFinalScore: game.finalScores?.[opp.id] ?? 0,
      };
    }
    return { ...base, explanation: game.question.explanation, answer: game.question.answer };
  }

  if (!game.p1.isBot) io.to(game.p1.id).emit('game_result', payloadFor(game.p1, game.p2, p1Wins));
  if (!game.p2.isBot) io.to(game.p2.id).emit('game_result', payloadFor(game.p2, game.p1, p2Wins));

  delete games[gameId];
}

// ── BOT MATCH ─────────────────────────────────────────────────────────────────
const BOT_ACCURACY = { easy: 0.52, medium: 0.68, hard: 0.83 };
const BOT_DELAY    = { easy: [35, 85], medium: [65, 140], hard: [100, 230] };
const BOT_ACTIVITY = { easy: [12, 30], medium: [22, 55], hard: [35, 90] };

function startBotMatch(playerSocket, category, difficulty) {
  const bot = getRandomBot();
  if (!bot) return;
  const botProxy = { id: 'bot-' + makeGameId(), userId: bot.id, username: bot.username, elo: bot.elo, isBot: true, isGuest: false };
  const gameId = startGame(playerSocket, botProxy, category, difficulty);
  if (!gameId) return;
  const game = games[gameId];

  // Quant battles simulate the bot's full performance (both phases) synchronously
  // inside startQuantBattle — nothing further to schedule here.
  if (category === 'quant') return;

  const [sMin, sMax] = BOT_DELAY[difficulty];
  const totalDelay = (sMin + Math.random() * (sMax - sMin)) * 1000;

  if (game.multiQuestion) {
    const total = game.questions.length;
    for (let i = 1; i <= total; i++) {
      setTimeout(() => {
        if (!games[gameId]?.ended) {
          io.to(playerSocket.id).emit('opponent_progress', { submitted: i });
        }
      }, totalDelay * i / total);
    }

    setTimeout(() => {
      const g = games[gameId];
      if (!g || g.ended) return;
      const botProgress = g.playerProgress[botProxy.id];
      if (!botProgress) return;
      botProgress.submitted = total;
      botProgress.score = Array.from({ length: total }, () => Math.random() < BOT_ACCURACY[difficulty] ? 1 : 0).reduce((a, b) => a + b, 0);
      botProgress.finished = true;
      botProgress.finishTime = Date.now();

      const playerProgress = g.playerProgress[playerSocket.id];
      if (playerProgress?.finished) {
        if (playerProgress.score > botProgress.score) endGame(gameId, playerSocket.id);
        else if (botProgress.score > playerProgress.score) endGame(gameId, botProxy.id);
        else endGame(gameId, null);
      }
    }, totalDelay);
  } else {
    const [aMin, aMax] = BOT_ACTIVITY[difficulty];
    setTimeout(() => {
      if (games[gameId]?.ended) return;
      const msg = game.question.type === 'code' ? 'running tests...' : 'checking answer...';
      io.to(playerSocket.id).emit('opponent_activity', { message: msg });
    }, (aMin + Math.random() * (aMax - aMin)) * 1000);

    setTimeout(() => {
      const g = games[gameId];
      if (!g || g.ended) return;
      io.to(playerSocket.id).emit('opponent_answered');
      const botCorrect = Math.random() < BOT_ACCURACY[difficulty];
      g.answers[botProxy.id] = { correct: botCorrect, timestamp: Date.now() };
      const playerAnswered = g.answers[playerSocket.id];
      if (botCorrect && !playerAnswered?.correct) {
        endGame(gameId, botProxy.id);
      } else if (!botCorrect && playerAnswered && !playerAnswered.correct) {
        endGame(gameId, null);
      }
    }, totalDelay);
  }
}

// ── SOCKET AUTH ──────────────────────────────────────────────────────────────
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    socket.userId = null; socket.username = 'Guest'; socket.elo = 1200; socket.isGuest = true; socket.isBot = false;
    return next();
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.getUserStats.get(decoded.id);
    if (!user) throw new Error();
    socket.userId = user.id; socket.username = user.username; socket.elo = user.elo; socket.isGuest = false; socket.isBot = false;
    next();
  } catch {
    socket.userId = null; socket.username = 'Guest'; socket.elo = 1200; socket.isGuest = true; socket.isBot = false;
    next();
  }
});

// ── SOCKET HANDLERS ──────────────────────────────────────────────────────────
io.on('connection', (socket) => {

  socket.on('join_queue', ({ category, difficulty }) => {
    const key = queueKey(category, difficulty);
    if (!queues[key]) queues[key] = [];
    queues[key] = queues[key].filter(p => p.socketId !== socket.id);
    const waiting = queues[key].find(p => io.sockets.sockets.get(p.socketId)?.connected);
    if (waiting) {
      queues[key] = queues[key].filter(p => p.socketId !== waiting.socketId);
      const opp = io.sockets.sockets.get(waiting.socketId);
      if (opp) startGame(socket, opp, category, difficulty);
    } else {
      queues[key].push({ socketId: socket.id, userId: socket.userId, username: socket.username, elo: socket.elo });
      socket.emit('queue_joined');
    }
  });

  socket.on('request_bot_match', ({ category, difficulty }) => {
    Object.keys(queues).forEach(k => { queues[k] = queues[k].filter(p => p.socketId !== socket.id); });
    startBotMatch(socket, category, difficulty);
  });

  socket.on('leave_queue', () => {
    Object.keys(queues).forEach(k => { queues[k] = queues[k].filter(p => p.socketId !== socket.id); });
  });

  // ── QUANT BATTLE PHASE 1: each player gets their own question stream; the
  // server holds the answer and grades it, so the client can't just read it
  // off the wire and auto-win.
  // Called on every keystroke (not just Enter/Submit) so it live-checks and
  // auto-advances exactly like Mental Math — but the answer never leaves the
  // server, so a wrong/incomplete guess just gets silently ignored and the
  // player stays on the same question until they actually get it right.
  socket.on('submit_blitz_answer', ({ gameId, value }) => {
    const game = games[gameId];
    if (!game || game.ended || !game.isQuantBattle || game.phase !== 'blitz') return;
    const entry = game.blitz[socket.id];
    if (!entry) return;

    const val = parseFloat(value);
    if (isNaN(val) || Math.abs(val - entry.question.answer) >= 0.005) return;

    entry.score++;
    entry.question = generateBlitzQuestion(game.difficulty);
    socket.emit('blitz_question', { yourScore: entry.score, question: entry.question.text });

    const opponent = game.p1.id === socket.id ? game.p2 : game.p1;
    if (!opponent.isBot) io.to(opponent.id).emit('blitz_opponent_update', { opponentScore: entry.score });
  });

  // ── QUANT BATTLE PHASE 2: client self-grades (same trust model as the
  // existing numeric/code submissions below) and reports a final tally;
  // clamp defensively so a tampered client can't report an impossible score.
  socket.on('submit_tactical_results', ({ gameId, correctCount }) => {
    const game = games[gameId];
    if (!game || game.ended || !game.isQuantBattle) return;
    const progress = game.tacticalProgress[socket.id];
    if (!progress || progress.finished) return;

    progress.score = Math.max(0, Math.min(Number(correctCount) || 0, game.tacticalQuestions.length));
    progress.finished = true;

    const opponent = game.p1.id === socket.id ? game.p2 : game.p1;
    const oppProgress = game.tacticalProgress[opponent.id];
    if (oppProgress?.finished) finishQuantBattle(gameId);
  });

  socket.on('submit_answer', ({ gameId, correct, questionIndex, hintUsed, isLast }) => {
    const game = games[gameId];
    if (!game || game.ended) return;

    const opponent = game.p1.id === socket.id ? game.p2 : game.p1;

    if (game.multiQuestion) {
      const progress = game.playerProgress[socket.id];
      if (!progress || progress.finished) return;
      if (questionIndex !== undefined && questionIndex !== progress.submitted) return;

      progress.submitted++;
      if (correct) progress.score++;
      if (hintUsed) progress.hintUsed = true;

      if (!opponent.isBot) {
        io.to(opponent.id).emit('opponent_progress', { submitted: progress.submitted });
      }

      if (progress.submitted >= game.questions.length) {
        progress.finished = true;
        progress.finishTime = Date.now();

        if (progress.score === game.questions.length) {
          endGame(gameId, socket.id);
          return;
        }

        const oppProgress = game.playerProgress[opponent.id];
        if (oppProgress?.finished) {
          if (progress.score > oppProgress.score) endGame(gameId, socket.id);
          else if (oppProgress.score > progress.score) endGame(gameId, opponent.id);
          else endGame(gameId, null);
        }
      }
    } else {
      if (game.answers[socket.id] !== undefined) return;
      if (hintUsed) { if (!game.hintUsed) game.hintUsed = {}; game.hintUsed[socket.id] = true; }

      game.answers[socket.id] = { correct, timestamp: Date.now() };
      if (!opponent.isBot) io.to(opponent.id).emit('opponent_answered');

      if (correct) {
        endGame(gameId, socket.id);
      } else {
        const opponentAnswered = game.answers[opponent.id];
        if (opponentAnswered && !opponentAnswered.correct) endGame(gameId, null);
      }
    }
  });

  socket.on('create_private_room', ({ category, difficulty }) => {
    const code = makeRoomCode();
    privateRooms[code] = { host: socket, category, difficulty };
    socket.emit('private_room_created', { code });
    setTimeout(() => { delete privateRooms[code]; }, 10 * 60 * 1000);
  });

  socket.on('join_private_room', ({ code }) => {
    const room = privateRooms[code];
    if (!room) return socket.emit('error', { message: 'Room not found or expired' });
    if (room.host.id === socket.id) return socket.emit('error', { message: "Can't join your own room" });
    if (!room.host.connected) return socket.emit('error', { message: 'Host disconnected' });
    delete privateRooms[code];
    startGame(room.host, socket, room.category, room.difficulty);
  });

  socket.on('disconnect', () => {
    Object.keys(queues).forEach(k => { queues[k] = queues[k].filter(p => p.socketId !== socket.id); });
    for (const [gameId, game] of Object.entries(games)) {
      if ((game.p1.id === socket.id || game.p2.id === socket.id) && !game.ended) {
        const winnerSocket = game.p1.id === socket.id ? game.p2 : game.p1;
        endGame(gameId, winnerSocket.id);
        break;
      }
    }
  });
});

// ── DATABASE BACKUP ──────────────────────────────────────────────────────────
app.get('/api/admin/backup', (req, res) => {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey || req.query.key !== adminKey) return res.status(401).json({ error: 'Unauthorized' });
  try { db.pragma('wal_checkpoint(FULL)'); } catch (_) {}
  const dbPath = path.join(__dirname, 'arena.db');
  res.download(dbPath, `arena-backup-${new Date().toISOString().slice(0,10)}.db`);
});

// ── ADMIN STATS ──────────────────────────────────────────────────────────────
app.get('/api/admin/stats', (req, res) => {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey || req.query.key !== adminKey) return res.status(401).json({ error: 'Unauthorized' });
  const todayCutoff = new Date().toISOString().slice(0, 10) + ' 00:00:00';
  const weekCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
  const meta = db.getMeta.get();
  res.json({
    totalUsers: db.countRealUsers.get().count,
    signupsToday: db.countUsersSince.get(todayCutoff).count,
    signupsThisWeek: db.countUsersSince.get(weekCutoff).count,
    totalMatches: db.countMatches.get().count,
    // Persistence canary: if dbFirstSeenAt stays the same and dbBootCount keeps
    // climbing across deploys/restarts, the database file is surviving them.
    // If dbFirstSeenAt keeps resetting to "now", the filesystem is being wiped.
    dbFirstSeenAt: meta?.first_seen_at || null,
    dbBootCount: meta?.boot_count || null,
  });
});

if (process.env.SENTRY_DSN) app.use(Sentry.expressErrorHandler());
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: 'Internal server error' }); });

server.listen(PORT, () => { console.log(`\n⚔️  QuantBattle running at http://localhost:${PORT}\n`); });
