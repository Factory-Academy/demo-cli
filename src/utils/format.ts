export function formatTable(data: Record<string, any>[], columns: string[]): string {
  if (data.length === 0 || columns.length === 0) return ''

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
  if (!isFinite(ms)) return 'N/A'
  if (ms === 0) return '0ms'
  if (ms < 0) return '-' + formatDuration(-ms)

  const rounded = Math.round(ms)
  if (rounded === 0) return '<1ms'

  const units = [
    { label: 'd', value: 86400000 },
    { label: 'h', value: 3600000 },
    { label: 'm', value: 60000 },
    { label: 's', value: 1000 },
    { label: 'ms', value: 1 },
  ]

  const parts: string[] = []
  let remaining = rounded

  for (const unit of units) {
    if (remaining >= unit.value) {
      const count = Math.floor(remaining / unit.value)
      parts.push(`${count}${unit.label}`)
      remaining -= count * unit.value
    }
  }

  return parts.slice(0, 2).join(' ')
}
