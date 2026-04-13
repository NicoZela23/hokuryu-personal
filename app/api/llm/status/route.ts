import { NextResponse } from 'next/server'
import { getProvider, getAvailableProviders } from '@/lib/llm/registry'

export async function GET() {
  const available = getAvailableProviders()
  const active    = getProvider()
  return NextResponse.json({
    available: available.length > 0,
    providers: available.map((p) => p.name),
    active:    active?.name ?? null,
  })
}
