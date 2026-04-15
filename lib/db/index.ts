import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL ?? ''

if (!connectionString) {
  console.warn('[db] DATABASE_URL is not set — database calls will fail at runtime')
}

// Serverless-optimized config:
// - max: 1       → one connection per function instance, prevents pool exhaustion
// - prepare: false → required for PgBouncer transaction mode (port 6543)
// - idle_timeout  → release connection back to pool quickly between requests
// - max_lifetime  → rotate connections to avoid stale sockets on long-lived instances
const client = postgres(connectionString, {
  prepare:      false,
  max:          1,
  idle_timeout: 20,
  max_lifetime: 1800,
})

export const db = drizzle(client, { schema })
