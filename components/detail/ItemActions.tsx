'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUpdateItem, useDeleteItem } from '@/lib/query/hooks/useItems'
import { useEnrichItem } from '@/lib/query/hooks/useIngest'
import { useLLMStatus } from '@/lib/query/hooks/useTags'
import type { Item } from '@/lib/utils/types'

type Props = { item: Item }

function enrichHint(item: Item): { ok: boolean; hint: string } {
  if (!item.title.trim())        return { ok: false, hint: 'TITLE REQUIRED TO ENRICH' }
  if (!item.url && !item.author) return { ok: false, hint: 'ADD URL OR AUTHOR SO AI HAS DATA TO SEARCH' }
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
    <div className="border border-vault-border bg-vault-panel p-4 space-y-3">
      <p className="font-display text-lg text-phosphor-dim tracking-widest border-b border-vault-border pb-2">
        ■ ACTIONS
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={toggleStatus}
          className="font-display text-lg tracking-widest border border-vault-border text-phosphor-dim px-4 py-1 hover:border-phosphor hover:text-phosphor hover:bg-vault-hover transition-colors focus:outline-none"
        >
          {item.status === 'consumed' ? '▸ ACTIVE' : '▸ COMPLETE'}
        </button>

        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display text-lg tracking-widest border border-vault-border text-phosphor-dim px-4 py-1 hover:border-amber hover:text-amber transition-colors focus:outline-none"
          >
            SOURCE ↗
          </a>
        )}

        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="font-display text-lg tracking-widest text-danger/60 hover:text-danger transition-colors ml-auto focus:outline-none"
          >
            [DELETE RECORD]
          </button>
        ) : (
          <div className="ml-auto flex items-center gap-3">
            <span className="font-display text-sm text-danger tracking-widest">
              ⚠ CONFIRM DELETION?
            </span>
            <button
              onClick={handleDelete}
              className="font-display text-lg tracking-widest text-danger hover:glow-danger transition-all focus:outline-none"
            >
              CONFIRM
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="font-display text-lg tracking-widest text-phosphor-dim hover:text-phosphor transition-colors focus:outline-none"
            >
              CANCEL
            </button>
          </div>
        )}
      </div>

      {llm?.available && !item.enriched && (
        <div className="flex items-center gap-3 pt-2 border-t border-vault-border/50">
          {hint.ok ? (
            <button
              onClick={handleEnrich}
              disabled={enrichItem.isPending}
              className="font-display text-lg tracking-widest border border-amber/50 text-amber px-4 py-1 hover:border-amber hover:bg-amber-faint transition-colors focus:outline-none disabled:opacity-50"
            >
              {enrichItem.isPending ? '◌ ENRICHING...' : '◈ ENRICH'}
            </button>
          ) : (
            <p className="font-display text-sm text-danger tracking-widest">
              ✗ {hint.hint}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export { ItemActions }
