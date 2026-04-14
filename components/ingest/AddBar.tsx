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
    <div className="px-6 md:px-10 lg:px-12 pt-5 pb-2">
      {/* Terminal prompt header */}
      <div className="border border-vault-border bg-vault-panel p-4">
        <p className="font-display text-xl text-phosphor-dim tracking-widest mb-3 border-b border-vault-border pb-2">
          ■ INPUT TERMINAL
        </p>

        {/* Mode tabs */}
        <div className="flex items-center gap-1 mb-3">
          {(['url', 'manual'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`font-display text-lg tracking-widest px-3 py-0.5 border transition-colors focus:outline-none ${
                mode === m
                  ? 'border-phosphor text-phosphor bg-vault-active'
                  : 'border-vault-border text-phosphor-dim hover:border-phosphor-dim hover:text-phosphor'
              }`}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {mode === 'url' && (
            <div key="url">
              <form onSubmit={handleUrlSubmit} className="flex gap-2">
                <div className="flex-1 flex items-center border border-vault-border focus-within:border-phosphor transition-colors">
                  <span className="font-display text-xl text-phosphor-dim px-3 select-none">&gt;_</span>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="paste url to plant a seed..."
                    disabled={state === 'loading' || state === 'confirm'}
                    className="flex-1 py-2.5 bg-transparent font-mono text-sm text-phosphor focus:outline-none disabled:opacity-60 pr-3"
                  />
                </div>
                <button
                  type="submit"
                  disabled={state === 'loading' || state === 'confirm' || !url.trim()}
                  className="font-display text-xl tracking-widest px-5 py-2 bg-phosphor text-vault hover:bg-phosphor-bright transition-colors focus:outline-none disabled:opacity-60"
                >
                  PLANT
                </button>
              </form>

              {state === 'loading' && (
                <div className="mt-3 p-4 border border-vault-border space-y-2">
                  <p className="font-display text-base text-phosphor-dim tracking-widest animate-blink">
                    ◌ SCANNING TARGET URL...
                  </p>
                  <Skeleton className="w-3/4 h-4" />
                  <Skeleton className="w-1/2 h-4" />
                  <Skeleton className="w-full h-14" />
                </div>
              )}

              {state === 'duplicate' && (
                <div className="mt-3 px-4 py-3 border border-amber/40 bg-amber-faint flex items-center justify-between">
                  <span className="font-display text-lg text-amber tracking-widest">
                    ⚠ RECORD ALREADY EXISTS IN ARCHIVE
                  </span>
                  <button
                    onClick={() => { setState('idle'); setUrl('') }}
                    className="font-display text-base text-amber/70 hover:text-amber tracking-widest focus:outline-none"
                  >
                    [DISMISS]
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
    </div>
  )
}

export { AddBar }
