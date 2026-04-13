'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useIngestUrl } from '@/lib/query/hooks/useIngest'
import { ConfirmCard } from './ConfirmCard'
import { ManualEntryForm } from './ManualEntryForm'
import { Skeleton } from '@/components/ui/Skeleton'
import type { ScrapedMetadata, Item } from '@/lib/utils/types'

type Mode  = 'url' | 'manual'
type State = 'idle' | 'loading' | 'confirm' | 'duplicate'

function AddBar() {
  const [mode, setMode]         = useState<Mode>('url')
  const [state, setState]       = useState<State>('idle')
  const [url, setUrl]           = useState('')
  const [metadata, setMetadata] = useState<ScrapedMetadata | null>(null)

  const ingestUrl = useIngestUrl()

  async function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setState('loading')
    try {
      const result = await ingestUrl.mutateAsync(url.trim())
      if ('duplicate' in result) {
        setState('duplicate')
      } else {
        setMetadata(result.metadata)
        setState('confirm')
      }
    } catch {
      setState('idle')
    }
  }

  function handleConfirmed(_item: Item) {
    setUrl('')
    setMetadata(null)
    setState('idle')
  }

  function handleDiscard() {
    setMetadata(null)
    setState('idle')
  }

  function switchMode(m: Mode) {
    setMode(m)
    setState('idle')
    setMetadata(null)
  }

  return (
    <div className="px-6 md:px-12 lg:px-20 pt-6">
      {/* Mode tabs */}
      <div className="flex items-center gap-1 mb-3">
        {(['url', 'manual'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`text-xs px-3 py-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-moss ${
              mode === m
                ? 'bg-moss text-white dark:bg-moss-mid dark:text-forest'
                : 'text-ink-muted dark:text-ink-muted hover:text-moss dark:hover:text-moss-mid'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {mode === 'url' && (
          <div key="url">
            <form onSubmit={handleUrlSubmit} className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="drop a link, plant a seed..."
                disabled={state === 'loading' || state === 'confirm'}
                className="flex-1 px-4 py-2.5 text-sm bg-paper-dark dark:bg-forest-card border border-ink-faint dark:border-moss-ink/30 rounded-r-lg text-ink dark:text-paper placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-moss disabled:opacity-60 font-mono"
              />
              <button
                type="submit"
                disabled={state === 'loading' || state === 'confirm' || !url.trim()}
                className="px-4 py-2.5 text-sm bg-moss text-white rounded hover:bg-moss-dark transition-colors focus:outline-none focus:ring-2 focus:ring-moss disabled:opacity-60"
              >
                plant
              </button>
            </form>

            {state === 'loading' && (
              <div className="mt-3 p-4 bg-paper-dark dark:bg-forest-card border border-ink-faint dark:border-moss-ink/20 rounded-r-lg space-y-2">
                <Skeleton className="w-3/4 h-5" />
                <Skeleton className="w-1/2 h-4" />
                <Skeleton className="w-full h-16" />
              </div>
            )}

            {state === 'duplicate' && (
              <div className="mt-3 px-4 py-2.5 text-sm text-ink-muted dark:text-ink-muted bg-paper-dark dark:bg-forest-card border border-ink-faint dark:border-moss-ink/20 rounded-r-lg flex items-center justify-between">
                <span>already in your garden</span>
                <button
                  onClick={() => { setState('idle'); setUrl('') }}
                  className="text-moss dark:text-moss-mid text-xs hover:underline focus:outline-none"
                >
                  dismiss
                </button>
              </div>
            )}

            <AnimatePresence>
              {state === 'confirm' && metadata && (
                <ConfirmCard
                  key="confirm"
                  metadata={metadata}
                  onConfirm={handleConfirmed}
                  onDiscard={handleDiscard}
                />
              )}
            </AnimatePresence>
          </div>
        )}

        {mode === 'manual' && (
          <div key="manual">
            <ManualEntryForm onSaved={() => switchMode('url')} />
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { AddBar }
