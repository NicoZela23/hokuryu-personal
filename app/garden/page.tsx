import { redirect } from 'next/navigation'
import { desc, eq, and, like, or } from 'drizzle-orm'
import { db } from '@/lib/db'
import { items, profiles } from '@/lib/db/schema'
import { requireAuth } from '@/lib/utils/auth'
import { AddBar } from '@/components/ingest/AddBar'
import { Timeline } from '@/components/garden/Timeline'
import type { Item, ItemFilters } from '@/lib/utils/types'
import type { SQL } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

type SearchParams = {
  status?:   string
  type?:     string   // sourceType (medium)
  format?:   string   // contentFormat
  platform?: string
  mood?:     string
  genre?:    string
  q?:        string
}

export default async function GardenPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireAuth()

  const filters: ItemFilters = {
    status:   searchParams.status,
    type:     searchParams.type,
    format:   searchParams.format,
    platform: searchParams.platform,
    mood:     searchParams.mood,
    genre:    searchParams.genre,
    q:        searchParams.q,
  }

  const conditions: SQL[] = [eq(items.userId, user.id)]
  if (filters.status)   conditions.push(eq(items.status,        filters.status))
  if (filters.type)     conditions.push(eq(items.sourceType,    filters.type))
  if (filters.format)   conditions.push(eq(items.contentFormat, filters.format))
  if (filters.platform) conditions.push(eq(items.platform,      filters.platform))
  if (filters.genre)    conditions.push(eq(items.genre,         filters.genre))
  if (filters.mood)     conditions.push(like(items.mood,        `%${filters.mood}%`))
  if (filters.q)      conditions.push(
    or(
      like(items.title,    `%${filters.q}%`),
      like(items.synopsis, `%${filters.q}%`),
      like(items.author,   `%${filters.q}%`),
    )!
  )

  // Single round-trip: profile check + items fetch in parallel
  const [profileRows, initialItems] = await Promise.all([
    db
      .select({ onboardingCompleted: profiles.onboardingCompleted })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1),
    db
      .select({
        id:            items.id,
        userId:        items.userId,
        url:           items.url,
        title:         items.title,
        author:        items.author,
        sourceType:    items.sourceType,
        contentFormat: items.contentFormat,
        platform:      items.platform,
        genre:         items.genre,
        mood:          items.mood,
        synopsis:      items.synopsis,
        keywords:      items.keywords,
        thumbnail:     items.thumbnail,
        duration:      items.duration,
        recommender:   items.recommender,
        status:        items.status,
        notes:         items.notes,
        rating:        items.rating,
        aiTags:        items.aiTags,
        enriched:      items.enriched,
        llmProvider:   items.llmProvider,
        createdAt:     items.createdAt,
        consumedAt:    items.consumedAt,
        originalItemId: items.originalItemId,
        originalUserId: items.originalUserId,
      })
      .from(items)
      .where(and(...conditions))
      .orderBy(desc(items.createdAt))
      .limit(50),
  ])

  if (profileRows[0] && !profileRows[0].onboardingCompleted) redirect('/onboarding')

  return (
    <main>
      <AddBar />
      <Timeline initialItems={initialItems} filters={filters} />
    </main>
  )
}
