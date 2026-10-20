# Item lifecycle state machine

## The problem

Item status was a free-form `string`. It was set directly at each call site
(`status: config.items.defaultStatus` on create, arbitrary `--status` values on
filter) with no validation and no notion of which changes were legal. Nothing
stopped an item from being written with an impossible status, moved backwards
out of a terminal state, or changed in a way no one had agreed was valid. That
is the "inconsistent state handling" this change fixes.

## The approach

A single source of truth for item states and transitions, enforced by a small
generic state machine.

- `src/workflow/stateMachine.ts` — a reusable async finite state machine. It
  owns one `current` state and only advances it through declared transitions.
  Transitions are `async` so a guard and a persistence/side-effect hook can run
  before the new state is trusted. State is mutated only after the guard passes,
  so a rejected or failing transition leaves the machine untouched. It also
  records an audit log and refuses overlapping transitions on one instance.
- `src/workflow/itemStates.ts` — the item lifecycle: the `ItemState` and
  `ItemEvent` enums, the transition map, and string-narrowing helpers.
- `src/workflow/itemWorkflow.ts` — the async call surface the app uses:
  `createItem`, `applyItemEvent`, `applyItemEventByName`, and inspection
  helpers. Item records are immutable; a transition returns a new record with an
  updated status, `updatedAt`, and appended history. Status can never be set
  by hand.

## Lifecycle

```
draft     --activate--> active
draft     --archive---> archived
active    --suspend---> suspended
active    --archive---> archived
suspended --activate--> active
suspended --archive---> archived
archived  (terminal)
```

New items default to `active` (`config.items.defaultStatus`), which keeps the
existing default behavior while making the value a typed `ItemState`.

## Call-site migration

- `src/config.ts` — `items.defaultStatus` is now typed `ItemState` (value
  unchanged: `active`).
- `src/commands/item.ts`
  - `create` goes through `createItem`; it no longer assigns a raw status.
  - `list --status` validates the filter against the known states and exits
    with an error on an unknown value instead of silently returning nothing.
  - `get` now also reports the events currently available for the item.
  - New `items transition <id> <event>` subcommand drives the lifecycle and
    reports a clear error (with the legal events) on an illegal move.

## Edge cases handled

- Unknown status filter or event name — rejected with the valid set listed.
- Illegal transition from the current state — `InvalidTransitionError`, state
  unchanged.
- Terminal `archived` state — no event can move an item out of it.
- Guard veto or guard throw — state and history left untouched.
- Overlapping async transitions on one machine instance — rejected.
- Blank item name — rejected at creation.

## Tests

- `tests/stateMachine.test.ts` — generic machine: inspection, valid/invalid
  transitions, history immutability, guards (sync/async/throwing), the
  post-transition hook, the concurrency guard, and reset.
- `tests/itemStates.test.ts` — enums, the transition map, and the narrowing
  helpers.
- `tests/itemWorkflow.test.ts` — creation, every legal transition (table
  driven), immutability of inputs, history accumulation, and illegal/terminal
  rejections.
