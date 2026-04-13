import OpenAI from 'openai'
import type { LLMProvider, EnrichInput, EnrichOutput } from '../interface'
import { SYSTEM_PROMPT, buildUserMessage } from '../interface'

export class OpenRouterProvider implements LLMProvider {
  name = 'openrouter'

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

    // Strip markdown code fences if model wraps response
    const clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    return JSON.parse(clean) as EnrichOutput
  }
}
