interface CacheEntry<T> {
  value: T
  expiry: number | null
}

export interface LRUCacheOptions {
  maxSize: number
  ttlMs?: number
}

export class LRUCache<K, V> {
  private cache: Map<K, CacheEntry<V>>
  private readonly maxSize: number
  private readonly ttlMs: number | null

  constructor(options: LRUCacheOptions) {
    this.cache = new Map()
    this.maxSize = options.maxSize
    this.ttlMs = options.ttlMs ?? null
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return undefined
    }

    // Check if entry has expired
    if (entry.expiry !== null && Date.now() > entry.expiry) {
      this.cache.delete(key)
      return undefined
    }

    // Move to end (most recently used) by deleting and re-inserting
    this.cache.delete(key)
    this.cache.set(key, entry)
    
    return entry.value
  }

  set(key: K, value: V): void {
    // Remove existing entry if present to update position
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }

    // Evict least recently used if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    const expiry = this.ttlMs !== null ? Date.now() + this.ttlMs : null
    this.cache.set(key, { value, expiry })
  }

  evict(key: K): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  has(key: K): boolean {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return false
    }

    // Check if expired
    if (entry.expiry !== null && Date.now() > entry.expiry) {
      this.cache.delete(key)
      return false
    }

    return true
  }
}
