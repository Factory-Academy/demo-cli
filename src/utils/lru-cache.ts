interface CacheEntry<T> {
  value: T
  expiresAt?: number
}

export class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>
  private readonly maxSize: number
  private readonly defaultTTL?: number

  constructor(maxSize: number = 100, defaultTTL?: number) {
    if (maxSize <= 0) {
      throw new Error('maxSize must be greater than 0')
    }
    this.cache = new Map()
    this.maxSize = maxSize
    this.defaultTTL = defaultTTL
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key)

    if (!entry) {
      return undefined
    }

    // Check if entry has expired
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.cache.delete(key)
      return undefined
    }

    // Move to end (most recently used)
    this.cache.delete(key)
    this.cache.set(key, entry)

    return entry.value
  }

  set(key: string, value: T, ttl?: number): void {
    // Remove existing key to reset position
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }

    const expiresAt = ttl || this.defaultTTL
      ? Date.now() + ((ttl ?? this.defaultTTL)! * 1000)
      : undefined

    const entry: CacheEntry<T> = { value, expiresAt }
    this.cache.set(key, entry)

    // Evict oldest (first) entry if we exceed max size
    if (this.cache.size > this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }
  }

  evict(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}
