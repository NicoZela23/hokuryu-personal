import type { SourceType } from '@/lib/utils/types'

const codes: Record<string, string> = {
  video:       'VID',
  film:        'FLM',
  book:        'BKS',
  article:     'ART',
  podcast:     'POD',
  music:       'MUS',
  interactive: 'INT',
  event:       'LIV',
  course:      'CRS',
  generic:     'GEN',
}

const colors: Record<string, string> = {
  video:       'text-seed-video       border-seed-video/60',
  film:        'text-seed-film        border-seed-film/60',
  book:        'text-seed-book        border-seed-book/60',
  article:     'text-seed-article     border-seed-article/60',
  podcast:     'text-seed-podcast     border-seed-podcast/60',
  music:       'text-seed-music       border-seed-music/60',
  interactive: 'text-seed-interactive border-seed-interactive/60',
  event:       'text-seed-event       border-seed-event/60',
  course:      'text-seed-course      border-seed-course/60',
  generic:     'text-seed-generic     border-seed-generic/60',
}

type Props = { type: SourceType | string }

function TypeBadge({ type }: Props) {
  const code  = codes[type]  ?? 'GEN'
  const color = colors[type] ?? 'text-seed-generic border-seed-generic/60'

  return (
    <span className={`font-display text-base tracking-widest border px-1.5 leading-none py-0.5 ${color}`}>
      {code}
    </span>
  )
}

export { TypeBadge }
