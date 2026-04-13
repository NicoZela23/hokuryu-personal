import OpenAI from 'openai'
import type { LLMProvider, EnrichInput, EnrichOutput } from '../interface'
import { SYSTEM_PROMPT, buildUserMessage } from '../interface'

export class OllamaProvider implements LLMProvider {
  name = 'ollama'

  isAvailable(): boolean {
    return true
  }

  async enrich(input: EnrichInput): Promise<EnrichOutput> {
    const host  = process.env.OLLAMA_HOST  ?? 'http://localhost:11434'
    const model = process.env.OLLAMA_MODEL ?? 'llama3.2'

    const client = new OpenAI({ apiKey: 'ollama', baseURL: `${host}/v1` })

    const response = await client.chat.completions.create({
      model,
      max_tokens: 700,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: buildUserMessage(input) },
      ],
    })

    const text  = response.choices[0]?.message?.content ?? ''
    const clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    return JSON.parse(clean) as EnrichOutput
  }
}
