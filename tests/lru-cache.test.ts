import { LRUCache } from '../src/utils/lru-cache'

describe('LRUCache', () => {
  describe('basic operations', () => {
    test('stores and retrieves values', () => {
      const cache = new LRUCache<string, number>({ maxSize: 3 })
      
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      
      expect(cache.get('a')).toBe(1)
      expect(cache.get('b')).toBe(2)
      expect(cache.get('c')).toBe(3)
      expect(cache.size()).toBe(3)
    })

    test('returns undefined for missing keys', () => {
      const cache = new LRUCache<string, number>({ maxSize: 3 })
      expect(cache.get('nonexistent')).toBeUndefined()
    })

    test('updates existing values', () => {
      const cache = new LRUCache<string, number>({ maxSize: 3 })
      
      cache.set('a', 1)
      cache.set('a', 100)
      
      expect(cache.get('a')).toBe(100)
      expect(cache.size()).toBe(1)
    })

    test('has() checks key existence', () => {
      const cache = new LRUCache<string, number>({ maxSize: 3 })
      
      cache.set('a', 1)
      
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
    })
  })

  describe('LRU eviction', () => {
    test('evicts least recently used item when full', () => {
      const cache = new LRUCache<string, number>({ maxSize: 3 })
      
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4) // Should evict 'a'
      
      expect(cache.get('a')).toBeUndefined()
      expect(cache.get('b')).toBe(2)
      expect(cache.get('c')).toBe(3)
      expect(cache.get('d')).toBe(4)
      expect(cache.size()).toBe(3)
    })

    test('updates recency on get', () => {
      const cache = new LRUCache<string, number>({ maxSize: 3 })
      
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a') // Make 'a' most recently used
      cache.set('d', 4) // Should evict 'b', not 'a'
      
      expect(cache.get('a')).toBe(1)
      expect(cache.get('b')).toBeUndefined()
      expect(cache.get('c')).toBe(3)
      expect(cache.get('d')).toBe(4)
    })

    test('updates recency on set', () => {
      const cache = new LRUCache<string, number>({ maxSize: 3 })
      
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('a', 100) // Update 'a', making it most recently used
      cache.set('d', 4) // Should evict 'b'
      
      expect(cache.get('a')).toBe(100)
      expect(cache.get('b')).toBeUndefined()
      expect(cache.get('c')).toBe(3)
      expect(cache.get('d')).toBe(4)
    })
  })

  describe('TTL expiration', () => {
    test('expires entries after TTL', async () => {
      const cache = new LRUCache<string, number>({ maxSize: 3, ttlMs: 50 })
      
      cache.set('a', 1)
      expect(cache.get('a')).toBe(1)
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 60))
      
      expect(cache.get('a')).toBeUndefined()
      expect(cache.size()).toBe(0)
    })

    test('has() returns false for expired entries', async () => {
      const cache = new LRUCache<string, number>({ maxSize: 3, ttlMs: 50 })
      
      cache.set('a', 1)
      expect(cache.has('a')).toBe(true)
      
      await new Promise(resolve => setTimeout(resolve, 60))
      
      expect(cache.has('a')).toBe(false)
    })

    test('different entries can expire independently', async () => {
      const cache = new LRUCache<string, number>({ maxSize: 3, ttlMs: 50 })
      
      cache.set('a', 1)
      await new Promise(resolve => setTimeout(resolve, 30))
      cache.set('b', 2)
      await new Promise(resolve => setTimeout(resolve, 30))
      
      // 'a' should be expired, 'b' should still be valid
      expect(cache.get('a')).toBeUndefined()
      expect(cache.get('b')).toBe(2)
    })

    test('cache without TTL does not expire entries', async () => {
      const cache = new LRUCache<string, number>({ maxSize: 3 })
      
      cache.set('a', 1)
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(cache.get('a')).toBe(1)
    })
  })

  describe('explicit eviction', () => {
    test('evict() removes specific entry', () => {
      const cache = new LRUCache<string, number>({ maxSize: 3 })
      
      cache.set('a', 1)
      cache.set('b', 2)
      
      const evicted = cache.evict('a')
      
      expect(evicted).toBe(true)
      expect(cache.get('a')).toBeUndefined()
      expect(cache.get('b')).toBe(2)
      expect(cache.size()).toBe(1)
    })

    test('evict() returns false for nonexistent key', () => {
      const cache = new LRUCache<string, number>({ maxSize: 3 })
      
      const evicted = cache.evict('nonexistent')
      
      expect(evicted).toBe(false)
    })

    test('clear() removes all entries', () => {
      const cache = new LRUCache<string, number>({ maxSize: 3 })
      
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      
      cache.clear()
      
      expect(cache.size()).toBe(0)
      expect(cache.get('a')).toBeUndefined()
      expect(cache.get('b')).toBeUndefined()
      expect(cache.get('c')).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    test('handles maxSize of 1', () => {
      const cache = new LRUCache<string, number>({ maxSize: 1 })
      
      cache.set('a', 1)
      expect(cache.get('a')).toBe(1)
      
      cache.set('b', 2)
      expect(cache.get('a')).toBeUndefined()
      expect(cache.get('b')).toBe(2)
      expect(cache.size()).toBe(1)
    })

    test('works with complex value types', () => {
      const cache = new LRUCache<string, { data: string[] }>({ maxSize: 3 })
      
      const value = { data: ['a', 'b', 'c'] }
      cache.set('key', value)
      
      const retrieved = cache.get('key')
      expect(retrieved).toEqual(value)
      expect(retrieved?.data).toEqual(['a', 'b', 'c'])
    })

    test('works with numeric keys', () => {
      const cache = new LRUCache<number, string>({ maxSize: 3 })
      
      cache.set(1, 'one')
      cache.set(2, 'two')
      
      expect(cache.get(1)).toBe('one')
      expect(cache.get(2)).toBe('two')
    })
  })
})
