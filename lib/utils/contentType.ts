import type { SourceType } from './types'

// ── Medium detector — maps URL to source_type (how content is delivered) ─────

export function detectContentType(url: string): SourceType {
  const u = url.toLowerCase()

  // Online video
  if (u.includes('youtube.com') || u.includes('youtu.be') ||
      u.includes('tiktok.com')  || u.includes('instagram.com') ||
      u.includes('vimeo.com')   || u.includes('twitch.tv') ||
      u.includes('kick.com')    || u.includes('dailymotion.com') ||
      u.includes('crunchyroll.com') || u.includes('funimation.com') ||
      u.includes('hidive.com')  || u.includes('rumble.com'))
    return 'video'

  // Cinema / streaming VOD (film or series — LLM resolves which)
  if (u.includes('netflix.com') || u.includes('hulu.com') ||
      u.includes('disneyplus.com') || u.includes('disney.com/watch') ||
      u.includes('primevideo.com') || u.includes('max.com') ||
      u.includes('hbomax.com')   || u.includes('tv.apple.com') ||
      u.includes('peacocktv.com') || u.includes('paramountplus.com') ||
      u.includes('mubi.com')     || u.includes('criterion.com') ||
      u.includes('letterboxd.com') || u.includes('imdb.com'))
    return 'film'

  // Podcasts
  if (u.includes('anchor.fm')        || u.includes('podcasts.apple.com') ||
      u.includes('pocketcasts.com')   || u.includes('overcast.fm') ||
      u.includes('spotify.com/episode') || u.includes('buzzsprout.com') ||
      u.includes('podbean.com')        || u.includes('castro.fm'))
    return 'podcast'

  // Music
  if (u.includes('spotify.com')   || u.includes('soundcloud.com') ||
      u.includes('bandcamp.com')   || u.includes('tidal.com') ||
      u.includes('music.apple.com') || u.includes('itunes.apple.com') ||
      u.includes('music.amazon.com') || u.includes('deezer.com') ||
      u.includes('last.fm')        || u.includes('genius.com'))
    return 'music'

  // Books / reading
  if (u.includes('goodreads.com')  || u.includes('audible.com') ||
      u.includes('books.google.com') || u.includes('openlibrary.org') ||
      u.includes('libbyapp.com')   || u.includes('overdrive.com') ||
      u.includes('scribd.com')     || u.includes('storygraph.com') ||
      u.includes('kobo.com')       || u.includes('mangadex.org') ||
      u.includes('webtoons.com')   || u.includes('webtoon.com') ||
      u.includes('comixology.com') || u.includes('viz.com') ||
      u.includes('mangaplus.shueisha.co.jp'))
    return 'book'

  // Interactive / games
  if (u.includes('store.steampowered.com') || u.includes('epicgames.com') ||
      u.includes('gog.com')   || u.includes('itch.io') ||
      u.includes('store.playstation.com') || u.includes('xbox.com') ||
      u.includes('nintendo.com'))
    return 'interactive'

  // Courses / education
  if (u.includes('udemy.com')       || u.includes('coursera.org') ||
      u.includes('edx.org')         || u.includes('pluralsight.com') ||
      u.includes('skillshare.com')  || u.includes('linkedin.com/learning') ||
      u.includes('khanacademy.org') || u.includes('frontendmasters.com') ||
      u.includes('egghead.io')      || u.includes('scrimba.com') ||
      u.includes('codecademy.com')  || u.includes('freecodecamp.org') ||
      u.includes('theodinproject.com'))
    return 'course'

  // Live events
  if (u.includes('ticketmaster.com') || u.includes('eventbrite.com') ||
      u.includes('songkick.com')     || u.includes('bandsintown.com') ||
      u.includes('seatgeek.com'))
    return 'event'

  return 'generic'
}

// ── Platform detector — maps URL to origin platform name (free text) ─────────

export function detectPlatform(url: string): string | null {
  if (!url) return null
  const u = url.toLowerCase()

  // Video
  if (u.includes('youtube.com') || u.includes('youtu.be'))     return 'YouTube'
  if (u.includes('vimeo.com'))                                  return 'Vimeo'
  if (u.includes('dailymotion.com'))                            return 'Dailymotion'
  if (u.includes('twitch.tv'))                                  return 'Twitch'
  if (u.includes('kick.com'))                                   return 'Kick'
  if (u.includes('tiktok.com'))                                 return 'TikTok'
  if (u.includes('instagram.com'))                              return 'Instagram'
  if (u.includes('rumble.com'))                                 return 'Rumble'
  if (u.includes('facebook.com/watch') || u.includes('fb.watch')) return 'Facebook'

  // Streaming VOD
  if (u.includes('netflix.com'))                                return 'Netflix'
  if (u.includes('hulu.com'))                                   return 'Hulu'
  if (u.includes('disneyplus.com') || u.includes('disney.com/watch')) return 'Disney+'
  if (u.includes('primevideo.com') || (u.includes('amazon.com') && u.includes('video'))) return 'Amazon Prime Video'
  if (u.includes('max.com') || u.includes('hbomax.com'))        return 'Max'
  if (u.includes('tv.apple.com') || u.includes('apple.com/apple-tv-plus')) return 'Apple TV+'
  if (u.includes('peacocktv.com'))                              return 'Peacock'
  if (u.includes('paramountplus.com'))                          return 'Paramount+'
  if (u.includes('showtime.com'))                               return 'Showtime'
  if (u.includes('starz.com'))                                  return 'Starz'
  if (u.includes('mubi.com'))                                   return 'MUBI'
  if (u.includes('criterion.com'))                              return 'Criterion Channel'

  // Anime
  if (u.includes('crunchyroll.com'))                            return 'Crunchyroll'
  if (u.includes('funimation.com'))                             return 'Funimation'
  if (u.includes('hidive.com'))                                 return 'HIDIVE'
  if (u.includes('anilist.co'))                                 return 'AniList'
  if (u.includes('myanimelist.net'))                            return 'MyAnimeList'

  // Music
  if (u.includes('spotify.com/episode'))                        return 'Spotify Podcasts'
  if (u.includes('open.spotify.com') || u.includes('spotify.com')) return 'Spotify'
  if (u.includes('music.apple.com') || u.includes('itunes.apple.com')) return 'Apple Music'
  if (u.includes('soundcloud.com'))                             return 'SoundCloud'
  if (u.includes('bandcamp.com'))                               return 'Bandcamp'
  if (u.includes('tidal.com'))                                  return 'Tidal'
  if (u.includes('music.amazon.com'))                           return 'Amazon Music'
  if (u.includes('deezer.com'))                                 return 'Deezer'
  if (u.includes('last.fm'))                                    return 'Last.fm'
  if (u.includes('genius.com'))                                 return 'Genius'

  // Podcasts
  if (u.includes('podcasts.apple.com'))                         return 'Apple Podcasts'
  if (u.includes('pocketcasts.com'))                            return 'Pocket Casts'
  if (u.includes('overcast.fm'))                                return 'Overcast'
  if (u.includes('anchor.fm') || u.includes('podcasters.spotify.com')) return 'Anchor'
  if (u.includes('buzzsprout.com'))                             return 'Buzzsprout'
  if (u.includes('podbean.com'))                                return 'Podbean'
  if (u.includes('castro.fm'))                                  return 'Castro'

  // Books
  if (u.includes('goodreads.com'))                              return 'Goodreads'
  if (u.includes('audible.com'))                                return 'Audible'
  if (u.includes('amazon.com') && (u.includes('/dp/') || u.includes('kindle'))) return 'Amazon Kindle'
  if (u.includes('books.google.com'))                           return 'Google Books'
  if (u.includes('openlibrary.org'))                            return 'Open Library'
  if (u.includes('libbyapp.com') || u.includes('overdrive.com')) return 'Libby'
  if (u.includes('scribd.com'))                                 return 'Scribd'
  if (u.includes('storygraph.com'))                             return 'StoryGraph'
  if (u.includes('kobo.com'))                                   return 'Kobo'

  // Manga / Comics
  if (u.includes('mangadex.org'))                               return 'MangaDex'
  if (u.includes('webtoons.com') || u.includes('webtoon.com')) return 'Webtoon'
  if (u.includes('comixology.com'))                             return 'ComiXology'
  if (u.includes('viz.com'))                                    return 'VIZ Media'
  if (u.includes('mangaplus.shueisha.co.jp'))                   return 'MANGA Plus'

  // Games
  if (u.includes('store.steampowered.com'))                     return 'Steam'
  if (u.includes('epicgames.com'))                              return 'Epic Games'
  if (u.includes('gog.com'))                                    return 'GOG'
  if (u.includes('itch.io'))                                    return 'itch.io'
  if (u.includes('store.playstation.com'))                      return 'PlayStation Store'
  if (u.includes('xbox.com'))                                   return 'Xbox'
  if (u.includes('nintendo.com'))                               return 'Nintendo'

  // Courses
  if (u.includes('udemy.com'))                                  return 'Udemy'
  if (u.includes('coursera.org'))                               return 'Coursera'
  if (u.includes('edx.org'))                                    return 'edX'
  if (u.includes('pluralsight.com'))                            return 'Pluralsight'
  if (u.includes('skillshare.com'))                             return 'Skillshare'
  if (u.includes('linkedin.com/learning'))                      return 'LinkedIn Learning'
  if (u.includes('khanacademy.org'))                            return 'Khan Academy'
  if (u.includes('frontendmasters.com'))                        return 'Frontend Masters'
  if (u.includes('egghead.io'))                                 return 'Egghead'
  if (u.includes('scrimba.com'))                                return 'Scrimba'
  if (u.includes('codecademy.com'))                             return 'Codecademy'
  if (u.includes('freecodecamp.org'))                           return 'freeCodeCamp'
  if (u.includes('theodinproject.com'))                         return 'The Odin Project'

  // Tech / Dev articles
  if (u.includes('medium.com'))                                 return 'Medium'
  if (u.includes('substack.com'))                               return 'Substack'
  if (u.includes('dev.to'))                                     return 'Dev.to'
  if (u.includes('hashnode.com') || u.includes('hashnode.dev')) return 'Hashnode'
  if (u.includes('github.com'))                                 return 'GitHub'
  if (u.includes('stackoverflow.com'))                          return 'Stack Overflow'
  if (u.includes('news.ycombinator.com'))                       return 'Hacker News'

  // Film tracking
  if (u.includes('letterboxd.com'))                             return 'Letterboxd'
  if (u.includes('imdb.com'))                                   return 'IMDb'
  if (u.includes('rottentomatoes.com'))                         return 'Rotten Tomatoes'

  // Social
  if (u.includes('reddit.com'))                                 return 'Reddit'
  if (u.includes('twitter.com') || u.includes('x.com'))         return 'X (Twitter)'
  if (u.includes('wikipedia.org'))                              return 'Wikipedia'

  // Events
  if (u.includes('ticketmaster.com'))                           return 'Ticketmaster'
  if (u.includes('eventbrite.com'))                             return 'Eventbrite'
  if (u.includes('songkick.com'))                               return 'Songkick'
  if (u.includes('bandsintown.com'))                            return 'Bandsintown'

  return null
}

// ── Content format detector — obvious cases from URL alone ────────────────────
// LLM fills in the rest during enrichment.

export function detectContentFormat(url: string): string | null {
  if (!url) return null
  const u = url.toLowerCase()

  if (u.includes('crunchyroll.com') || u.includes('funimation.com') ||
      u.includes('hidive.com')      || u.includes('myanimelist.net') ||
      u.includes('anilist.co'))                                      return 'anime'

  if (u.includes('mangadex.org')    || u.includes('mangaplus.shueisha.co.jp')) return 'manga'
  if (u.includes('webtoons.com')    || u.includes('webtoon.com'))   return 'manhwa'
  if (u.includes('comixology.com')  || u.includes('viz.com'))       return 'comics'
  if (u.includes('letterboxd.com'))                                  return 'series' // LLM will correct film vs series
  if (u.includes('store.steampowered.com') || u.includes('epicgames.com') ||
      u.includes('gog.com')         || u.includes('itch.io'))        return 'gaming'
  if (u.includes('github.com')      || u.includes('dev.to') ||
      u.includes('stackoverflow.com') || u.includes('frontendmasters.com') ||
      u.includes('egghead.io')      || u.includes('scrimba.com') ||
      u.includes('freecodecamp.org') || u.includes('theodinproject.com')) return 'programming'

  return null
}
