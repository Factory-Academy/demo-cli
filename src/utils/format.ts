export function formatTable(data: Record<string, any>[], columns: string[], compact = false): string {
  if (!data || data.length === 0) return ''
  if (!columns || columns.length === 0) return ''

  const widths = columns.map(col =>
    Math.max(col.length, ...data.map(row => String(row[col] ?? '').length))
  )

  const header = columns.map((col, i) => col.padEnd(widths[i])).join('  ')
  const rows = data.map(row =>
    columns.map((col, i) => String(row[col] ?? '').padEnd(widths[i])).join('  ')
  )

  if (compact) {
    return [header, ...rows].join('\n')
  }

  const separator = widths.map(w => '-'.repeat(w)).join('  ')
  return [header, separator, ...rows].join('\n')
}
