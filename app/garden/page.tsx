import { desc, eq, and, like, or } from 'drizzle-orm'
import { db } from '@/lib/db'
import { items } from '@/lib/db/schema'
import { AddBar } from '@/components/ingest/AddBar'
import { Timeline } from '@/components/garden/Timeline'
import type { Item, ItemFilters } from '@/lib/utils/types'
import type { SQL } from 'drizzle-orm'

type SearchParams = { status?: string; type?: string; mood?: string; genre?: string; q?: string }

export default async function GardenPage({ searchParams }: { searchParams: SearchParams }) {
  const filters: ItemFilters = {
    status: searchParams.status,
    type:   searchParams.type,
    mood:   searchParams.mood,
    genre:  searchParams.genre,
    q:      searchParams.q,
  }

  const conditions: SQL[] = []
  if (filters.status) conditions.push(eq(items.status, filters.status))
  if (filters.type)   conditions.push(eq(items.sourceType, filters.type))
  if (filters.genre)  conditions.push(eq(items.genre, filters.genre))
  if (filters.mood)   conditions.push(like(items.mood, `%${filters.mood}%`))
  if (filters.q)      conditions.push(or(like(items.title, `%${filters.q}%`), like(items.synopsis, `%${filters.q}%`), like(items.author, `%${filters.q}%`))!)

  const initialItems = (await db.select().from(items)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(items.createdAt))) as unknown as Item[]

  return (
    <main>
      <AddBar />
      <Timeline initialItems={initialItems} filters={filters} />
    </main>
  )
}
