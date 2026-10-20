import { listItems, Item } from '../src/commands/item'

describe('listItems', () => {
  const items: Item[] = [
    {
      id: '1',
      name: 'First',
      status: 'active',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      name: 'Second',
      status: 'inactive',
      createdAt: '2026-01-02T00:00:00.000Z',
    },
    {
      id: '3',
      name: 'Third',
      status: 'active',
      createdAt: '2026-01-03T00:00:00.000Z',
    },
  ]

  test('filters by status before paginating', () => {
    const result = listItems(items, { status: 'active', limit: 1 })

    expect(result.items.map(item => item.id)).toEqual(['1'])
    expect(result.nextCursor).toBe('1')
  })

  test('supports cursor pagination on filtered results', () => {
    const result = listItems(items, { status: 'active', cursor: '1', limit: 1 })

    expect(result.items.map(item => item.id)).toEqual(['3'])
    expect(result.nextCursor).toBeUndefined()
  })
})
