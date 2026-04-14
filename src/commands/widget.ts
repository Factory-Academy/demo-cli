import { Command } from 'commander'
import { formatTable } from '../utils/format'

interface Widget {
  id: string
  name: string
  itemId: string
  priority: number
  createdAt: string
}

const widgets: Widget[] = []
let nextId = 1

export const widgetCommand = new Command('widgets')
  .description('Manage widgets')

widgetCommand
  .command('list')
  .description('List all widgets')
  .option('--item-id <itemId>', 'Filter by item ID')
  .action((opts) => {
    let filtered = widgets
    if (opts.itemId) {
      filtered = widgets.filter(w => w.itemId === opts.itemId)
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
  .action((opts) => {
    const widget: Widget = {
      id: String(nextId++),
      name: opts.name,
      itemId: opts.itemId,
      priority: parseInt(opts.priority, 10),
      createdAt: new Date().toISOString(),
    }
    widgets.push(widget)
    console.log(`Created widget ${widget.id}: ${widget.name}`)
  })
