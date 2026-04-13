'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { panelVariants } from '@/lib/animations'
import { RatingDots } from '@/components/ui/RatingDots'
import { useConfirmItem } from '@/lib/query/hooks/useIngest'
import { useLLMStatus } from '@/lib/query/hooks/useTags'
import { SOURCE_TYPES } from '@/lib/utils/types'
import type { Item } from '@/lib/utils/types'

type Props = { onSaved: (item: Item) => void }

function ManualEntryForm({ onSaved }: Props) {
  const shouldReduce = useReducedMotion()
  const confirmItem = useConfirmItem()
  const { data: llm } = useLLMStatus()

  const [title, setTitle]             = useState('')
  const [sourceType, setSourceType]   = useState('generic')
  const [recommender, setRecommender] = useState('')
  const [url, setUrl]                 = useState('')
  const [genre, setGenre]             = useState('')
  const [notes, setNotes]             = useState('')
  const [rating, setRating]           = useState<number | null>(null)
  const [enrichAfter, setEnrichAfter] = useState(false)

  const variants = shouldReduce ? { hidden: {}, visible: {}, exit: {} } : panelVariants

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = await confirmItem.mutateAsync({
      title,
      sourceType,
      recommender: recommender || null,
      url: url || null,
      genre: genre || null,
      notes: notes || null,
      rating,
      enriched: false,
    })
    onSaved(result.item)
  }

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="overflow-hidden"
    >
      <form onSubmit={handleSubmit} className="mt-3 p-4 bg-paper-dark dark:bg-forest-card border border-ink-faint dark:border-moss-ink/20 rounded-r-lg space-y-3">
        <p className="text-xs font-medium text-ink-muted dark:text-ink-muted uppercase tracking-widest">add manually</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="title"
              className="w-full px-3 py-2 text-sm bg-paper dark:bg-forest border border-ink-faint dark:border-moss-ink/30 rounded text-ink dark:text-paper placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-moss"
            />
          </div>

          <div>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-paper dark:bg-forest border border-ink-faint dark:border-moss-ink/30 rounded text-ink dark:text-paper focus:outline-none focus:ring-2 focus:ring-moss"
            >
              {SOURCE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <input
              value={recommender}
              onChange={(e) => setRecommender(e.target.value)}
              placeholder="recommended by"
              className="w-full px-3 py-2 text-sm bg-paper dark:bg-forest border border-ink-faint dark:border-moss-ink/30 rounded text-ink dark:text-paper placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-moss"
            />
          </div>

          <div>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="url (optional)"
              type="url"
              className="w-full px-3 py-2 text-sm bg-paper dark:bg-forest border border-ink-faint dark:border-moss-ink/30 rounded text-ink dark:text-paper placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-moss"
            />
          </div>

          <div>
            <input
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="genre (optional)"
              className="w-full px-3 py-2 text-sm bg-paper dark:bg-forest border border-ink-faint dark:border-moss-ink/30 rounded text-ink dark:text-paper placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-moss"
            />
          </div>

          <div className="col-span-2">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="notes (optional)"
              rows={2}
              className="w-full px-3 py-2 text-sm bg-paper dark:bg-forest border border-ink-faint dark:border-moss-ink/30 rounded text-ink dark:text-paper placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-moss resize-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <RatingDots rating={rating} interactive onChange={setRating} />
          <span className="text-xs text-ink-muted dark:text-ink-muted">rating</span>
        </div>

        {llm?.available && url && (
          <label className="flex items-center gap-2 text-sm text-ink dark:text-paper cursor-pointer">
            <input
              type="checkbox"
              checked={enrichAfter}
              onChange={(e) => setEnrichAfter(e.target.checked)}
              className="accent-moss"
            />
            enrich after saving
          </label>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={confirmItem.isPending}
            className="text-sm px-4 py-2 bg-moss text-white rounded hover:bg-moss-dark transition-colors focus:outline-none focus:ring-2 focus:ring-moss disabled:opacity-60"
          >
            {confirmItem.isPending ? 'planting...' : 'plant this seed'}
          </button>
        </div>
      </form>
    </motion.div>
  )
}

export { ManualEntryForm }
