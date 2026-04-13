'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const filters = [
  { label: 'all',      value: undefined },
  { label: 'pending',  value: 'pending' },
  { label: 'consumed', value: 'consumed' },
]

function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('status') ?? undefined

  function setFilter(value: string | undefined) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set('status', value)
    else params.delete('status')
    router.push(`/garden?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-1">
      {filters.map((f) => {
        const active = current === f.value
        return (
          <button
            key={f.label}
            onClick={() => setFilter(f.value)}
            className={`text-xs px-3 py-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-moss ${
              active
                ? 'bg-moss text-white dark:bg-moss-mid dark:text-forest'
                : 'text-ink-muted dark:text-ink-muted hover:text-moss dark:hover:text-moss-mid hover:bg-moss-light dark:hover:bg-moss-ink/30'
            }`}
          >
            {f.label}
          </button>
        )
      })}
    </div>
  )
}

export { FilterBar }
