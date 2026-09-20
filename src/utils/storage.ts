import { promises as fs } from 'fs'
import * as path from 'path'
import { globalSerializer } from './serializer'

const STORAGE_DIR = path.join(process.cwd(), '.data')

interface StorageData<T> {
  items: T[]
  nextId: number
}

/**
 * Async file-based storage with race condition protection.
 * Uses a serializer to ensure sequential access to storage files.
 */
export class AsyncStorage<T extends { id: string }> {
  private filePath: string

  constructor(namespace: string) {
    this.filePath = path.join(STORAGE_DIR, `${namespace}.json`)
  }

  /**
   * Read all items from storage.
   */
  async readAll(): Promise<T[]> {
    return globalSerializer.execute(this.filePath, async () => {
      try {
        await this.ensureStorageDir()
        const data = await fs.readFile(this.filePath, 'utf-8')
        const parsed: StorageData<T> = JSON.parse(data)
        return parsed.items
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          return []
        }
        throw error
      }
    })
  }

  /**
   * Add a new item to storage with auto-incremented ID.
   * Returns the created item with its assigned ID.
   */
  async create(item: Omit<T, 'id'>): Promise<T> {
    return globalSerializer.execute(this.filePath, async () => {
      await this.ensureStorageDir()
      
      let data: StorageData<T>
      try {
        const content = await fs.readFile(this.filePath, 'utf-8')
        data = JSON.parse(content)
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          data = { items: [], nextId: 1 }
        } else {
          throw error
        }
      }

      const newItem = { ...item, id: String(data.nextId) } as T
      data.items.push(newItem)
      data.nextId++

      await fs.writeFile(this.filePath, JSON.stringify(data, null, 2))
      return newItem
    })
  }

  /**
   * Find an item by ID.
   */
  async findById(id: string): Promise<T | undefined> {
    const items = await this.readAll()
    return items.find(item => item.id === id)
  }

  /**
   * Filter items by a predicate function.
   */
  async filter(predicate: (item: T) => boolean): Promise<T[]> {
    const items = await this.readAll()
    return items.filter(predicate)
  }

  private async ensureStorageDir(): Promise<void> {
    try {
      await fs.mkdir(STORAGE_DIR, { recursive: true })
    } catch (error: any) {
      if (error.code !== 'EEXIST') {
        throw error
      }
    }
  }
}
