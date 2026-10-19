/**
 * Application configuration
 * Centralizes constants and default values used across the CLI
 */

export interface AppConfig {
  /** CLI application name */
  name: string
  /** CLI application version */
  version: string
  /** Radix for parsing decimal integers (must be between 2 and 36) */
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
 * Validates that a radix value is within the valid range for parseInt
 * @param radix - The radix value to validate
 * @throws Error if radix is not between 2 and 36
 */
function validateRadix(radix: number): void {
  if (radix < 2 || radix > 36) {
    throw new Error(`Invalid radix: ${radix}. Radix must be between 2 and 36.`)
  }
}

/**
 * Application configuration instance
 * All default values and constants should be defined here
 */
const DECIMAL_RADIX = 10
validateRadix(DECIMAL_RADIX)

export const config: AppConfig = {
  name: 'demo-cli',
  version: '0.1.0',
  decimalRadix: DECIMAL_RADIX,
  items: {
    startingId: 1,
    defaultStatus: 'active',
  },
  widgets: {
    startingId: 1,
    defaultPriority: 0,
  },
}
