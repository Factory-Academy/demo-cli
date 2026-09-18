import { Item, Widget } from '../core/types'
import { formatTable } from '../utils/format'

// CLI output concerns: turning core values into the exact strings the old
// handlers printed, and turning core errors into a stderr message + exit code.
// Keeping this here means the command modules stay declarative wiring.

const ITEM_COLUMNS = ['id', 'name', 'status', 'createdAt']
const WIDGET_COLUMNS = ['id', 'name', 'itemId', 'priority']

export function renderItemList(items: Item[]): string {
  if (items.length === 0) {
    return 'No items found.'
  }
  return formatTable(items, ITEM_COLUMNS)
}

export function renderWidgetList(widgets: Widget[]): string {
  if (widgets.length === 0) {
    return 'No widgets found.'
  }
  return formatTable(widgets, WIDGET_COLUMNS)
}

/** Prints an error to stderr and exits non-zero, matching legacy `get` behavior. */
export function reportFailure(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error)
  console.error(message)
  process.exit(1)
}
