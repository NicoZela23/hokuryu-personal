import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/garden'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = createServerClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    console.error('[auth/callback] OAuth exchange failed:', error)
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
  }

  // Ensure profile row exists — OAuth users skip the signup form
  const [existing] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.id, data.user.id))
    .limit(1)

  if (!existing) {
    const email       = data.user.email ?? ''
    const emailPrefix = email.split('@')[0]
    const sanitized   = emailPrefix.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20)
    const username    = `${sanitized}_${data.user.id.slice(0, 6)}`
    const avatarUrl   = data.user.user_metadata?.avatar_url ?? null
    const displayName = data.user.user_metadata?.full_name ?? null

    await db.insert(profiles).values({
      id: data.user.id,
      username,
      displayName,
      avatarUrl,
    })

    // New OAuth user → onboarding
    return NextResponse.redirect(`${origin}/onboarding`)
  }

  // Existing user → check onboarding status
  const [profile] = await db
    .select({ onboardingCompleted: profiles.onboardingCompleted })
    .from(profiles)
    .where(eq(profiles.id, data.user.id))
    .limit(1)

  const destination = profile?.onboardingCompleted ? next : '/onboarding'
  return NextResponse.redirect(`${origin}${destination}`)
}
