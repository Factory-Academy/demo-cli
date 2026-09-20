import { Command } from 'commander'
import { formatTable } from '../utils/format'
import { AsyncStorage } from '../utils/storage'

interface Widget {
  id: string
  name: string
  itemId: string
  priority: number
  createdAt: string
}

const storage = new AsyncStorage<Widget>('widgets')

export const widgetCommand = new Command('widgets')
  .description('Manage widgets')

widgetCommand
  .command('list')
  .description('List all widgets')
  .option('--item-id <itemId>', 'Filter by item ID')
  .action(async (opts) => {
    let filtered: Widget[]
    if (opts.itemId) {
      filtered = await storage.filter(w => w.itemId === opts.itemId)
    } else {
      filtered = await storage.readAll()
    }
    if (filtered.length === 0) {
      console.log('No widgets found.')
      return
    }
    console.log(formatTable(filtered, ['id', 'name', 'itemId', 'priority']))
  })

widgetCommand
  .command('create')
  .description('Create a new widget')
  .requiredOption('--name <name>', 'Widget name')
  .requiredOption('--item-id <itemId>', 'Parent item ID')
  .option('--priority <priority>', 'Priority level', '0')
  .action(async (opts) => {
    const widgetData = {
      name: opts.name,
      itemId: opts.itemId,
      priority: parseInt(opts.priority, 10),
      createdAt: new Date().toISOString(),
    }
    const widget = await storage.create(widgetData)
    console.log(`Created widget ${widget.id}: ${widget.name}`)
  })
