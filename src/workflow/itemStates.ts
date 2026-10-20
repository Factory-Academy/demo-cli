/**
 * Item lifecycle definition.
 *
 * Item status used to be a free-form string set directly at each call site,
 * which allowed impossible values and undefined transitions. These enums plus
 * the transition map are the single source of truth for what an item status
 * can be and how it is allowed to change.
 */

import { TransitionMap } from './stateMachine'

/** Every valid item status. */
export enum ItemState {
  Draft = 'draft',
  Active = 'active',
  Suspended = 'suspended',
  Archived = 'archived',
}

/** Every event that can move an item between states. */
export enum ItemEvent {
  Activate = 'activate',
  Suspend = 'suspend',
  Archive = 'archive',
}

/**
 * Allowed item transitions.
 *
 *   draft     --activate--> active
 *   draft     --archive---> archived
 *   active    --suspend---> suspended
 *   active    --archive---> archived
 *   suspended --activate--> active
 *   suspended --archive---> archived
 *   archived  (terminal)
 */
export const itemTransitions: TransitionMap<ItemState, ItemEvent> = {
  [ItemState.Draft]: {
    [ItemEvent.Activate]: ItemState.Active,
    [ItemEvent.Archive]: ItemState.Archived,
  },
  [ItemState.Active]: {
    [ItemEvent.Suspend]: ItemState.Suspended,
    [ItemEvent.Archive]: ItemState.Archived,
  },
  [ItemState.Suspended]: {
    [ItemEvent.Activate]: ItemState.Active,
    [ItemEvent.Archive]: ItemState.Archived,
  },
  [ItemState.Archived]: {},
}

/** All item states as a plain array, useful for validation and help text. */
export const ALL_ITEM_STATES: readonly ItemState[] = Object.values(ItemState)

/** All item events as a plain array, useful for validation and help text. */
export const ALL_ITEM_EVENTS: readonly ItemEvent[] = Object.values(ItemEvent)

/** Narrow an arbitrary string to an ItemState, or undefined if invalid. */
export function toItemState(value: string): ItemState | undefined {
  return (ALL_ITEM_STATES as readonly string[]).includes(value)
    ? (value as ItemState)
    : undefined
}

/** Narrow an arbitrary string to an ItemEvent, or undefined if invalid. */
export function toItemEvent(value: string): ItemEvent | undefined {
  return (ALL_ITEM_EVENTS as readonly string[]).includes(value)
    ? (value as ItemEvent)
    : undefined
}
