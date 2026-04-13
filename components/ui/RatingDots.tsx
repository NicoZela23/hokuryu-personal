'use client'

type Props = {
  rating:      number | null
  interactive?: boolean
  onChange?:   (rating: number) => void
}

function RatingDots({ rating, interactive = false, onChange }: Props) {
  return (
    <div className="flex items-center gap-1" aria-label={`Rating: ${rating ?? 0} of 5`}>
      {[1, 2, 3, 4, 5].map((dot) => {
        const filled = rating !== null && dot <= rating
        if (interactive) {
          return (
            <button
              key={dot}
              onClick={() => onChange?.(dot)}
              aria-label={`Rate ${dot}`}
              className={`w-2 h-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-moss ${
                filled
                  ? 'bg-moss dark:bg-moss-mid'
                  : 'bg-ink-faint dark:bg-moss-ink/40 hover:bg-moss/50'
              }`}
            />
          )
        }
        return (
          <span
            key={dot}
            className={`w-2 h-2 rounded-full ${
              filled ? 'bg-moss dark:bg-moss-mid' : 'bg-ink-faint dark:bg-moss-ink/40'
            }`}
          />
        )
      })}
    </div>
  )
}

export { RatingDots }
