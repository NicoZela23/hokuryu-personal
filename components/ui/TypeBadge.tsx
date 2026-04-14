import type { SourceType } from '@/lib/utils/types'

const codes: Record<string, string> = {
  youtube:   'VID',
  spotify:   'MUS',
  tiktok:    'CLV',
  instagram: 'IMG',
  x:         'PST',
  article:   'ART',
  podcast:   'POD',
  film:      'FLM',
  book:      'BKS',
  concert:   'LIV',
  generic:   'GEN',
}

const colors: Record<string, string> = {
  youtube:   'text-seed-youtube   border-seed-youtube/60',
  spotify:   'text-seed-spotify   border-seed-spotify/60',
  tiktok:    'text-seed-tiktok    border-seed-tiktok/60',
  instagram: 'text-seed-instagram border-seed-instagram/60',
  x:         'text-seed-x        border-seed-x/60',
  article:   'text-seed-article   border-seed-article/60',
  podcast:   'text-seed-podcast   border-seed-podcast/60',
  film:      'text-seed-film      border-seed-film/60',
  book:      'text-seed-book      border-seed-book/60',
  concert:   'text-seed-concert   border-seed-concert/60',
  generic:   'text-seed-generic   border-seed-generic/60',
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
