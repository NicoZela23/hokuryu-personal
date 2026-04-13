import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { items, itemTags, tags } from '@/lib/db/schema'
import { PatchItemSchema } from '@/lib/utils/types'

type Ctx = { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const id = parseInt(params.id, 10)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  try {
    const [item] = await db.select().from(items).where(eq(items.id, id)).limit(1)
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const tagRows = await db
      .select({ id: tags.id, label: tags.label })
      .from(itemTags)
      .innerJoin(tags, eq(itemTags.tagId, tags.id))
      .where(eq(itemTags.itemId, id))

    return NextResponse.json({ item: { ...item, tags: tagRows } })
  } catch (err) {
    console.error('[items/[id]/GET]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const id = parseInt(params.id, 10)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const body   = await req.json()
  const result = PatchItemSchema.safeParse(body)
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 })

  try {
    const patch: Record<string, unknown> = { ...result.data }
    if (result.data.status === 'consumed') patch.consumedAt = new Date().toISOString()
    if (result.data.status === 'pending')  patch.consumedAt = null

    const [item] = await db.update(items).set(patch).where(eq(items.id, id)).returning()
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ item })
  } catch (err) {
    console.error('[items/[id]/PATCH]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const id = parseInt(params.id, 10)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  try {
    await db.delete(items).where(eq(items.id, id))
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[items/[id]/DELETE]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
