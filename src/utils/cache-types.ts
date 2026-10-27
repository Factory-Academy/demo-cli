export interface CacheOptions {
  maxSize: number
  ttl?: number
}

export interface CacheStats {
  hits: number
  misses: number
  size: number
  maxSize: number
}

export interface ICache<K, V> {
  get(key: K): V | undefined
  set(key: K, value: V): void
  evict(key: K): boolean
  size(): number
  getStats(): CacheStats
  clear(): void
}
