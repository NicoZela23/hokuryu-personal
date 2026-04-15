import { createClient } from '@supabase/supabase-js'

// Service role client — server-only. Never import this in client components.
// Used for system writes (badge awards, karma, notifications) that bypass RLS.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
