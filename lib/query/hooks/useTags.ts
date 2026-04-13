'use client'

import { useQuery } from '@tanstack/react-query'
import { keys } from '../keys'
import type { Tag } from '@/lib/utils/types'

export function useTags() {
  return useQuery({
    queryKey: keys.tags(),
    queryFn: async (): Promise<{ tags: Tag[] }> => {
      const res = await fetch('/api/tags')
      if (!res.ok) throw new Error('Failed to fetch tags')
      return res.json()
    },
  })
}

export function useLLMStatus() {
  return useQuery({
    queryKey: keys.llm(),
    queryFn: async (): Promise<{ available: boolean; providers: string[]; active: string | null }> => {
      const res = await fetch('/api/llm/status')
      if (!res.ok) return { available: false, providers: [], active: null }
      return res.json()
    },
    staleTime: 1000 * 60 * 10,
  })
}
