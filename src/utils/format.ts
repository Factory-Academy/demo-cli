export function formatTable(data: Record<string, any>[], columns: string[], compact: boolean = false): string {
  if (data.length === 0) return ''

  if (compact) {
    return data.map(row =>
      columns.map(col => String(row[col] ?? '')).join(' | ')
    ).join('\n')
  }

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
