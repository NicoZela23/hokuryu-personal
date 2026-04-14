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
  const shouldReduce  = useReducedMotion()
  const confirmItem   = useConfirmItem()
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

  const inputClass = 'w-full bg-vault font-mono text-sm text-phosphor border border-vault-border px-3 py-2 focus:outline-none focus:border-phosphor placeholder:text-phosphor-dim transition-colors'
  const labelClass = 'font-display text-base text-phosphor-dim tracking-widest'

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="overflow-hidden"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className={labelClass}>TITLE *</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="record title"
            className={`${inputClass} mt-1`}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>TYPE</label>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              className={`${inputClass} mt-1`}
            >
              {SOURCE_TYPES.map((t) => (
                <option key={t} value={t}>{t.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>SOURCE</label>
            <input
              value={recommender}
              onChange={(e) => setRecommender(e.target.value)}
              placeholder="recommended by"
              className={`${inputClass} mt-1`}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>URL</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://... (optional)"
              type="url"
              className={`${inputClass} mt-1`}
            />
          </div>
          <div>
            <label className={labelClass}>GENRE</label>
            <input
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="genre"
              className={`${inputClass} mt-1`}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>NOTES</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="field notes (optional)"
            rows={2}
            className={`${inputClass} mt-1 resize-none`}
          />
        </div>

        <div className="flex items-center gap-3 pt-1">
          <span className={labelClass}>RATING</span>
          <RatingDots rating={rating} interactive onChange={setRating} />
          <span className="font-display text-base text-phosphor-dim tracking-widest">
            {rating ? `${rating}/5` : '—'}
          </span>
        </div>

        {llm?.available && url && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={enrichAfter}
              onChange={(e) => setEnrichAfter(e.target.checked)}
              className="accent-phosphor"
            />
            <span className="font-display text-base text-phosphor-dim tracking-widest">
              ENRICH AFTER SAVING
            </span>
          </label>
        )}

        <div className="pt-1">
          <button
            type="submit"
            disabled={confirmItem.isPending}
            className="font-display text-xl tracking-widest border border-phosphor text-phosphor px-5 py-1 hover:bg-vault-active transition-colors focus:outline-none disabled:opacity-60"
          >
            {confirmItem.isPending ? '◌ PLANTING...' : '▸ PLANT THIS SEED'}
          </button>
        </div>
      </form>
    </motion.div>
  )
}

export { ManualEntryForm }
