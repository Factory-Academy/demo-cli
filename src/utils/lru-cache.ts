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
    if (defaultTTL !== undefined && defaultTTL <= 0) {
      throw new Error('defaultTTL must be greater than 0')
    }
    this.cache = new Map()
    this.maxSize = maxSize
    this.defaultTTL = defaultTTL
  }

  private validateKey(key: string): void {
    if (!key || typeof key !== 'string') {
      throw new Error('key must be a non-empty string')
    }
  }

  private validateTTL(ttl: number | undefined): void {
    if (ttl !== undefined && (ttl <= 0 || !Number.isFinite(ttl))) {
      throw new Error('ttl must be a positive finite number')
    }
  }

  private isExpired(entry: CacheEntry<T>): boolean {
    return entry.expiresAt !== undefined && entry.expiresAt < Date.now()
  }

  get(key: string): T | undefined {
    this.validateKey(key)
    const entry = this.cache.get(key)

    if (!entry) {
      return undefined
    }

    // Check if entry has expired
    if (this.isExpired(entry)) {
      this.cache.delete(key)
      return undefined
    }

    // Move to end (most recently used)
    this.cache.delete(key)
    this.cache.set(key, entry)

    return entry.value
  }

  set(key: string, value: T, ttl?: number): void {
    this.validateKey(key)
    this.validateTTL(ttl)

    // Remove existing key to reset position
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }

    // Calculate expiration time with proper fallback logic
    const effectiveTTL = ttl !== undefined ? ttl : this.defaultTTL
    const expiresAt = effectiveTTL !== undefined
      ? Date.now() + (effectiveTTL * 1000)
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
    this.validateKey(key)
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}
