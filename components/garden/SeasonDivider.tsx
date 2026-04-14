import type { Season } from '@/lib/utils/seasons'

const codes: Record<Season, string> = {
  spring: 'SPR',
  summer: 'SUM',
  autumn: 'AUT',
  winter: 'WIN',
}

function SeasonDivider({ season }: { season: Season }) {
  return (
    <div className="flex items-center gap-4 my-6 px-6 md:px-10 lg:px-12">
      <div className="flex-1 h-px bg-vault-border" />
      <span className="font-display text-xl text-amber glow-amber tracking-widest uppercase">
        ◆ SEASON_{codes[season]} ◆
      </span>
      <div className="flex-1 h-px bg-vault-border" />
    </div>
  )
}

export { SeasonDivider }
