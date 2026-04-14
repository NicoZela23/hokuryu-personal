'use client'

import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { keywordPanelVariants } from '@/lib/animations'
import { Skeleton } from '@/components/ui/Skeleton'
import type { SearchResult } from '@/lib/utils/types'

type Props = { keyword: string }

function KeywordPill({ keyword }: Props) {
  const [open, setOpen]       = useState(false)
  const [result, setResult]   = useState<SearchResult | null>(null)
  const [error, setError]     = useState(false)
  const [loading, setLoading] = useState(false)
  const shouldReduce          = useReducedMotion()

  const panelVars = shouldReduce
    ? { hidden: {}, visible: {}, exit: {} }
    : keywordPanelVariants

  async function handleOpen() {
    if (open) { setOpen(false); return }
    setOpen(true)
    if (result || error) return
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(keyword)}`)
      if (!res.ok) throw new Error('failed')
      setResult(await res.json())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="font-display text-base tracking-widest text-amber border border-amber/50 px-2 py-0 leading-snug hover:border-amber hover:text-amber-bright hover:glow-amber transition-colors focus:outline-none"
      >
        &gt; {keyword}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-vault/70"
            />

            <motion.aside
              key="panel"
              variants={panelVars}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-vault-panel border-l border-vault-border flex flex-col"
              style={{ boxShadow: '-4px 0 24px rgba(0,0,0,0.8)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-vault-border shrink-0">
                <div>
                  <p className="font-display text-xs text-phosphor-dim tracking-widest">INTEL QUERY</p>
                  <span className="font-display text-2xl text-phosphor glow tracking-wider">{keyword.toUpperCase()}</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="close"
                  className="font-display text-2xl text-phosphor-dim hover:text-danger transition-colors focus:outline-none"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">

                {loading && (
                  <div className="space-y-3">
                    <Skeleton className="w-full h-32" />
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-3/4 h-4" />
                  </div>
                )}

                {!loading && error && (
                  <p className="font-mono text-sm text-danger">
                    &gt; ERROR: NO RECORDS FOUND FOR THIS QUERY.
                  </p>
                )}

                {!loading && result && (
                  <>
                    {result.abstract ? (
                      <div className="space-y-3">
                        {result.image && (
                          <img
                            src={result.image}
                            alt=""
                            className="w-full h-36 object-cover bg-vault-border/30"
                          />
                        )}
                        <p className="font-mono text-sm text-cream-mid leading-relaxed">
                          {result.abstract}
                        </p>
                        {result.source && (
                          <a
                            href={result.source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-display text-base text-amber tracking-wider hover:glow-amber transition-all"
                          >
                            &gt; SOURCE: {result.sourceName || 'LINK'} ↗
                          </a>
                        )}
                      </div>
                    ) : (
                      <p className="font-mono text-sm text-phosphor-dim">
                        &gt; NO INTELLIGENCE DATA AVAILABLE.
                      </p>
                    )}

                    {result.related.length > 0 && (
                      <div className="space-y-2">
                        <p className="font-display text-lg text-phosphor-dim tracking-widest">
                          RELATED ENTRIES
                        </p>
                        {result.related.map((r, i) => (
                          <a
                            key={i}
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-3 py-2 border border-vault-border text-sm text-cream-mid font-mono hover:border-phosphor hover:text-cream transition-colors leading-relaxed"
                          >
                            {r.text}
                          </a>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export { KeywordPill }
