import { Command } from 'commander'
import { formatTable } from '../utils/format'
import { LRUCache } from '../utils/lru-cache'

interface Item {
  id: string
  name: string
  description?: string
  status: string
  createdAt: string
}

const JSON_INDENT_SPACES = 2

const items: Item[] = []
let nextId = 1

const itemCache = new LRUCache<string, Item>({ maxSize: 100, ttl: 60000 })

export const itemCommand = new Command('items')
  .description('Manage items')

itemCommand
  .command('list')
  .description('List all items')
  .option('--status <status>', 'Filter by status')
  .action((opts) => {
    let filtered = items
    if (opts.status) {
      filtered = items.filter(i => i.status === opts.status)
    }
    if (filtered.length === 0) {
      console.log('No items found.')
      return
    }
    console.log(formatTable(filtered, ['id', 'name', 'status', 'createdAt']))
  })

itemCommand
  .command('create')
  .description('Create a new item')
  .requiredOption('--name <name>', 'Item name')
  .option('--description <desc>', 'Item description')
  .action((opts) => {
    const item: Item = {
      id: String(nextId++),
      name: opts.name,
      description: opts.description,
      status: 'active',
      createdAt: new Date().toISOString(),
    }
    items.push(item)
    console.log(`Created item ${item.id}: ${item.name}`)
  })

itemCommand
  .command('get <id>')
  .description('Get item by ID')
  .action((id: string) => {
    const cachedItem = itemCache.get(id)
    if (cachedItem) {
      console.log(JSON.stringify(cachedItem, null, JSON_INDENT_SPACES))
      return
    }

    const item = items.find(i => i.id === id)
    if (!item) {
      console.error(`Item ${id} not found`)
      process.exit(1)
    }
    
    itemCache.set(id, item)
    console.log(JSON.stringify(item, null, JSON_INDENT_SPACES))
  })

itemCommand
  .command('cache-stats')
  .description('Show cache statistics')
  .action(() => {
    const stats = itemCache.getStats()
    console.log(JSON.stringify(stats, null, JSON_INDENT_SPACES))
  })

itemCommand
  .command('cache-clear')
  .description('Clear the cache')
  .action(() => {
    itemCache.clear()
    console.log('Cache cleared.')
  })
