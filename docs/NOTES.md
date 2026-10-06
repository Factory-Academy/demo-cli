# Notes: table-formatter edge-case fixes

## Context

`formatTable` (the `src/utils/format.ts` data-transform path) turned rows of
data into an aligned text table. It worked for the small, well-formed inputs
the CLI produced, but had a class of latent edge-case bugs that surfaced on
empty, large, or malformed data.

## Bugs found

1. **Stack overflow on large inputs.** Column widths were computed with
   `Math.max(col.length, ...data.map(row => ...))`. Spreading a large
   per-column array into `Math.max` throws
   `RangeError: Maximum call stack size exceeded` once the array exceeds the
   engine's argument limit (~100k entries).
2. **Crash on malformed rows.** A `null`/`undefined` entry in `data` made
   `row[col]` throw. Non-object entries (strings, numbers, arrays) produced
   garbage cells.
3. **Broken alignment from control characters.** Cell values containing `\n`,
   `\r`, or `\t` injected extra lines and threw off column padding, so the
   table no longer lined up.
4. **Unhelpful rendering of complex values.** Objects became
   `"[object Object]"` and non-finite numbers rendered as `NaN` / `Infinity`.
5. **Degenerate output for invalid columns.** `null`, non-string, empty, or
   duplicate column names were not filtered.

## Change

The helper was refactored from one function into a small, single-responsibility
module under `src/utils/table/`:

| File | Responsibility |
|---|---|
| `types.ts` | `TableRow`, `TableOptions`, and option resolution with safe defaults |
| `normalize.ts` | Coerce columns/rows and stringify/truncate/sanitize cell values |
| `width.ts` | Column widths via a plain loop (no large-array spread) |
| `render.ts` | Header, separator, and row line rendering |
| `index.ts` | Compose the stages into `formatTable` |

`src/utils/format.ts` now re-exports `formatTable` from this module, so existing
imports (`../utils/format`) are unchanged.

### Behavior guarantees

`formatTable` is now total — any input shape returns a string without throwing:

- empty / non-array data or no usable columns returns `''`
- `null`/`undefined`/primitive/array rows are skipped
- `null`/`undefined`/empty/duplicate/non-string columns are skipped
- newlines, tabs, and control chars are collapsed to spaces (single-line rows)
- objects are JSON-encoded; non-finite numbers, symbols, and functions use the
  configurable `nullPlaceholder`
- large datasets are handled without stack overflow
- optional `maxCellWidth` caps column width with a truncation marker

The previously-unused `table.columnSeparator` config value is now threaded
through the `items` and `widgets` list commands via the new options argument.

## Tests

Regression coverage mirrors the module split:

- `tests/table/normalize.test.ts` — column/row coercion, cell stringification,
  sanitization, truncation
- `tests/table/width.test.ts` — width computation, including a 200k-row
  no-stack-overflow regression
- `tests/table/render.test.ts` — header/separator/row rendering and padding
- `tests/table/format.test.ts` — end-to-end: happy path, empty inputs,
  malformed inputs, alignment safety, and large-dataset scale

The original `tests/item.test.ts` continues to pass unchanged.
