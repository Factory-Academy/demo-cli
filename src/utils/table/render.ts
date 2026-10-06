/**
 * Line rendering: turning normalized columns, rows, and widths into text.
 */

import { renderCellValue } from './normalize'
import { ResolvedTableOptions, TableRow } from './types'

/** Pad a single cell to its column width. */
export function padCell(value: string, width: number): string {
  return value.padEnd(width)
}

/** Render the header line from column names. */
export function renderHeader(
  columns: string[],
  widths: number[],
  options: ResolvedTableOptions
): string {
  return columns.map((col, i) => padCell(col, widths[i])).join(options.columnSeparator)
}

/** Render the dashed separator line beneath the header. */
export function renderSeparator(widths: number[], options: ResolvedTableOptions): string {
  return widths.map(w => '-'.repeat(w)).join(options.columnSeparator)
}

/** Render a single data row. */
export function renderRow(
  row: TableRow,
  columns: string[],
  widths: number[],
  options: ResolvedTableOptions
): string {
  return columns
    .map((col, i) => padCell(renderCellValue(row[col], options), widths[i]))
    .join(options.columnSeparator)
}

/** Render all data rows. */
export function renderRows(
  rows: TableRow[],
  columns: string[],
  widths: number[],
  options: ResolvedTableOptions
): string[] {
  return rows.map(row => renderRow(row, columns, widths, options))
}
