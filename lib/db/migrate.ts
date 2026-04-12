import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import path from 'path'
import fs from 'fs'
import * as schema from './schema'

const DB_PATH = process.env.DB_PATH ?? './data/garden.db'

async function runMigrations() {
  // Ensure data directory exists
  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  const sqlite = new Database(DB_PATH)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')

  const db = drizzle(sqlite, { schema })

  // Run migrations from drizzle folder
  const migrationsFolder = path.join(process.cwd(), 'drizzle')
  if (fs.existsSync(migrationsFolder)) {
    migrate(db, { migrationsFolder })
  } else {
    // No migrations folder yet — create tables directly from schema
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT UNIQUE,
        title TEXT NOT NULL,
        author TEXT,
        source_type TEXT NOT NULL,
        genre TEXT,
        mood TEXT,
        synopsis TEXT,
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
  }

  // First-run: seed admin user if users table is empty
  const existing = db.select().from(schema.users).all()
  if (existing.length === 0) {
    const username = process.env.GARDEN_ADMIN_USER ?? 'admin'
    const password = process.env.GARDEN_ADMIN_PASS ?? 'changeme'
    const passwordHash = await bcrypt.hash(password, 12)
    db.insert(schema.users).values({ username, passwordHash }).run()
    console.log(`Garden initialized. First user created: ${username}`)
  }

  sqlite.close()
}

runMigrations().catch((err) => {
  console.error('[migrate] failed:', err)
  process.exit(1)
})
