import { db } from '@/lib/db'
import { enrichmentCache } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import type { EnrichedMetadata } from '@/lib/utils/types'

export async function getCachedEnrichment(
  url: string
): Promise<{ data: EnrichedMetadata; provider: string | null } | null> {
  if (!url) return null
  try {
    const [row] = await db
      .select({ data: enrichmentCache.data, provider: enrichmentCache.provider })
      .from(enrichmentCache)
      .where(eq(enrichmentCache.url, url))
      .limit(1)

    if (!row) return null

    // Increment hit counter — fire and forget, non-fatal
    db.update(enrichmentCache)
      .set({ hitCount: sql`${enrichmentCache.hitCount} + 1` })
      .where(eq(enrichmentCache.url, url))
      .catch(() => {})

    return { data: JSON.parse(row.data) as EnrichedMetadata, provider: row.provider }
  } catch {
    return null
  }
}

export async function setCachedEnrichment(
  url: string,
  data: EnrichedMetadata,
  provider: string | null
): Promise<void> {
  if (!url) return
  try {
    await db
      .insert(enrichmentCache)
      .values({ url, data: JSON.stringify(data), provider })
      .onConflictDoUpdate({
        target: enrichmentCache.url,
        set:    { data: JSON.stringify(data), provider },
      })
  } catch {
    // Cache write failures are non-fatal — LLM result was already returned
  }
}
