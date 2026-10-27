interface CacheEntry<V> {
  value: V
  expiry?: number
}

export class LRUCache<K, V> {
  private cache: Map<K, CacheEntry<V>>
  private readonly maxSize: number
  private readonly ttl?: number

  constructor(options: { maxSize: number; ttl?: number }) {
    this.cache = new Map()
    this.maxSize = Math.max(1, options.maxSize)
    this.ttl = options.ttl
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key)
    if (!entry) return undefined

    if (entry.expiry && entry.expiry < Date.now()) {
      this.cache.delete(key)
      return undefined
    }

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
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
      }
    }

    const expiry = this.ttl ? Date.now() + this.ttl : undefined
    this.cache.set(key, { value, expiry })
  }

  evict(key: K): void {
    this.cache.delete(key)
  }

  size(): number {
    return this.cache.size
  }

  clear(): void {
    this.cache.clear()
  }
}
