import { Command } from 'commander'
import { ItemService } from '../core/itemService'
import { renderItemList, reportFailure } from './output'

// Thin CLI adapter for the `items` command group.
//
// Its only jobs are: (1) declare the Commander surface, (2) translate parsed
// options into ItemService calls, and (3) print results or report failures.
// All state and rules live in the pure core.
//
// The service is created once and shared by every subcommand, which preserves
// the original module-singleton behavior (items accumulate across subcommand
// handlers within a single process run). A caller may inject a service, which
// is what the tests do.
export function createItemCommand(service: ItemService = new ItemService()): Command {
  const command = new Command('items').description('Manage items')

  command
    .command('list')
    .description('List all items')
    .option('--status <status>', 'Filter by status')
    .action((opts: { status?: string }) => {
      console.log(renderItemList(service.list({ status: opts.status })))
    })

  command
    .command('create')
    .description('Create a new item')
    .requiredOption('--name <name>', 'Item name')
    .option('--description <desc>', 'Item description')
    .action((opts: { name: string; description?: string }) => {
      try {
        const item = service.create({ name: opts.name, description: opts.description })
        console.log(`Created item ${item.id}: ${item.name}`)
      } catch (error) {
        reportFailure(error)
      }
    })

  command
    .command('get <id>')
    .description('Get item by ID')
    .action((id: string) => {
      try {
        console.log(JSON.stringify(service.get(id), null, 2))
      } catch (error) {
        reportFailure(error)
      }
    })

  return command
}

/** Shared instance backing the CLI registration in index.ts. */
export const itemCommand = createItemCommand()
