const Database = require('better-sqlite3');
const path = require('path');

const dbFilePath = path.join(__dirname, 'arena.db');
const db = new Database(dbFilePath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT    UNIQUE NOT NULL,
    email         TEXT    UNIQUE NOT NULL,
    password_hash TEXT    NOT NULL,
    elo           INTEGER DEFAULT 1200,
    wins          INTEGER DEFAULT 0,
    losses        INTEGER DEFAULT 0,
    draws         INTEGER DEFAULT 0,
    color         TEXT    DEFAULT 'default',
    badge         TEXT    DEFAULT '',
    shields       INTEGER DEFAULT 0,
    created_at    TEXT    DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS matches (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    player1_id    INTEGER NOT NULL REFERENCES users(id),
    player2_id    INTEGER NOT NULL REFERENCES users(id),
    winner_id     INTEGER REFERENCES users(id),
    category      TEXT NOT NULL,
    difficulty    TEXT NOT NULL,
    question_id   TEXT NOT NULL,
    p1_elo_before INTEGER,
    p2_elo_before INTEGER,
    p1_elo_after  INTEGER,
    p2_elo_after  INTEGER,
    created_at    TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Single-row persistence canary: if boot_count keeps climbing with the same
  -- first_seen_at across deploys, the DB file is surviving restarts. If
  -- first_seen_at keeps resetting to "now", the filesystem is being wiped.
  CREATE TABLE IF NOT EXISTS meta (
    id           INTEGER PRIMARY KEY CHECK (id = 1),
    first_seen_at TEXT DEFAULT CURRENT_TIMESTAMP,
    boot_count    INTEGER DEFAULT 0
  );
`);

db.prepare(`
  INSERT INTO meta (id, boot_count) VALUES (1, 1)
  ON CONFLICT(id) DO UPDATE SET boot_count = boot_count + 1
`).run();

// Safe migrations for existing databases
['color TEXT DEFAULT \'default\'', 'badge TEXT DEFAULT \'\'', 'shields INTEGER DEFAULT 0', 'owned_badges TEXT DEFAULT \'[]\''].forEach(col => {
  try { db.exec(`ALTER TABLE users ADD COLUMN ${col}`); } catch (_) {}
});

const getMeta = db.prepare('SELECT first_seen_at, boot_count FROM meta WHERE id = 1');

const getById      = db.prepare('SELECT * FROM users WHERE id = ?');
const getByEmail   = db.prepare('SELECT * FROM users WHERE email = ?');
const getByUsername= db.prepare('SELECT * FROM users WHERE username = ?');
const createUser   = db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)');
const setElo       = db.prepare('UPDATE users SET elo = ? WHERE id = ?');
const setCosmetic    = db.prepare('UPDATE users SET color = ?, badge = ? WHERE id = ?');
const setOwnedBadges = db.prepare('UPDATE users SET owned_badges = ? WHERE id = ?');
const useShield    = db.prepare('UPDATE users SET shields = MAX(shields - 1, 0) WHERE id = ?');
const addShields   = db.prepare('UPDATE users SET shields = shields + ? WHERE id = ?');

const updateElo = db.prepare(`
  UPDATE users SET elo = ?, wins = wins + ?, losses = losses + ?, draws = draws + ? WHERE id = ?
`);

const recordMatch = db.prepare(`
  INSERT INTO matches (player1_id, player2_id, winner_id, category, difficulty, question_id,
    p1_elo_before, p2_elo_before, p1_elo_after, p2_elo_after)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Bot accounts seeded at startup use @aiq.internal addresses — excluded from real user counts.
const countRealUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE email NOT LIKE '%@aiq.internal'");
const countUsersSince = db.prepare("SELECT COUNT(*) as count FROM users WHERE email NOT LIKE '%@aiq.internal' AND created_at >= ?");
const countMatches = db.prepare('SELECT COUNT(*) as count FROM matches');

const getLeaderboard = db.prepare(`
  SELECT id, username, elo, wins, losses, draws, color, badge, shields,
    ROUND(CAST(wins AS REAL) / MAX(wins + losses, 1) * 100, 1) as win_rate
  FROM users ORDER BY elo DESC LIMIT 50
`);

const getUserStats = db.prepare(`
  SELECT id, username, elo, wins, losses, draws, color, badge, shields,
    ROUND(CAST(wins AS REAL) / MAX(wins + losses, 1) * 100, 1) as win_rate
  FROM users WHERE id = ?
`);

function calculateElo(winnerElo, loserElo, K = 32) {
  const expected = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  return { winnerGain: Math.round(K * (1 - expected)), loserLoss: Math.round(K * expected) };
}

function applyMatchResult(player1Id, player2Id, winnerId, matchData) {
  const p1 = getById.get(player1Id);
  const p2 = getById.get(player2Id);
  if (!p1 || !p2) return { p1: { eloChange: 0, newElo: 1200 }, p2: { eloChange: 0, newElo: 1200 } };

  const K = matchData.winnerHintUsed ? 16 : 32;

  let p1EloAfter = p1.elo, p2EloAfter = p2.elo;
  let p1W = 0, p1L = 0, p1D = 0, p2W = 0, p2L = 0, p2D = 0;

  if (winnerId === player1Id) {
    const { winnerGain, loserLoss } = calculateElo(p1.elo, p2.elo, K);
    p1EloAfter = p1.elo + winnerGain; p2EloAfter = p2.elo - loserLoss;
    p1W = 1; p2L = 1;
  } else if (winnerId === player2Id) {
    const { winnerGain, loserLoss } = calculateElo(p2.elo, p1.elo, K);
    p2EloAfter = p2.elo + winnerGain; p1EloAfter = p1.elo - loserLoss;
    p2W = 1; p1L = 1;
  } else {
    p1D = 1; p2D = 1;
  }

  db.transaction(() => {
    updateElo.run(p1EloAfter, p1W, p1L, p1D, player1Id);
    updateElo.run(p2EloAfter, p2W, p2L, p2D, player2Id);
    recordMatch.run(player1Id, player2Id, winnerId || null, matchData.category, matchData.difficulty, matchData.questionId, p1.elo, p2.elo, p1EloAfter, p2EloAfter);
  })();

  return {
    p1: { eloChange: p1EloAfter - p1.elo, newElo: p1EloAfter },
    p2: { eloChange: p2EloAfter - p2.elo, newElo: p2EloAfter },
  };
}

module.exports = { getById, getByEmail, getByUsername, createUser, setElo, setCosmetic, setOwnedBadges, useShield, addShields, getLeaderboard, getUserStats, applyMatchResult, countRealUsers, countUsersSince, countMatches, getMeta, dbFilePath };
