import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { items } from '@/lib/db/schema'
import { IngestConfirmSchema } from '@/lib/utils/types'

export async function POST(req: NextRequest) {
  const body   = await req.json()
  const result = IngestConfirmSchema.safeParse(body)
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 })

  const { metadata } = result.data

  try {
    if (metadata.url) {
      const [existing] = await db.select().from(items).where(eq(items.url, metadata.url)).limit(1)
      if (existing) return NextResponse.json({ item: existing })
    }

    const [item] = await db.insert(items).values({
      url:         metadata.url         ?? null,
      title:       metadata.title,
      author:      metadata.author      ?? null,
      sourceType:  metadata.sourceType,
      genre:       metadata.genre       ?? null,
      mood:        metadata.mood        ?? null,
      synopsis:    metadata.synopsis    ?? null,
      keywords:    metadata.keywords    ?? null,
      thumbnail:   metadata.thumbnail   ?? null,
      duration:    null,
      recommender: metadata.recommender ?? null,
      status:      'pending',
      notes:       metadata.notes       ?? null,
      rating:      metadata.rating      ?? null,
      aiTags:      metadata.aiTags      ?? null,
      enriched:    metadata.enriched    ?? false,
      llmProvider: metadata.llmProvider ?? null,
    }).returning()

    return NextResponse.json({ item })
  } catch (err) {
    console.error('[ingest/confirm]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
