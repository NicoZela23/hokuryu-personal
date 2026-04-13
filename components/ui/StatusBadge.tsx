function StatusBadge({ status }: { status: string | null }) {
  if (status === 'consumed') return null
  return (
    <span className="text-xs px-1.5 py-0.5 rounded-full border border-moss/40 text-moss dark:text-moss-mid dark:border-moss-mid/40">
      growing
    </span>
  )
}

export { StatusBadge }
