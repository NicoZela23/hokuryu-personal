import type { LLMProvider } from './interface'
import { AnthropicProvider } from './providers/anthropic'
import { OpenRouterProvider } from './providers/openrouter'
import { OllamaProvider } from './providers/ollama'

const providers: LLMProvider[] = [
  new AnthropicProvider(),
  new OpenRouterProvider(),
  new OllamaProvider(),
]

// Returns first available provider — detection order: Anthropic → OpenRouter → Ollama
export function getProvider(): LLMProvider | null {
  return providers.find((p) => p.isAvailable()) ?? null
}

// Returns all configured providers (for status UI)
export function getAvailableProviders(): LLMProvider[] {
  return providers.filter((p) => p.isAvailable())
}
