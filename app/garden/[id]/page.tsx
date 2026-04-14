export const dynamic = 'force-dynamic'

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
    <main className="flex-1 px-4 md:px-8 lg:px-10 py-6 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        {/* Back + record header */}
        <div className="mb-4">
          <Link
            href="/garden"
            className="font-display text-lg text-phosphor-dim tracking-widest hover:text-phosphor transition-colors focus:outline-none"
          >
            ← BACK TO GARDEN
          </Link>
        </div>

        <div className="mb-5 border-b border-vault-border pb-3">
          <span className="font-display text-base text-phosphor-dim tracking-widest">
            RECORD #{String(item.id).padStart(4, '0')} &nbsp;·&nbsp;
            {item.status === 'consumed' ? (
              <span className="text-phosphor-dim">[COMPLETED]</span>
            ) : (
              <span className="text-amber">[ ACTIVE ]</span>
            )}
          </span>
        </div>

        {/* 2-column on xl+: left = hero/synopsis/notes, right = meta/actions/edit */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
          {/* Left column */}
          <div className="space-y-5">
            <ItemHero item={item} />

            {item.synopsis && (
              <div className="border-l-2 border-phosphor-dim pl-4">
                <p className="font-mono text-sm text-cream-mid leading-relaxed">
                  {item.synopsis}
                </p>
              </div>
            )}

            <ItemNotes item={item} />
          </div>

          {/* Right column */}
          <div className="space-y-5">
            <ItemMeta item={item} />
            <ItemActions item={item} />
            <ItemEditForm item={item} />
          </div>
        </div>
      </div>
    </main>
  )
}
