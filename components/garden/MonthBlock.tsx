'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { stemVariants, seedCardVariants } from '@/lib/animations'
import { SeedCard } from './SeedCard'
import type { Item } from '@/lib/utils/types'

type Props = {
  month: string
  items: Item[]
}

function MonthBlock({ month, items }: Props) {
  const shouldReduce = useReducedMotion()

  const stem = shouldReduce ? { hidden: {}, visible: {} } : stemVariants

  return (
    <div className="flex gap-6 px-6 md:px-12 lg:px-20">
      {/* Stem + label */}
      <div className="flex flex-col items-center pt-1 w-12 shrink-0">
        <motion.div
          variants={stem}
          initial="hidden"
          animate="visible"
          className="w-px flex-1 bg-ink-faint dark:bg-moss-ink/40 origin-top"
        />
        <span
          className="text-xs text-ink-muted dark:text-ink-muted tracking-widest uppercase whitespace-nowrap"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          {month}
        </span>
      </div>

      {/* Seeds */}
      <div className="flex-1 space-y-3 pb-8 pt-1">
        <AnimatePresence initial={false}>
          {items.map((item, i) => (
            <SeedCard key={item.id} item={item} index={i} />
          ))}
        </AnimatePresence>

        {items.length === 0 && (
          <p className="text-sm text-ink-muted dark:text-ink-muted italic">no seeds this month</p>
        )}
      </div>
    </div>
  )
}

export { MonthBlock }
