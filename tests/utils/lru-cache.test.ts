import { LRUCache } from '../../src/utils/lru-cache'

describe('LRUCache', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('should store and retrieve values', () => {
    const cache = new LRUCache<string, string>({ maxSize: 2 })
    cache.set('key1', 'val1')
    expect(cache.get('key1')).toBe('val1')
    expect(cache.getStats().hits).toBe(1)
  })

  test('should respect maxSize and evict least recently used', () => {
    const cache = new LRUCache<string, string>({ maxSize: 2 })
    cache.set('key1', 'val1')
    cache.set('key2', 'val2')
    cache.set('key3', 'val3')

    expect(cache.get('key1')).toBeUndefined()
    expect(cache.get('key2')).toBe('val2')
    expect(cache.get('key3')).toBe('val3')
    expect(cache.getStats().misses).toBe(1)
  })

  test('should update LRU position on get', () => {
    const cache = new LRUCache<string, string>({ maxSize: 2 })
    cache.set('key1', 'val1')
    cache.set('key2', 'val2')
    
    // access key1 to make it most recently used
    cache.get('key1')
    
    cache.set('key3', 'val3')

    expect(cache.get('key2')).toBeUndefined()
    expect(cache.get('key1')).toBe('val1')
    expect(cache.get('key3')).toBe('val3')
  })

  test('should respect TTL', () => {
    const cache = new LRUCache<string, string>({ maxSize: 2, ttl: 50 })
    cache.set('key1', 'val1')
    
    expect(cache.get('key1')).toBe('val1')
    
    jest.advanceTimersByTime(51)
    
    expect(cache.get('key1')).toBeUndefined()
    expect(cache.getStats().misses).toBe(1)
  })

  test('should handle undefined keys correctly', () => {
    const cache = new LRUCache<any, string>({ maxSize: 1 })
    cache.set(undefined, 'val')
    expect(cache.get(undefined)).toBe('val')
    
    cache.set('other', 'val2')
    expect(cache.get(undefined)).toBeUndefined()
  })

  test('should handle non-integer maxSize', () => {
    const cache = new LRUCache<string, string>({ maxSize: 1.5 })
    cache.set('key1', 'val1')
    cache.set('key2', 'val2')
    expect(cache.get('key1')).toBeUndefined()
    expect(cache.get('key2')).toBe('val2')
  })

  test('should track stats correctly', () => {
    const cache = new LRUCache<string, string>({ maxSize: 2 })
    cache.set('key1', 'val1')
    cache.get('key1') // hit
    cache.get('key2') // miss
    
    const stats = cache.getStats()
    expect(stats.hits).toBe(1)
    expect(stats.misses).toBe(1)
    expect(stats.size).toBe(1)
  })

  test('should evict values manually', () => {
    const cache = new LRUCache<string, string>({ maxSize: 2 })
    cache.set('key1', 'val1')
    const evicted = cache.evict('key1')
    expect(evicted).toBe(true)
    expect(cache.get('key1')).toBeUndefined()
  })
})
