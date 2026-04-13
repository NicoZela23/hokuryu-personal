import type { SourceType } from './types'

export function detectContentType(url: string): SourceType {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('tiktok.com')) return 'tiktok'
  if (url.includes('instagram.com')) return 'instagram'
  if (url.includes('twitter.com') || url.includes('x.com')) return 'x'
  if (
    url.includes('anchor.fm') ||
    url.includes('podcasts.apple.com') ||
    url.includes('open.spotify.com/episode') ||
    url.includes('pocketcasts.com')
  ) return 'podcast'
  if (url.includes('spotify.com')) return 'spotify'
  return 'generic'
}
