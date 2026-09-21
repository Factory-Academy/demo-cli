import { formatTable, formatDuration } from '../src/utils/format'
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

describe('formatDuration', () => {
  test('formats milliseconds', () => {
    expect(formatDuration(0)).toBe('0 ms')
    expect(formatDuration(50)).toBe('50 ms')
    expect(formatDuration(999)).toBe('999 ms')
  })

  test('formats seconds', () => {
    expect(formatDuration(1000)).toBe('1 s')
    expect(formatDuration(5000)).toBe('5 s')
    expect(formatDuration(45000)).toBe('45 s')
  })

  test('formats minutes and seconds', () => {
    expect(formatDuration(60000)).toBe('1 min')
    expect(formatDuration(90000)).toBe('1 min 30 s')
    expect(formatDuration(125000)).toBe('2 min 5 s')
    expect(formatDuration(600000)).toBe('10 min')
  })

  test('formats hours and minutes', () => {
    expect(formatDuration(3600000)).toBe('1 h')
    expect(formatDuration(3660000)).toBe('1 h 1 min')
    expect(formatDuration(5400000)).toBe('1 h 30 min')
    expect(formatDuration(7200000)).toBe('2 h')
  })

  test('formats days and hours', () => {
    expect(formatDuration(86400000)).toBe('1 d')
    expect(formatDuration(90000000)).toBe('1 d 1 h')
    expect(formatDuration(172800000)).toBe('2 d')
    expect(formatDuration(183600000)).toBe('2 d 3 h')
  })

  test('handles negative values', () => {
    expect(formatDuration(-100)).toBe('0 ms')
    expect(formatDuration(-5000)).toBe('0 ms')
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
