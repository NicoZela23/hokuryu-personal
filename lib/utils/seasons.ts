export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

export function getSeason(date: Date): Season {
  const month = date.getMonth() + 1 // 1-12
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}

export function getSeasonLabel(season: Season): string {
  const labels: Record<Season, string> = {
    spring: 'spring',
    summer: 'summer',
    autumn: 'autumn',
    winter: 'winter',
  }
  return labels[season]
}

export function getMonthLabel(date: Date): string {
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' })
}

export interface MonthGroup<T> {
  month:  string
  season: Season
  year:   number
  items:  T[]
}

export function groupByMonth<T extends { createdAt: string | null }>(
  items: T[],
): MonthGroup<T>[] {
  const map = new Map<string, MonthGroup<T>>()

  for (const item of items) {
    const date = item.createdAt ? new Date(item.createdAt) : new Date()
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    if (!map.has(key)) {
      map.set(key, {
        month:  getMonthLabel(date),
        season: getSeason(date),
        year:   date.getFullYear(),
        items:  [],
      })
    }
    map.get(key)!.items.push(item)
  }

  // Newest first
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([, v]) => v)
}
