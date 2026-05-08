const Sentry = require('@sentry/node');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const { getRandomQuestion } = require('./questions');

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

function startGame(p1, p2, category, difficulty) {
  const question = getRandomQuestion(category, difficulty);
  if (!question) return null;
  const timeLimits = { easy: 300, medium: 480, hard: 720 };
  const gameId = makeGameId();
  games[gameId] = { p1, p2, question, category, difficulty, answers: {}, startTime: Date.now(), timeLimit: timeLimits[difficulty] || 300, timer: null, ended: false };
  const payload = { gameId, question, timeLimit: timeLimits[difficulty] || 300 };
  if (!p1.isBot) io.to(p1.id).emit('match_found', { ...payload, opponent: { username: p2.username, elo: p2.elo } });
  if (!p2.isBot) io.to(p2.id).emit('match_found', { ...payload, opponent: { username: p1.username, elo: p1.elo } });
  games[gameId].timer = setTimeout(() => { if (!games[gameId]?.ended) endGame(gameId, null); }, (timeLimits[difficulty] + 5) * 1000);
  return gameId;
}

// winnerSocketId = socket.id of winner, or null for draw
function endGame(gameId, winnerSocketId) {
  const game = games[gameId];
  if (!game || game.ended) return;
  game.ended = true;
  clearTimeout(game.timer);

  const p1Wins = winnerSocketId !== null && winnerSocketId === game.p1.id;
  const p2Wins = winnerSocketId !== null && winnerSocketId === game.p2.id;

  const result = { explanation: game.question.explanation, answer: game.question.answer };

  // Only update ELO when both players have real accounts
  let eloResult = { p1: { eloChange: 0, newElo: game.p1.elo }, p2: { eloChange: 0, newElo: game.p2.elo } };
  if (game.p1.userId && game.p2.userId) {
    const dbWinnerId = p1Wins ? game.p1.userId : p2Wins ? game.p2.userId : null;
    eloResult = db.applyMatchResult(
      game.p1.userId, game.p2.userId, dbWinnerId,
      { category: game.category, difficulty: game.difficulty, questionId: game.question.id }
    );
  }

  if (!game.p1.isBot) {
    io.to(game.p1.id).emit('game_result', { ...result, youWin: p1Wins, isDraw: !p1Wins && !p2Wins, eloChange: eloResult.p1.eloChange, newElo: eloResult.p1.newElo });
  }
  if (!game.p2.isBot) {
    io.to(game.p2.id).emit('game_result', { ...result, youWin: p2Wins, isDraw: !p1Wins && !p2Wins, eloChange: eloResult.p2.eloChange, newElo: eloResult.p2.newElo });
  }

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

  const [aMin, aMax] = BOT_ACTIVITY[difficulty];
  setTimeout(() => {
    if (games[gameId]?.ended) return;
    const msg = game.question.type === 'code' ? 'running tests...' : 'checking answer...';
    io.to(playerSocket.id).emit('opponent_activity', { message: msg });
  }, (aMin + Math.random() * (aMax - aMin)) * 1000);

  const [sMin, sMax] = BOT_DELAY[difficulty];
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
  }, (sMin + Math.random() * (sMax - sMin)) * 1000);
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

  // Client sends correct:true/false based on local test evaluation
  socket.on('submit_answer', ({ gameId, correct }) => {
    const game = games[gameId];
    if (!game || game.ended) return;
    if (game.answers[socket.id] !== undefined) return; // already answered (use socket.id not userId)

    game.answers[socket.id] = { correct, timestamp: Date.now() };

    const opponent = game.p1.id === socket.id ? game.p2 : game.p1;
    if (!opponent.isBot) io.to(opponent.id).emit('opponent_answered');

    if (correct) {
      endGame(gameId, socket.id);
    } else {
      // Check if bot or opponent also answered wrong
      const opponentAnswered = game.answers[opponent.id];
      if (opponentAnswered && !opponentAnswered.correct) {
        endGame(gameId, null);
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

if (process.env.SENTRY_DSN) app.use(Sentry.expressErrorHandler());
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: 'Internal server error' }); });

server.listen(PORT, () => { console.log(`\n⚔️  ArenaIQ running at http://localhost:${PORT}\n`); });
