'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ScrapedMetadata, Item, EnrichedMetadata } from '@/lib/utils/types'

// Enriches an existing saved item: calls /api/ingest/enrich then PATCHes the item.
export function useEnrichItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (item: Item): Promise<{ item: Item }> => {
      // 1. Enrich via LLM
      const enrichRes = await fetch('/api/ingest/enrich', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadata: {
            url:        item.url    ?? '',
            title:      item.title,
            author:     item.author ?? undefined,
            sourceType: item.sourceType,
          },
        }),
      })
      if (!enrichRes.ok) throw new Error('Enrich failed')
      const enrichData = await enrichRes.json()
      if ('unavailable' in enrichData) throw new Error('LLM unavailable')
      if ('error' in enrichData)       throw new Error('LLM error')

      const { enriched: e, provider } = enrichData as { enriched: EnrichedMetadata; provider: string }

      // 2. PATCH item with enriched fields
      const patchRes = await fetch(`/api/items/${item.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:       e.title      || item.title,
          synopsis:    e.synopsis   || null,
          genre:       e.genre      || null,
          mood:        Array.isArray(e.mood)     ? e.mood.join(', ')        : null,
          keywords:    Array.isArray(e.keywords) ? JSON.stringify(e.keywords) : null,
          aiTags:      Array.isArray(e.aiTags)   ? JSON.stringify(e.aiTags)  : null,
          sourceType:  e.sourceType || item.sourceType,
          enriched:    true,
          llmProvider: provider,
        }),
      })
      if (!patchRes.ok) throw new Error('Patch failed')
      return patchRes.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
    onError: (_err, item) => {
      queryClient.invalidateQueries({ queryKey: ['items', item.id] })
    },
  })
}

export type IngestUrlResult =
  | { metadata: ScrapedMetadata }
  | { duplicate: true; item: Item }

export type EnrichResult =
  | { enriched: EnrichedMetadata; provider: string | null; cached: boolean }
  | { unavailable: true }
  | { error: true; metadata: Partial<ScrapedMetadata> }

export function useIngestUrl() {
  return useMutation({
    mutationFn: async (url: string): Promise<IngestUrlResult> => {
      const res = await fetch('/api/ingest/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      if (!res.ok) throw new Error('Failed to ingest URL')
      return res.json()
    },
  })
}

export function useEnrich() {
  return useMutation({
    mutationFn: async (metadata: Partial<ScrapedMetadata>): Promise<EnrichResult> => {
      const res = await fetch('/api/ingest/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata }),
      })
      if (!res.ok) throw new Error('Failed to enrich')
      return res.json()
    },
  })
}

export function useConfirmItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (metadata: Record<string, unknown>): Promise<{ item: Item }> => {
      const res = await fetch('/api/ingest/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata }),
      })
      if (!res.ok) throw new Error('Failed to confirm item')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
}

