import { NextRequest, NextResponse } from 'next/server'
import { eq, desc, and, like, or } from 'drizzle-orm'
import { db } from '@/lib/db'
import { items } from '@/lib/db/schema'
import { CreateItemSchema } from '@/lib/utils/types'
import type { SQL } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const conditions: SQL[] = []

    const status      = searchParams.get('status')
    const type        = searchParams.get('type')
    const mood        = searchParams.get('mood')
    const genre       = searchParams.get('genre')
    const recommender = searchParams.get('recommender')
    const q           = searchParams.get('q')

    if (status)      conditions.push(eq(items.status, status))
    if (type)        conditions.push(eq(items.sourceType, type))
    if (genre)       conditions.push(eq(items.genre, genre))
    if (recommender) conditions.push(eq(items.recommender, recommender))
    if (mood)        conditions.push(like(items.mood, `%${mood}%`))
    if (q)           conditions.push(or(like(items.title, `%${q}%`), like(items.synopsis, `%${q}%`), like(items.author, `%${q}%`))!)

    const rows = await db.select().from(items)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(items.createdAt))

    return NextResponse.json({ items: rows })
  } catch (err) {
    console.error('[items/GET]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const body   = await req.json()
  const result = CreateItemSchema.safeParse(body)
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 })

  try {
    if (result.data.url) {
      const [existing] = await db.select().from(items).where(eq(items.url, result.data.url)).limit(1)
      if (existing) return NextResponse.json({ item: existing })
    }

    const [item] = await db.insert(items).values({
      ...result.data,
      url:      result.data.url      ?? null,
      enriched: false,
      status:   result.data.status   ?? 'pending',
    }).returning()

    return NextResponse.json({ item })
  } catch (err) {
    console.error('[items/POST]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
