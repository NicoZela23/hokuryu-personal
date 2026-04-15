import { z } from 'zod'

// Medium — how the content is delivered (visual identity of the seed card)
export const SOURCE_TYPES = [
  'video', 'film', 'book', 'article',
  'podcast', 'music', 'interactive', 'event',
  'course', 'generic',
] as const

export type SourceType = typeof SOURCE_TYPES[number]

// Consumption format — what kind of content it is (used for recommendations + grouping)
export const CONTENT_FORMATS = [
  // Screen
  'anime', 'animation', 'series', 'documentary', 'k-drama', 'stand-up',
  // Reading
  'manga', 'manhwa', 'comics', 'fiction', 'non-fiction', 'biography', 'self-help',
  // Tech / Dev
  'programming', 'design', 'ai-ml',
  // Knowledge
  'science', 'history', 'philosophy', 'news', 'true-crime',
  // Lifestyle
  'nature', 'travel', 'food', 'sports',
  // Audio / Live
  'album', 'live-concert',
  // Education
  'education',
] as const

export type ContentFormat = typeof CONTENT_FORMATS[number]

export const STATUS_VALUES = ['pending', 'consumed'] as const
export type Status = typeof STATUS_VALUES[number]

export interface Item {
  id:             number
  userId:         string          // UUID — owner
  url:            string | null
  title:          string
  author:         string | null
  sourceType:     string
  genre:          string | null
  mood:           string | null
  synopsis:       string | null
  keywords:       string | null   // JSON string[]
  thumbnail:      string | null
  duration:       string | null
  recommender:    string | null
  status:         string | null
  notes:          string | null
  rating:         number | null
  aiTags:         string | null   // JSON string[]
  enriched:       boolean | null
  llmProvider:    string | null
  contentFormat:  string | null   // consumption category (anime, gaming, programming…)
  platform:       string | null   // origin platform (YouTube, Netflix, Crunchyroll…)
  createdAt:      string | null
  consumedAt:     string | null
  originalItemId: number | null   // set if this is a souvenir
  originalUserId: string | null   // source garden owner UUID
}

export interface Tag {
  id:    number
  label: string
}

export interface Profile {
  id:                  string
  username:            string
  displayName:         string | null
  bio:                 string | null
  avatarUrl:           string | null
  karma:               number
  streakCount:         number
  contentPrefs:        string[] | null
  onboardingCompleted: boolean
  createdAt:           string | null
}

export interface PublicProfile extends Profile {
  seedCount:      number
  harvestCount:   number
}

export const GENRES = [
  'Fiction', 'Non-Fiction', 'Science', 'History', 'Technology',
  'Art', 'Music', 'Philosophy', 'Psychology', 'Biography',
  'Business', 'Politics', 'Sports', 'Comedy', 'Drama',
  'Horror', 'Thriller', 'Sci-Fi', 'Fantasy', 'Documentary',
  'Self-Help', 'Education', 'Gaming', 'Travel', 'Food',
] as const

export type Genre = typeof GENRES[number]

export interface ScrapedMetadata {
  url:            string
  title:          string
  author:         string
  sourceType:     SourceType
  platform:       string | null   // auto-detected from URL
  contentFormat:  string | null   // auto-detected from URL (obvious cases only)
  thumbnail:      string
  rawDescription: string
}

export interface EnrichedMetadata {
  title:         string
  synopsis:      string
  keywords:      string[]
  mood:          string[]
  genre:         string
  sourceType:    string
  contentFormat: string | null
  platform:      string | null
  aiTags:        string[]
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
  type?:        string   // sourceType (medium)
  format?:      string   // contentFormat
  platform?:    string
  mood?:        string
  genre?:       string
  recommender?: string
  q?:           string
}

// Zod schemas

export const CreateItemSchema = z.object({
  url:           z.string().url().optional().nullable(),
  title:         z.string().min(1),
  author:        z.string().optional().nullable(),
  sourceType:    z.enum(SOURCE_TYPES),
  contentFormat: z.string().optional().nullable(),
  platform:      z.string().optional().nullable(),
  genre:         z.string().optional().nullable(),
  mood:          z.string().optional().nullable(),
  synopsis:      z.string().optional().nullable(),
  keywords:      z.string().optional().nullable(),
  thumbnail:     z.string().optional().nullable(),
  duration:      z.string().optional().nullable(),
  recommender:   z.string().optional().nullable(),
  status:        z.enum(STATUS_VALUES).optional().default('pending'),
  notes:         z.string().optional().nullable(),
  rating:        z.number().int().min(1).max(5).optional().nullable(),
  aiTags:        z.string().optional().nullable(),
  llmProvider:   z.string().optional().nullable(),
})

export const PatchItemSchema = z.object({
  url:           z.string().url().optional().nullable(),
  title:         z.string().min(1).optional(),
  author:        z.string().optional().nullable(),
  sourceType:    z.string().optional(),        // string (not enum) — patch is lenient
  contentFormat: z.string().optional().nullable(),
  platform:      z.string().optional().nullable(),
  genre:         z.string().optional().nullable(),
  mood:          z.string().optional().nullable(),
  synopsis:      z.string().optional().nullable(),
  keywords:      z.string().optional().nullable(),
  thumbnail:     z.string().optional().nullable(),
  duration:      z.string().optional().nullable(),
  recommender:   z.string().optional().nullable(),
  status:        z.enum(STATUS_VALUES).optional(),
  notes:         z.string().optional().nullable(),
  rating:        z.number().int().min(1).max(5).optional().nullable(),
  aiTags:        z.string().optional().nullable(),
  enriched:      z.boolean().optional(),
  llmProvider:   z.string().optional().nullable(),
})

export const IngestConfirmSchema = z.object({
  metadata: z.object({
    url:           z.string().optional().nullable(),
    title:         z.string().min(1),
    author:        z.string().optional().nullable(),
    sourceType:    z.enum(SOURCE_TYPES),
    contentFormat: z.string().optional().nullable(),
    platform:      z.string().optional().nullable(),
    genre:         z.string().optional().nullable(),
    mood:          z.string().optional().nullable(),
    synopsis:      z.string().optional().nullable(),
    keywords:      z.string().optional().nullable(),
    thumbnail:     z.string().optional().nullable(),
    duration:      z.string().optional().nullable(),
    recommender:   z.string().optional().nullable(),
    notes:         z.string().optional().nullable(),
    rating:        z.number().int().min(1).max(5).optional().nullable(),
    aiTags:        z.string().optional().nullable(),
    llmProvider:   z.string().optional().nullable(),
    enriched:      z.boolean().optional(),
  }),
})
