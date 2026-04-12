import type { ItemFilters } from '@/lib/utils/types'

export const keys = {
  items: (filters?: ItemFilters) => ['items', filters] as const,
  item:  (id: number)            => ['items', id] as const,
  tags:  ()                      => ['tags'] as const,
  llm:   ()                      => ['llm', 'status'] as const,
}
