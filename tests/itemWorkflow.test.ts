import { ItemEvent, ItemState } from '../src/workflow/itemStates'
import {
  applyItemEvent,
  applyItemEventByName,
  availableItemEvents,
  canApplyItemEvent,
  createItem,
  createItemMachine,
  InvalidTransitionError,
  ItemRecord,
} from '../src/workflow/itemWorkflow'

async function seededItem(status: ItemState = ItemState.Active): Promise<ItemRecord> {
  const item = await createItem({ id: '1', name: 'Sample' })
  return { ...item, status }
}

describe('createItem', () => {
  test('defaults a new item to active with no history', async () => {
    const item = await createItem({ id: '1', name: 'Alpha' })
    expect(item).toMatchObject({
      id: '1',
      name: 'Alpha',
      status: ItemState.Active,
      history: [],
    })
    expect(item.createdAt).toBe(item.updatedAt)
  })

  test('honors a requested initial status', async () => {
    const item = await createItem({
      id: '2',
      name: 'Beta',
      initialStatus: ItemState.Draft,
    })
    expect(item.status).toBe(ItemState.Draft)
  })

  test('trims the name', async () => {
    const item = await createItem({ id: '3', name: '  Spaced  ' })
    expect(item.name).toBe('Spaced')
  })

  test('rejects a blank name', async () => {
    await expect(createItem({ id: '4', name: '   ' })).rejects.toThrow(
      /name is required/i,
    )
  })

  test('carries an optional description through', async () => {
    const item = await createItem({ id: '5', name: 'Gamma', description: 'note' })
    expect(item.description).toBe('note')
  })
})

describe('createItemMachine', () => {
  test('defaults to active', () => {
    expect(createItemMachine().state).toBe(ItemState.Active)
  })

  test('seeds at the provided state', () => {
    expect(createItemMachine(ItemState.Suspended).state).toBe(
      ItemState.Suspended,
    )
  })
})

describe('applyItemEvent', () => {
  test('moves active -> suspended and records history', async () => {
    const item = await seededItem(ItemState.Active)
    const updated = await applyItemEvent(item, ItemEvent.Suspend)
    expect(updated.status).toBe(ItemState.Suspended)
    expect(updated.history).toHaveLength(1)
    expect(updated.history[0]).toMatchObject({
      from: ItemState.Active,
      to: ItemState.Suspended,
      event: ItemEvent.Suspend,
    })
  })

  test('does not mutate the input item', async () => {
    const item = await seededItem(ItemState.Active)
    const before = JSON.stringify(item)
    await applyItemEvent(item, ItemEvent.Suspend)
    expect(JSON.stringify(item)).toBe(before)
  })

  test('accumulates history across multiple transitions', async () => {
    let item = await seededItem(ItemState.Draft)
    item = await applyItemEvent(item, ItemEvent.Activate)
    item = await applyItemEvent(item, ItemEvent.Suspend)
    item = await applyItemEvent(item, ItemEvent.Activate)
    expect(item.status).toBe(ItemState.Active)
    expect(item.history.map(h => h.to)).toEqual([
      ItemState.Active,
      ItemState.Suspended,
      ItemState.Active,
    ])
  })

  test('advances updatedAt to the transition time', async () => {
    const item = await seededItem(ItemState.Active)
    const updated = await applyItemEvent(item, ItemEvent.Archive)
    expect(updated.updatedAt).toBe(updated.history[0].at)
  })

  test('rejects an illegal transition and leaves nothing behind', async () => {
    const item = await seededItem(ItemState.Archived)
    await expect(applyItemEvent(item, ItemEvent.Activate)).rejects.toBeInstanceOf(
      InvalidTransitionError,
    )
  })

  test('cannot resurrect an archived item', async () => {
    const item = await seededItem(ItemState.Archived)
    for (const event of [ItemEvent.Activate, ItemEvent.Suspend, ItemEvent.Archive]) {
      await expect(applyItemEvent(item, event)).rejects.toThrow()
    }
  })

  test.each([
    [ItemState.Draft, ItemEvent.Activate, ItemState.Active],
    [ItemState.Draft, ItemEvent.Archive, ItemState.Archived],
    [ItemState.Active, ItemEvent.Suspend, ItemState.Suspended],
    [ItemState.Active, ItemEvent.Archive, ItemState.Archived],
    [ItemState.Suspended, ItemEvent.Activate, ItemState.Active],
    [ItemState.Suspended, ItemEvent.Archive, ItemState.Archived],
  ])('%s --%s--> %s', async (from, event, to) => {
    const item = await seededItem(from)
    const updated = await applyItemEvent(item, event)
    expect(updated.status).toBe(to)
  })
})

describe('applyItemEventByName', () => {
  test('dispatches a valid event name', async () => {
    const item = await seededItem(ItemState.Active)
    const updated = await applyItemEventByName(item, 'suspend')
    expect(updated.status).toBe(ItemState.Suspended)
  })

  test('rejects an unknown event name', async () => {
    const item = await seededItem(ItemState.Active)
    await expect(applyItemEventByName(item, 'delete')).rejects.toBeInstanceOf(
      InvalidTransitionError,
    )
  })

  test('rejects a valid name that is illegal from the current state', async () => {
    const item = await seededItem(ItemState.Active)
    await expect(applyItemEventByName(item, 'activate')).rejects.toBeInstanceOf(
      InvalidTransitionError,
    )
  })
})

describe('availableItemEvents', () => {
  test('lists events for each state', () => {
    expect(availableItemEvents(ItemState.Draft).sort()).toEqual([
      ItemEvent.Activate,
      ItemEvent.Archive,
    ])
    expect(availableItemEvents(ItemState.Active).sort()).toEqual([
      ItemEvent.Archive,
      ItemEvent.Suspend,
    ])
    expect(availableItemEvents(ItemState.Archived)).toEqual([])
  })
})

describe('canApplyItemEvent', () => {
  test('is true for a legal transition', () => {
    expect(canApplyItemEvent(ItemState.Active, ItemEvent.Suspend)).toBe(true)
  })

  test('is false for an illegal transition', () => {
    expect(canApplyItemEvent(ItemState.Archived, ItemEvent.Activate)).toBe(false)
  })
})
