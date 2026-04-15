import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const username = req.nextUrl.searchParams.get('username')?.toLowerCase().trim()
  if (!username || username.length < 3 || !/^[a-z0-9_]+$/.test(username)) {
    return NextResponse.json({ available: false, reason: 'INVALID FORMAT' })
  }

  const [existing] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.username, username))
    .limit(1)

  const takenBySelf = existing?.id === user.id
  const available   = !existing || takenBySelf

  return NextResponse.json(
    { available },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
