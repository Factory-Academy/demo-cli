import { Command } from 'commander'
import { formatTable } from '../utils/format'

interface Item {
  id: string
  name: string
  description?: string
  status: string
  createdAt: string
}

const items: Item[] = []
let nextId = 1

export const itemCommand = new Command('items')
  .description('Manage items')

itemCommand
  .command('list')
  .description('List all items')
  .option('--status <status>', 'Filter by status')
  .action((opts) => {
    let filtered = items
    const statusFilter = opts.status?.trim()
    if (statusFilter) {
      filtered = items.filter(item => item.status === statusFilter)
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
    const trimmedId = id?.trim()
    if (!trimmedId) {
      console.error('Item ID cannot be empty')
      process.exit(1)
    }
    const item = items.find(elem => elem.id === trimmedId)
    if (!item) {
      console.error(`Item ${trimmedId} not found`)
      process.exit(1)
    }
    console.log(JSON.stringify(item, null, 2))
  })
