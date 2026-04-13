import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_PATH = process.env.DB_PATH ?? './data/garden.db'

async function runMigrations() {
  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  const sqlite = new Database(DB_PATH)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT UNIQUE,
      title TEXT NOT NULL,
      author TEXT,
      source_type TEXT NOT NULL,
      genre TEXT,
      mood TEXT,
      synopsis TEXT,
      facts TEXT,
      opinions TEXT,
      thumbnail TEXT,
      duration TEXT,
      recommender TEXT,
      status TEXT DEFAULT 'pending',
      notes TEXT,
      rating INTEGER,
      ai_tags TEXT,
      enriched INTEGER DEFAULT 0,
      llm_provider TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      consumed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS item_tags (
      item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE
    );
  `)

  // Add new columns to existing DBs gracefully
  const cols = sqlite.pragma('table_info(items)') as { name: string }[]
  const colNames = cols.map((c) => c.name)
  if (!colNames.includes('facts'))    sqlite.exec(`ALTER TABLE items ADD COLUMN facts TEXT`)
  if (!colNames.includes('opinions')) sqlite.exec(`ALTER TABLE items ADD COLUMN opinions TEXT`)
  if (!colNames.includes('keywords')) sqlite.exec(`ALTER TABLE items ADD COLUMN keywords TEXT`)

  console.log('Garden DB ready.')
  sqlite.close()
}

runMigrations().catch((err) => {
  console.error('[migrate] failed:', err)
  process.exit(1)
})
