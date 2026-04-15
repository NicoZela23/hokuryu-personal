import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { enrichMetadata } from '@/lib/llm/enricher'
import { getProvider } from '@/lib/llm/registry'
import { getCachedEnrichment, setCachedEnrichment } from '@/lib/llm/cache'

const BodySchema = z.object({
  metadata: z.object({
    url:            z.string().optional(),
    title:          z.string(),
    author:         z.string().optional(),
    sourceType:     z.string(),
    rawDescription: z.string().optional(),
  }),
})

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const result = BodySchema.safeParse(body)
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 })

  if (!getProvider()) return NextResponse.json({ unavailable: true })

  const { metadata } = result.data
  const url = metadata.url ?? ''

  // ── Cache check ────────────────────────────────────────────────────────────
  if (url) {
    const cached = await getCachedEnrichment(url)
    if (cached) {
      return NextResponse.json({
        enriched: cached.data,
        provider: cached.provider,
        cached:   true,
      })
    }
  }

  // ── LLM call ───────────────────────────────────────────────────────────────
  try {
    const enriched = await enrichMetadata({
      url,
      title:          metadata.title,
      author:         metadata.author,
      sourceType:     metadata.sourceType,
      rawDescription: metadata.rawDescription,
    })

    if (!enriched) return NextResponse.json({ error: true, metadata })

    const provider = getProvider()?.name ?? null

    // Store in cache for future requests — non-blocking
    if (url) setCachedEnrichment(url, enriched, provider)

    return NextResponse.json({ enriched, provider, cached: false })
  } catch (err) {
    console.error('[ingest/enrich]', err)
    return NextResponse.json({ error: true, metadata: result.data.metadata })
  }
}
