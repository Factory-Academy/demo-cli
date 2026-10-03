import { Command } from 'commander'
import { formatTable } from '../utils/format'
import { getConfig } from '../config'

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
    const config = getConfig()
    let filtered = items
    if (opts.status) {
      filtered = items.filter(i => i.status === opts.status)
    }
    if (filtered.length === 0) {
      console.log('No items found.')
      return
    }
    console.log(formatTable(filtered, config.table.itemColumns))
  })

itemCommand
  .command('create')
  .description('Create a new item')
  .requiredOption('--name <name>', 'Item name')
  .option('--description <desc>', 'Item description')
  .action((opts) => {
    const config = getConfig()
    const item: Item = {
      id: String(nextId++),
      name: opts.name,
      description: opts.description,
      status: config.defaultItemStatus,
      createdAt: new Date().toISOString(),
    }
    items.push(item)
    console.log(`Created item ${item.id}: ${item.name}`)
  })

itemCommand
  .command('get <id>')
  .description('Get item by ID')
  .action((id: string) => {
    const config = getConfig()
    const item = items.find(i => i.id === id)
    if (!item) {
      console.error(`Item ${id} not found`)
      process.exit(config.errorExitCode)
    }
    console.log(JSON.stringify(item, null, 2))
  })
