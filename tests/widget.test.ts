import { AsyncStorage } from '../src/utils/storage'
import { promises as fs } from 'fs'
import * as path from 'path'

interface Widget {
  id: string
  name: string
  itemId: string
  priority: number
  createdAt: string
}

const STORAGE_DIR = path.join(process.cwd(), '.data')
const WIDGET_FILE = path.join(STORAGE_DIR, 'widgets.json')

describe('Widget storage integration', () => {
  let storage: AsyncStorage<Widget>

  beforeEach(async () => {
    storage = new AsyncStorage<Widget>('widgets')
    // Clean up test data
    try {
      await fs.unlink(WIDGET_FILE)
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error
      }
    }
  })

  afterEach(async () => {
    // Clean up test data
    try {
      await fs.unlink(WIDGET_FILE)
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error
      }
    }
  })

  test('creates widgets with correct structure', async () => {
    const widgetData = {
      name: 'Test Widget',
      itemId: '1',
      priority: 5,
      createdAt: new Date().toISOString(),
    }

    const widget = await storage.create(widgetData)

    expect(widget.id).toBe('1')
    expect(widget.name).toBe('Test Widget')
    expect(widget.itemId).toBe('1')
    expect(widget.priority).toBe(5)
    expect(widget.createdAt).toBeDefined()
  })

  test('filters widgets by item ID', async () => {
    await storage.create({
      name: 'Widget 1',
      itemId: '1',
      priority: 1,
      createdAt: new Date().toISOString(),
    })
    await storage.create({
      name: 'Widget 2',
      itemId: '2',
      priority: 2,
      createdAt: new Date().toISOString(),
    })
    await storage.create({
      name: 'Widget 3',
      itemId: '1',
      priority: 3,
      createdAt: new Date().toISOString(),
    })

    const item1Widgets = await storage.filter(w => w.itemId === '1')

    expect(item1Widgets).toHaveLength(2)
    expect(item1Widgets[0].name).toBe('Widget 1')
    expect(item1Widgets[1].name).toBe('Widget 3')
  })

  test('handles concurrent widget creation', async () => {
    const promises = Array.from({ length: 10 }, (_, i) =>
      storage.create({
        name: `Widget ${i}`,
        itemId: String(i % 3),
        priority: i,
        createdAt: new Date().toISOString(),
      })
    )

    const widgets = await Promise.all(promises)
    const ids = widgets.map(widget => widget.id)

    // All IDs should be unique
    expect(new Set(ids).size).toBe(10)
    expect(ids).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'])
  })

  test('preserves priority as number type', async () => {
    const widget = await storage.create({
      name: 'Priority Widget',
      itemId: '1',
      priority: 42,
      createdAt: new Date().toISOString(),
    })

    const found = await storage.findById(widget.id)

    expect(typeof found?.priority).toBe('number')
    expect(found?.priority).toBe(42)
  })

  test('handles multiple items with same itemId', async () => {
    await storage.create({
      name: 'Widget A',
      itemId: 'item-1',
      priority: 1,
      createdAt: new Date().toISOString(),
    })
    await storage.create({
      name: 'Widget B',
      itemId: 'item-1',
      priority: 2,
      createdAt: new Date().toISOString(),
    })

    const widgets = await storage.filter(w => w.itemId === 'item-1')

    expect(widgets).toHaveLength(2)
  })
})
