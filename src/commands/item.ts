import { Command } from 'commander'
import { formatTable } from '../utils/format'
import { config } from '../config'
import {
  ALL_ITEM_EVENTS,
  ALL_ITEM_STATES,
  toItemState,
} from '../workflow/itemStates'
import {
  applyItemEventByName,
  availableItemEvents,
  createItem,
  InvalidTransitionError,
  ItemRecord,
} from '../workflow/itemWorkflow'

const items: ItemRecord[] = []
let nextId = config.items.startingId

export const itemCommand = new Command('items')
  .description('Manage items')

itemCommand
  .command('list')
  .description('List all items')
  .option('--status <status>', 'Filter by status')
  .action((opts) => {
    let filtered = items
    if (opts.status) {
      const status = toItemState(opts.status)
      if (!status) {
        console.error(
          `Invalid status "${opts.status}". ` +
            `Valid statuses: ${ALL_ITEM_STATES.join(', ')}.`,
        )
        process.exit(1)
      }
      filtered = items.filter(i => i.status === status)
    }
    if (filtered.length === 0) {
      console.log('No items found.')
      return
    }
    console.log(formatTable([...filtered], ['id', 'name', 'status', 'createdAt']))
  })

itemCommand
  .command('create')
  .description('Create a new item')
  .requiredOption('--name <name>', 'Item name')
  .option('--description <desc>', 'Item description')
  .action(async (opts) => {
    try {
      const item = await createItem({
        id: String(nextId),
        name: opts.name,
        description: opts.description,
        initialStatus: config.items.defaultStatus,
      })
      items.push(item)
      nextId++
      console.log(`Created item ${item.id}: ${item.name} [${item.status}]`)
    } catch (err) {
      console.error((err as Error).message)
      process.exit(1)
    }
  })

itemCommand
  .command('transition <id> <event>')
  .description(
    `Move an item through its lifecycle (events: ${ALL_ITEM_EVENTS.join(', ')})`,
  )
  .action(async (id: string, event: string) => {
    const index = items.findIndex(i => i.id === id)
    if (index === -1) {
      console.error(`Item ${id} not found`)
      process.exit(1)
    }

    try {
      const updated = await applyItemEventByName(items[index], event)
      items[index] = updated
      console.log(`Item ${id} is now [${updated.status}]`)
    } catch (err) {
      if (err instanceof InvalidTransitionError) {
        console.error(err.message)
        process.exit(1)
      }
      throw err
    }
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
    const events = availableItemEvents(item.status)
    console.log(
      JSON.stringify({ ...item, availableEvents: events }, null, 2),
    )
  })
