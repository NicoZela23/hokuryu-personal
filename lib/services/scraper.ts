import * as cheerio from 'cheerio'
import { detectContentType, detectPlatform, detectContentFormat } from '@/lib/utils/contentType'
import type { ScrapedMetadata } from '@/lib/utils/types'

export async function scrapeUrl(url: string): Promise<ScrapedMetadata> {
  const sourceType    = detectContentType(url)
  const platform      = detectPlatform(url)
  const contentFormat = detectContentFormat(url)

  try {
    const got = (await import('got')).default
    const response = await got(url, {
      timeout: { request: 8000 },
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DigiHokuryu/1.0)' },
    })

    const $ = cheerio.load(response.body)

    const title =
      $('meta[property="og:title"]').attr('content') ??
      $('meta[name="twitter:title"]').attr('content') ??
      $('title').text() ??
      ''

    const rawDescription =
      $('meta[property="og:description"]').attr('content') ??
      $('meta[name="description"]').attr('content') ??
      $('meta[name="twitter:description"]').attr('content') ??
      ''

    const thumbnail =
      $('meta[property="og:image"]').attr('content') ??
      $('meta[name="twitter:image"]').attr('content') ??
      ''

    const author =
      $('meta[property="article:author"]').attr('content') ??
      $('meta[name="author"]').attr('content') ??
      ''

    return { url, sourceType, platform, contentFormat, title: title.trim(), author: author.trim(), thumbnail, rawDescription }
  } catch {
    return { url, sourceType, platform, contentFormat, title: '', author: '', thumbnail: '', rawDescription: '' }
  }
}
