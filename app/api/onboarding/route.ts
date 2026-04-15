import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles, onboardingPreferences } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { CONTENT_FORMATS } from '@/lib/utils/types'

const OnboardingSchema = z.object({
  contentFormats: z.array(z.enum(CONTENT_FORMATS)).min(1),
  genres:         z.array(z.string()).max(5).default([]),
})

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const result = OnboardingSchema.safeParse(body)
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 })

  const { contentFormats, genres } = result.data

  try {
    // Ensure profile row exists — guards against tables being reset while auth session survives
    const [existingProfile] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1)

    if (!existingProfile) {
      const emailPrefix = user.email?.split('@')[0] ?? 'operative'
      const sanitized   = emailPrefix.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20)
      const username    = `${sanitized}_${user.id.slice(0, 6)}`
      await db.insert(profiles).values({ id: user.id, username })
    }

    // Upsert onboarding_preferences
    await db
      .insert(onboardingPreferences)
      .values({ userId: user.id, contentFormats, genres, completed: true })
      .onConflictDoUpdate({
        target: onboardingPreferences.userId,
        set:    { contentFormats, genres, completed: true },
      })

    // Mirror content formats into profiles.content_prefs + mark onboarding done
    await db
      .update(profiles)
      .set({ contentPrefs: contentFormats, onboardingCompleted: true })
      .where(eq(profiles.id, user.id))

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[onboarding] failed:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
