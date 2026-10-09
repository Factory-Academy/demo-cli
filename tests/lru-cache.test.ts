import { LRUCache } from '../src/utils/lru-cache'

describe('LRUCache', () => {
  describe('basic get and set', () => {
    test('stores and retrieves values', () => {
      const cache = new LRUCache<string>({ maxSize: 10, ttl: 1000 })
      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')
    })

    test('returns undefined for missing keys', () => {
      const cache = new LRUCache<string>({ maxSize: 10, ttl: 1000 })
      expect(cache.get('nonexistent')).toBeUndefined()
    })

    test('overwrites existing keys', () => {
      const cache = new LRUCache<string>({ maxSize: 10, ttl: 1000 })
      cache.set('key1', 'value1')
      cache.set('key1', 'value2')
      expect(cache.get('key1')).toBe('value2')
      expect(cache.size()).toBe(1)
    })
  })

  describe('LRU eviction', () => {
    test('evicts least recently used item when at capacity', () => {
      const cache = new LRUCache<number>({ maxSize: 3, ttl: 10000 })
      
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      
      expect(cache.size()).toBe(3)
      
      // Adding fourth item should evict 'a'
      cache.set('d', 4)
      
      expect(cache.size()).toBe(3)
      expect(cache.get('a')).toBeUndefined()
      expect(cache.get('b')).toBe(2)
      expect(cache.get('c')).toBe(3)
      expect(cache.get('d')).toBe(4)
    })

    test('get updates recency', () => {
      const cache = new LRUCache<number>({ maxSize: 3, ttl: 10000 })
      
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      
      // Access 'a' to make it most recent
      cache.get('a')
      
      // Adding fourth item should now evict 'b' (least recent)
      cache.set('d', 4)
      
      expect(cache.get('a')).toBe(1)
      expect(cache.get('b')).toBeUndefined()
      expect(cache.get('c')).toBe(3)
      expect(cache.get('d')).toBe(4)
    })

    test('set updates recency for existing keys', () => {
      const cache = new LRUCache<number>({ maxSize: 3, ttl: 10000 })
      
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      
      // Update 'a' to make it most recent
      cache.set('a', 10)
      
      // Adding fourth item should evict 'b'
      cache.set('d', 4)
      
      expect(cache.get('a')).toBe(10)
      expect(cache.get('b')).toBeUndefined()
      expect(cache.get('c')).toBe(3)
      expect(cache.get('d')).toBe(4)
    })
  })

  describe('TTL expiration', () => {
    test('returns undefined for expired entries', async () => {
      const cache = new LRUCache<string>({ maxSize: 10, ttl: 50 })
      
      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 60))
      
      expect(cache.get('key1')).toBeUndefined()
    })

    test('cleans up expired entries on access', async () => {
      const cache = new LRUCache<string>({ maxSize: 10, ttl: 50 })
      
      cache.set('key1', 'value1')
      expect(cache.size()).toBe(1)
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 60))
      
      // Accessing expired entry should remove it
      cache.get('key1')
      expect(cache.size()).toBe(0)
    })

    test('unexpired entries remain accessible', async () => {
      const cache = new LRUCache<string>({ maxSize: 10, ttl: 200 })
      
      cache.set('key1', 'value1')
      
      // Wait but not long enough to expire
      await new Promise(resolve => setTimeout(resolve, 50))
      
      expect(cache.get('key1')).toBe('value1')
    })
  })

  describe('evict', () => {
    test('removes specific key', () => {
      const cache = new LRUCache<string>({ maxSize: 10, ttl: 1000 })
      
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      
      expect(cache.evict('key1')).toBe(true)
      expect(cache.get('key1')).toBeUndefined()
      expect(cache.get('key2')).toBe('value2')
    })

    test('returns false for non-existent key', () => {
      const cache = new LRUCache<string>({ maxSize: 10, ttl: 1000 })
      expect(cache.evict('nonexistent')).toBe(false)
    })
  })

  describe('clear', () => {
    test('removes all entries', () => {
      const cache = new LRUCache<string>({ maxSize: 10, ttl: 1000 })
      
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')
      
      expect(cache.size()).toBe(3)
      
      cache.clear()
      
      expect(cache.size()).toBe(0)
      expect(cache.get('key1')).toBeUndefined()
      expect(cache.get('key2')).toBeUndefined()
      expect(cache.get('key3')).toBeUndefined()
    })
  })

  describe('has', () => {
    test('returns true for existing non-expired keys', () => {
      const cache = new LRUCache<string>({ maxSize: 10, ttl: 1000 })
      
      cache.set('key1', 'value1')
      
      expect(cache.has('key1')).toBe(true)
      expect(cache.has('nonexistent')).toBe(false)
    })

    test('returns false for expired keys', async () => {
      const cache = new LRUCache<string>({ maxSize: 10, ttl: 50 })
      
      cache.set('key1', 'value1')
      expect(cache.has('key1')).toBe(true)
      
      await new Promise(resolve => setTimeout(resolve, 60))
      
      expect(cache.has('key1')).toBe(false)
    })
  })

  describe('size', () => {
    test('returns current number of entries', () => {
      const cache = new LRUCache<string>({ maxSize: 10, ttl: 1000 })
      
      expect(cache.size()).toBe(0)
      
      cache.set('key1', 'value1')
      expect(cache.size()).toBe(1)
      
      cache.set('key2', 'value2')
      expect(cache.size()).toBe(2)
      
      cache.evict('key1')
      expect(cache.size()).toBe(1)
    })
  })

  describe('complex types', () => {
    test('handles object values', () => {
      interface User {
        id: string
        name: string
      }
      
      const cache = new LRUCache<User>({ maxSize: 10, ttl: 1000 })
      const user = { id: '1', name: 'Alice' }
      
      cache.set('user1', user)
      expect(cache.get('user1')).toEqual(user)
    })

    test('handles array values', () => {
      const cache = new LRUCache<number[]>({ maxSize: 10, ttl: 1000 })
      const arr = [1, 2, 3, 4, 5]
      
      cache.set('array1', arr)
      expect(cache.get('array1')).toEqual(arr)
    })
  })
})
