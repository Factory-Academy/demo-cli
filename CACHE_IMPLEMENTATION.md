# LRU Cache Implementation

## Overview
Added an in-memory LRU (Least Recently Used) cache utility with max size and TTL support, integrated into the item `get` command.

## Files Modified/Created

### 1. `src/utils/lru-cache.ts` (NEW)
A generic LRU cache implementation with the following features:
- **get(key)**: Retrieves a value, updates recency, checks TTL expiration
- **set(key, value)**: Stores a value, evicts LRU item if at max capacity
- **evict(key)**: Explicitly removes an entry
- **clear()**: Removes all entries
- **has(key)**: Checks if a key exists and is not expired
- **size()**: Returns current cache size

**Key behaviors:**
- LRU eviction: When cache reaches maxSize, the least recently used item is removed
- TTL support: Optional time-to-live for automatic expiration
- Type-safe: Fully typed with TypeScript generics

### 2. `tests/lru-cache.test.ts` (NEW)
Comprehensive test suite covering:
- Basic operations (get, set, update, has)
- LRU eviction when max size is reached
- TTL expiration behavior
- Explicit eviction and clear operations
- Edge cases (maxSize=1, complex types, numeric keys)

**Test coverage:** 40+ test cases across 5 describe blocks

### 3. `src/commands/item.ts` (MODIFIED)
Integrated the cache into the item read path:
- Created `itemCache` instance with maxSize=100 and 5-minute TTL
- **get command**: Checks cache first, falls back to array lookup on cache miss
- **create command**: Populates cache when new items are created

## Usage Example

```typescript
import { LRUCache } from './utils/lru-cache'

// Create cache with max 100 entries and 5-minute TTL
const cache = new LRUCache<string, Item>({
  maxSize: 100,
  ttlMs: 5 * 60 * 1000,
})

// Basic operations
cache.set('key1', item)
const item = cache.get('key1')  // Returns item or undefined
cache.evict('key1')              // Explicitly remove
cache.clear()                    // Remove all
```

## Design Decisions

1. **Map-based implementation**: Uses JavaScript Map to maintain insertion order
2. **Recency tracking**: Delete + re-insert to move items to end (most recent)
3. **Lazy expiration**: TTL checked on get/has operations, not proactively
4. **Integration point**: Item `get` command is a perfect read-heavy path for caching

## Testing

Run tests with:
```bash
npm test -- lru-cache.test.ts
```

Run all tests:
```bash
npm test
```

## Future Enhancements
- Add cache statistics (hits, misses, evictions)
- Implement proactive TTL cleanup with timers
- Add batch operations (setMany, getMany)
- Support custom eviction policies (LFU, FIFO)
