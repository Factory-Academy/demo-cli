/**
 * Table formatting utility.
 *
 * The implementation lives in `./table`, split into small, testable stages
 * (normalize → width → render). This module re-exports the public surface so
 * existing imports (`../utils/format`) keep working unchanged.
 */

export { formatTable } from './table'
export type { TableOptions, TableRow } from './table'
