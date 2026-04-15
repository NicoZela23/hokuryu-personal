import { NextRequest, NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/lib/db'
import { items } from '@/lib/db/schema'
import { createServerClient } from '@/lib/supabase/server'
import { scrapeUrl } from '@/lib/services/scraper'

const BodySchema = z.object({ url: z.string().url() })

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const result = BodySchema.safeParse(body)
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 })

  const { url } = result.data

  try {
    // Per-user duplicate check
    const [existing] = await db
      .select()
      .from(items)
      .where(and(eq(items.url, url), eq(items.userId, user.id)))
      .limit(1)

    if (existing) return NextResponse.json({ duplicate: true, item: existing })

    const metadata = await scrapeUrl(url)
    return NextResponse.json({ metadata })
  } catch (err) {
    console.error('[ingest/url]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
