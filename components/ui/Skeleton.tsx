type Props = {
  className?: string
  lines?:     number
}

function Skeleton({ className = '', lines = 1 }: Props) {
  if (lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`h-4 bg-ink-faint dark:bg-moss-ink/40 rounded animate-pulse ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
          />
        ))}
      </div>
    )
  }
  return (
    <div className={`h-4 bg-ink-faint dark:bg-moss-ink/40 rounded animate-pulse ${className}`} />
  )
}

export { Skeleton }
