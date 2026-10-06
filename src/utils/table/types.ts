/**
 * Shared types for the table-formatting data-transform path.
 */

/** A single table row. Keys are column names; values are arbitrary. */
export type TableRow = Record<string, unknown>

/**
 * Options controlling how rows are transformed into an aligned text table.
 * All fields are optional; {@link resolveTableOptions} fills in defaults.
 */
export interface TableOptions {
  /** String placed between rendered columns. Defaults to two spaces. */
  columnSeparator?: string
  /** Text substituted for `null`/`undefined`/unrenderable cells. Defaults to ''. */
  nullPlaceholder?: string
  /**
   * Maximum rendered width of a single cell before truncation.
   * `undefined` (the default) means no limit.
   */
  maxCellWidth?: number
  /** Marker appended when a cell is truncated. Defaults to '…'. */
  truncationMarker?: string
}

/** Fully-resolved options with every field present. */
export interface ResolvedTableOptions {
  columnSeparator: string
  nullPlaceholder: string
  maxCellWidth: number | undefined
  truncationMarker: string
}

export const DEFAULT_TABLE_OPTIONS: ResolvedTableOptions = {
  columnSeparator: '  ',
  nullPlaceholder: '',
  maxCellWidth: undefined,
  truncationMarker: '…',
}

/**
 * Merge caller-supplied options over the defaults.
 * Invalid values (negative widths, non-string separators) fall back to defaults
 * so a malformed options object can never corrupt rendering.
 */
export function resolveTableOptions(options?: TableOptions): ResolvedTableOptions {
  if (!options) return { ...DEFAULT_TABLE_OPTIONS }

  const columnSeparator =
    typeof options.columnSeparator === 'string'
      ? options.columnSeparator
      : DEFAULT_TABLE_OPTIONS.columnSeparator

  const nullPlaceholder =
    typeof options.nullPlaceholder === 'string'
      ? options.nullPlaceholder
      : DEFAULT_TABLE_OPTIONS.nullPlaceholder

  const truncationMarker =
    typeof options.truncationMarker === 'string'
      ? options.truncationMarker
      : DEFAULT_TABLE_OPTIONS.truncationMarker

  let maxCellWidth = DEFAULT_TABLE_OPTIONS.maxCellWidth
  if (
    typeof options.maxCellWidth === 'number' &&
    Number.isFinite(options.maxCellWidth) &&
    options.maxCellWidth > 0
  ) {
    maxCellWidth = Math.floor(options.maxCellWidth)
  }

  return { columnSeparator, nullPlaceholder, maxCellWidth, truncationMarker }
}
