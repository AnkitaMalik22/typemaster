// Database initialization and history saving
const fs = require('fs');
const path = require('path');
const os = require('os');
const Database = require('better-sqlite3');

const dbPath = path.join(os.homedir(), '.typemaster', 'history.db');

function initDB() {
  let db;
  try {
    if (!fs.existsSync(path.dirname(dbPath))) {
      fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    }
    db = new Database(dbPath);
    db.exec(`
      CREATE TABLE IF NOT EXISTS tests (
        id INTEGER PRIMARY KEY,
        timestamp TEXT,
        mode TEXT,
        wpm REAL,
        cpm REAL,
        accuracy REAL,
        duration REAL,
        errors INTEGER
      )
    `);
  } catch (e) {
    console.error('Database initialization failed:', e.message);
  }
  return db;
}

function saveTest(db, stats, mode) {
  try {
    const stmt = db.prepare('INSERT INTO tests (timestamp, mode, wpm, cpm, accuracy, duration, errors) VALUES (?, ?, ?, ?, ?, ?, ?)');
    stmt.run(new Date().toISOString(), mode, stats.wpm, stats.cpm, stats.accuracy, stats.duration, stats.errors);
  } catch (e) {
    // Ignore DB errors
  }
}

module.exports = { initDB, saveTest, dbPath };
