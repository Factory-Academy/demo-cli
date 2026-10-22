export function maxNumber(values: number[], fallback = 0): number {
  return values.reduce((max, value) => Math.max(max, value), fallback)
}

export function formatTable(data: Record<string, any>[], columns: string[]): string {
  if (data.length === 0) return ''

  const widths = columns.map(col =>
    maxNumber(data.map(row => String(row[col] ?? '').length), col.length)
  )

  const header = columns.map((col, i) => col.padEnd(widths[i])).join('  ')
  const separator = widths.map(w => '-'.repeat(w)).join('  ')
  const rows = data.map(row =>
    columns.map((col, i) => String(row[col] ?? '').padEnd(widths[i])).join('  ')
  )

  return [header, separator, ...rows].join('\n')
}
