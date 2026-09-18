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
