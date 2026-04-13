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

  const panelVariants = shouldReduce
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
        className="text-xs px-2.5 py-1 rounded-full border border-moss/50 dark:border-moss-mid/50 text-moss dark:text-moss-mid hover:bg-moss-light dark:hover:bg-moss-ink/30 transition-colors focus:outline-none focus:ring-2 focus:ring-moss"
      >
        {keyword}
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
              className="fixed inset-0 z-40 bg-ink/20 dark:bg-ink/50 backdrop-blur-sm"
            />

            <motion.aside
              key="panel"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-paper dark:bg-forest-card border-l border-ink-faint dark:border-moss-ink/30 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-ink-faint dark:border-moss-ink/20 shrink-0">
                <span className="text-sm font-medium text-ink dark:text-paper">{keyword}</span>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="close"
                  className="text-xl leading-none text-ink-muted hover:text-ink dark:hover:text-paper transition-colors focus:outline-none focus:ring-2 focus:ring-moss rounded"
                >
                  ×
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">

                {loading && (
                  <div className="space-y-3">
                    <Skeleton className="w-full h-40 rounded-lg" />
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-3/4 h-4" />
                  </div>
                )}

                {!loading && error && (
                  <p className="text-sm text-ink-muted dark:text-ink-muted">
                    Could not load results for this keyword.
                  </p>
                )}

                {!loading && result && (
                  <>
                    {/* Abstract card */}
                    {result.abstract ? (
                      <div className="space-y-3">
                        {result.image && (
                          <img
                            src={result.image}
                            alt=""
                            className="w-full h-40 object-cover rounded-lg bg-ink-faint/20 dark:bg-moss-ink/20"
                          />
                        )}
                        <p className="text-sm text-ink dark:text-paper/90 leading-relaxed">
                          {result.abstract}
                        </p>
                        {result.source && (
                          <a
                            href={result.source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-ink-muted dark:text-ink-muted hover:text-moss dark:hover:text-moss-mid transition-colors"
                          >
                            {result.sourceName || 'source'} ↗
                          </a>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-ink-muted dark:text-ink-muted">
                        No summary found for this keyword.
                      </p>
                    )}

                    {/* Related topics */}
                    {result.related.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-ink-muted dark:text-ink-muted uppercase tracking-wider">
                          related
                        </p>
                        {result.related.map((r, i) => (
                          <a
                            key={i}
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-3 py-2.5 rounded-lg bg-paper-dark dark:bg-forest border border-ink-faint dark:border-moss-ink/20 text-xs text-ink dark:text-paper/80 hover:border-moss dark:hover:border-moss-mid transition-colors leading-relaxed"
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
