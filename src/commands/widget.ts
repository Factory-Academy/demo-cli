import { Command } from 'commander'
import { WidgetService } from '../core/widgetService'
import { renderWidgetList, reportFailure } from './output'
import { parseIntegerOption } from './parse'

// Thin CLI adapter for the `widgets` command group. See item.ts for the
// rationale; this mirrors it. The `--priority` string is parsed here (strictly,
// via parseIntegerOption) so the core only ever receives a real integer.
export function createWidgetCommand(service: WidgetService = new WidgetService()): Command {
  const command = new Command('widgets').description('Manage widgets')

  command
    .command('list')
    .description('List all widgets')
    .option('--item-id <itemId>', 'Filter by item ID')
    .action((opts: { itemId?: string }) => {
      console.log(renderWidgetList(service.list({ itemId: opts.itemId })))
    })

  command
    .command('create')
    .description('Create a new widget')
    .requiredOption('--name <name>', 'Widget name')
    .requiredOption('--item-id <itemId>', 'Parent item ID')
    .option('--priority <priority>', 'Priority level', '0')
    .action((opts: { name: string; itemId: string; priority: string }) => {
      try {
        const widget = service.create({
          name: opts.name,
          itemId: opts.itemId,
          priority: parseIntegerOption(opts.priority, 'Widget priority'),
        })
        console.log(`Created widget ${widget.id}: ${widget.name}`)
      } catch (error) {
        reportFailure(error)
      }
    })

  return command
}

/** Shared instance backing the CLI registration in index.ts. */
export const widgetCommand = createWidgetCommand()
