import { LRUCache } from '../src/utils/lru-cache'

describe('LRUCache', () => {
  describe('constructor', () => {
    test('creates cache with default max size of 100', () => {
      const cache = new LRUCache<string>()
      expect(cache.size()).toBe(0)
    })

    test('creates cache with custom max size', () => {
      const cache = new LRUCache<string>(50)
      expect(cache.size()).toBe(0)
    })

    test('throws error if max size is 0 or negative', () => {
      expect(() => new LRUCache<string>(0)).toThrow('maxSize must be greater than 0')
      expect(() => new LRUCache<string>(-1)).toThrow('maxSize must be greater than 0')
    })

    test('throws error if default TTL is 0 or negative', () => {
      expect(() => new LRUCache<string>(10, 0)).toThrow('defaultTTL must be greater than 0')
      expect(() => new LRUCache<string>(10, -5)).toThrow('defaultTTL must be greater than 0')
    })
  })

  describe('set and get', () => {
    test('stores and retrieves a value', () => {
      const cache = new LRUCache<string>(10)
      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')
    })

    test('returns undefined for non-existent key', () => {
      const cache = new LRUCache<string>(10)
      expect(cache.get('nonexistent')).toBeUndefined()
    })

    test('stores multiple values', () => {
      const cache = new LRUCache<string>(10)
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')
      expect(cache.get('key1')).toBe('value1')
      expect(cache.get('key2')).toBe('value2')
      expect(cache.get('key3')).toBe('value3')
    })

    test('overwrites existing key', () => {
      const cache = new LRUCache<string>(10)
      cache.set('key1', 'value1')
      cache.set('key1', 'value2')
      expect(cache.get('key1')).toBe('value2')
      expect(cache.size()).toBe(1)
    })

    test('handles different data types', () => {
      const cache = new LRUCache<any>(10)
      const obj = { id: '1', name: 'Test' }
      cache.set('obj', obj)
      expect(cache.get('obj')).toEqual(obj)
    })

    test('throws error for empty string key', () => {
      const cache = new LRUCache<string>(10)
      expect(() => cache.set('', 'value')).toThrow('key must be a non-empty string')
    })

    test('throws error when getting with empty string key', () => {
      const cache = new LRUCache<string>(10)
      expect(() => cache.get('')).toThrow('key must be a non-empty string')
    })

    test('throws error for invalid TTL (zero or negative)', () => {
      const cache = new LRUCache<string>(10)
      expect(() => cache.set('key1', 'value', 0)).toThrow('ttl must be a positive finite number')
      expect(() => cache.set('key1', 'value', -1)).toThrow('ttl must be a positive finite number')
    })

    test('throws error for invalid TTL (non-finite)', () => {
      const cache = new LRUCache<string>(10)
      expect(() => cache.set('key1', 'value', Infinity)).toThrow('ttl must be a positive finite number')
      expect(() => cache.set('key1', 'value', NaN)).toThrow('ttl must be a positive finite number')
    })

    test('allows TTL of 0 to be rejected in constructor', () => {
      expect(() => new LRUCache<string>(10, 0)).toThrow('defaultTTL must be greater than 0')
    })
  })

  describe('LRU eviction', () => {
    test('evicts oldest entry when max size is exceeded', () => {
      const cache = new LRUCache<string>(3)
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')
      expect(cache.size()).toBe(3)

      // Adding a 4th entry should evict the first
      cache.set('key4', 'value4')
      expect(cache.size()).toBe(3)
      expect(cache.get('key1')).toBeUndefined()
      expect(cache.get('key4')).toBe('value4')
    })

    test('updates position when existing key is accessed', () => {
      const cache = new LRUCache<string>(3)
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      // Access key1 to make it recently used
      cache.get('key1')

      // Add key4, which should evict key2 (not key1)
      cache.set('key4', 'value4')
      expect(cache.get('key1')).toBe('value1')
      expect(cache.get('key2')).toBeUndefined()
      expect(cache.get('key3')).toBe('value3')
      expect(cache.get('key4')).toBe('value4')
    })

    test('updates position when existing key is set again', () => {
      const cache = new LRUCache<string>(3)
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      // Update key1 to make it recently used
      cache.set('key1', 'value1-updated')

      // Add key4, which should evict key2 (not key1)
      cache.set('key4', 'value4')
      expect(cache.get('key1')).toBe('value1-updated')
      expect(cache.get('key2')).toBeUndefined()
      expect(cache.get('key3')).toBe('value3')
      expect(cache.get('key4')).toBe('value4')
    })
  })

  describe('TTL (Time To Live)', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.runOnlyPendingTimers()
      jest.useRealTimers()
    })

    test('stores entry with custom TTL', () => {
      const cache = new LRUCache<string>(10)
      cache.set('key1', 'value1', 2) // 2 seconds TTL
      expect(cache.get('key1')).toBe('value1')
    })

    test('returns undefined after TTL expires', () => {
      const cache = new LRUCache<string>(10)
      cache.set('key1', 'value1', 2) // 2 seconds TTL
      expect(cache.get('key1')).toBe('value1')

      // Advance time by 3 seconds
      jest.advanceTimersByTime(3000)
      expect(cache.get('key1')).toBeUndefined()
    })

    test('does not expire entry within TTL', () => {
      const cache = new LRUCache<string>(10)
      cache.set('key1', 'value1', 5) // 5 seconds TTL
      jest.advanceTimersByTime(3000) // Advance 3 seconds
      expect(cache.get('key1')).toBe('value1')
    })

    test('uses default TTL when provided', () => {
      const cache = new LRUCache<string>(10, 3) // Default 3 seconds TTL
      cache.set('key1', 'value1') // Uses default TTL
      expect(cache.get('key1')).toBe('value1')
      jest.advanceTimersByTime(4000) // Advance 4 seconds
      expect(cache.get('key1')).toBeUndefined()
    })

    test('custom TTL overrides default TTL', () => {
      const cache = new LRUCache<string>(10, 10) // Default 10 seconds TTL
      cache.set('key1', 'value1', 2) // Override with 2 seconds TTL
      jest.advanceTimersByTime(3000) // Advance 3 seconds
      expect(cache.get('key1')).toBeUndefined()
    })

    test('entry without TTL never expires', () => {
      const cache = new LRUCache<string>(10) // No default TTL
      cache.set('key1', 'value1') // No TTL specified
      jest.advanceTimersByTime(10000) // Advance 10 seconds
      expect(cache.get('key1')).toBe('value1')
    })
  })

  describe('evict', () => {
    test('removes specific entry by key', () => {
      const cache = new LRUCache<string>(10)
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.evict('key1')
      expect(cache.get('key1')).toBeUndefined()
      expect(cache.get('key2')).toBe('value2')
      expect(cache.size()).toBe(1)
    })

    test('does nothing for non-existent key', () => {
      const cache = new LRUCache<string>(10)
      cache.set('key1', 'value1')
      cache.evict('nonexistent')
      expect(cache.get('key1')).toBe('value1')
      expect(cache.size()).toBe(1)
    })

    test('throws error for empty string key', () => {
      const cache = new LRUCache<string>(10)
      expect(() => cache.evict('')).toThrow('key must be a non-empty string')
    })
  })

  describe('clear', () => {
    test('removes all entries', () => {
      const cache = new LRUCache<string>(10)
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

  describe('size', () => {
    test('returns correct cache size', () => {
      const cache = new LRUCache<string>(10)
      expect(cache.size()).toBe(0)
      cache.set('key1', 'value1')
      expect(cache.size()).toBe(1)
      cache.set('key2', 'value2')
      expect(cache.size()).toBe(2)
      cache.evict('key1')
      expect(cache.size()).toBe(1)
    })
  })

  describe('integration scenarios', () => {
    test('handles cache with max size of 1', () => {
      const cache = new LRUCache<string>(1)
      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')
      cache.set('key2', 'value2')
      expect(cache.get('key1')).toBeUndefined()
      expect(cache.get('key2')).toBe('value2')
    })

    test('complex scenario with mixed operations', () => {
      const cache = new LRUCache<object>(5)
      const obj1 = { id: '1', name: 'Item 1' }
      const obj2 = { id: '2', name: 'Item 2' }
      const obj3 = { id: '3', name: 'Item 3' }

      cache.set('key1', obj1)
      cache.set('key2', obj2)
      expect(cache.get('key1')).toEqual(obj1) // Make key1 recent

      cache.set('key3', obj3)
      cache.evict('key2')

      expect(cache.size()).toBe(2)
      expect(cache.get('key1')).toEqual(obj1)
      expect(cache.get('key2')).toBeUndefined()
      expect(cache.get('key3')).toEqual(obj3)
    })
  })
})
