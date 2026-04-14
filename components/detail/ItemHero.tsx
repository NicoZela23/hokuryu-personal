'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import type { Item } from '@/lib/utils/types'

function ItemHero({ item }: { item: Item }) {
  const shouldReduce = useReducedMotion()

  return (
    <div>
      {item.thumbnail ? (
        <motion.div
          initial={shouldReduce ? {} : { opacity: 0 }}
          animate={shouldReduce ? {} : { opacity: 1 }}
          className="relative w-full h-56 overflow-hidden bg-vault-border/20"
        >
          <Image
            src={item.thumbnail}
            alt=""
            fill
            className="object-cover opacity-60"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-vault/80 via-transparent to-transparent" />
          {/* Scanline overlay on image */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)',
            }}
          />
        </motion.div>
      ) : (
        <div className="w-full h-32 border border-vault-border bg-vault-panel flex items-center justify-center">
          <span className="font-display text-xl text-vault-border tracking-widest">
            [ NO IMAGE DATA ]
          </span>
        </div>
      )}

      <div className="mt-4 space-y-1">
        <h1 className="font-display text-4xl md:text-5xl text-phosphor glow tracking-wider leading-tight">
          {item.title.toUpperCase()}
        </h1>
        {item.author && (
          <p className="font-mono text-sm text-cream-dim">
            BY: {item.author}
          </p>
        )}
      </div>
    </div>
  )
}

export { ItemHero }
