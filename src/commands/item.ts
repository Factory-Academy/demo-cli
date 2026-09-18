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

const items: Item[] = []
let nextId = 1

// Cache items for up to 5 minutes with a max of 50 entries
const itemCache = new LRUCache<Item>(50, 300)

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
    // Cache the newly created item
    itemCache.set(item.id, item)
    console.log(`Created item ${item.id}: ${item.name}`)
  })

itemCommand
  .command('get <id>')
  .description('Get item by ID')
  .action((id: string) => {
    // Check cache first
    let item = itemCache.get(id)

    if (!item) {
      // Fetch from items array
      item = items.find(i => i.id === id)
      if (!item) {
        console.error(`Item ${id} not found`)
        process.exit(1)
      }
      // Cache the item
      itemCache.set(id, item)
    }

    console.log(JSON.stringify(item, null, 2))
  })
