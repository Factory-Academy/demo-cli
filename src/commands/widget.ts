import { Command } from 'commander'
import { formatTable } from '../utils/format'
import { validateOrThrow } from '../utils/validators'

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
    try {
      validateOrThrow(opts, {
        name: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 100,
        },
        itemId: {
          type: 'string',
          required: true,
          pattern: /^[a-zA-Z0-9-_]+$/,
        },
        priority: {
          type: 'number',
          min: 0,
          max: 10,
        },
      })

      const widget: Widget = {
        id: String(nextId++),
        name: opts.name,
        itemId: opts.itemId,
        priority: parseInt(opts.priority, 10),
        createdAt: new Date().toISOString(),
      }
      widgets.push(widget)
      console.log(`Created widget ${widget.id}: ${widget.name}`)
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message)
      } else {
        console.error('Validation failed')
      }
      process.exit(1)
    }
  })
