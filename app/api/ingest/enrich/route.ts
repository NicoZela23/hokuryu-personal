import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { enrichMetadata } from '@/lib/llm/enricher'
import { getProvider } from '@/lib/llm/registry'

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
  const body   = await req.json()
  const result = BodySchema.safeParse(body)
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 })

  if (!getProvider()) return NextResponse.json({ unavailable: true })

  try {
    const { metadata } = result.data
    const enriched = await enrichMetadata({
      url:            metadata.url ?? '',
      title:          metadata.title,
      author:         metadata.author,
      sourceType:     metadata.sourceType,
      rawDescription: metadata.rawDescription,
    })

    if (!enriched) return NextResponse.json({ error: true, metadata })

    return NextResponse.json({ enriched, provider: getProvider()?.name ?? null })
  } catch (err) {
    console.error('[ingest/enrich]', err)
    return NextResponse.json({ error: true, metadata: result.data.metadata })
  }
}
