import { NextRequest, NextResponse } from 'next/server'
import type { SearchResult } from '@/lib/utils/types'

interface DDGResponse {
  Heading:        string
  AbstractText:   string
  AbstractURL:    string
  AbstractSource: string
  Image:          string
  RelatedTopics:  Array<{
    Text?:     string
    FirstURL?: string
    Topics?:   Array<{ Text: string; FirstURL: string }>
  }>
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q) return NextResponse.json({ error: 'Missing query' }, { status: 400 })

  try {
    const got = (await import('got')).default
    const url  = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`
    const ddg  = await got(url, { timeout: { request: 6000 } }).json<DDGResponse>()

    // DDG image paths are relative — prepend host
    const image = ddg.Image
      ? ddg.Image.startsWith('http') ? ddg.Image : `https://duckduckgo.com${ddg.Image}`
      : ''

    const related = (ddg.RelatedTopics ?? [])
      .filter((t) => t.Text && t.FirstURL && !t.Topics)  // skip section headers
      .slice(0, 6)
      .map((t) => ({ text: t.Text!, url: t.FirstURL! }))

    const result: SearchResult = {
      heading:    ddg.Heading    || q,
      abstract:   ddg.AbstractText   || '',
      source:     ddg.AbstractURL    || '',
      sourceName: ddg.AbstractSource || '',
      image,
      related,
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('[search]', err)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
