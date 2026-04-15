import { defineConfig } from 'drizzle-kit'
import { config } from 'dotenv'

config({ path: '.env' })
config({ path: '.env.local', override: true })

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set — check .env or .env.local')
}

export default defineConfig({
  schema:    './lib/db/schema.ts',
  out:       './drizzle',
  dialect:   'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
})
