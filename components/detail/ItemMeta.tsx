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
    { label: 'TYPE',        value: <TypeBadge type={item.sourceType} /> },
    item.genre       ? { label: 'GENRE',       value: <span className="text-phosphor-mid">{item.genre.toUpperCase()}</span> } : null,
    item.recommender ? { label: 'SOURCE',       value: <span className="text-amber">{item.recommender}</span> } : null,
    item.createdAt   ? { label: 'LOGGED',       value: <span>{formatDate(item.createdAt)}</span> } : null,
    item.consumedAt  ? { label: 'COMPLETED',     value: <span>{formatDate(item.consumedAt)}</span> } : null,
    item.duration    ? { label: 'DURATION',     value: <span>{formatDuration(item.duration)}</span> } : null,
    item.llmProvider ? { label: 'ENRICHED BY',  value: <span className="text-phosphor-dim">{item.llmProvider.toUpperCase()}</span> } : null,
  ] as (Row | null)[]).filter((r): r is Row => r !== null)

  return (
    <div className="space-y-5 border border-vault-border bg-vault-panel p-4">
      <p className="font-display text-lg text-phosphor-dim tracking-widest border-b border-vault-border pb-2">
        ■ RECORD DATA
      </p>

      <dl className="space-y-1.5">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-baseline gap-3">
            <dt className="font-display text-base text-phosphor-dim tracking-widest w-28 shrink-0">{label}</dt>
            <dd className="font-mono text-sm text-cream">{value}</dd>
          </div>
        ))}
      </dl>

      {moodList.length > 0 && (
        <div>
          <p className="font-display text-base text-phosphor-dim tracking-widest mb-2">MOOD</p>
          <div className="flex flex-wrap gap-1.5">
            {moodList.map((m) => (
              <span
                key={m}
                className="font-display text-base tracking-widest text-phosphor border border-vault-border px-2 py-0 leading-snug"
              >
                {m.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      )}

      {aiTagList.length > 0 && (
        <div>
          <p className="font-display text-base text-phosphor-dim tracking-widest mb-2">AI TAGS</p>
          <div className="flex flex-wrap gap-1.5">
            {aiTagList.map((tag: string) => (
              <span
                key={tag}
                className="font-mono text-xs text-phosphor-dim border border-vault-border/50 px-2 py-0.5"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {keywordList.length > 0 && (
        <div>
          <p className="font-display text-base text-phosphor-dim tracking-widest mb-2">INTEL KEYWORDS</p>
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
