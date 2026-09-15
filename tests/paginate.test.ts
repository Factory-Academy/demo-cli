import { paginate } from '../src/utils/paginate'

describe('paginate', () => {
  test('returns correct first page', () => {
    const items = ['a', 'b', 'c', 'd', 'e']
    const result = paginate(items, 1, 2)
    
    expect(result.items).toEqual(['a', 'b'])
    expect(result.page).toBe(1)
    expect(result.totalPages).toBe(3)
    expect(result.hasNextPage).toBe(true)
    expect(result.hasPreviousPage).toBe(false)
  })

  test('returns correct middle page', () => {
    const items = ['a', 'b', 'c', 'd', 'e']
    const result = paginate(items, 2, 2)
    
    expect(result.items).toEqual(['c', 'd'])
    expect(result.page).toBe(2)
    expect(result.hasNextPage).toBe(true)
    expect(result.hasPreviousPage).toBe(true)
  })

  test('returns correct last page with remaining items', () => {
    const items = ['a', 'b', 'c', 'd', 'e']
    const result = paginate(items, 3, 2)
    
    expect(result.items).toEqual(['e'])
    expect(result.page).toBe(3)
    expect(result.hasNextPage).toBe(false)
    expect(result.hasPreviousPage).toBe(true)
  })

  test('handles exact page size division', () => {
    const items = ['a', 'b', 'c', 'd']
    const result = paginate(items, 2, 2)
    
    expect(result.items).toEqual(['c', 'd'])
    expect(result.totalPages).toBe(2)
  })

  test('handles empty array', () => {
    const result = paginate([], 1, 10)
    
    expect(result.items).toEqual([])
    expect(result.totalPages).toBe(0)
    expect(result.hasNextPage).toBe(false)
  })

  test('clamps page number to valid range', () => {
    const items = ['a', 'b', 'c']
    const result = paginate(items, 10, 2)
    
    expect(result.page).toBe(2)
    expect(result.items).toEqual(['c'])
  })

  test('regression: no off-by-one at page boundaries', () => {
    // Create array with known values to detect skipped or duplicated items
    const items = Array.from({ length: 10 }, (_, i) => i)
    
    const page1 = paginate(items, 1, 3)
    const page2 = paginate(items, 2, 3)
    const page3 = paginate(items, 3, 3)
    const page4 = paginate(items, 4, 3)
    
    expect(page1.items).toEqual([0, 1, 2])
    expect(page2.items).toEqual([3, 4, 5])
    expect(page3.items).toEqual([6, 7, 8])
    expect(page4.items).toEqual([9])
    
    // Verify no gaps or overlaps
    const allItems = [
      ...page1.items,
      ...page2.items,
      ...page3.items,
      ...page4.items,
    ]
    expect(allItems).toEqual(items)
  })
})
