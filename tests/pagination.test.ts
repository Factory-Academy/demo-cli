import { paginate, encodeCursor, decodeCursor, MAX_PAGE_LIMIT } from '../src/utils/pagination'

describe('pagination', () => {
  describe('encodeCursor', () => {
    test('encodes a numeric offset to base64', () => {
      const cursor = encodeCursor(10)
      expect(cursor).toBe(Buffer.from('10').toString('base64'))
    })

    test('encodes zero offset', () => {
      const cursor = encodeCursor(0)
      expect(cursor).toBe(Buffer.from('0').toString('base64'))
    })

    test('encodes large offset', () => {
      const cursor = encodeCursor(9999)
      expect(cursor).toBe(Buffer.from('9999').toString('base64'))
    })
  })

  describe('decodeCursor', () => {
    test('decodes a valid cursor back to offset', () => {
      const cursor = encodeCursor(10)
      const offset = decodeCursor(cursor)
      expect(offset).toBe(10)
    })

    test('decodes zero offset', () => {
      const cursor = encodeCursor(0)
      const offset = decodeCursor(cursor)
      expect(offset).toBe(0)
    })

    test('throws on invalid base64', () => {
      expect(() => decodeCursor('invalid!@#$')).toThrow('Invalid cursor format')
    })

    test('throws on negative offset', () => {
      const cursor = Buffer.from('-5').toString('base64')
      expect(() => decodeCursor(cursor)).toThrow('Invalid cursor value')
    })

    test('throws on non-numeric cursor', () => {
      const cursor = Buffer.from('abc').toString('base64')
      expect(() => decodeCursor(cursor)).toThrow('Invalid cursor value')
    })

    test('throws on floating point cursor', () => {
      const cursor = Buffer.from('10.5').toString('base64')
      expect(() => decodeCursor(cursor)).toThrow('Invalid cursor value')
    })

    test('throws on cursor with whitespace', () => {
      const cursor = Buffer.from(' 10 ').toString('base64')
      expect(() => decodeCursor(cursor)).toThrow('Invalid cursor value')
    })
  })

  describe('paginate', () => {
    const sampleData = Array.from({ length: 25 }, (_, i) => ({
      id: String(i + 1),
      name: `Item ${i + 1}`,
    }))

    test('returns first page without cursor', () => {
      const result = paginate(sampleData, { limit: 10 })
      
      expect(result.items).toHaveLength(10)
      expect(result.items[0].id).toBe('1')
      expect(result.items[9].id).toBe('10')
      expect(result.hasMore).toBe(true)
      expect(result.nextCursor).toBeDefined()
    })

    test('returns second page with cursor', () => {
      const firstPage = paginate(sampleData, { limit: 10 })
      const secondPage = paginate(sampleData, {
        cursor: firstPage.nextCursor,
        limit: 10,
      })
      
      expect(secondPage.items).toHaveLength(10)
      expect(secondPage.items[0].id).toBe('11')
      expect(secondPage.items[9].id).toBe('20')
      expect(secondPage.hasMore).toBe(true)
      expect(secondPage.nextCursor).toBeDefined()
    })

    test('returns last page with no nextCursor', () => {
      const firstPage = paginate(sampleData, { limit: 10 })
      const secondPage = paginate(sampleData, {
        cursor: firstPage.nextCursor,
        limit: 10,
      })
      const thirdPage = paginate(sampleData, {
        cursor: secondPage.nextCursor,
        limit: 10,
      })
      
      expect(thirdPage.items).toHaveLength(5)
      expect(thirdPage.items[0].id).toBe('21')
      expect(thirdPage.items[4].id).toBe('25')
      expect(thirdPage.hasMore).toBe(false)
      expect(thirdPage.nextCursor).toBeUndefined()
    })

    test('handles exact page boundary', () => {
      const data = Array.from({ length: 20 }, (_, i) => ({ id: String(i + 1) }))
      const firstPage = paginate(data, { limit: 10 })
      const secondPage = paginate(data, {
        cursor: firstPage.nextCursor,
        limit: 10,
      })
      
      expect(secondPage.items).toHaveLength(10)
      expect(secondPage.hasMore).toBe(false)
      expect(secondPage.nextCursor).toBeUndefined()
    })

    test('handles empty array', () => {
      const result = paginate([], { limit: 10 })
      
      expect(result.items).toHaveLength(0)
      expect(result.hasMore).toBe(false)
      expect(result.nextCursor).toBeUndefined()
    })

    test('handles limit larger than total items', () => {
      const data = Array.from({ length: 5 }, (_, i) => ({ id: String(i + 1) }))
      const result = paginate(data, { limit: 10 })
      
      expect(result.items).toHaveLength(5)
      expect(result.hasMore).toBe(false)
      expect(result.nextCursor).toBeUndefined()
    })

    test('handles cursor beyond data length', () => {
      const cursor = encodeCursor(100)
      const result = paginate(sampleData, { cursor, limit: 10 })
      
      expect(result.items).toHaveLength(0)
      expect(result.hasMore).toBe(false)
      expect(result.nextCursor).toBeUndefined()
    })

    test('handles limit of 1', () => {
      const result = paginate(sampleData, { limit: 1 })
      
      expect(result.items).toHaveLength(1)
      expect(result.items[0].id).toBe('1')
      expect(result.hasMore).toBe(true)
      expect(result.nextCursor).toBeDefined()
    })

    test('maintains pagination consistency across pages', () => {
      const allItems: typeof sampleData = []
      let cursor: string | undefined = undefined
      let page = 0
      
      // Paginate through all items
      while (true) {
        const result = paginate(sampleData, { cursor, limit: 7 })
        allItems.push(...result.items)
        page++
        
        if (!result.hasMore) {
          break
        }
        cursor = result.nextCursor
      }
      
      // Verify we got all items exactly once
      expect(allItems).toHaveLength(25)
      expect(allItems[0].id).toBe('1')
      expect(allItems[24].id).toBe('25')
      expect(page).toBe(4) // 7, 7, 7, 4 = 4 pages
    })

    test('throws on invalid cursor', () => {
      expect(() => paginate(sampleData, {
        cursor: 'invalid',
        limit: 10,
      })).toThrow()
    })

    test('throws on zero limit', () => {
      expect(() => paginate(sampleData, { limit: 0 })).toThrow('Limit must be a positive integer')
    })

    test('throws on negative limit', () => {
      expect(() => paginate(sampleData, { limit: -5 })).toThrow('Limit must be a positive integer')
    })

    test('throws on floating point limit', () => {
      expect(() => paginate(sampleData, { limit: 10.5 })).toThrow('Limit must be a positive integer')
    })

    test('throws on limit exceeding MAX_PAGE_LIMIT', () => {
      expect(() => paginate(sampleData, { limit: MAX_PAGE_LIMIT + 1 }))
        .toThrow(`Limit cannot exceed ${MAX_PAGE_LIMIT}`)
    })

    test('accepts limit at MAX_PAGE_LIMIT', () => {
      const data = Array.from({ length: 2000 }, (_, i) => ({ id: String(i + 1) }))
      const result = paginate(data, { limit: MAX_PAGE_LIMIT })
      
      expect(result.items).toHaveLength(MAX_PAGE_LIMIT)
      expect(result.hasMore).toBe(true)
    })

    test('handles offset exactly at items.length', () => {
      const cursor = encodeCursor(sampleData.length)
      const result = paginate(sampleData, { cursor, limit: 10 })
      
      expect(result.items).toHaveLength(0)
      expect(result.hasMore).toBe(false)
      expect(result.nextCursor).toBeUndefined()
    })
  })
})
