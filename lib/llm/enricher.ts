import type { EnrichInput, EnrichOutput } from './interface'
import { getProvider } from './registry'

export async function enrichMetadata(input: EnrichInput): Promise<EnrichOutput | null> {
  const provider = getProvider()
  if (!provider) return null
  try {
    const result = await provider.enrich(input)
    return result
  } catch (err) {
    console.error(`[enricher] ${provider.name} failed:`, err)
    return null
  }
}
