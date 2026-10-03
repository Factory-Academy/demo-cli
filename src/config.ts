/**
 * Application configuration with typed defaults
 */

export interface AppConfig {
  /** Default status for newly created items */
  defaultItemStatus: string
  /** Default priority for newly created widgets */
  defaultWidgetPriority: number
  /** Exit code for error conditions */
  errorExitCode: number
  /** Radix for parsing integer strings */
  parseRadix: number
  /** Table display configuration */
  table: {
    columnSeparator: string
    itemColumns: string[]
    widgetColumns: string[]
  }
}

/**
 * Default application configuration
 */
export const defaultConfig: AppConfig = {
  defaultItemStatus: 'active',
  defaultWidgetPriority: 0,
  errorExitCode: 1,
  parseRadix: 10,
  table: {
    columnSeparator: '  ',
    itemColumns: ['id', 'name', 'status', 'createdAt'],
    widgetColumns: ['id', 'name', 'itemId', 'priority'],
  },
}

/**
 * Get the current application configuration
 * This can be extended later to support overrides from environment variables or config files
 */
export function getConfig(): AppConfig {
  return defaultConfig
}
