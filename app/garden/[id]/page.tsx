import { notFound } from 'next/navigation'
import Link from 'next/link'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { items } from '@/lib/db/schema'
import { ItemHero } from '@/components/detail/ItemHero'
import { ItemMeta } from '@/components/detail/ItemMeta'
import { ItemNotes } from '@/components/detail/ItemNotes'
import { ItemActions } from '@/components/detail/ItemActions'
import { ItemEditForm } from '@/components/detail/ItemEditForm'
import type { Item } from '@/lib/utils/types'

export default async function ItemDetailPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10)
  if (isNaN(id)) notFound()

  const [row] = await db.select().from(items).where(eq(items.id, id)).limit(1)
  if (!row) notFound()

  const item = row as unknown as Item

  return (
    <main className="px-6 md:px-12 lg:px-20 py-8 max-w-2xl">
      <Link
        href="/garden"
        className="text-moss dark:text-moss-mid text-sm mb-6 inline-block hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-moss rounded"
      >
        ← back to garden
      </Link>

      <div className="space-y-8">
        <div className="space-y-3">
          <ItemHero item={item} />
          <ItemEditForm item={item} />
        </div>

        <ItemMeta item={item} />

        {item.synopsis && (
          <p className="text-base leading-relaxed max-w-prose text-ink dark:text-paper font-sans">
            {item.synopsis}
          </p>
        )}

        <ItemNotes item={item} />

        <ItemActions item={item} />
      </div>
    </main>
  )
}
