'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUpdateItem, useDeleteItem } from '@/lib/query/hooks/useItems'
import { useEnrichItem } from '@/lib/query/hooks/useIngest'
import { useLLMStatus } from '@/lib/query/hooks/useTags'
import type { Item } from '@/lib/utils/types'

type Props = { item: Item }

function enrichHint(item: Item): { ok: boolean; hint: string } {
  if (!item.title.trim())        return { ok: false, hint: 'add a title to enrich' }
  if (!item.url && !item.author) return { ok: false, hint: 'add a url or author so AI has something to search' }
  return { ok: true, hint: '' }
}

function ItemActions({ item }: Props) {
  const router         = useRouter()
  const updateItem     = useUpdateItem()
  const deleteItem     = useDeleteItem()
  const enrichItem     = useEnrichItem()
  const { data: llm }  = useLLMStatus()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const hint = enrichHint(item)

  function toggleStatus() {
    updateItem.mutate({
      id: item.id,
      patch: { status: item.status === 'consumed' ? 'pending' : 'consumed' },
    })
  }

  async function handleEnrich() {
    await enrichItem.mutateAsync(item)
    router.refresh()
  }

  async function handleDelete() {
    await deleteItem.mutateAsync(item.id)
    router.push('/garden')
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={toggleStatus}
          className="text-sm px-4 py-2 border border-moss dark:border-moss-mid text-moss dark:text-moss-mid rounded hover:bg-moss hover:text-white dark:hover:bg-moss-mid dark:hover:text-forest transition-colors focus:outline-none focus:ring-2 focus:ring-moss"
        >
          {item.status === 'consumed' ? 'mark as pending' : 'mark as consumed'}
        </button>

        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm px-4 py-2 border border-moss dark:border-moss-mid text-moss dark:text-moss-mid rounded hover:bg-moss hover:text-white dark:hover:bg-moss-mid dark:hover:text-forest transition-colors focus:outline-none focus:ring-2 focus:ring-moss"
          >
            open original ↗
          </a>
        )}

        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-sm text-red-500 hover:underline ml-auto focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
          >
            remove from garden
          </button>
        ) : (
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-ink dark:text-paper">are you sure? this seed will be lost.</span>
            <button
              onClick={handleDelete}
              className="text-sm text-red-500 hover:underline focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
            >
              yes, remove
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-sm text-ink-muted dark:text-ink-muted hover:underline focus:outline-none focus:ring-2 focus:ring-moss rounded"
            >
              cancel
            </button>
          </div>
        )}
      </div>

      {/* Enrich row — only shown when LLM is available and item not yet enriched */}
      {llm?.available && !item.enriched && (
        <div className="flex items-center gap-3">
          {hint.ok ? (
            <button
              onClick={handleEnrich}
              disabled={enrichItem.isPending}
              className="text-sm px-4 py-2 border border-moss-mid/60 dark:border-moss-mid/60 text-moss dark:text-moss-mid rounded hover:bg-moss-light dark:hover:bg-moss-ink/30 transition-colors focus:outline-none focus:ring-2 focus:ring-moss disabled:opacity-50"
            >
              {enrichItem.isPending ? 'enriching...' : 'enrich with AI'}
            </button>
          ) : (
            <p className="text-xs text-ink-muted dark:text-ink-muted italic">
              to enrich: {hint.hint}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export { ItemActions }
