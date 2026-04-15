import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const PatchProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional().nullable(),
  bio:         z.string().max(2000).optional().nullable(),
  username:    z.string().min(3).max(20).regex(/^[a-z0-9_]+$/, 'Lowercase letters, numbers, underscores only').optional(),
  avatarUrl:   z.string().url().optional().nullable(),
})

export async function PATCH(req: NextRequest) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const result = PatchProfileSchema.safeParse(body)
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 })

  const { displayName, bio, username, avatarUrl } = result.data

  try {
    // Fetch current profile to get old username for cache invalidation
    const [current] = await db
      .select({ username: profiles.username })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1)

    // Username uniqueness check (if changing)
    if (username) {
      const [existing] = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(eq(profiles.username, username))
        .limit(1)
      if (existing && existing.id !== user.id) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
      }
    }

    const updated = await db
      .update(profiles)
      .set({
        ...(displayName !== undefined && { displayName }),
        ...(bio         !== undefined && { bio }),
        ...(username    !== undefined && { username }),
        ...(avatarUrl   !== undefined && { avatarUrl }),
      })
      .where(eq(profiles.id, user.id))
      .returning({
        id:          profiles.id,
        username:    profiles.username,
        displayName: profiles.displayName,
        bio:         profiles.bio,
        avatarUrl:   profiles.avatarUrl,
      })

    // Invalidate ISR cache for public profile pages
    if (current?.username) revalidatePath(`/u/${current.username}`)
    if (updated[0]?.username && updated[0].username !== current?.username) {
      revalidatePath(`/u/${updated[0].username}`)
    }

    return NextResponse.json({ data: updated[0] })
  } catch (err) {
    console.error('[profile] PATCH failed:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [profile] = await db
    .select({
      id:          profiles.id,
      username:    profiles.username,
      displayName: profiles.displayName,
      bio:         profiles.bio,
      avatarUrl:   profiles.avatarUrl,
      karma:       profiles.karma,
      streakCount: profiles.streakCount,
      contentPrefs: profiles.contentPrefs,
    })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1)

  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ data: profile })
}
