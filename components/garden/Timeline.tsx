'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { pageVariants } from '@/lib/animations'
import { useItems } from '@/lib/query/hooks/useItems'
import { groupByMonth } from '@/lib/utils/seasons'
import { MonthBlock } from './MonthBlock'
import { SeasonDivider } from './SeasonDivider'
import type { Item, ItemFilters } from '@/lib/utils/types'

type Props = {
  initialItems: Item[]
  filters:      ItemFilters
}

function Timeline({ initialItems, filters }: Props) {
  const shouldReduce = useReducedMotion()

  const { data } = useItems(filters, { initialData: { items: initialItems } })

  const items  = data?.items ?? initialItems
  const groups = groupByMonth(items)

  const variants = shouldReduce ? { hidden: {}, visible: {} } : pageVariants

  if (items.length === 0) {
    return (
      <div className="px-6 md:px-10 lg:px-12 py-16">
        <p className="font-display text-2xl text-phosphor-dim tracking-widest">
          &gt; NO RECORDS FOUND. DATABASE EMPTY.
        </p>
        <p className="font-mono text-sm text-phosphor-dim mt-2">
          DROP A LINK ABOVE TO PLANT YOUR FIRST SEED.
        </p>
      </div>
    )
  }

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      className="mt-6 pb-24"
    >
      {groups.map((group, i) => {
        const prevGroup  = i > 0 ? groups[i - 1] : null
        const showDivider = prevGroup && prevGroup.season !== group.season

        return (
          <div key={group.month}>
            {showDivider && <SeasonDivider season={group.season} />}
            <MonthBlock month={group.month} items={group.items} />
          </div>
        )
      })}
    </motion.div>
  )
}

export { Timeline }
