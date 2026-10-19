/**
 * Application configuration
 * Centralizes constants and default values used across the CLI
 */

export interface AppConfig {
  /** CLI application name */
  name: string
  /** CLI application version */
  version: string
  /** Radix for parsing decimal integers */
  decimalRadix: number
  /** Default values for items */
  items: {
    /** Starting ID for new items */
    startingId: number
    /** Default status for new items */
    defaultStatus: string
  }
  /** Default values for widgets */
  widgets: {
    /** Starting ID for new widgets */
    startingId: number
    /** Default priority for new widgets */
    defaultPriority: number
  }
}

/**
 * Application configuration instance
 * All default values and constants should be defined here
 */
export const config: AppConfig = {
  name: 'demo-cli',
  version: '0.1.0',
  decimalRadix: 10,
  items: {
    startingId: 1,
    defaultStatus: 'active',
  },
  widgets: {
    startingId: 1,
    defaultPriority: 0,
  },
}
