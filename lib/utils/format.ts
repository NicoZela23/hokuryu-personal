export function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDuration(seconds: string | null): string {
  if (!seconds) return ''
  const s = parseInt(seconds, 10)
  if (isNaN(s)) return seconds
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${m}:${String(sec).padStart(2, '0')}`
}

export function truncate(text: string | null, length: number): string {
  if (!text) return ''
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}
