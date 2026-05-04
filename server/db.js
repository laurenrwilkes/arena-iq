const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'arena.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    username    TEXT    UNIQUE NOT NULL,
    email       TEXT    UNIQUE NOT NULL,
    password_hash TEXT  NOT NULL,
    elo         INTEGER DEFAULT 1200,
    wins        INTEGER DEFAULT 0,
    losses      INTEGER DEFAULT 0,
    draws       INTEGER DEFAULT 0,
    created_at  TEXT    DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS matches (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    player1_id  INTEGER NOT NULL REFERENCES users(id),
    player2_id  INTEGER NOT NULL REFERENCES users(id),
    winner_id   INTEGER REFERENCES users(id),
    category    TEXT NOT NULL,
    difficulty  TEXT NOT NULL,
    question_id TEXT NOT NULL,
    p1_elo_before INTEGER,
    p2_elo_before INTEGER,
    p1_elo_after  INTEGER,
    p2_elo_after  INTEGER,
    created_at  TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

const getById = db.prepare('SELECT * FROM users WHERE id = ?');
const getByEmail = db.prepare('SELECT * FROM users WHERE email = ?');
const getByUsername = db.prepare('SELECT * FROM users WHERE username = ?');

const createUser = db.prepare(`
  INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)
`);

const updateElo = db.prepare(`
  UPDATE users SET elo = ?, wins = wins + ?, losses = losses + ?, draws = draws + ?
  WHERE id = ?
`);

const recordMatch = db.prepare(`
  INSERT INTO matches (player1_id, player2_id, winner_id, category, difficulty, question_id,
    p1_elo_before, p2_elo_before, p1_elo_after, p2_elo_after)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const getLeaderboard = db.prepare(`
  SELECT id, username, elo, wins, losses, draws,
    ROUND(CAST(wins AS REAL) / MAX(wins + losses, 1) * 100, 1) as win_rate
  FROM users ORDER BY elo DESC LIMIT 50
`);

const getUserStats = db.prepare(`
  SELECT id, username, elo, wins, losses, draws,
    ROUND(CAST(wins AS REAL) / MAX(wins + losses, 1) * 100, 1) as win_rate
  FROM users WHERE id = ?
`);

function calculateElo(winnerElo, loserElo, K = 32) {
  const expected = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const winnerGain = Math.round(K * (1 - expected));
  const loserLoss = Math.round(K * expected);
  return { winnerGain, loserLoss };
}

function applyMatchResult(player1Id, player2Id, winnerId, matchData) {
  const p1 = getById.get(player1Id);
  const p2 = getById.get(player2Id);

  let p1EloAfter = p1.elo;
  let p2EloAfter = p2.elo;
  let p1WinDelta = 0, p1LossDelta = 0, p1DrawDelta = 0;
  let p2WinDelta = 0, p2LossDelta = 0, p2DrawDelta = 0;

  if (winnerId === player1Id) {
    const { winnerGain, loserLoss } = calculateElo(p1.elo, p2.elo);
    p1EloAfter = p1.elo + winnerGain;
    p2EloAfter = p2.elo - loserLoss;
    p1WinDelta = 1; p2LossDelta = 1;
  } else if (winnerId === player2Id) {
    const { winnerGain, loserLoss } = calculateElo(p2.elo, p1.elo);
    p2EloAfter = p2.elo + winnerGain;
    p1EloAfter = p1.elo - loserLoss;
    p2WinDelta = 1; p1LossDelta = 1;
  } else {
    p1DrawDelta = 1; p2DrawDelta = 1;
  }

  const applyAll = db.transaction(() => {
    updateElo.run(p1EloAfter, p1WinDelta, p1LossDelta, p1DrawDelta, player1Id);
    updateElo.run(p2EloAfter, p2WinDelta, p2LossDelta, p2DrawDelta, player2Id);
    recordMatch.run(
      player1Id, player2Id, winnerId || null,
      matchData.category, matchData.difficulty, matchData.questionId,
      p1.elo, p2.elo, p1EloAfter, p2EloAfter
    );
  });

  applyAll();

  return {
    p1: { eloChange: p1EloAfter - p1.elo, newElo: p1EloAfter },
    p2: { eloChange: p2EloAfter - p2.elo, newElo: p2EloAfter },
  };
}

module.exports = {
  getById,
  getByEmail,
  getByUsername,
  createUser,
  getLeaderboard,
  getUserStats,
  applyMatchResult,
};
