'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { stemVariants } from '@/lib/animations'
import { SeedCard } from './SeedCard'
import type { Item } from '@/lib/utils/types'

type Props = {
  month: string
  items: Item[]
}

function MonthBlock({ month, items }: Props) {
  const shouldReduce = useReducedMotion()
  const stem = shouldReduce ? { hidden: {}, visible: {} } : stemVariants

  const [monthName, year] = month.split(' ')
  const shortMonth = monthName?.toUpperCase().slice(0, 3) ?? month.toUpperCase()

  return (
    <div className="flex gap-4 px-6 md:px-10 lg:px-12 mb-2">
      {/* Vertical stem + month label */}
      <div className="flex flex-col items-center w-14 xl:w-16 shrink-0">
        <motion.div
          variants={stem}
          initial="hidden"
          animate="visible"
          className="w-px flex-1 origin-top"
          style={{ backgroundImage: 'repeating-linear-gradient(to bottom, #2a4422 0px, #2a4422 4px, transparent 4px, transparent 8px)' }}
        />
        <div className="rotate-180 py-2" style={{ writingMode: 'vertical-rl' }}>
          <span className="font-display text-xl xl:text-2xl text-phosphor-dim tracking-widest whitespace-nowrap">
            {shortMonth}
          </span>
          {year && (
            <span className="font-display text-base text-phosphor-dim/50 tracking-widest whitespace-nowrap">
              {year}
            </span>
          )}
        </div>
      </div>

      {/* Card grid — 1 col mobile/lg, 2 col xl+ */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-2 pb-8 pt-1 min-w-0 items-start">
        <AnimatePresence initial={false}>
          {items.map((item, i) => (
            <SeedCard key={item.id} item={item} index={i} />
          ))}
        </AnimatePresence>
        {items.length === 0 && (
          <p className="font-display text-xl text-phosphor-dim tracking-widest col-span-full">
            &gt; NO ENTRIES THIS PERIOD
          </p>
        )}
      </div>
    </div>
  )
}

export { MonthBlock }
