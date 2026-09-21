export function formatTable(data: Record<string, any>[], columns: string[]): string {
  if (data.length === 0) return ''

  const widths = columns.map(col =>
    Math.max(col.length, ...data.map(row => String(row[col] ?? '').length))
  )

  const header = columns.map((col, i) => col.padEnd(widths[i])).join('  ')
  const separator = widths.map(w => '-'.repeat(w)).join('  ')
  const rows = data.map(row =>
    columns.map((col, i) => String(row[col] ?? '').padEnd(widths[i])).join('  ')
  )

  return [header, separator, ...rows].join('\n')
}

export function formatDuration(ms: number): string {
  if (ms < 0) {
    return '0 ms'
  }

  if (ms < 1000) {
    return `${Math.round(ms)} ms`
  }

  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    const remainingHours = hours % 24
    return remainingHours > 0 ? `${days} d ${remainingHours} h` : `${days} d`
  }

  if (hours > 0) {
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours} h ${remainingMinutes} min` : `${hours} h`
  }

  if (minutes > 0) {
    const remainingSeconds = seconds % 60
    return remainingSeconds > 0 ? `${minutes} min ${remainingSeconds} s` : `${minutes} min`
  }

  return `${seconds} s`
}
