'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { seedCardVariants } from '@/lib/animations'
import { TypeBadge } from '@/components/ui/TypeBadge'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { RatingDots } from '@/components/ui/RatingDots'
import { SeedPanel } from './SeedPanel'
import { truncate } from '@/lib/utils/format'
import type { Item } from '@/lib/utils/types'

const accentBorder: Record<string, string> = {
  youtube:   'border-l-seed-youtube',
  spotify:   'border-l-seed-spotify',
  tiktok:    'border-l-seed-tiktok',
  instagram: 'border-l-seed-instagram',
  x:         'border-l-seed-generic',
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
  const shouldReduce = useReducedMotion()

  const variants = shouldReduce
    ? { hidden: {}, visible: {}, exit: {} }
    : seedCardVariants

  const accent = accentBorder[item.sourceType] ?? 'border-l-seed-generic'
  const isConsumed = item.status === 'consumed'

  return (
    <motion.div
      layout
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      custom={index}
      className={`border border-ink-faint dark:border-moss-ink/20 border-l-2 ${accent} rounded-r-lg bg-paper-dark dark:bg-forest-card ${isConsumed ? 'opacity-60' : ''} transition-opacity`}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left p-4 focus:outline-none focus:ring-2 focus:ring-moss rounded-r-lg"
      >
        <div className="flex items-start justify-between gap-2">
          <span className="flex items-center gap-1.5 text-sm font-medium text-ink dark:text-paper leading-snug">
            {item.title}
            {!item.enriched && (
              <span
                title="not yet enriched"
                className="inline-block w-1.5 h-1.5 rounded-full bg-moss/50 dark:bg-moss-mid/60 shrink-0 mt-0.5"
              />
            )}
          </span>
          <TypeBadge type={item.sourceType} />
        </div>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {item.recommender && (
            <span className="text-xs text-moss dark:text-moss-mid font-medium">
              {item.recommender}
            </span>
          )}
          {item.recommender && (item.genre || item.status !== 'consumed') && (
            <span className="text-ink-faint dark:text-moss-ink/60 text-xs">·</span>
          )}
          {item.genre && (
            <span className="text-xs text-ink-muted dark:text-ink-muted">{item.genre}</span>
          )}
          {item.status !== 'consumed' && (
            <>
              {(item.recommender || item.genre) && (
                <span className="text-ink-faint dark:text-moss-ink/60 text-xs">·</span>
              )}
              <StatusBadge status={item.status} />
            </>
          )}
        </div>

        {item.notes && (
          <p className="text-xs italic text-ink-muted dark:text-ink-muted mt-1.5">
            {truncate(item.notes, 60)}
          </p>
        )}

        {item.rating !== null && (
          <div className="mt-2">
            <RatingDots rating={item.rating} />
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
