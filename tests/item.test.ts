import { formatTable } from '../src/utils/format'
import { AsyncStorage } from '../src/utils/storage'
import { promises as fs } from 'fs'
import * as path from 'path'

interface Item {
  id: string
  name: string
  description?: string
  status: string
  createdAt: string
}

const STORAGE_DIR = path.join(process.cwd(), '.data')
const ITEM_FILE = path.join(STORAGE_DIR, 'items.json')

describe('formatTable', () => {
  test('formats data into aligned columns', () => {
    const data = [
      { id: '1', name: 'Test', status: 'active' },
      { id: '2', name: 'Another', status: 'pending' },
    ]
    const result = formatTable(data, ['id', 'name', 'status'])
    expect(result).toContain('id')
    expect(result).toContain('Test')
    expect(result).toContain('Another')
  })

  test('handles empty data', () => {
    expect(formatTable([], ['id', 'name'])).toBe('')
  })
})

describe('Item storage integration', () => {
  let storage: AsyncStorage<Item>

  beforeEach(async () => {
    storage = new AsyncStorage<Item>('items')
    // Clean up test data
    try {
      await fs.unlink(ITEM_FILE)
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error
      }
    }
  })

  afterEach(async () => {
    // Clean up test data
    try {
      await fs.unlink(ITEM_FILE)
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error
      }
    }
  })

  test('creates items with correct structure', async () => {
    const itemData = {
      name: 'Test Item',
      description: 'A test item',
      status: 'active',
      createdAt: new Date().toISOString(),
    }

    const item = await storage.create(itemData)

    expect(item.id).toBe('1')
    expect(item.name).toBe('Test Item')
    expect(item.description).toBe('A test item')
    expect(item.status).toBe('active')
    expect(item.createdAt).toBeDefined()
  })

  test('filters items by status', async () => {
    await storage.create({
      name: 'Active Item',
      status: 'active',
      createdAt: new Date().toISOString(),
    })
    await storage.create({
      name: 'Pending Item',
      status: 'pending',
      createdAt: new Date().toISOString(),
    })

    const activeItems = await storage.filter(item => item.status === 'active')

    expect(activeItems).toHaveLength(1)
    expect(activeItems[0].name).toBe('Active Item')
  })

  test('handles concurrent item creation', async () => {
    const promises = Array.from({ length: 5 }, (_, i) =>
      storage.create({
        name: `Item ${i}`,
        status: 'active',
        createdAt: new Date().toISOString(),
      })
    )

    const items = await Promise.all(promises)
    const ids = items.map(item => item.id)

    // All IDs should be unique
    expect(new Set(ids).size).toBe(5)
  })
})
