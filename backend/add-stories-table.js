const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'mythos.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
});

const createStoriesTable = `
CREATE TABLE IF NOT EXISTS stories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  title TEXT NOT NULL,
  genre TEXT,
  content TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
`;

db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');
  db.run(createStoriesTable, (err) => {
    if (err) {
      console.error('Failed to create stories table:', err);
      process.exit(1);
    } else {
      console.log('stories table ensured.');
      process.exit(0);
    }
  });
});
