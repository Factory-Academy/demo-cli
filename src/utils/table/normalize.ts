/**
 * Input normalization for the table formatter.
 *
 * These helpers make the transform total: any shape of input is coerced into
 * a predictable `(columns, rows)` pair of plain strings so later stages never
 * have to defend against `null` rows, non-string columns, or exotic values.
 */

import { ResolvedTableOptions, TableRow } from './types'

/**
 * Keep only usable column names: non-empty strings, de-duplicated in order.
 * A caller passing `null`, numbers, or duplicates can't skew alignment.
 */
export function normalizeColumns(columns: unknown): string[] {
  if (!Array.isArray(columns)) return []

  const seen = new Set<string>()
  const result: string[] = []
  for (const col of columns) {
    if (typeof col !== 'string' || col.length === 0) continue
    if (seen.has(col)) continue
    seen.add(col)
    result.push(col)
  }
  return result
}

/**
 * Keep only row-like entries. `null`, `undefined`, arrays, and primitives are
 * dropped so `row[col]` lookups downstream are always safe.
 */
export function normalizeRows(data: unknown): TableRow[] {
  if (!Array.isArray(data)) return []

  const result: TableRow[] = []
  for (const row of data) {
    if (row === null || typeof row !== 'object' || Array.isArray(row)) continue
    result.push(row as TableRow)
  }
  return result
}

/** Collapse newlines, tabs, and other control characters into single spaces. */
function stripControlChars(value: string): string {
  // Control chars (incl. \n, \r, \t) would otherwise break single-line layout.
  return value.replace(/[\u0000-\u001f\u007f]+/g, ' ')
}

/**
 * Convert an arbitrary cell value into a single-line display string.
 * Objects are JSON-encoded, non-finite numbers and symbols fall back to the
 * configured placeholder, and everything is control-char sanitized.
 */
export function stringifyCell(value: unknown, options: ResolvedTableOptions): string {
  if (value === null || value === undefined) return options.nullPlaceholder

  switch (typeof value) {
    case 'string':
      return stripControlChars(value)
    case 'number':
      return Number.isFinite(value) ? String(value) : options.nullPlaceholder
    case 'bigint':
    case 'boolean':
      return String(value)
    case 'symbol':
    case 'function':
      return options.nullPlaceholder
    case 'object': {
      try {
        return stripControlChars(JSON.stringify(value) ?? options.nullPlaceholder)
      } catch {
        // Circular references and other non-serializable values.
        return options.nullPlaceholder
      }
    }
    default:
      return options.nullPlaceholder
  }
}

/**
 * Apply the optional per-cell width cap. When the configured marker alone is
 * wider than the limit the value is hard-sliced so the result never exceeds it.
 */
export function truncateCell(value: string, options: ResolvedTableOptions): string {
  const max = options.maxCellWidth
  if (max === undefined || value.length <= max) return value

  const marker = options.truncationMarker
  if (marker.length >= max) return value.slice(0, max)
  return value.slice(0, max - marker.length) + marker
}

/** Full value pipeline: stringify, then truncate. */
export function renderCellValue(value: unknown, options: ResolvedTableOptions): string {
  return truncateCell(stringifyCell(value, options), options)
}
