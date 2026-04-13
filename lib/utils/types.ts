import { z } from 'zod'

export const SOURCE_TYPES = [
  'youtube', 'spotify', 'tiktok', 'instagram',
  'x', 'article', 'podcast', 'film', 'book',
  'concert', 'generic'
] as const

export type SourceType = typeof SOURCE_TYPES[number]

export const STATUS_VALUES = ['pending', 'consumed'] as const
export type Status = typeof STATUS_VALUES[number]

export interface Item {
  id:          number
  url:         string | null
  title:       string
  author:      string | null
  sourceType:  string
  genre:       string | null
  mood:        string | null
  synopsis:    string | null
  keywords:    string | null   // JSON array of searchable proper nouns
  thumbnail:   string | null
  duration:    string | null
  recommender: string | null
  status:      string | null
  notes:       string | null
  rating:      number | null
  aiTags:      string | null
  enriched:    boolean | null
  llmProvider: string | null
  createdAt:   string | null
  consumedAt:  string | null
}

export interface Tag {
  id:    number
  label: string
}

export interface ScrapedMetadata {
  url:            string
  title:          string
  author:         string
  sourceType:     SourceType
  thumbnail:      string
  rawDescription: string
}

export interface EnrichedMetadata {
  title:      string
  synopsis:   string
  keywords:   string[]
  mood:       string[]
  genre:      string
  sourceType: string
  aiTags:     string[]
}

export interface SearchResult {
  heading:    string
  abstract:   string
  source:     string
  sourceName: string
  image:      string
  related:    { text: string; url: string }[]
}

export interface ItemFilters {
  status?:      string
  type?:        string
  mood?:        string
  genre?:       string
  recommender?: string
  q?:           string
}

// Zod schemas

export const CreateItemSchema = z.object({
  url:         z.string().url().optional().nullable(),
  title:       z.string().min(1),
  author:      z.string().optional().nullable(),
  sourceType:  z.enum(SOURCE_TYPES),
  genre:       z.string().optional().nullable(),
  mood:        z.string().optional().nullable(),
  synopsis:    z.string().optional().nullable(),
  keywords:    z.string().optional().nullable(),
  thumbnail:   z.string().optional().nullable(),
  duration:    z.string().optional().nullable(),
  recommender: z.string().optional().nullable(),
  status:      z.enum(STATUS_VALUES).optional().default('pending'),
  notes:       z.string().optional().nullable(),
  rating:      z.number().int().min(1).max(5).optional().nullable(),
  aiTags:      z.string().optional().nullable(),
  llmProvider: z.string().optional().nullable(),
})

export const PatchItemSchema = z.object({
  url:         z.string().url().optional().nullable(),
  title:       z.string().min(1).optional(),
  author:      z.string().optional().nullable(),
  sourceType:  z.enum(SOURCE_TYPES).optional(),
  genre:       z.string().optional().nullable(),
  mood:        z.string().optional().nullable(),
  synopsis:    z.string().optional().nullable(),
  keywords:    z.string().optional().nullable(),
  thumbnail:   z.string().optional().nullable(),
  duration:    z.string().optional().nullable(),
  recommender: z.string().optional().nullable(),
  status:      z.enum(STATUS_VALUES).optional(),
  notes:       z.string().optional().nullable(),
  rating:      z.number().int().min(1).max(5).optional().nullable(),
  aiTags:      z.string().optional().nullable(),
  enriched:    z.boolean().optional(),
  llmProvider: z.string().optional().nullable(),
})

export const IngestConfirmSchema = z.object({
  metadata: z.object({
    url:         z.string().optional().nullable(),
    title:       z.string().min(1),
    author:      z.string().optional().nullable(),
    sourceType:  z.enum(SOURCE_TYPES),
    genre:       z.string().optional().nullable(),
    mood:        z.string().optional().nullable(),
    synopsis:    z.string().optional().nullable(),
    keywords:    z.string().optional().nullable(),
    thumbnail:   z.string().optional().nullable(),
    duration:    z.string().optional().nullable(),
    recommender: z.string().optional().nullable(),
    notes:       z.string().optional().nullable(),
    rating:      z.number().int().min(1).max(5).optional().nullable(),
    aiTags:      z.string().optional().nullable(),
    llmProvider: z.string().optional().nullable(),
    enriched:    z.boolean().optional(),
  }),
})
