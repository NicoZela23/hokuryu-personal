import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getProvider, getAvailableProviders } from '@/lib/llm/registry'

export async function GET() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const available = getAvailableProviders()
  const active    = getProvider()

  return NextResponse.json({
    available: available.length > 0,
    providers: available.map((p) => p.name),
    active:    active?.name ?? null,
  })
}
