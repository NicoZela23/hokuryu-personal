import { NextRequest, NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import { items } from '@/lib/db/schema'
import { createServerClient } from '@/lib/supabase/server'
import { IngestConfirmSchema } from '@/lib/utils/types'

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const result = IngestConfirmSchema.safeParse(body)
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 })

  const { metadata } = result.data

  try {
    // Per-user duplicate URL check
    if (metadata.url) {
      const [existing] = await db
        .select()
        .from(items)
        .where(and(eq(items.url, metadata.url), eq(items.userId, user.id)))
        .limit(1)
      if (existing) return NextResponse.json({ item: existing })
    }

    const [item] = await db.insert(items).values({
      userId:        user.id,
      url:           metadata.url           ?? null,
      title:         metadata.title,
      author:        metadata.author        ?? null,
      sourceType:    metadata.sourceType,
      contentFormat: metadata.contentFormat ?? null,
      platform:      metadata.platform      ?? null,
      genre:         metadata.genre         ?? null,
      mood:          metadata.mood          ?? null,
      synopsis:      metadata.synopsis      ?? null,
      keywords:      metadata.keywords      ?? null,
      thumbnail:     metadata.thumbnail     ?? null,
      duration:      null,
      recommender:   metadata.recommender   ?? null,
      status:        'pending',
      notes:         metadata.notes         ?? null,
      rating:        metadata.rating        ?? null,
      aiTags:        metadata.aiTags        ?? null,
      enriched:      metadata.enriched      ?? false,
      llmProvider:   metadata.llmProvider   ?? null,
    }).returning()

    return NextResponse.json({ item })
  } catch (err) {
    console.error('[ingest/confirm]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
