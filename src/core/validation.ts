// Shared input validation for the pure core.
//
// ItemService and WidgetService previously repeated the same guard clause
// inline —
//   if (!input.name || input.name.trim() === '') throw new ValidationError(...)
// — once per required string, and each spelled out its own numeric check.
// Duplicated rules drift: a fix applied to one service is easy to forget in the
// other. Centralizing them here gives a single place to reason about the edge
// cases (blank strings, whitespace, floats, negatives, non-finite numbers) and
// guarantees the two services stay consistent.

import { ValidationError } from './errors'

/**
 * Ensures a value is a non-empty string once surrounding whitespace is removed.
 *
 * Returns the ORIGINAL (untrimmed) value so existing behavior — storing names
 * exactly as the user typed them, spaces and all — is preserved. Only the
 * emptiness decision uses the trimmed form.
 */
export function requireNonEmptyString(value: string | undefined, field: string): string {
  if (value === undefined || value.trim() === '') {
    throw new ValidationError(`${field} is required`)
  }
  return value
}

/**
 * Asserts that an already-parsed number is a finite, non-negative integer and
 * returns it unchanged.
 *
 * The checks are ordered from most to least fundamental so the message names
 * the first rule the value breaks:
 *   1. finite   — rejects NaN and ±Infinity
 *   2. integer  — rejects fractional values rather than silently truncating
 *   3. sign     — rejects negatives
 */
export function assertNonNegativeInteger(value: number, field: string): number {
  if (!Number.isFinite(value)) {
    throw new ValidationError(`${field} must be a finite number`)
  }
  if (!Number.isInteger(value)) {
    throw new ValidationError(`${field} must be a whole number`)
  }
  if (value < 0) {
    throw new ValidationError(`${field} must not be negative`)
  }
  return value
}
