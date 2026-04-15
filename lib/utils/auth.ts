import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

/**
 * Use in server components and page-level RSCs.
 * Redirects to /login if no session — never returns null.
 */
export async function requireAuth(): Promise<User> {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return user
}

/**
 * Use when auth is optional (public pages that behave differently for logged-in users).
 * Returns null if no session.
 */
export async function getOptionalUser(): Promise<User | null> {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user ?? null
}
