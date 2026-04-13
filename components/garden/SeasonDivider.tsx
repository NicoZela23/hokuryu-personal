import type { Season } from '@/lib/utils/seasons'

const icons: Record<Season, string> = {
  spring: '❧',
  summer: '✦',
  autumn: '⁂',
  winter: '※',
}

function SeasonDivider({ season }: { season: Season }) {
  return (
    <div className="flex items-center gap-4 my-8 px-6 md:px-12 lg:px-20">
      <div className="flex-1 h-px bg-ink-faint dark:bg-moss-ink/30" />
      <span className="text-xs text-ink-muted dark:text-ink-muted tracking-widest uppercase flex items-center gap-2">
        <span>{icons[season]}</span>
        {season}
        <span>{icons[season]}</span>
      </span>
      <div className="flex-1 h-px bg-ink-faint dark:bg-moss-ink/30" />
    </div>
  )
}

export { SeasonDivider }
