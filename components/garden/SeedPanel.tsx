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
  if (!item.title.trim())        return { ok: false, hint: 'TITLE REQUIRED' }
  if (!item.url && !item.author) return { ok: false, hint: 'ADD URL OR AUTHOR FIRST' }
  return { ok: true, hint: '' }
}

function SeedPanel({ item }: Props) {
  const shouldReduce  = useReducedMotion()
  const updateItem    = useUpdateItem()
  const enrichItem    = useEnrichItem()
  const { data: llm } = useLLMStatus()

  const variants = shouldReduce ? { hidden: {}, visible: {}, exit: {} } : panelVariants
  const hint     = enrichHint(item)

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
      <div className="px-4 pb-4 pt-2 space-y-3 border-t border-vault-border/50">
        {item.thumbnail && (
          <div className="relative w-full h-36 overflow-hidden bg-vault-border/20">
            <Image src={item.thumbnail} alt="" fill className="object-cover opacity-70" unoptimized />
            <div className="absolute inset-0 bg-gradient-to-t from-vault-card/70 to-transparent" />
          </div>
        )}

        {item.synopsis && (
          <p className="font-mono text-sm text-cream-mid leading-relaxed border-l-2 border-vault-border pl-3">
            {item.synopsis}
          </p>
        )}

        <div className="flex items-center gap-2 pt-1 overflow-x-auto">
          <Link
            href={`/garden/${item.id}`}
            className="font-display text-lg tracking-widest border border-phosphor/40 text-phosphor px-3 py-0.5 hover:border-phosphor hover:bg-vault-active hover:glow transition-colors focus:outline-none shrink-0"
          >
            ▸ OPEN FILE
          </Link>

          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display text-lg tracking-widest border border-amber/40 text-amber px-3 py-0.5 hover:border-amber hover:bg-amber-faint hover:glow-amber transition-colors focus:outline-none shrink-0"
            >
              ↗ SOURCE
            </a>
          )}

          <div className="ml-auto flex items-center gap-2 shrink-0">
            <button
              onClick={toggleStatus}
              className="font-display text-lg tracking-widest border border-vault-border text-phosphor-dim px-3 py-0.5 hover:border-phosphor hover:text-phosphor hover:bg-vault-hover transition-colors focus:outline-none"
            >
              {item.status === 'consumed' ? '◎ ACTIVE' : '◉ COMPLETE'}
            </button>

            {llm?.available && !item.enriched && (
              hint.ok ? (
                <button
                  onClick={() => enrichItem.mutate(item)}
                  disabled={enrichItem.isPending}
                  className="font-display text-lg tracking-widest border border-amber/50 text-amber px-3 py-0.5 hover:border-amber hover:bg-amber-faint transition-colors focus:outline-none disabled:opacity-50"
                >
                  {enrichItem.isPending ? '◌ ENRICHING...' : '◈ ENRICH'}
                </button>
              ) : (
                <span className="font-display text-sm text-danger tracking-widest">
                  ✗ {hint.hint}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export { SeedPanel }
