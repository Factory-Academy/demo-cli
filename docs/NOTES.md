# Design note: untangling the command modules

## The tangle

`src/commands/item.ts` and `src/commands/widget.ts` each mixed five unrelated
concerns in a single file:

1. **Domain types** — the `Item` / `Widget` interfaces.
2. **Persistence** — a module-level array plus a `let nextId = 1` counter.
3. **Business rules** — create/list/get logic and filtering.
4. **CLI wiring** — Commander command and option declarations.
5. **I/O** — `console.log`, `console.error`, `process.exit`, JSON and table
   formatting.

Because rules and side effects lived in the same closure, the logic could only
be exercised by spawning the CLI and reading stdout. `new Date().toISOString()`
was called inline, so output was never deterministic. The two files also
duplicated the store/counter pattern.

## The shape now: pure core + thin adapter

```
src/
  core/                 pure, I/O-free, deterministic
    types.ts            data-only interfaces (+ input/filter shapes)
    identifiable.ts     the `{ id: string }` contract Store requires
    store.ts            generic in-memory collection + id sequencing
    clock.ts            Clock abstraction (systemClock / fixedClock)
    errors.ts           NotFoundError, ValidationError
    itemService.ts      item rules over a private Store
    widgetService.ts    widget rules over a private Store
  commands/             thin CLI adapters
    item.ts             Commander wiring -> ItemService
    widget.ts           Commander wiring -> WidgetService
    output.ts           rendering + failure reporting (the only I/O)
  utils/
    format.ts           table formatter (unchanged)
  index.ts              registers the command groups (unchanged)
```

**Core** owns state and rules and performs no I/O. Time is injected through a
`Clock`, and ids come from a `Store` counter, so every method is deterministic
and unit-testable in isolation. `Store<T>` removes the duplicated
array-plus-counter logic that each command carried.

**Adapters** are declarative: parse options, call a service, render or report.
The only `console` / `process.exit` calls in the codebase now live in
`commands/output.ts`. Each command constructs its service once and shares it
across subcommands, which reproduces the original module-singleton behavior
(state accumulates within one process run). Tests inject their own service.

## Behavior preserved

- ids start at `"1"` and increment; `status` defaults to `active`.
- `items list` / `widgets list` print the same columns and the same
  `No items found.` / `No widgets found.` empty-state text.
- `create` prints `Created item <id>: <name>` (and the widget equivalent).
- `items get <id>` prints the item as pretty JSON, or writes
  `Item <id> not found` to stderr and exits `1`.
- `widgets` still exposes only `list` and `create` on the CLI. `WidgetService`
  additionally offers `get` for symmetry and reuse; it is intentionally not
  wired to a subcommand.

## Intentional hardening (documented deviations)

These paths were previously undefined or silently wrong; valid input is
unaffected:

- Empty or whitespace-only `--name` (and `--item-id` for widgets) now raises a
  `ValidationError` instead of storing a blank record. Valid names keep their
  exact, untrimmed value.
- A non-numeric `--priority` (e.g. `abc`) parsed to `NaN` and was stored as-is;
  it now raises a `ValidationError`.

## Tests

- `store.test.ts` — id sequencing, read-copy isolation, filter/find.
- `itemService.test.ts` / `widgetService.test.ts` — rules, defaults, filters,
  validation, and error messages against a `fixedClock`.
- `output.test.ts` — rendering and the stderr-plus-exit failure path.
- `commands.test.ts` — the adapters end-to-end through Commander, asserting the
  legacy stdout strings.
- `item.test.ts` — the existing `formatTable` coverage, unchanged.

## Follow-up: tightening validation edge cases

Review feedback on the refactor PR flagged two loose ends. Both are now closed.

### 1. `--priority` was too permissive

The adapter parsed the flag with `parseInt(opts.priority, 10)`, and the core
only checked `Number.isFinite`. That let three surprising inputs through:

| Input           | Old result           | New result                             |
|-----------------|----------------------|----------------------------------------|
| `--priority 5.9`  | stored `5` (truncated) | `Widget priority must be an integer`   |
| `--priority 5abc` | stored `5` (prefix)    | `Widget priority must be an integer`   |
| `--priority=-1`   | stored `-1`            | `Widget priority must not be negative` |

The fix splits the concern along the existing boundary:

- **`commands/parse.ts`** — `parseIntegerOption` turns the raw CLI string into a
  real integer, accepting only an optional sign plus digits. Floats, trailing
  garbage, and hex/exponent forms are rejected here, where the raw string lives.
- **`core/validation.ts`** — `assertNonNegativeInteger` enforces the *domain*
  rule (finite, whole, non-negative) on the parsed number, independent of the
  CLI. Priority is a rank, so negatives are rejected.

Valid input is unchanged: an omitted flag still defaults to `0`, and
`--priority 5` still stores `5`.

### 2. The "required string" guard was duplicated

Both services repeated `if (!value || value.trim() === '')` per field, so a rule
change had to be made in two places. `core/validation.ts` now owns
`requireNonEmptyString`, which both services call for `name` (and `itemId`). It
still returns the original untrimmed value, so names keep their exact spacing.

The same helper now guards `ItemService.get` / `WidgetService.get`: a blank id
raises `ValidationError` ("Item id is required") instead of the misleading
`Item  not found`. Non-blank lookups are unaffected.

### New/updated tests

- `validation.test.ts` — the shared guards, including message ordering
  (non-finite is reported before non-integer).
- `parse.test.ts` — strict integer parsing: signs, whitespace, and the
  fraction/garbage/hex cases `parseInt` used to swallow.
- `widgetService.test.ts` — added fractional, negative, and explicit-zero
  priority cases plus the blank-id guard.
- `itemService.test.ts` — added the blank-id guard.
- `commands.test.ts` — drives the bad `--priority` inputs through Commander and
  asserts the stderr message and exit code via a stubbed `process.exit`.
