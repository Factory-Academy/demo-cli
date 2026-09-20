import { AsyncStorage } from '../src/utils/storage'
import { promises as fs } from 'fs'
import * as path from 'path'

interface TestItem {
  id: string
  name: string
  value: number
}

const STORAGE_DIR = path.join(process.cwd(), '.data')
const TEST_NAMESPACE = 'test-items'
const TEST_FILE = path.join(STORAGE_DIR, `${TEST_NAMESPACE}.json`)

describe('AsyncStorage', () => {
  let storage: AsyncStorage<TestItem>

  beforeEach(async () => {
    storage = new AsyncStorage<TestItem>(TEST_NAMESPACE)
    // Clean up test data
    try {
      await fs.unlink(TEST_FILE)
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error
      }
    }
  })

  afterEach(async () => {
    // Clean up test data
    try {
      await fs.unlink(TEST_FILE)
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error
      }
    }
  })

  test('creates items with auto-incremented IDs', async () => {
    const item1 = await storage.create({ name: 'Item 1', value: 100 })
    const item2 = await storage.create({ name: 'Item 2', value: 200 })
    const item3 = await storage.create({ name: 'Item 3', value: 300 })

    expect(item1.id).toBe('1')
    expect(item2.id).toBe('2')
    expect(item3.id).toBe('3')
  })

  test('reads all items', async () => {
    await storage.create({ name: 'Item 1', value: 100 })
    await storage.create({ name: 'Item 2', value: 200 })

    const items = await storage.readAll()

    expect(items).toHaveLength(2)
    expect(items[0].name).toBe('Item 1')
    expect(items[1].name).toBe('Item 2')
  })

  test('returns empty array when no items exist', async () => {
    const items = await storage.readAll()
    expect(items).toEqual([])
  })

  test('finds item by ID', async () => {
    await storage.create({ name: 'Item 1', value: 100 })
    const created = await storage.create({ name: 'Item 2', value: 200 })

    const found = await storage.findById(created.id)

    expect(found).toBeDefined()
    expect(found?.name).toBe('Item 2')
    expect(found?.value).toBe(200)
  })

  test('returns undefined for non-existent ID', async () => {
    const found = await storage.findById('999')
    expect(found).toBeUndefined()
  })

  test('filters items by predicate', async () => {
    await storage.create({ name: 'Item 1', value: 100 })
    await storage.create({ name: 'Item 2', value: 200 })
    await storage.create({ name: 'Item 3', value: 150 })

    const filtered = await storage.filter(item => item.value >= 150)

    expect(filtered).toHaveLength(2)
    expect(filtered[0].value).toBe(200)
    expect(filtered[1].value).toBe(150)
  })

  test('persists data to file system', async () => {
    await storage.create({ name: 'Persistent Item', value: 100 })

    // Create new storage instance to read from disk
    const newStorage = new AsyncStorage<TestItem>(TEST_NAMESPACE)
    const items = await newStorage.readAll()

    expect(items).toHaveLength(1)
    expect(items[0].name).toBe('Persistent Item')
  })

  test('handles concurrent create operations without ID collisions', async () => {
    const promises = Array.from({ length: 10 }, (_, i) =>
      storage.create({ name: `Item ${i}`, value: i * 10 })
    )

    const items = await Promise.all(promises)

    // Extract IDs and check for uniqueness
    const ids = items.map(item => item.id)
    const uniqueIds = new Set(ids)

    expect(uniqueIds.size).toBe(10)
    expect(ids).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'])
  })

  test('maintains data integrity under concurrent operations', async () => {
    // Mix reads and writes
    const operations = [
      storage.create({ name: 'Item 1', value: 1 }),
      storage.readAll(),
      storage.create({ name: 'Item 2', value: 2 }),
      storage.readAll(),
      storage.create({ name: 'Item 3', value: 3 }),
    ]

    await Promise.all(operations)

    const finalItems = await storage.readAll()
    expect(finalItems).toHaveLength(3)
    
    // Verify all items have unique IDs
    const ids = finalItems.map(item => item.id)
    expect(new Set(ids).size).toBe(3)
  })

  test('preserves item data types', async () => {
    const created = await storage.create({ name: 'Test', value: 42 })

    expect(typeof created.id).toBe('string')
    expect(typeof created.name).toBe('string')
    expect(typeof created.value).toBe('number')

    const found = await storage.findById(created.id)
    expect(typeof found?.value).toBe('number')
    expect(found?.value).toBe(42)
  })
})
