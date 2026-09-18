import { ValidationError } from '../core/errors'

// Strict CLI string -> integer parsing for the adapter layer.
//
// Commander hands option values through as raw strings, so the adapter is
// responsible for turning them into the numbers the core expects. The old
// widget adapter used `parseInt(raw, 10)`, which is deceptively lax:
//
//   parseInt('5.9', 10)  -> 5      (silently truncates the fraction)
//   parseInt('5abc', 10) -> 5      (silently ignores trailing garbage)
//   parseInt('', 10)     -> NaN
//
// The first two produce a clean integer, so they sail straight past the core's
// numeric guard and store a value the user never typed. Parse strictly here:
// accept only an optional sign followed by digits, and reject everything else
// with a message the failure reporter can surface. Sign/range rules that are
// domain concerns (e.g. "priority must not be negative") stay in the core.
const INTEGER_PATTERN = /^[+-]?\d+$/

export function parseIntegerOption(raw: string, field: string): number {
  const trimmed = raw.trim()
  if (!INTEGER_PATTERN.test(trimmed)) {
    throw new ValidationError(`${field} must be an integer`)
  }
  return Number(trimmed)
}
