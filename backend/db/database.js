const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'voteapp.db'), { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables
const initDb = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
      oauth_provider TEXT,
      oauth_id TEXT,
      points INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(oauth_provider, oauth_id)
    )
  `);

  // Markets table
  db.exec(`
    CREATE TABLE IF NOT EXISTS markets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      rules TEXT,
      close_time DATETIME NOT NULL,
      status TEXT DEFAULT 'open' CHECK(status IN ('open', 'closed', 'resolved')),
      resolution TEXT CHECK(resolution IN ('YES', 'NO', NULL)),
      show_totals BOOLEAN DEFAULT 1,
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      resolved_at DATETIME,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Votes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      market_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      vote TEXT NOT NULL CHECK(vote IN ('YES', 'NO')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (market_id) REFERENCES markets(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(market_id, user_id)
    )
  `);

  // Badges table
  db.exec(`
    CREATE TABLE IF NOT EXISTS badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      requirement_type TEXT NOT NULL CHECK(requirement_type IN ('votes', 'correct', 'streak', 'points')),
      requirement_value INTEGER NOT NULL
    )
  `);

  // User badges table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      badge_id INTEGER NOT NULL,
      earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
      UNIQUE(user_id, badge_id)
    )
  `);

  // Insert default badges if they don't exist
  const badgeCount = db.prepare('SELECT COUNT(*) as count FROM badges').get();
  if (badgeCount.count === 0) {
    const insertBadge = db.prepare(`
      INSERT INTO badges (name, description, icon, requirement_type, requirement_value)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertBadge.run('First Vote', 'Cast your first vote', '🎯', 'votes', 1);
    insertBadge.run('Vote Enthusiast', 'Cast 10 votes', '🔥', 'votes', 10);
    insertBadge.run('Vote Master', 'Cast 50 votes', '⭐', 'votes', 50);
    insertBadge.run('Predictor', 'Get 5 correct predictions', '✅', 'correct', 5);
    insertBadge.run('Oracle', 'Get 20 correct predictions', '🔮', 'correct', 20);
    insertBadge.run('Winning Streak', 'Get 5 correct predictions in a row', '🚀', 'streak', 5);
    insertBadge.run('Points Hunter', 'Earn 100 points', '💯', 'points', 100);
    insertBadge.run('Points Champion', 'Earn 500 points', '👑', 'points', 500);
  }

  console.log('Database initialized successfully');
};

initDb();

module.exports = db;

