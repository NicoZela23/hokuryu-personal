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
  const shouldReduce  = useReducedMotion()
  const confirm       = useConfirmItem()
  const enrich        = useEnrich()
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

  const inputClass = 'w-full bg-vault font-mono text-sm text-phosphor border border-vault-border px-3 py-2 focus:outline-none focus:border-phosphor placeholder:text-phosphor-dim transition-colors'

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="mt-3 border border-vault-border bg-vault-panel p-4 space-y-4"
    >
      <p className="font-display text-lg text-phosphor-dim tracking-widest border-b border-vault-border pb-2">
        ■ CONFIRM NEW RECORD
      </p>

      {metadata.thumbnail && (
        <div className="relative w-full h-36 overflow-hidden bg-vault-border/20">
          <Image src={metadata.thumbnail} alt="" fill className="object-cover opacity-70" unoptimized />
          <div className="absolute inset-0 bg-gradient-to-t from-vault-panel/80 to-transparent" />
        </div>
      )}

      <div className="space-y-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="title"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="AUTHOR"
            className={inputClass}
          />
          <select
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value as typeof sourceType)}
            className={inputClass}
          >
            {SOURCE_TYPES.map((t) => (
              <option key={t} value={t}>{t.toUpperCase()}</option>
            ))}
          </select>
        </div>
        <input
          value={recommender}
          onChange={(e) => setRecommender(e.target.value)}
          placeholder="RECOMMENDED BY"
          className={inputClass}
        />
      </div>

      {/* Enriched preview */}
      {isEnriching ? (
        <div className="space-y-2 border-t border-vault-border/50 pt-3">
          <p className="font-display text-base text-phosphor-dim tracking-widest animate-blink">
            ◌ ENRICHMENT IN PROGRESS...
          </p>
          <Skeleton className="w-full h-14" />
          <div className="flex gap-2">
            <Skeleton className="w-20 h-6" />
            <Skeleton className="w-24 h-6" />
          </div>
        </div>
      ) : enriched ? (
        <div className="space-y-3 border-t border-vault-border/50 pt-3">
          <p className="font-display text-base text-phosphor tracking-widest">◈ ENRICHMENT COMPLETE</p>
          {synopsis && (
            <p className="font-mono text-xs text-cream-mid leading-relaxed border-l-2 border-vault-border pl-3">
              {synopsis}
            </p>
          )}
          {genre && (
            <span className="font-display text-base text-phosphor-dim tracking-widest">{genre.toUpperCase()}</span>
          )}
          {mood && (
            <div className="flex flex-wrap gap-1">
              {mood.split(',').map((m) => (
                <span key={m.trim()} className="font-display text-base text-phosphor border border-vault-border px-2 py-0 tracking-widest">
                  {m.trim().toUpperCase()}
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

      <div className="flex items-center gap-3 pt-2 border-t border-vault-border/50 flex-wrap">
        <button
          onClick={handleConfirm}
          disabled={confirm.isPending}
          className="font-display text-xl tracking-widest border border-phosphor text-phosphor px-4 py-1 hover:bg-vault-active transition-colors focus:outline-none disabled:opacity-60"
        >
          {confirm.isPending ? '◌ PLANTING...' : '▸ PLANT SEED'}
        </button>

        {llm?.available && !enriched && (
          <button
            onClick={handleEnrich}
            disabled={isEnriching}
            className="font-display text-xl tracking-widest border border-amber/50 text-amber px-4 py-1 hover:border-amber hover:bg-amber-faint transition-colors focus:outline-none disabled:opacity-60"
          >
            {isEnriching ? '◌ ENRICHING...' : '◈ ENRICH'}
          </button>
        )}

        <button
          onClick={onDiscard}
          className="font-display text-xl tracking-widest text-phosphor-dim hover:text-danger transition-colors focus:outline-none ml-auto"
        >
          [DISCARD]
        </button>
      </div>
    </motion.div>
  )
}

export { ConfirmCard }
