import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tags } from '@/lib/db/schema'

export async function GET() {
  try {
    const rows = await db.select().from(tags).orderBy(tags.label)
    return NextResponse.json({ tags: rows })
  } catch (err) {
    console.error('[tags/GET]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
