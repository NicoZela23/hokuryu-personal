'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { panelVariants } from '@/lib/animations'
import { useUpdateItem } from '@/lib/query/hooks/useItems'
import { useEnrichItem } from '@/lib/query/hooks/useIngest'
import { useLLMStatus } from '@/lib/query/hooks/useTags'
import type { Item } from '@/lib/utils/types'

type Props = { item: Item }

function enrichHint(item: Item): { ok: boolean; hint: string } {
  if (!item.title.trim())        return { ok: false, hint: 'add a title to enrich' }
  if (!item.url && !item.author) return { ok: false, hint: 'add a url or author first' }
  return { ok: true, hint: '' }
}

function SeedPanel({ item }: Props) {
  const shouldReduce = useReducedMotion()
  const updateItem   = useUpdateItem()
  const enrichItem   = useEnrichItem()
  const { data: llm } = useLLMStatus()

  const variants = shouldReduce
    ? { hidden: {}, visible: {}, exit: {} }
    : panelVariants

  const hint = enrichHint(item)

  function toggleStatus() {
    updateItem.mutate({
      id: item.id,
      patch: { status: item.status === 'consumed' ? 'pending' : 'consumed' },
    })
  }

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="overflow-hidden"
    >
      <div className="px-4 pb-4 pt-2 space-y-3 border-t border-ink-faint/50 dark:border-moss-ink/20">
        {item.thumbnail && (
          <div className="relative w-full h-36 rounded overflow-hidden bg-ink-faint/30 dark:bg-moss-ink/20">
            <Image src={item.thumbnail} alt="" fill className="object-cover" unoptimized />
          </div>
        )}

        {item.synopsis && (
          <p className="text-sm text-ink dark:text-paper/80 leading-relaxed">
            {item.synopsis}
          </p>
        )}

        <div className="flex items-center gap-3 flex-wrap pt-1">
          <button
            onClick={toggleStatus}
            className="text-sm px-3 py-1.5 rounded border border-moss dark:border-moss-mid text-moss dark:text-moss-mid hover:bg-moss hover:text-white dark:hover:bg-moss-mid dark:hover:text-forest transition-colors focus:outline-none focus:ring-2 focus:ring-moss"
          >
            {item.status === 'consumed' ? 'mark as pending' : 'mark as consumed'}
          </button>

          {/* Enrich button — only when LLM available and item not yet enriched */}
          {llm?.available && !item.enriched && (
            hint.ok ? (
              <button
                onClick={() => enrichItem.mutate(item)}
                disabled={enrichItem.isPending}
                className="text-sm px-3 py-1.5 rounded border border-moss-mid/60 dark:border-moss-mid/60 text-moss dark:text-moss-mid hover:bg-moss-light dark:hover:bg-moss-ink/30 transition-colors focus:outline-none focus:ring-2 focus:ring-moss disabled:opacity-50"
              >
                {enrichItem.isPending ? 'enriching...' : 'enrich with AI'}
              </button>
            ) : (
              <span className="text-xs text-ink-muted dark:text-ink-muted italic">
                {hint.hint}
              </span>
            )
          )}

          <Link
            href={`/garden/${item.id}`}
            className="text-sm text-ink-muted dark:text-ink-muted hover:text-moss dark:hover:text-moss-mid transition-colors focus:outline-none focus:ring-2 focus:ring-moss rounded"
          >
            open full page →
          </Link>

          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-ink-muted dark:text-ink-muted hover:text-moss dark:hover:text-moss-mid transition-colors focus:outline-none focus:ring-2 focus:ring-moss rounded ml-auto"
            >
              open original ↗
            </a>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export { SeedPanel }
