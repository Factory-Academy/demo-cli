/**
 * Column-width computation.
 *
 * The original implementation used `Math.max(header, ...rows.map(...))`.
 * Spreading a large per-column array into `Math.max` throws
 * `RangeError: Maximum call stack size exceeded` once the array exceeds the
 * engine's argument limit (~1e5 entries). These helpers fold with a plain loop
 * so arbitrarily large datasets are safe.
 */

import { renderCellValue } from './normalize'
import { ResolvedTableOptions, TableRow } from './types'

/** Width of one column: the longest of its header and all rendered cells. */
export function columnWidth(
  column: string,
  rows: TableRow[],
  options: ResolvedTableOptions
): number {
  let width = column.length
  for (const row of rows) {
    const cell = renderCellValue(row[column], options)
    if (cell.length > width) width = cell.length
  }
  return width
}

/** Width for every column, index-aligned with `columns`. */
export function computeWidths(
  columns: string[],
  rows: TableRow[],
  options: ResolvedTableOptions
): number[] {
  return columns.map(col => columnWidth(col, rows, options))
}
