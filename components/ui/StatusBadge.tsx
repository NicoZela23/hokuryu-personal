function StatusBadge({ status }: { status: string | null }) {
  if (status === 'consumed') return null
  return (
    <span className="font-display text-base tracking-widest text-amber border border-amber/60 px-1.5 py-0 leading-none glow-amber">
      ACTIVE
    </span>
  )
}

export { StatusBadge }
