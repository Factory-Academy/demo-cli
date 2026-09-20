# Quick Reference: Race Condition Fix

## The Race Condition Problem

**Scenario**: Two async operations try to create items concurrently

### Without Serialization (BROKEN)
```typescript
// Operation 1                    // Operation 2
const data = await read()         const data = await read()
// data.nextId = 1                // data.nextId = 1 (RACE!)
const item1 = { id: "1", ... }    const item2 = { id: "1", ... } (COLLISION!)
data.nextId = 2                   data.nextId = 2
await write(data)                 await write(data) (OVERWRITES!)
```

**Result**: ID collision, data loss

### With Serialization (FIXED)
```typescript
serializer.execute('file', async () => {
  // Operation 1 runs completely first
  const data = await read()        // data.nextId = 1
  const item1 = { id: "1", ... }
  data.nextId = 2
  await write(data)
})

// Operation 2 waits in queue, then runs
serializer.execute('file', async () => {
  const data = await read()        // data.nextId = 2 ✓
  const item2 = { id: "2", ... }   // Unique ID ✓
  data.nextId = 3
  await write(data)                // No overwrite ✓
})
```

**Result**: Unique IDs 1, 2, 3... No data loss

## Key Files

### Implementation
- **`src/utils/serializer.ts`** - Queue mechanism
- **`src/utils/storage.ts`** - Async storage using serializer

### Callers (Refactored)
- **`src/commands/item.ts`** - Uses AsyncStorage
- **`src/commands/widget.ts`** - Uses AsyncStorage

### Tests
- **`tests/serializer.test.ts`** - Tests queue behavior
- **`tests/storage.test.ts`** - Tests race prevention
- **`tests/item.test.ts`** - Item integration tests
- **`tests/widget.test.ts`** - Widget integration tests

## How It Works

### 1. Serializer Pattern
```typescript
class Serializer {
  queues: Map<string, QueueItem[]>  // Per-key queues
  
  async execute(key, operation) {
    // Add to queue for this key
    // If not processing, start processing
    // Operations execute in FIFO order
  }
}
```

### 2. Storage Uses Serializer
```typescript
class AsyncStorage {
  async create(item) {
    return globalSerializer.execute(this.filePath, async () => {
      const data = await readFile()     // Read
      const newItem = { ...item, id }   // Modify
      await writeFile(data)              // Write
      // ↑ All atomic within serializer
    })
  }
}
```

### 3. Commands Use Storage
```typescript
// Before (in-memory, sync)
const items: Item[] = []
let nextId = 1
items.push({ id: String(nextId++), ...data })

// After (persistent, async, safe)
const storage = new AsyncStorage<Item>('items')
await storage.create(data)  // Serialized, no races
```

## Testing Race Prevention

### Test Case: 10 Concurrent Creates
```typescript
const promises = Array.from({ length: 10 }, (_, i) =>
  storage.create({ name: `Item ${i}`, value: i })
)

const items = await Promise.all(promises)
const ids = items.map(item => item.id)

// Without serialization: possible duplicates, overwrites
// With serialization: guaranteed unique sequential IDs
expect(ids).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'])
```

## Benefits

### Correctness
- ✓ No ID collisions
- ✓ No data corruption  
- ✓ No lost updates

### Performance
- ✓ Reads can be parallel
- ✓ Writes on different files parallel
- ✓ Only same-file writes serialized

### Simplicity
- ✓ No manual locks/mutexes
- ✓ No deadlock risk
- ✓ Easy to test and verify

## Running Tests

```bash
# All tests
npm test

# Specific tests
npm test serializer.test.ts  # Queue behavior
npm test storage.test.ts     # Race prevention
npm test item.test.ts        # Item integration
npm test widget.test.ts      # Widget integration
```

## Migration Checklist

For any new command needing async storage:

- [ ] Import `AsyncStorage` from `src/utils/storage`
- [ ] Create storage instance: `new AsyncStorage<T>('namespace')`
- [ ] Make action handlers `async`
- [ ] Replace array operations with storage methods:
  - `array.push()` → `await storage.create()`
  - `array.filter()` → `await storage.filter()`
  - `array.find()` → `await storage.findById()`
  - `array` → `await storage.readAll()`
- [ ] Add integration tests
- [ ] Verify concurrent operation safety

## Example: Adding a New Command

```typescript
import { AsyncStorage } from '../utils/storage'

interface Task {
  id: string
  title: string
  completed: boolean
}

const storage = new AsyncStorage<Task>('tasks')

export const taskCommand = new Command('tasks')

taskCommand
  .command('create')
  .requiredOption('--title <title>')
  .action(async (opts) => {
    const task = await storage.create({
      title: opts.title,
      completed: false,
    })
    console.log(`Created task ${task.id}`)
  })

taskCommand
  .command('list')
  .action(async () => {
    const tasks = await storage.readAll()
    console.log(formatTable(tasks, ['id', 'title', 'completed']))
  })
```

Race-safe by default! No additional work needed.
