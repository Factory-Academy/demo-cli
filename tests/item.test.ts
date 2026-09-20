import { formatTable } from '../src/utils/format'
import { LRUCache } from '../src/utils/lru-cache'

describe('formatTable', () => {
  test('formats data into aligned columns', () => {
    const data = [
      { id: '1', name: 'Test', status: 'active' },
      { id: '2', name: 'Another', status: 'pending' },
    ]
    const result = formatTable(data, ['id', 'name', 'status'])
    expect(result).toContain('id')
    expect(result).toContain('Test')
    expect(result).toContain('Another')
  })

  test('handles empty data', () => {
    expect(formatTable([], ['id', 'name'])).toBe('')
  })
})

describe('LRUCache integration with item data', () => {
  interface Item {
    id: string
    name: string
    status: string
  }

  test('caches item and invalidates on delete', () => {
    const cache = new LRUCache<Item>(10, 300)
    const item: Item = { id: '1', name: 'Test Item', status: 'active' }

    // Store item in cache
    cache.set('1', item)
    expect(cache.get('1')).toEqual(item)

    // Evict (simulating delete)
    cache.evict('1')
    expect(cache.get('1')).toBeUndefined()
  })

  test('maintains cache consistency across multiple items', () => {
    const cache = new LRUCache<Item>(5, 300)
    const items = [
      { id: '1', name: 'Item 1', status: 'active' },
      { id: '2', name: 'Item 2', status: 'pending' },
      { id: '3', name: 'Item 3', status: 'active' },
    ]

    items.forEach(item => cache.set(item.id, item))

    // Verify all items are cached
    items.forEach(item => {
      expect(cache.get(item.id)).toEqual(item)
    })

    // Evict one item
    cache.evict('2')
    expect(cache.get('2')).toBeUndefined()

    // Other items remain
    expect(cache.get('1')).toEqual(items[0])
    expect(cache.get('3')).toEqual(items[2])
  })
})
