import type { SourceType } from '@/lib/utils/types'

const labels: Record<string, string> = {
  youtube:   'YouTube',
  spotify:   'Spotify',
  tiktok:    'TikTok',
  instagram: 'Instagram',
  x:         'X',
  article:   'Article',
  podcast:   'Podcast',
  film:      'Film',
  book:      'Book',
  concert:   'Concert',
  generic:   'Link',
}

const textColors: Record<string, string> = {
  youtube:   'text-seed-youtube',
  spotify:   'text-seed-spotify',
  tiktok:    'text-seed-tiktok',
  instagram: 'text-seed-instagram',
  x:         'text-seed-generic',
  article:   'text-seed-article',
  podcast:   'text-seed-podcast',
  film:      'text-seed-film',
  book:      'text-seed-book',
  concert:   'text-seed-concert',
  generic:   'text-seed-generic',
}

type Props = { type: SourceType | string }

function TypeBadge({ type }: Props) {
  const label = labels[type] ?? type
  const color = textColors[type] ?? 'text-seed-generic'

  return (
    <span className={`text-xs font-medium px-1.5 py-0.5 rounded bg-ink-faint/50 dark:bg-moss-ink/30 ${color}`}>
      {label}
    </span>
  )
}

export { TypeBadge }
