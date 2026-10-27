import { CacheOptions, CacheStats, ICache } from './cache-types'

interface CacheEntry<V> {
  value: V
  expiry?: number
}

export class LRUCache<K, V> implements ICache<K, V> {
  private cache: Map<K, CacheEntry<V>>
  private readonly maxSize: number
  private readonly ttl?: number
  private hits = 0
  private misses = 0

  constructor(options: CacheOptions) {
    this.cache = new Map()
    this.maxSize = Math.max(1, Math.floor(options.maxSize))
    this.ttl = options.ttl && options.ttl > 0 ? options.ttl : undefined
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key)
    if (!entry) {
      this.misses++
      return undefined
    }

    if (entry.expiry && entry.expiry <= Date.now()) {
      this.cache.delete(key)
      this.misses++
      return undefined
    }

    this.hits++

    // Refresh LRU position
    this.cache.delete(key)
    this.cache.set(key, entry)

    return entry.value
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item in Map iterator)
      const first = this.cache.keys().next()
      if (!first.done) {
        this.cache.delete(first.value)
      }
    }

    const expiry = this.ttl ? Date.now() + this.ttl : undefined
    this.cache.set(key, { value, expiry })
  }

  evict(key: K): boolean {
    return this.cache.delete(key)
  }

  size(): number {
    return this.cache.size
  }

  getStats(): CacheStats {
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
      maxSize: this.maxSize,
    }
  }

  clear(): void {
    this.cache.clear()
    this.hits = 0
    this.misses = 0
  }
}
