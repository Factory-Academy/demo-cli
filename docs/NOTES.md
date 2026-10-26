# Design notes: pluggable sort strategies

A spike exploring a small Strategy pattern for ordering list output, plus one
integration (`items list --sort`). This note records what was built and why,
and weighs the approaches considered.

## What was built

```
src/strategies/
  sortStrategy.ts            # SortStrategy<T> interface + order/helpers
  alphabeticalSortStrategy.ts # locale-aware string ordering
  numericSortStrategy.ts      # value-based numeric ordering
  sortStrategyFactory.ts      # createSortStrategy(spec) + kind guards
  index.ts                    # public barrel
```

- `SortStrategy<T>` is a one-method interface (`compare(a, b)`), the same shape
  `Array.prototype.sort` already expects, so strategies compose with the
  standard library for free.
- `createSortStrategy(spec)` is the single construction point. Command handlers
  depend on the interface and the factory, never on a concrete class.
- Integration: `items list` gains `--sort <field>` and `--order <asc|desc>`.
  A small `SORTABLE_FIELDS` map in the command declares which kind fits each
  field; the command validates input and delegates the rest.

## Why a factory in front of the interface

The factory decouples *choosing* a strategy (driven by runtime input like a CLI
flag) from *constructing* one. Adding a third kind (say, chronological) touches
the factory switch and the `SortStrategyKind` union only; the exhaustiveness
check (`assertNever`) turns a forgotten case into a compile error. Callers are
untouched.

## Approaches weighed

### A. Strategy objects behind a factory (chosen)

- **Pros:** each rule is isolated and independently testable; `compare` plugs
  directly into `sort`; the factory centralizes selection and gives one place
  to validate untrusted input; the pattern reads clearly for a demo audience.
- **Cons:** more files and ceremony than a one-off sort; a class per rule is
  mild overkill for two implementations today.

### B. A map of plain comparator functions

`Record<string, (a, b) => number>` keyed by field.

- **Pros:** least code; comparators are just functions.
- **Cons:** no shared contract or `name` for diagnostics; per-rule options
  (order, case sensitivity, invalid placement) devolve into ad-hoc closures or
  repeated arguments; selection/validation logic has no natural home. Fine for
  a fixed, tiny set, but it does not scale into the "pluggable" goal of the
  spike.

### C. A single configurable sort function

One `sort(items, { field, type, order })` with internal branching.

- **Pros:** one entry point, no extra types.
- **Cons:** the branching that A pushes into separate, closed units collapses
  back into one growing function; edge-case handling for strings and numbers
  interleaves and gets harder to test in isolation. This is essentially the
  factory's body with the seams removed, trading structure for brevity.

## Edge cases handled

- **Immutability:** `sortWith` copies before sorting, so shared in-memory state
  (the command's `items` array) is never reordered as a side effect.
- **Missing keys:** alphabetical coerces `null`/`undefined`/missing to `''`;
  numeric treats `null`/`undefined`/`''`/non-numeric as invalid.
- **Numeric strings:** CLI flags arrive as strings, so numeric sort coerces with
  `Number(...)` to avoid lexical ordering (`'10'` before `'9'`).
- **Invalid placement:** configurable (`first`/`last`) and intentionally
  independent of asc/desc, so unparseable values never crowd out real data.
- **Locale:** alphabetical uses `localeCompare` with a `sensitivity` tuned to
  the case-insensitivity flag, so accented characters order sensibly.

## If promoted beyond a spike

- Let fields self-describe their kind instead of a per-command map.
- Add tie-breaking (secondary sort key) to the spec for stable multi-key sorts.
- Apply the same `--sort`/`--order` wiring to `widgets list`.
