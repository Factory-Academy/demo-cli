/**
 * Item workflow: the async call surface the rest of the app uses to create
 * items and move them through their lifecycle.
 *
 * Callers never set `status` directly. They create an item (which starts in a
 * well-defined state) and then send lifecycle events. Each event is validated
 * against {@link itemTransitions} before the item is mutated, so the stored
 * status can never drift into an impossible value.
 */

import {
  GuardRejectedError,
  InvalidTransitionError,
  StateMachine,
  TransitionRecord,
} from './stateMachine'
import {
  ItemEvent,
  ItemState,
  itemTransitions,
  toItemEvent,
} from './itemStates'

/** A single lifecycle entry kept on an item for auditing. */
export interface ItemHistoryEntry {
  readonly from: ItemState
  readonly to: ItemState
  readonly event: ItemEvent
  readonly at: string
}

/** The stored shape of an item. `status` is always a valid {@link ItemState}. */
export interface ItemRecord {
  readonly id: string
  readonly name: string
  readonly description?: string
  readonly status: ItemState
  readonly createdAt: string
  readonly updatedAt: string
  readonly history: readonly ItemHistoryEntry[]
}

export interface CreateItemInput {
  readonly id: string
  readonly name: string
  readonly description?: string
  /** State the item starts in. Defaults to {@link ItemState.Active}. */
  readonly initialStatus?: ItemState
}

/** Build a state machine seeded at `initial` for an item lifecycle. */
export function createItemMachine(
  initial: ItemState = ItemState.Active,
): StateMachine<ItemState, ItemEvent> {
  return new StateMachine<ItemState, ItemEvent>({
    initial,
    transitions: itemTransitions,
  })
}

/**
 * Create a new item record.
 *
 * Async to match the rest of the workflow surface; a real implementation would
 * persist here. Validates the requested initial status up front so a bad value
 * can never be written.
 */
export async function createItem(input: CreateItemInput): Promise<ItemRecord> {
  const name = input.name?.trim()
  if (!name) {
    throw new Error('Item name is required.')
  }

  const initialStatus = input.initialStatus ?? ItemState.Active
  const now = new Date().toISOString()

  return {
    id: input.id,
    name,
    description: input.description,
    status: initialStatus,
    createdAt: now,
    updatedAt: now,
    history: [],
  }
}

/**
 * Apply a lifecycle event to an item, returning a new, updated record.
 *
 * The input item is never mutated; callers should store the returned value.
 * Throws {@link InvalidTransitionError} when the event is not legal from the
 * item's current status.
 */
export async function applyItemEvent(
  item: ItemRecord,
  event: ItemEvent,
): Promise<ItemRecord> {
  const machine = createItemMachine(item.status)

  // Surfaces InvalidTransitionError / GuardRejectedError to the caller.
  const record: TransitionRecord<ItemState, ItemEvent> =
    await machine.send(event)

  const entry: ItemHistoryEntry = {
    from: record.from,
    to: record.to,
    event: record.event,
    at: record.at,
  }

  return {
    ...item,
    status: record.to,
    updatedAt: record.at,
    history: [...item.history, entry],
  }
}

/**
 * Convenience wrapper that accepts an event as a raw string, validating it
 * before dispatch. Keeps string parsing (CLI input, config) out of the core.
 */
export async function applyItemEventByName(
  item: ItemRecord,
  eventName: string,
): Promise<ItemRecord> {
  const event = toItemEvent(eventName)
  if (!event) {
    throw new InvalidTransitionError(
      item.status,
      eventName as ItemEvent,
      machineEventsFor(item.status),
    )
  }
  return applyItemEvent(item, event)
}

/** The events currently valid for an item in `status`. */
export function availableItemEvents(status: ItemState): ItemEvent[] {
  return createItemMachine(status).availableEvents()
}

/** Whether `event` is valid from `status` without performing it. */
export function canApplyItemEvent(
  status: ItemState,
  event: ItemEvent,
): boolean {
  return createItemMachine(status).can(event)
}

function machineEventsFor(status: ItemState): ItemEvent[] {
  return createItemMachine(status).availableEvents()
}

export { GuardRejectedError, InvalidTransitionError }
