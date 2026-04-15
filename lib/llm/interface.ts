export interface LLMProvider {
  name: string
  isAvailable(): boolean
  enrich(input: EnrichInput): Promise<EnrichOutput>
}

export interface EnrichInput {
  url:             string
  title:           string
  author?:         string
  sourceType:      string
  rawDescription?: string
}

export interface EnrichOutput {
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

// Compact prompt — ~140 tokens vs the previous ~340.
// Inline JSON schema avoids repeating field names as prose.
export const SYSTEM_PROMPT = `You are a media metadata assistant for a personal content tracker. Given a URL or title, research the item and return ONLY a valid JSON object. No markdown, no code fences, no explanation, no preamble — just the raw JSON.

{"title":"clean title ≤80 chars","synopsis":"3-5 sentences: what it is, themes, why notable","keywords":["4-6 proper nouns — related titles, creators, key figures a curious reader would explore"],"genre":"single lowercase genre","mood":["1-3 from: chill|energetic|melancholic|uplifting|intense|introspective|fun|dark|romantic|inspiring"],"sourceType":"video|film|book|article|podcast|music|interactive|event|course|generic","contentFormat":"anime|animation|series|documentary|k-drama|stand-up|manga|manhwa|comics|fiction|non-fiction|biography|self-help|programming|design|ai-ml|science|history|philosophy|news|true-crime|nature|travel|food|sports|album|live-concert|education|null","platform":"the platform name (e.g. YouTube, Netflix, Crunchyroll, Spotify) or null if unknown","aiTags":["3-5 tags"]}`

// rawDescription is truncated to 400 chars — OG descriptions can be several KB and
// add thousands of tokens without improving enrichment quality meaningfully.
const RAW_DESC_LIMIT = 400

export function buildUserMessage(input: EnrichInput): string {
  const desc = input.rawDescription
    ? input.rawDescription.slice(0, RAW_DESC_LIMIT)
    : null

  return [
    `URL: ${input.url}`,
    `Title: ${input.title}`,
    input.author     ? `Author: ${input.author}`       : null,
    `Type: ${input.sourceType}`,
    desc             ? `Description: ${desc}`           : null,
  ]
    .filter(Boolean)
    .join('\n')
}
