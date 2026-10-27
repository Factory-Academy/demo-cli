import { LRUCache } from '../../src/utils/lru-cache'

describe('LRUCache', () => {
  test('should store and retrieve values', () => {
    const cache = new LRUCache<string, string>({ maxSize: 2 })
    cache.set('key1', 'val1')
    expect(cache.get('key1')).toBe('val1')
  })

  test('should respect maxSize and evict least recently used', () => {
    const cache = new LRUCache<string, string>({ maxSize: 2 })
    cache.set('key1', 'val1')
    cache.set('key2', 'val2')
    cache.set('key3', 'val3')

    expect(cache.get('key1')).toBeUndefined()
    expect(cache.get('key2')).toBe('val2')
    expect(cache.get('key3')).toBe('val3')
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

  test('should respect TTL', async () => {
    const cache = new LRUCache<string, string>({ maxSize: 2, ttl: 50 })
    cache.set('key1', 'val1')
    
    expect(cache.get('key1')).toBe('val1')
    
    await new Promise(resolve => setTimeout(resolve, 60))
    
    expect(cache.get('key1')).toBeUndefined()
  })

  test('should evict values manually', () => {
    const cache = new LRUCache<string, string>({ maxSize: 2 })
    cache.set('key1', 'val1')
    cache.evict('key1')
    expect(cache.get('key1')).toBeUndefined()
  })
})
