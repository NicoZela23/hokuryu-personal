'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { keys } from '../keys'
import type { Item, ItemFilters } from '@/lib/utils/types'

export function useItems(filters?: ItemFilters, options?: { initialData?: { items: Item[] } }) {
  return useQuery({
    queryKey: keys.items(filters),
    initialData: options?.initialData,
    queryFn: async (): Promise<{ items: Item[] }> => {
      const params = new URLSearchParams()
      if (filters?.status)      params.set('status', filters.status)
      if (filters?.type)        params.set('type', filters.type)
      if (filters?.mood)        params.set('mood', filters.mood)
      if (filters?.genre)       params.set('genre', filters.genre)
      if (filters?.recommender) params.set('recommender', filters.recommender)
      if (filters?.q)           params.set('q', filters.q)
      const res = await fetch(`/api/items?${params}`)
      if (!res.ok) throw new Error('Failed to fetch items')
      return res.json()
    },
  })
}

export function useItem(id: number) {
  return useQuery({
    queryKey: keys.item(id),
    queryFn: async (): Promise<{ item: Item & { tags: { id: number; label: string }[] } }> => {
      const res = await fetch(`/api/items/${id}`)
      if (!res.ok) throw new Error('Failed to fetch item')
      return res.json()
    },
  })
}

export function useUpdateItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, patch }: { id: number; patch: Partial<Item> }): Promise<{ item: Item }> => {
      const res = await fetch(`/api/items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      if (!res.ok) throw new Error('Failed to update item')
      return res.json()
    },
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: ['items'] })
      const prev = queryClient.getQueryData(keys.items())
      queryClient.setQueryData(keys.items(), (old: { items: Item[] } | undefined) => {
        if (!old) return old
        return { items: old.items.map((item) => (item.id === id ? { ...item, ...patch } : item)) }
      })
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(keys.items(), ctx.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
}

export function useDeleteItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number): Promise<{ success: true }> => {
      const res = await fetch(`/api/items/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete item')
      return res.json()
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['items'] })
      const prev = queryClient.getQueryData(keys.items())
      queryClient.setQueryData(keys.items(), (old: { items: Item[] } | undefined) => {
        if (!old) return old
        return { items: old.items.filter((item) => item.id !== id) }
      })
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(keys.items(), ctx.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
}
