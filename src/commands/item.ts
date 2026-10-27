import { Command } from 'commander'
import { displayList } from '../utils/display'
import { getNextId } from '../utils/id'

interface Item {
  id: string
  name: string
  description?: string
  status: string
  createdAt: string
}

const JSON_INDENT_SPACES = 2

const items: Item[] = []

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
    displayList(filtered, 'items', ['id', 'name', 'status', 'createdAt'])
  })

itemCommand
  .command('create')
  .description('Create a new item')
  .requiredOption('--name <name>', 'Item name')
  .option('--description <desc>', 'Item description')
  .action(async (opts) => {
    const item: Item = {
      id: await getNextId(),
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
