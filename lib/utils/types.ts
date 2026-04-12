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
  sourceType:  SourceType
  genre:       string | null
  mood:        string | null
  synopsis:    string | null
  thumbnail:   string | null
  duration:    string | null
  recommender: string | null
  status:      Status
  notes:       string | null
  rating:      number | null
  aiTags:      string | null
  enriched:    boolean
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
  synopsis:       string
  rawDescription: string
  duration:       string
}

export interface EnrichedMetadata {
  title:      string
  synopsis:   string
  mood:       string[]
  genre:      string
  sourceType: SourceType
  aiTags:     string[]
}

export interface CandidateItem {
  title:       string
  url:         string
  recommender: string
  sourceType:  SourceType
}

export interface ItemFilters {
  status?:      string
  type?:        string
  mood?:        string
  genre?:       string
  recommender?: string
  q?:           string
}

// Zod schemas for API validation

export const ItemFiltersSchema = z.object({
  status:      z.string().optional(),
  type:        z.string().optional(),
  mood:        z.string().optional(),
  genre:       z.string().optional(),
  recommender: z.string().optional(),
  q:           z.string().optional(),
})

export const CreateItemSchema = z.object({
  url:         z.string().url().optional().nullable(),
  title:       z.string().min(1),
  author:      z.string().optional().nullable(),
  sourceType:  z.enum(SOURCE_TYPES),
  genre:       z.string().optional().nullable(),
  mood:        z.string().optional().nullable(),
  synopsis:    z.string().optional().nullable(),
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

export const IngestUrlSchema = z.object({
  url: z.string().url(),
})

export const IngestEnrichSchema = z.object({
  metadata: z.object({
    url:            z.string(),
    title:          z.string(),
    author:         z.string().optional(),
    sourceType:     z.string(),
    thumbnail:      z.string().optional(),
    synopsis:       z.string().optional(),
    rawDescription: z.string().optional(),
    duration:       z.string().optional(),
  }),
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
