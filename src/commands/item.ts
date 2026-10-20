import { Command } from 'commander'
import { formatTable } from '../utils/format'
import { config } from '../config'
import { paginateByCursor } from '../utils/pagination'

export interface Item {
  id: string
  name: string
  description?: string
  status: string
  createdAt: string
}

export interface ListItemsOptions {
  status?: string
  cursor?: string
  limit?: number
}

const items: Item[] = []
let nextId = config.items.startingId

export const itemCommand = new Command('items')
  .description('Manage items')

export function listItems(sourceItems: Item[], opts: ListItemsOptions) {
  const filtered = opts.status
    ? sourceItems.filter(item => item.status === opts.status)
    : sourceItems

  return paginateByCursor(filtered, {
    cursor: opts.cursor,
    limit: opts.limit,
  })
}

itemCommand
  .command('list')
  .description('List all items')
  .option('--status <status>', 'Filter by status')
  .option('--cursor <cursor>', 'Pagination cursor (last seen item ID)')
  .option('--limit <limit>', 'Maximum number of items to return', (value) => parseInt(value, 10))
  .action((opts) => {
    const paginatedItems = listItems(items, {
      status: opts.status,
      cursor: opts.cursor,
      limit: opts.limit,
    })

    if (paginatedItems.items.length === 0) {
      console.log('No items found.')
      return
    }

    console.log(formatTable(paginatedItems.items, ['id', 'name', 'status', 'createdAt']))
    if (paginatedItems.nextCursor) {
      console.log(`Next cursor: ${paginatedItems.nextCursor}`)
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
      status: config.items.defaultStatus,
      createdAt: new Date().toISOString(),
    }
    items.push(item)
    console.log(`Created item ${item.id}: ${item.name}`)
  })

itemCommand
  .command('get <id>')
  .description('Get item by ID')
  .action((id: string) => {
    const item = items.find(i => i.id === id)
    if (!item) {
      console.error(`Item ${id} not found`)
      process.exit(1)
    }
    console.log(JSON.stringify(item, null, 2))
  })
