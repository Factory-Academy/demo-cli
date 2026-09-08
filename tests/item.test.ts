import { formatTable } from '../src/utils/format'
import { paginate } from '../src/utils/pagination'

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

describe('item list with pagination', () => {
  test('paginates items correctly', () => {
    const items = Array.from({ length: 25 }, (_, i) => ({
      id: String(i + 1),
      name: `Item ${i + 1}`,
      status: 'active',
      createdAt: new Date().toISOString(),
    }))

    // First page
    const page1 = paginate(items, { limit: 10 })
    expect(page1.items).toHaveLength(10)
    expect(page1.items[0].id).toBe('1')
    expect(page1.hasMore).toBe(true)

    // Second page
    const page2 = paginate(items, { cursor: page1.nextCursor, limit: 10 })
    expect(page2.items).toHaveLength(10)
    expect(page2.items[0].id).toBe('11')
    expect(page2.hasMore).toBe(true)

    // Third page (last)
    const page3 = paginate(items, { cursor: page2.nextCursor, limit: 10 })
    expect(page3.items).toHaveLength(5)
    expect(page3.items[0].id).toBe('21')
    expect(page3.hasMore).toBe(false)
  })

  test('applies filter before pagination', () => {
    const items = [
      { id: '1', name: 'Item 1', status: 'active', createdAt: '2023-01-01' },
      { id: '2', name: 'Item 2', status: 'pending', createdAt: '2023-01-02' },
      { id: '3', name: 'Item 3', status: 'active', createdAt: '2023-01-03' },
      { id: '4', name: 'Item 4', status: 'active', createdAt: '2023-01-04' },
    ]

    const filtered = items.filter(i => i.status === 'active')
    const result = paginate(filtered, { limit: 2 })
    
    expect(result.items).toHaveLength(2)
    expect(result.items[0].status).toBe('active')
    expect(result.items[1].status).toBe('active')
    expect(result.hasMore).toBe(true)
  })
})
