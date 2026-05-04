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

// Sentry — only active when SENTRY_DSN env var is set
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
const BOT_SEEDS = [
  { username: 'jaypark_92',   email: 'bot1@aiq.internal' },
  { username: 'quant_wolf',   email: 'bot2@aiq.internal' },
  { username: 'sigma_grind',  email: 'bot3@aiq.internal' },
  { username: 'midas_touch',  email: 'bot4@aiq.internal' },
  { username: 'lbo_lord',     email: 'bot5@aiq.internal' },
  { username: 'delta_grind',  email: 'bot6@aiq.internal' },
  { username: 'algo_ace',     email: 'bot7@aiq.internal' },
  { username: 'trade_beast',  email: 'bot8@aiq.internal' },
];

const botUserIds = [];
(async () => {
  const placeholder = await bcrypt.hash('bot-internal-password', 4);
  for (const b of BOT_SEEDS) {
    try {
      const r = db.createUser.run(b.username, b.email, placeholder);
      botUserIds.push(r.lastInsertRowid);
    } catch {
      const existing = db.getByEmail.get(b.email);
      if (existing) botUserIds.push(existing.id);
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

// Used by client for bot game question fetch
app.get('/api/question', (req, res) => {
  const q = getRandomQuestion(req.query.category, req.query.difficulty);
  if (!q) return res.status(404).json({ error: 'Not found' });
  res.json(q);
});

function safeUser(u) {
  return { id: u.id, username: u.username, elo: u.elo, wins: u.wins, losses: u.losses, draws: u.draws, win_rate: u.win_rate };
}

// ── GAME STATE ───────────────────────────────────────────────────────────────
const queues = {};       // 'cat-diff' → [{ socketId, userId, username, elo, isBot }]
const games = {};        // gameId → game object
const privateRooms = {}; // code → { host, category, difficulty }

function queueKey(cat, diff) { return `${cat}-${diff}`; }
function makeGameId() { return Math.random().toString(36).slice(2, 10); }
function makeRoomCode() { return Math.random().toString(36).slice(2, 8).toUpperCase(); }

function startGame(p1, p2, category, difficulty) {
  const question = getRandomQuestion(category, difficulty);
  if (!question) return null;

  const timeLimits = { easy: 300, medium: 480, hard: 720 }; // longer for code/numeric
  const gameId = makeGameId();

  games[gameId] = { p1, p2, question, category, difficulty, answers: {}, startTime: Date.now(), timeLimit: timeLimits[difficulty] || 300, timer: null, ended: false };

  const payload = { gameId, question, timeLimit: timeLimits[difficulty] || 300 };

  if (!p1.isBot) io.to(p1.id).emit('match_found', { ...payload, opponent: { username: p2.username, elo: p2.elo } });
  if (!p2.isBot) io.to(p2.id).emit('match_found', { ...payload, opponent: { username: p1.username, elo: p1.elo } });

  games[gameId].timer = setTimeout(() => {
    if (!games[gameId]?.ended) endGame(gameId, null);
  }, (timeLimits[difficulty] + 5) * 1000);

  return gameId;
}

function endGame(gameId, winnerId) {
  const game = games[gameId];
  if (!game || game.ended) return;
  game.ended = true;
  clearTimeout(game.timer);

  const result = {
    winnerId,
    explanation: game.question.explanation,
    answer: game.question.answer,         // for numeric questions
    correctIndex: game.question.correct,  // for MC (unused now)
  };

  // Always update ELO — bots have real DB records
  const eloResult = db.applyMatchResult(
    game.p1.userId, game.p2.userId, winnerId,
    { category: game.category, difficulty: game.difficulty, questionId: game.question.id }
  );

  if (!game.p1.isBot) {
    io.to(game.p1.id).emit('game_result', {
      ...result,
      eloChange: eloResult.p1.eloChange,
      newElo: eloResult.p1.newElo,
      youWin: winnerId === game.p1.userId,
    });
  }
  if (!game.p2.isBot) {
    io.to(game.p2.id).emit('game_result', {
      ...result,
      eloChange: eloResult.p2.eloChange,
      newElo: eloResult.p2.newElo,
      youWin: winnerId === game.p2.userId,
    });
  }

  delete games[gameId];
}

// ── BOT MATCH ─────────────────────────────────────────────────────────────────
// Accuracy: chance bot gets the answer right
const BOT_ACCURACY  = { easy: 0.55, medium: 0.70, hard: 0.85 };
// Delay (seconds) before bot "submits" — makes it feel like a real person
const BOT_DELAY     = { easy: [40, 90], medium: [70, 150], hard: [110, 240] };
// Delay before bot sends "running / checking" activity signal
const BOT_ACTIVITY  = { easy: [15, 35], medium: [25, 60], hard: [40, 100] };

function startBotMatch(playerSocket, category, difficulty) {
  const bot = getRandomBot();
  if (!bot) return;

  const botProxy = {
    id: 'bot-' + makeGameId(),
    userId: bot.id,
    username: bot.username,
    elo: bot.elo,
    isBot: true,
    isGuest: false,
    connected: true,
  };

  const gameId = startGame(playerSocket, botProxy, category, difficulty);
  if (!gameId) return;

  const game = games[gameId];
  const q = game.question;

  // Bot sends an "activity" signal (looks like they're working)
  const [aMin, aMax] = BOT_ACTIVITY[difficulty];
  const activityDelay = (aMin + Math.random() * (aMax - aMin)) * 1000;
  setTimeout(() => {
    if (games[gameId]?.ended) return;
    const msg = q.type === 'code' ? 'running tests...' : 'checking answer...';
    io.to(playerSocket.id).emit('opponent_activity', { message: msg });
  }, activityDelay);

  // Bot submits after a realistic delay
  const [sMin, sMax] = BOT_DELAY[difficulty];
  const submitDelay = (sMin + Math.random() * (sMax - sMin)) * 1000;
  setTimeout(() => {
    const g = games[gameId];
    if (!g || g.ended) return;

    io.to(playerSocket.id).emit('opponent_answered');

    const botCorrect = Math.random() < BOT_ACCURACY[difficulty];
    g.answers[botProxy.userId] = { correct: botCorrect, timestamp: Date.now() };

    const playerAnswered = g.answers[playerSocket.userId];

    if (botCorrect) {
      if (!playerAnswered?.correct) {
        // Bot wins
        endGame(gameId, botProxy.userId);
      }
      // If player already answered correctly, they won — do nothing
    } else {
      if (playerAnswered && !playerAnswered.correct) {
        // Both wrong — draw
        endGame(gameId, null);
      }
      // Otherwise wait for player to answer
    }
  }, submitDelay);
}

// ── SOCKET AUTH ──────────────────────────────────────────────────────────────
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    socket.userId = null;
    socket.username = 'Guest_' + Math.random().toString(36).slice(2,6).toUpperCase();
    socket.elo = 1200;
    socket.isGuest = true;
    socket.isBot = false;
    return next();
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.getUserStats.get(decoded.id);
    if (!user) throw new Error();
    socket.userId = user.id;
    socket.username = user.username;
    socket.elo = user.elo;
    socket.isGuest = false;
    socket.isBot = false;
    next();
  } catch {
    socket.userId = null;
    socket.username = 'Guest_' + Math.random().toString(36).slice(2,6).toUpperCase();
    socket.elo = 1200;
    socket.isGuest = true;
    socket.isBot = false;
    next();
  }
});

// ── SOCKET HANDLERS ──────────────────────────────────────────────────────────
io.on('connection', (socket) => {

  socket.on('join_queue', ({ category, difficulty }) => {
    const key = queueKey(category, difficulty);
    if (!queues[key]) queues[key] = [];
    queues[key] = queues[key].filter(p => p.userId !== socket.userId);

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
    // Remove from any queue first
    Object.keys(queues).forEach(k => {
      queues[k] = queues[k].filter(p => p.socketId !== socket.id);
    });
    startBotMatch(socket, category, difficulty);
  });

  socket.on('leave_queue', () => {
    Object.keys(queues).forEach(k => {
      queues[k] = queues[k].filter(p => p.socketId !== socket.id);
    });
  });

  // Client reports whether their answer was correct (tested locally)
  socket.on('submit_answer', ({ gameId, correct }) => {
    const game = games[gameId];
    if (!game || game.ended) return;
    if (game.answers[socket.userId] !== undefined) return;

    game.answers[socket.userId] = { correct, timestamp: Date.now() };

    const opponent = game.p1.userId === socket.userId ? game.p2 : game.p1;
    if (!opponent.isBot) io.to(opponent.id).emit('opponent_answered');

    if (correct) {
      endGame(gameId, socket.userId);
    } else {
      const opponentAnswer = game.answers[opponent.userId];
      if (opponentAnswer && !opponentAnswer.correct) {
        endGame(gameId, null); // both wrong = draw
      }
    }
  });

  socket.on('create_private_room', ({ category, difficulty }) => {
    const code = makeRoomCode();
    privateRooms[code] = { host: socket, category, difficulty, createdAt: Date.now() };
    socket.emit('private_room_created', { code });
    setTimeout(() => { delete privateRooms[code]; }, 10 * 60 * 1000);
  });

  socket.on('join_private_room', ({ code }) => {
    const room = privateRooms[code];
    if (!room) return socket.emit('error', { message: 'Room not found or expired' });
    if (room.host.userId === socket.userId) return socket.emit('error', { message: "Can't join your own room" });
    if (!room.host.connected) return socket.emit('error', { message: 'Host disconnected' });
    delete privateRooms[code];
    startGame(room.host, socket, room.category, room.difficulty);
  });

  socket.on('disconnect', () => {
    Object.keys(queues).forEach(k => {
      queues[k] = queues[k].filter(p => p.socketId !== socket.id);
    });
    for (const [gameId, game] of Object.entries(games)) {
      if ((game.p1.id === socket.id || game.p2.id === socket.id) && !game.ended) {
        const winnerId = game.p1.id === socket.id ? game.p2.userId : game.p1.userId;
        endGame(gameId, winnerId);
        break;
      }
    }
  });
});

// ── DATABASE BACKUP ──────────────────────────────────────────────────────────
// Visit /api/admin/backup?key=YOUR_ADMIN_KEY to download the database file.
// Set ADMIN_KEY as a Railway environment variable to protect this route.
app.get('/api/admin/backup', (req, res) => {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey || req.query.key !== adminKey) {
    return res.status(401).json({ error: 'Unauthorized — set ADMIN_KEY env var and pass ?key=' });
  }
  // Flush WAL to main db file before downloading
  try { db.pragma('wal_checkpoint(FULL)'); } catch (_) {}
  const dbPath = path.join(__dirname, 'arena.db');
  const filename = `arena-backup-${new Date().toISOString().slice(0, 10)}.db`;
  res.download(dbPath, filename);
});

// ── SENTRY ERROR HANDLER (must be last) ──────────────────────────────────────
if (process.env.SENTRY_DSN) {
  app.use(Sentry.expressErrorHandler());
}

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

server.listen(PORT, () => {
  console.log(`\n⚔️  ArenaIQ running at http://localhost:${PORT}\n`);
});
