import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const items = sqliteTable('items', {
  id:          integer('id').primaryKey({ autoIncrement: true }),
  url:         text('url').unique(),
  title:       text('title').notNull(),
  author:      text('author'),
  sourceType:  text('source_type').notNull(),
  genre:       text('genre'),
  mood:        text('mood'),
  synopsis:    text('synopsis'),
  facts:       text('facts'),        // kept for existing data, no longer populated
  opinions:    text('opinions'),     // kept for existing data, no longer populated
  keywords:    text('keywords'),     // JSON array of searchable proper nouns
  thumbnail:   text('thumbnail'),
  duration:    text('duration'),
  recommender: text('recommender'),
  status:      text('status').default('pending'),
  notes:       text('notes'),
  rating:      integer('rating'),
  aiTags:      text('ai_tags'),
  enriched:    integer('enriched', { mode: 'boolean' }).default(false),
  llmProvider: text('llm_provider'),
  createdAt:   text('created_at').default(sql`CURRENT_TIMESTAMP`),
  consumedAt:  text('consumed_at'),
  testing:      text('tested_ar'),
  testing2:      text('tested_ar'),
  testing3:      text('tested_ar')
})

export const tags = sqliteTable('tags', {
  id:    integer('id').primaryKey({ autoIncrement: true }),
  label: text('label').notNull().unique(),
})

export const itemTags = sqliteTable('item_tags', {
  itemId: integer('item_id').notNull().references(() => items.id, { onDelete: 'cascade' }),
  tagId:  integer('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
})
