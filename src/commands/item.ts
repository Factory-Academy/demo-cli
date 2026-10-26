import { Command } from 'commander'
import { formatTable } from '../utils/format'
import {
  SortStrategyKind,
  SortStrategySpec,
  createSortStrategy,
  sortWith,
} from '../strategies'

interface Item {
  id: string
  name: string
  description?: string
  status: string
  createdAt: string
}

const JSON_INDENT_SPACES = 2

/**
 * Maps a user-facing `--sort` field to the strategy kind that orders it well.
 * The command layer declares intent; the factory owns construction.
 */
const SORTABLE_FIELDS: Record<string, SortStrategyKind> = {
  id: 'numeric',
  name: 'alphabetical',
  status: 'alphabetical',
  createdAt: 'alphabetical',
}

const items: Item[] = []
let nextId = 1

export const itemCommand = new Command('items')
  .description('Manage items')

itemCommand
  .command('list')
  .description('List all items')
  .option('--status <status>', 'Filter by status')
  .option('--sort <field>', `Sort by field (${Object.keys(SORTABLE_FIELDS).join(', ')})`)
  .option('--order <order>', 'Sort direction (asc or desc)', 'asc')
  .action((opts) => {
    let filtered = items
    if (opts.status) {
      filtered = items.filter(i => i.status === opts.status)
    }

    if (opts.sort) {
      const kind = SORTABLE_FIELDS[opts.sort]
      if (!kind) {
        console.error(
          `Cannot sort by "${opts.sort}". Valid fields: ${Object.keys(SORTABLE_FIELDS).join(', ')}`,
        )
        process.exit(1)
      }
      if (opts.order !== 'asc' && opts.order !== 'desc') {
        console.error(`Invalid order "${opts.order}". Use "asc" or "desc".`)
        process.exit(1)
      }
      const spec: SortStrategySpec<Item> = {
        kind,
        key: opts.sort as keyof Item,
        order: opts.order,
      }
      filtered = sortWith(filtered, createSortStrategy(spec))
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
    const item = items.find(i => i.id === id)
    if (!item) {
      console.error(`Item ${id} not found`)
      process.exit(1)
    }
    console.log(JSON.stringify(item, null, JSON_INDENT_SPACES))
  })
