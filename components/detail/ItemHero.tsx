'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import type { Item } from '@/lib/utils/types'

const seedBg: Record<string, string> = {
  youtube:   'bg-seed-youtube/20',
  spotify:   'bg-seed-spotify/20',
  tiktok:    'bg-seed-tiktok/20',
  instagram: 'bg-seed-instagram/20',
  x:         'bg-seed-generic/20',
  article:   'bg-seed-article/20',
  podcast:   'bg-seed-podcast/20',
  film:      'bg-seed-film/20',
  book:      'bg-seed-book/20',
  concert:   'bg-seed-concert/20',
  generic:   'bg-seed-generic/20',
}

function ItemHero({ item }: { item: Item }) {
  const shouldReduce = useReducedMotion()
  const bg = seedBg[item.sourceType] ?? 'bg-seed-generic/20'

  return (
    <div>
      {item.thumbnail ? (
        <motion.div
          initial={shouldReduce ? {} : { opacity: 0 }}
          animate={shouldReduce ? {} : { opacity: 1 }}
          className="relative w-full max-h-64 h-64 rounded-lg overflow-hidden shadow-sm"
        >
          <Image
            src={item.thumbnail}
            alt=""
            fill
            className="object-cover"
            unoptimized
          />
        </motion.div>
      ) : (
        <div className={`w-full h-64 rounded-lg ${bg}`} />
      )}

      <h1 className="font-serif text-3xl text-ink dark:text-paper mt-4 leading-tight">
        {item.title}
      </h1>
      {item.author && (
        <p className="text-ink-muted dark:text-ink-muted text-sm mt-1">{item.author}</p>
      )}
    </div>
  )
}

export { ItemHero }
