import { formatTable } from './format'

/**
 * Display a list of items in a formatted table, or show an empty message.
 * @param data Array of objects to display
 * @param resourceName Plural name of the resource (e.g., 'items', 'widgets')
 * @param columns Columns to display in the table
 */
export function displayList<T extends Record<string, any>>(
  data: T[],
  resourceName: string,
  columns: string[]
): void {
  if (data.length === 0) {
    console.log(`No ${resourceName} found.`)
    return
  }
  console.log(formatTable(data, columns))
}
