'use client'

import { useEffect, useRef, useState } from 'react'
import { useUpdateItem } from '@/lib/query/hooks/useItems'
import { RatingDots } from '@/components/ui/RatingDots'
import type { Item } from '@/lib/utils/types'

function ItemNotes({ item }: { item: Item }) {
  const [notes, setNotes]   = useState(item.notes ?? '')
  const updateItem          = useUpdateItem()
  const timerRef            = useRef<ReturnType<typeof setTimeout> | null>(null)
  const textareaRef         = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight}px`
  }, [notes])

  function handleNotesChange(value: string) {
    setNotes(value)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      updateItem.mutate({ id: item.id, patch: { notes: value } })
    }, 800)
  }

  function handleRating(rating: number) {
    updateItem.mutate({ id: item.id, patch: { rating } })
  }

  return (
    <div className="border border-vault-border bg-vault-panel p-4 space-y-4">
      <p className="font-display text-lg text-phosphor-dim tracking-widest border-b border-vault-border pb-2">
        ■ FIELD NOTES
      </p>
      <div className="relative">
        <span className="absolute top-0 left-0 font-display text-lg text-phosphor-dim select-none">&gt; </span>
        <textarea
          ref={textareaRef}
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="enter log entry..."
          rows={3}
          className="w-full bg-transparent font-mono text-sm text-cream placeholder:text-phosphor-dim resize-none focus:outline-none pl-6 leading-relaxed"
        />
      </div>
      <div className="flex items-center gap-3 pt-1 border-t border-vault-border/50">
        <span className="font-display text-base text-phosphor-dim tracking-widest">RATING</span>
        <RatingDots rating={item.rating} interactive onChange={handleRating} />
        <span className="font-display text-base text-phosphor-dim tracking-widest">
          {item.rating ? `${item.rating}/5` : '—'}
        </span>
      </div>
    </div>
  )
}

export { ItemNotes }
