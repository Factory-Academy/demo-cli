interface CacheEntry<T> {
  value: T
  expiresAt: number
}

interface LRUCacheOptions {
  maxSize: number
  ttl: number // Time to live in milliseconds
}

export class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>
  private readonly maxSize: number
  private readonly ttl: number

  constructor(options: LRUCacheOptions) {
    this.cache = new Map()
    this.maxSize = options.maxSize
    this.ttl = options.ttl
  }

  /**
   * Get a value from the cache
   * Returns undefined if not found or expired
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return undefined
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return undefined
    }

    // Move to end (most recently used)
    this.cache.delete(key)
    this.cache.set(key, entry)

    return entry.value
  }

  /**
   * Set a value in the cache
   * Evicts least recently used item if at capacity
   */
  set(key: string, value: T): void {
    // If key exists, delete it first to update position
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }

    // Evict least recently used if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
      }
    }

    // Add new entry with expiration time
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.ttl,
    })
  }

  /**
   * Explicitly evict a key from the cache
   */
  evict(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Clear all entries from the cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get the current number of entries in the cache
   */
  size(): number {
    return this.cache.size
  }

  /**
   * Check if a key exists in the cache (and is not expired)
   */
  has(key: string): boolean {
    return this.get(key) !== undefined
  }
}
