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
        if (interactive) {
          return (
            <button
              key={bar}
              onClick={() => onChange?.(bar)}
              aria-label={`Rate ${bar}`}
              className={`w-3 h-3.5 transition-all focus:outline-none focus:ring-1 focus:ring-phosphor ${
                filled
                  ? 'bg-phosphor shadow-glow-sm'
                  : 'bg-vault-border hover:bg-phosphor-dim'
              }`}
            />
          )
        }
        return (
          <span
            key={bar}
            className={`inline-block w-3 h-3.5 ${
              filled ? 'bg-phosphor' : 'bg-vault-border'
            }`}
          />
        )
      })}
    </div>
  )
}

export { RatingDots }
