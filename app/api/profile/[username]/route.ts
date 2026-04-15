import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { profiles, items } from '@/lib/db/schema'
import { eq, count, and } from 'drizzle-orm'

export async function GET(
  _req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const [profile] = await db
      .select({
        id:                  profiles.id,
        username:            profiles.username,
        displayName:         profiles.displayName,
        bio:                 profiles.bio,
        avatarUrl:           profiles.avatarUrl,
        karma:               profiles.karma,
        streakCount:         profiles.streakCount,
        contentPrefs:        profiles.contentPrefs,
        onboardingCompleted: profiles.onboardingCompleted,
        createdAt:           profiles.createdAt,
      })
      .from(profiles)
      .where(eq(profiles.username, params.username))
      .limit(1)

    if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const [{ seedCount }] = await db
      .select({ seedCount: count() })
      .from(items)
      .where(eq(items.userId, profile.id))

    const [{ harvestCount }] = await db
      .select({ harvestCount: count() })
      .from(items)
      .where(and(eq(items.userId, profile.id), eq(items.status, 'consumed')))

    return NextResponse.json(
      { data: { ...profile, seedCount, harvestCount } },
      { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=120' } }
    )
  } catch (err) {
    console.error('[profile/username] failed:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
