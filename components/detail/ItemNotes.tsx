'use client'

import { useEffect, useRef, useState } from 'react'
import { useUpdateItem } from '@/lib/query/hooks/useItems'
import { RatingDots } from '@/components/ui/RatingDots'
import type { Item } from '@/lib/utils/types'

function ItemNotes({ item }: { item: Item }) {
  const [notes, setNotes]     = useState(item.notes ?? '')
  const [rating, setRating]   = useState<number | null>(item.rating)
  const [saved, setSaved]     = useState(false)
  const updateItem            = useUpdateItem()
  const timerRef              = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedTimerRef         = useRef<ReturnType<typeof setTimeout> | null>(null)
  const textareaRef           = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight}px`
  }, [notes])

  function saveNotes(value: string) {
    updateItem.mutate({ id: item.id, patch: { notes: value } })
    setSaved(true)
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    savedTimerRef.current = setTimeout(() => setSaved(false), 1500)
  }

  function handleNotesChange(value: string) {
    const capped = value.slice(0, 250)
    setNotes(capped)
    setSaved(false)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => saveNotes(capped), 800)
  }

  function handleSaveNow() {
    if (timerRef.current) clearTimeout(timerRef.current)
    saveNotes(notes)
  }

  function handleRating(next: number) {
    setRating(next)
    updateItem.mutate({ id: item.id, patch: { rating: next } })
  }

  return (
    <div className="border border-vault-border bg-vault-panel p-4 space-y-4">
      <div className="flex items-baseline justify-between border-b border-vault-border pb-2">
        <p className="font-display text-lg text-phosphor-dim tracking-widest">■ FIELD NOTES</p>
        <span className={`font-display text-sm tracking-widest ${notes.length > 230 ? 'text-danger' : 'text-phosphor-dim'}`}>
          {notes.length}/250
        </span>
      </div>
      <div className="relative">
        <span className="absolute top-0 left-0 font-display text-lg text-phosphor-dim select-none">▸ </span>
        <textarea
          ref={textareaRef}
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="enter log entry..."
          rows={3}
          maxLength={250}
          className="w-full bg-transparent font-mono text-sm text-cream placeholder:text-phosphor-dim resize-none focus:outline-none pl-6 leading-relaxed"
        />
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-vault-border/50">
        <div className="flex items-center gap-3">
          <span className="font-display text-base text-phosphor-dim tracking-widest">RATING</span>
          <RatingDots rating={rating} interactive onChange={handleRating} />
        </div>
        <button
          onClick={handleSaveNow}
          disabled={updateItem.isPending}
          className="font-display text-sm tracking-widest border border-vault-border text-phosphor-dim px-3 py-0.5 hover:border-phosphor hover:text-phosphor transition-colors focus:outline-none disabled:opacity-40"
        >
          {saved ? '✓ SAVED' : updateItem.isPending ? '◌ SAVING...' : '▸ SAVE NOTE'}
        </button>
      </div>
    </div>
  )
}

export { ItemNotes }
