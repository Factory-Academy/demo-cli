import {
  ALL_ITEM_EVENTS,
  ALL_ITEM_STATES,
  ItemEvent,
  ItemState,
  itemTransitions,
  toItemEvent,
  toItemState,
} from '../src/workflow/itemStates'

describe('item states', () => {
  describe('enumerations', () => {
    test('exposes every state', () => {
      expect([...ALL_ITEM_STATES].sort()).toEqual([
        'active',
        'archived',
        'draft',
        'suspended',
      ])
    })

    test('exposes every event', () => {
      expect([...ALL_ITEM_EVENTS].sort()).toEqual([
        'activate',
        'archive',
        'suspend',
      ])
    })
  })

  describe('transition map', () => {
    test('draft can activate or archive', () => {
      expect(itemTransitions[ItemState.Draft]).toEqual({
        [ItemEvent.Activate]: ItemState.Active,
        [ItemEvent.Archive]: ItemState.Archived,
      })
    })

    test('active can suspend or archive', () => {
      expect(itemTransitions[ItemState.Active]).toEqual({
        [ItemEvent.Suspend]: ItemState.Suspended,
        [ItemEvent.Archive]: ItemState.Archived,
      })
    })

    test('suspended can activate or archive', () => {
      expect(itemTransitions[ItemState.Suspended]).toEqual({
        [ItemEvent.Activate]: ItemState.Active,
        [ItemEvent.Archive]: ItemState.Archived,
      })
    })

    test('archived is terminal', () => {
      expect(itemTransitions[ItemState.Archived]).toEqual({})
    })

    test('every declared target is itself a valid state', () => {
      for (const from of ALL_ITEM_STATES) {
        const events = itemTransitions[from] ?? {}
        for (const target of Object.values(events)) {
          expect(ALL_ITEM_STATES).toContain(target)
        }
      }
    })
  })

  describe('toItemState', () => {
    test('narrows a known status', () => {
      expect(toItemState('active')).toBe(ItemState.Active)
      expect(toItemState('archived')).toBe(ItemState.Archived)
    })

    test('returns undefined for an unknown status', () => {
      expect(toItemState('deleted')).toBeUndefined()
      expect(toItemState('')).toBeUndefined()
      expect(toItemState('ACTIVE')).toBeUndefined()
    })
  })

  describe('toItemEvent', () => {
    test('narrows a known event', () => {
      expect(toItemEvent('activate')).toBe(ItemEvent.Activate)
      expect(toItemEvent('archive')).toBe(ItemEvent.Archive)
    })

    test('returns undefined for an unknown event', () => {
      expect(toItemEvent('delete')).toBeUndefined()
      expect(toItemEvent('')).toBeUndefined()
    })
  })
})
