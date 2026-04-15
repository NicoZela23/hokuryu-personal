import { pgTable, text, integer, boolean, uuid, timestamp, serial, index } from 'drizzle-orm/pg-core'

// ── Profiles (extends Supabase auth.users) ──────────────────────────────────
export const profiles = pgTable('profiles', {
  id:                   uuid('id').primaryKey(),             // mirrors auth.users.id
  username:             text('username').notNull().unique(),
  displayName:          text('display_name'),
  bio:                  text('bio'),                         // markdown
  avatarUrl:            text('avatar_url'),
  karma:                integer('karma').default(0).notNull(),
  streakCount:          integer('streak_count').default(0).notNull(),
  streakLastDate:       text('streak_last_date'),            // YYYY-MM-DD
  contentPrefs:         text('content_prefs').array(),       // sourceType[] — copy from onboarding
  onboardingCompleted:  boolean('onboarding_completed').default(false).notNull(),
  createdAt:            timestamp('created_at', { mode: 'string' }).defaultNow(),
})

// ── Onboarding preferences ───────────────────────────────────────────────────
export const onboardingPreferences = pgTable('onboarding_preferences', {
  userId:         uuid('user_id').primaryKey().references(() => profiles.id, { onDelete: 'cascade' }),
  sourceTypes:    text('source_types').array(),     // legacy — medium[] selections
  contentFormats: text('content_formats').array(),  // contentFormat[] selections (new)
  genres:         text('genres').array(),            // genre[] selections
  completed:      boolean('completed').default(false).notNull(),
  createdAt:      timestamp('created_at', { mode: 'string' }).defaultNow(),
})

// ── Items (seeds) ────────────────────────────────────────────────────────────
export const items = pgTable('items', {
  id:             serial('id').primaryKey(),
  userId:         uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  url:            text('url'),
  title:          text('title').notNull(),
  author:         text('author'),
  sourceType:     text('source_type').notNull(),
  genre:          text('genre'),
  mood:           text('mood'),
  synopsis:       text('synopsis'),
  facts:          text('facts'),       // legacy — no longer populated
  opinions:       text('opinions'),    // legacy — no longer populated
  keywords:       text('keywords'),    // JSON string[]
  thumbnail:      text('thumbnail'),
  duration:       text('duration'),
  recommender:    text('recommender'),
  status:         text('status').default('pending'),
  notes:          text('notes'),
  rating:         integer('rating'),
  aiTags:         text('ai_tags'),      // JSON string[]
  enriched:       boolean('enriched').default(false),
  llmProvider:    text('llm_provider'),
  contentFormat:  text('content_format'),                    // e.g. anime, manga, programming
  platform:       text('platform'),                          // e.g. YouTube, Netflix, Crunchyroll
  createdAt:      timestamp('created_at', { mode: 'string' }).defaultNow(),
  consumedAt:     timestamp('consumed_at', { mode: 'string' }),
  // Social fields — used from V3 onward, nullable for now
  originalItemId: integer('original_item_id'),               // set if this is a souvenir
  originalUserId: uuid('original_user_id'),                  // source garden owner
}, (table) => ({
  userIdIdx:         index('items_user_id_idx').on(table.userId),
  createdAtIdx:      index('items_created_at_idx').on(table.createdAt),
  statusIdx:         index('items_status_idx').on(table.status),
  sourceTypeIdx:     index('items_source_type_idx').on(table.sourceType),
  contentFormatIdx:  index('items_content_format_idx').on(table.contentFormat),
  platformIdx:       index('items_platform_idx').on(table.platform),
}))

// ── Enrichment cache (shared across all users — saves LLM tokens) ────────────
export const enrichmentCache = pgTable('enrichment_cache', {
  id:        serial('id').primaryKey(),
  url:       text('url').notNull().unique(),
  data:      text('data').notNull(),         // JSON of EnrichedMetadata
  provider:  text('provider'),
  hitCount:  integer('hit_count').default(0).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
}, (table) => ({
  urlIdx: index('enrichment_cache_url_idx').on(table.url),
}))

// ── Tags (global — used for manual tag associations) ─────────────────────────
export const tags = pgTable('tags', {
  id:    serial('id').primaryKey(),
  label: text('label').notNull().unique(),
})

export const itemTags = pgTable('item_tags', {
  itemId: integer('item_id').notNull().references(() => items.id, { onDelete: 'cascade' }),
  tagId:  integer('tag_id').notNull().references(() => tags.id,  { onDelete: 'cascade' }),
})
