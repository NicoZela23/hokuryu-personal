import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { tags } from '@/lib/db/schema'

export async function GET() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const rows = await db.select().from(tags).orderBy(tags.label)
    return NextResponse.json({ tags: rows })
  } catch (err) {
    console.error('[tags/GET]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
