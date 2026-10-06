/**
 * Table-formatting data-transform path.
 *
 * Composes normalization, width computation, and rendering into a single
 * total function: any input shape produces a valid string (possibly empty)
 * without throwing.
 */

import { normalizeColumns, normalizeRows } from './normalize'
import { computeWidths } from './width'
import { renderHeader, renderRows, renderSeparator } from './render'
import { resolveTableOptions, TableOptions, TableRow } from './types'

export * from './types'
export { normalizeColumns, normalizeRows, renderCellValue, stringifyCell, truncateCell } from './normalize'
export { columnWidth, computeWidths } from './width'
export { padCell, renderHeader, renderRow, renderRows, renderSeparator } from './render'

/**
 * Transform rows of data into an aligned, single-line-per-row text table.
 *
 * Defensive by contract:
 * - empty / non-array data or no usable columns yields `''`
 * - `null`/`undefined`/primitive rows are skipped
 * - `null`/`undefined`/duplicate/non-string columns are skipped
 * - cell values with newlines, tabs, or control chars are sanitized
 * - very large datasets are handled without stack overflow
 */
export function formatTable(
  data: unknown,
  columns: unknown,
  options?: TableOptions
): string {
  const resolved = resolveTableOptions(options)
  const normalizedColumns = normalizeColumns(columns)
  const rows: TableRow[] = normalizeRows(data)

  if (normalizedColumns.length === 0 || rows.length === 0) return ''

  const widths = computeWidths(normalizedColumns, rows, resolved)
  const header = renderHeader(normalizedColumns, widths, resolved)
  const separator = renderSeparator(widths, resolved)
  const body = renderRows(rows, normalizedColumns, widths, resolved)

  return [header, separator, ...body].join('\n')
}
