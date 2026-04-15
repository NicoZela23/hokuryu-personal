import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import { config } from 'dotenv'

config({ path: '.env' })
config({ path: '.env.local', override: true })

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('[migrate] DATABASE_URL is required')
  process.exit(1)
}

async function runMigrations() {
  const client = postgres(connectionString!, { max: 1 })
  const db = drizzle(client)

  console.log('[migrate] applying migrations...')
  await migrate(db, { migrationsFolder: './drizzle' })
  console.log('[migrate] ✓ done')

  await client.end()
}

runMigrations().catch((err) => {
  console.error('[migrate] failed:', err)
  process.exit(1)
})
