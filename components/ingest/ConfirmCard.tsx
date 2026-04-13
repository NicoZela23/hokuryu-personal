'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { confirmCardVariants } from '@/lib/animations'
import { Skeleton } from '@/components/ui/Skeleton'
import { KeywordPill } from '@/components/ui/KeywordPill'
import { useConfirmItem, useEnrich } from '@/lib/query/hooks/useIngest'
import { useLLMStatus } from '@/lib/query/hooks/useTags'
import { SOURCE_TYPES } from '@/lib/utils/types'
import type { ScrapedMetadata, Item } from '@/lib/utils/types'

type Props = {
  metadata:  ScrapedMetadata
  onConfirm: (item: Item) => void
  onDiscard: () => void
}

function ConfirmCard({ metadata, onConfirm, onDiscard }: Props) {
  const shouldReduce = useReducedMotion()
  const confirm = useConfirmItem()
  const enrich  = useEnrich()
  const { data: llm } = useLLMStatus()

  const [title, setTitle]             = useState(metadata.title)
  const [author, setAuthor]           = useState(metadata.author ?? '')
  const [sourceType, setSourceType]   = useState(metadata.sourceType)
  const [recommender, setRecommender] = useState('')
  const [synopsis, setSynopsis]       = useState('')
  const [genre, setGenre]             = useState('')
  const [mood, setMood]               = useState('')
  const [aiTags, setAiTags]           = useState('')
  const [keywords, setKeywords]       = useState<string[]>([])
  const [llmProvider, setLlmProvider] = useState<string | null>(null)
  const [enriched, setEnriched]       = useState(false)

  const variants    = shouldReduce ? { hidden: {}, visible: {}, exit: {} } : confirmCardVariants
  const isEnriching = enrich.isPending

  async function handleEnrich() {
    const result = await enrich.mutateAsync(metadata)
    if ('enriched' in result) {
      setTitle(result.enriched.title || title)
      setSynopsis(result.enriched.synopsis || '')
      setGenre(result.enriched.genre || '')
      setMood(Array.isArray(result.enriched.mood) ? result.enriched.mood.join(', ') : '')
      setAiTags(Array.isArray(result.enriched.aiTags) ? JSON.stringify(result.enriched.aiTags) : '')
      setKeywords(Array.isArray(result.enriched.keywords) ? result.enriched.keywords : [])
      if (result.enriched.sourceType) setSourceType(result.enriched.sourceType as typeof sourceType)
      setLlmProvider(result.provider)
      setEnriched(true)
    }
  }

  async function handleConfirm() {
    const result = await confirm.mutateAsync({
      url:         metadata.url || null,
      title,
      author:      author || null,
      sourceType,
      recommender: recommender || null,
      synopsis:    synopsis || null,
      genre:       genre || null,
      mood:        mood || null,
      keywords:    keywords.length > 0 ? JSON.stringify(keywords) : null,
      thumbnail:   metadata.thumbnail || null,
      duration:    null,
      aiTags:      aiTags || null,
      llmProvider: llmProvider || null,
      enriched,
    })
    onConfirm(result.item)
  }

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="mt-3 p-4 bg-paper-dark dark:bg-forest-card border border-ink-faint dark:border-moss-ink/20 rounded-r-lg space-y-3"
    >
      {metadata.thumbnail && (
        <div className="relative w-full h-40 rounded overflow-hidden bg-ink-faint/30 dark:bg-moss-ink/20">
          <Image src={metadata.thumbnail} alt="" fill className="object-cover" unoptimized />
        </div>
      )}

      <div className="space-y-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-sm font-medium bg-transparent border-b border-ink-faint dark:border-moss-ink/30 text-ink dark:text-paper pb-1 focus:outline-none focus:border-moss"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="author"
            className="text-xs px-2 py-1.5 bg-paper dark:bg-forest border border-ink-faint dark:border-moss-ink/30 rounded text-ink dark:text-paper placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-moss"
          />
          <select
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value as typeof sourceType)}
            className="text-xs px-2 py-1.5 bg-paper dark:bg-forest border border-ink-faint dark:border-moss-ink/30 rounded text-ink dark:text-paper focus:outline-none focus:ring-2 focus:ring-moss"
          >
            {SOURCE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <input
          value={recommender}
          onChange={(e) => setRecommender(e.target.value)}
          placeholder="recommended by"
          className="w-full text-xs px-2 py-1.5 bg-paper dark:bg-forest border border-ink-faint dark:border-moss-ink/30 rounded text-ink dark:text-paper placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-moss"
        />
      </div>

      {/* Enriched preview */}
      {isEnriching ? (
        <div className="space-y-2">
          <Skeleton className="w-full h-16" />
          <div className="flex gap-2">
            <Skeleton className="w-20 h-6 rounded-full" />
            <Skeleton className="w-24 h-6 rounded-full" />
            <Skeleton className="w-16 h-6 rounded-full" />
          </div>
        </div>
      ) : enriched ? (
        <div className="space-y-3">
          {synopsis && (
            <p className="text-xs text-ink dark:text-paper/80 leading-relaxed">{synopsis}</p>
          )}
          {genre && (
            <span className="text-xs text-ink-muted dark:text-ink-muted">{genre}</span>
          )}
          {mood && (
            <div className="flex flex-wrap gap-1">
              {mood.split(',').map((m) => (
                <span key={m.trim()} className="text-xs px-2 py-0.5 rounded-full bg-moss-light dark:bg-moss-ink/30 text-moss dark:text-moss-mid">
                  {m.trim()}
                </span>
              ))}
            </div>
          )}
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {keywords.map((kw) => (
                <KeywordPill key={kw} keyword={kw} />
              ))}
            </div>
          )}
        </div>
      ) : null}

      <div className="flex items-center gap-2 pt-1 flex-wrap">
        <button
          onClick={handleConfirm}
          disabled={confirm.isPending}
          className="text-sm px-4 py-2 bg-moss text-white rounded hover:bg-moss-dark transition-colors focus:outline-none focus:ring-2 focus:ring-moss disabled:opacity-60"
        >
          {confirm.isPending ? 'planting...' : 'plant this seed'}
        </button>

        {llm?.available && !enriched && (
          <button
            onClick={handleEnrich}
            disabled={isEnriching}
            className="text-sm px-3 py-2 border border-moss-mid dark:border-moss-mid text-moss dark:text-moss-mid rounded hover:bg-moss-light dark:hover:bg-moss-ink/30 transition-colors focus:outline-none focus:ring-2 focus:ring-moss disabled:opacity-60"
          >
            {isEnriching ? 'enriching...' : 'enrich with AI'}
          </button>
        )}

        <button
          onClick={onDiscard}
          className="text-sm text-ink-muted dark:text-ink-muted hover:text-ink dark:hover:text-paper transition-colors focus:outline-none focus:ring-2 focus:ring-moss rounded ml-auto"
        >
          discard
        </button>
      </div>
    </motion.div>
  )
}

export { ConfirmCard }
