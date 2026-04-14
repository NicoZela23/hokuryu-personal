'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { seedCardVariants } from '@/lib/animations'
import { TypeBadge } from '@/components/ui/TypeBadge'
import { RatingDots } from '@/components/ui/RatingDots'
import { SeedPanel } from './SeedPanel'
import { truncate } from '@/lib/utils/format'
import type { Item } from '@/lib/utils/types'

const accentColor: Record<string, string> = {
  youtube:   'border-l-seed-youtube',
  spotify:   'border-l-seed-spotify',
  tiktok:    'border-l-seed-tiktok',
  instagram: 'border-l-seed-instagram',
  x:         'border-l-seed-x',
  article:   'border-l-seed-article',
  podcast:   'border-l-seed-podcast',
  film:      'border-l-seed-film',
  book:      'border-l-seed-book',
  concert:   'border-l-seed-concert',
  generic:   'border-l-seed-generic',
}

type Props = { item: Item; index: number }

function SeedCard({ item, index }: Props) {
  const [open, setOpen] = useState(false)
  const shouldReduce    = useReducedMotion()

  const variants   = shouldReduce ? { hidden: {}, visible: {}, exit: {} } : seedCardVariants
  const accent     = accentColor[item.sourceType] ?? 'border-l-seed-generic'
  const isComplete = item.status === 'consumed'

  return (
    <motion.div
      layout
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      custom={index}
      className={`border border-vault-border border-l-2 ${accent} bg-vault-card transition-opacity ${
        isComplete ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left px-4 py-3 focus:outline-none hover:bg-vault-hover transition-colors"
      >
        {/* Row 1: type badge + title + status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <TypeBadge type={item.sourceType} />
            <span className="font-mono text-sm text-cream leading-snug truncate">
              {item.title}
              {!item.enriched && (
                <span
                  title="not yet enriched"
                  className="inline-block w-1.5 h-1.5 bg-phosphor-dim animate-blink ml-1.5 align-middle shrink-0"
                />
              )}
            </span>
          </div>
          {isComplete && (
            <span className="font-display text-base text-phosphor-dim tracking-widest shrink-0">
              [DONE]
            </span>
          )}
        </div>

        {/* Row 2: meta */}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {item.recommender && (
            <span className="font-mono text-xs text-amber">
              FROM:{item.recommender}
            </span>
          )}
          {item.recommender && item.genre && (
            <span className="text-vault-border text-xs">·</span>
          )}
          {item.genre && (
            <span className="font-mono text-xs text-phosphor-dim">{item.genre.toUpperCase()}</span>
          )}
        </div>

        {/* Notes preview */}
        {item.notes && (
          <p className="font-mono text-xs text-cream-dim mt-1.5">
            &gt; {truncate(item.notes, 80)}
          </p>
        )}

        {/* Rating */}
        {item.rating !== null && (
          <div className="mt-2 flex items-center gap-2">
            <RatingDots rating={item.rating} />
            <span className="font-display text-sm text-phosphor-dim tracking-widest">
              {item.rating}/5
            </span>
          </div>
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && <SeedPanel item={item} />}
      </AnimatePresence>
    </motion.div>
  )
}

export { SeedCard }
