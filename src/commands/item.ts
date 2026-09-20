import { Command } from 'commander'
import { formatTable } from '../utils/format'
import { AsyncStorage } from '../utils/storage'

interface Item {
  id: string
  name: string
  description?: string
  status: string
  createdAt: string
}

const storage = new AsyncStorage<Item>('items')

export const itemCommand = new Command('items')
  .description('Manage items')

itemCommand
  .command('list')
  .description('List all items')
  .option('--status <status>', 'Filter by status')
  .action(async (opts) => {
    let filtered: Item[]
    if (opts.status) {
      filtered = await storage.filter(i => i.status === opts.status)
    } else {
      filtered = await storage.readAll()
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
  .action(async (opts) => {
    const itemData = {
      name: opts.name,
      description: opts.description,
      status: 'active',
      createdAt: new Date().toISOString(),
    }
    const item = await storage.create(itemData)
    console.log(`Created item ${item.id}: ${item.name}`)
  })

itemCommand
  .command('get <id>')
  .description('Get item by ID')
  .action(async (id: string) => {
    const item = await storage.findById(id)
    if (!item) {
      console.error(`Item ${id} not found`)
      process.exit(1)
    }
    console.log(JSON.stringify(item, null, 2))
  })
