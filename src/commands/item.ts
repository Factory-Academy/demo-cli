import { Command } from 'commander'
import { formatTable } from '../utils/format'
import { LRUCache } from '../utils/lru-cache'
import { paginate, MAX_PAGE_LIMIT } from '../utils/pagination'

interface Item {
  id: string
  name: string
  description?: string
  status: string
  createdAt: string
}

const items: Item[] = []
let nextId = 1

// Cache for item lookups (max 100 items, 5 minute TTL)
const itemCache = new LRUCache<string, Item>({
  maxSize: 100,
  ttlMs: 5 * 60 * 1000,
})

export const itemCommand = new Command('items')
  .description('Manage items')

itemCommand
  .command('list')
  .description('List all items')
  .option('--status <status>', 'Filter by status')
  .option('--cursor <cursor>', 'Pagination cursor')
  .option('--limit <limit>', 'Number of items per page', '10')
  .action((opts) => {
    let filtered = items
    if (opts.status) {
      filtered = items.filter(i => i.status === opts.status)
    }
    if (filtered.length === 0) {
      console.log('No items found.')
      return
    }

    // Parse and validate limit
    const parsedLimit = parseInt(opts.limit, 10)
    let limit = 10 // default
    
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      console.error(`Invalid limit: must be a positive integer. Using default: 10`)
      limit = 10
    } else if (parsedLimit > MAX_PAGE_LIMIT) {
      console.error(`Invalid limit: cannot exceed ${MAX_PAGE_LIMIT}. Using maximum: ${MAX_PAGE_LIMIT}`)
      limit = MAX_PAGE_LIMIT
    } else {
      limit = parsedLimit
    }

    try {
      // Apply pagination
      const result = paginate(filtered, {
        cursor: opts.cursor,
        limit,
      })

      console.log(formatTable(result.items, ['id', 'name', 'status', 'createdAt']))
      
      if (result.hasMore && result.nextCursor) {
        console.log(`\nShowing ${result.items.length} items. For next page, use: --cursor ${result.nextCursor}`)
      } else {
        console.log(`\nShowing ${result.items.length} items (last page)`)
      }
    } catch (error) {
      console.error(`Pagination error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      process.exit(1)
    }
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
      // Cache miss - look up in items array
      item = items.find(i => i.id === id)
      if (item) {
        // Store in cache for future lookups
        itemCache.set(id, item)
      }
    }
    
    if (!item) {
      console.error(`Item ${id} not found`)
      process.exit(1)
    }
    
    console.log(JSON.stringify(item, null, 2))
  })
