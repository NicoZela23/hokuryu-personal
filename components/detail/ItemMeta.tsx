'use client'

import { KeywordPill } from '@/components/ui/KeywordPill'
import { TypeBadge } from '@/components/ui/TypeBadge'
import { formatDate, formatDuration } from '@/lib/utils/format'
import type { Item } from '@/lib/utils/types'

function ItemMeta({ item }: { item: Item }) {
  const moodList = item.mood ? item.mood.split(',').map((m) => m.trim()).filter(Boolean) : []

  let aiTagList: string[] = []
  try { aiTagList = item.aiTags ? JSON.parse(item.aiTags) : [] } catch { aiTagList = [] }

  let keywordList: string[] = []
  try { keywordList = item.keywords ? JSON.parse(item.keywords) : [] } catch { keywordList = [] }

  type Row = { label: string; value: React.ReactNode }
  const rows: Row[] = ([
    { label: 'type',        value: <TypeBadge type={item.sourceType} /> },
    item.genre       ? { label: 'genre',       value: <span>{item.genre}</span> } : null,
    item.recommender ? { label: 'from',        value: <span className="text-moss dark:text-moss-mid font-medium">{item.recommender}</span> } : null,
    item.createdAt   ? { label: 'added',       value: <span>{formatDate(item.createdAt)}</span> } : null,
    item.consumedAt  ? { label: 'consumed',    value: <span>{formatDate(item.consumedAt)}</span> } : null,
    item.duration    ? { label: 'duration',    value: <span>{formatDuration(item.duration)}</span> } : null,
    item.llmProvider ? { label: 'enriched by', value: <span className="text-ink-muted dark:text-ink-muted">{item.llmProvider}</span> } : null,
  ] as (Row | null)[]).filter((r): r is Row => r !== null)

  return (
    <div className="space-y-5">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        {rows.map(({ label, value }) => (
          <div key={label} className="contents">
            <dt className="text-ink-muted dark:text-ink-muted">{label}</dt>
            <dd className="text-ink dark:text-paper">{value}</dd>
          </div>
        ))}
      </dl>

      {moodList.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {moodList.map((m) => (
            <span
              key={m}
              className="text-xs px-2.5 py-1 rounded-full bg-moss-light dark:bg-moss-ink/30 text-moss-dark dark:text-moss-mid"
            >
              {m}
            </span>
          ))}
        </div>
      )}

      {aiTagList.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {aiTagList.map((tag: string) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded bg-ink-faint/60 dark:bg-moss-ink/20 text-ink-muted dark:text-ink-muted"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {keywordList.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-ink-muted dark:text-ink-muted uppercase tracking-wider">
            explore
          </p>
          <div className="flex flex-wrap gap-2">
            {keywordList.map((kw: string) => (
              <KeywordPill key={kw} keyword={kw} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { ItemMeta }
