import OpenAI from 'openai'
import type { LLMProvider, EnrichInput, EnrichOutput } from '../interface'
import { SYSTEM_PROMPT, buildUserMessage } from '../interface'

export class OpenRouterProvider implements LLMProvider {
  name = 'artyom'

  isAvailable(): boolean {
    return !!process.env.OPENROUTER_API_KEY
  }

  async enrich(input: EnrichInput): Promise<EnrichOutput> {
    const client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Digi Hokuryu',
      },
    })

    // Default: Perplexity sonar — has live web search built in
    const model = process.env.OPENROUTER_MODEL ?? 'perplexity/sonar-pro'

    const response = await client.chat.completions.create({
      model,
      max_tokens: 700,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: buildUserMessage(input) },
      ],
    })

    const text = response.choices[0]?.message?.content ?? ''

    // 1. Strip markdown code fences
    let clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

    // 2. If model added prose before/after the JSON object, extract just the object
    if (!clean.startsWith('{')) {
      const match = clean.match(/\{[\s\S]*\}/)
      if (!match) throw new Error(`model returned non-JSON: ${clean.slice(0, 120)}`)
      clean = match[0]
    }

    return JSON.parse(clean) as EnrichOutput
  }
}
