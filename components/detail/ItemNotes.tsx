'use client'

import { useEffect, useRef, useState } from 'react'
import { useUpdateItem } from '@/lib/query/hooks/useItems'
import { RatingDots } from '@/components/ui/RatingDots'
import type { Item } from '@/lib/utils/types'

function ItemNotes({ item }: { item: Item }) {
  const [notes, setNotes] = useState(item.notes ?? '')
  const updateItem = useUpdateItem()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
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
    <div className="space-y-4">
      <textarea
        ref={textareaRef}
        value={notes}
        onChange={(e) => handleNotesChange(e.target.value)}
        placeholder="add notes..."
        rows={3}
        className="w-full bg-transparent border-b border-ink-faint dark:border-moss-ink/30 text-sm text-ink dark:text-paper placeholder:text-ink-muted resize-none focus:outline-none focus:border-moss py-1"
      />
      <div className="flex items-center gap-3">
        <RatingDots rating={item.rating} interactive onChange={handleRating} />
        <span className="text-xs text-ink-muted dark:text-ink-muted">
          {item.rating ? `${item.rating}/5` : 'rate this'}
        </span>
      </div>
    </div>
  )
}

export { ItemNotes }
