import Anthropic from '@anthropic-ai/sdk'
import type { LLMProvider, EnrichInput, EnrichOutput } from '../interface'
import { SYSTEM_PROMPT, buildUserMessage } from '../interface'

export class AnthropicProvider implements LLMProvider {
  name = 'anthropic'

  isAvailable(): boolean {
    return !!process.env.ANTHROPIC_API_KEY
  }

  async enrich(input: EnrichInput): Promise<EnrichOutput> {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const model  = process.env.ANTHROPIC_MODEL ?? 'claude-haiku-4-5-20251001'

    const message = await client.messages.create({
      model,
      // JSON output is ~250-400 tokens. 700 is a safe ceiling that avoids runaway
      // generation while leaving headroom for longer synopses.
      max_tokens: 700,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          // Prompt caching: Anthropic charges ~10% on cache hits (5-min TTL).
          // The system prompt is static, so every subsequent call within the window
          // pays ~10% of its token cost instead of 100%.
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: buildUserMessage(input) }],
    })

    const text  = message.content[0].type === 'text' ? message.content[0].text : ''
    const clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    return JSON.parse(clean) as EnrichOutput
  }
}
