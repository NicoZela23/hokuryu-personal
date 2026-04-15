import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Called after signup to ensure the profile row exists.
// Safe to call multiple times — idempotent upsert.
export async function POST() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const [existing] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1)

    if (!existing) {
      const emailPrefix = user.email?.split('@')[0] ?? 'operative'
      const sanitized  = emailPrefix.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20)
      const username   = `${sanitized}_${user.id.slice(0, 6)}`

      await db.insert(profiles).values({ id: user.id, username })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[auth/profile] failed:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
