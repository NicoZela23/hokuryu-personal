'use client'

type Props = {
  rating:       number | null
  interactive?: boolean
  onChange?:    (rating: number) => void
}

function RatingDots({ rating, interactive = false, onChange }: Props) {
  const bars = [1, 2, 3, 4, 5]

  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating ?? 0} of 5`}>
      {bars.map((bar) => {
        const filled = rating !== null && bar <= rating
        const glowStyle = filled
          ? { animationDelay: `${(bar - 1) * 180}ms` }
          : {}

        if (interactive) {
          return (
            <button
              key={bar}
              onClick={() => onChange?.(bar)}
              aria-label={`Rate ${bar}`}
              style={glowStyle}
              className={`w-3 h-3.5 transition-colors focus:outline-none focus:ring-1 focus:ring-phosphor ${
                filled
                  ? 'bg-phosphor animate-rating-glow'
                  : 'bg-vault-border hover:bg-phosphor-dim'
              }`}
            />
          )
        }
        return (
          <span
            key={bar}
            style={glowStyle}
            className={`inline-block w-3 h-3.5 ${
              filled ? 'bg-phosphor animate-rating-glow' : 'bg-vault-border'
            }`}
          />
        )
      })}
    </div>
  )
}

export { RatingDots }
