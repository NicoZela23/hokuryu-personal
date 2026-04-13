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
  title:      string
  synopsis:   string
  keywords:   string[]
  mood:       string[]
  genre:      string
  sourceType: string
  aiTags:     string[]
}

// Compact prompt — ~140 tokens vs the previous ~340.
// Inline JSON schema avoids repeating field names as prose.
export const SYSTEM_PROMPT = `Return ONLY valid JSON for the given content. No markdown, no code fences, no explanation.

{"title":"clean title ≤80 chars","synopsis":"3-5 sentences: what it is, themes, why notable","keywords":["4-6 proper nouns — related titles, creators, key figures a curious reader would explore"],"genre":"single lowercase genre","mood":["1-3 from: chill|energetic|melancholic|uplifting|intense|introspective|fun|dark|romantic|inspiring"],"sourceType":"youtube|spotify|tiktok|instagram|x|article|podcast|film|book|concert|generic","aiTags":["3-5 tags"]}`

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
