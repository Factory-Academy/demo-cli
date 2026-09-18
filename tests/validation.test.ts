import { ValidationError } from '../src/core/errors'
import { assertNonNegativeInteger, requireNonEmptyString } from '../src/core/validation'

describe('requireNonEmptyString', () => {
  test('returns a value with content unchanged', () => {
    expect(requireNonEmptyString('Alpha', 'Item name')).toBe('Alpha')
  })

  test('preserves the original untrimmed value', () => {
    expect(requireNonEmptyString('  spaced  ', 'Item name')).toBe('  spaced  ')
  })

  test('rejects undefined', () => {
    expect(() => requireNonEmptyString(undefined, 'Item name')).toThrow(ValidationError)
    expect(() => requireNonEmptyString(undefined, 'Item name')).toThrow('Item name is required')
  })

  test('rejects an empty string', () => {
    expect(() => requireNonEmptyString('', 'Widget name')).toThrow('Widget name is required')
  })

  test('rejects a whitespace-only string', () => {
    expect(() => requireNonEmptyString('   ', 'Widget itemId')).toThrow('Widget itemId is required')
  })

  test('names the field in the message', () => {
    expect(() => requireNonEmptyString('', 'Widget id')).toThrow('Widget id is required')
  })
})

describe('assertNonNegativeInteger', () => {
  test('returns finite non-negative integers unchanged', () => {
    expect(assertNonNegativeInteger(0, 'Widget priority')).toBe(0)
    expect(assertNonNegativeInteger(42, 'Widget priority')).toBe(42)
  })

  test('rejects NaN as non-finite', () => {
    expect(() => assertNonNegativeInteger(NaN, 'Widget priority')).toThrow(
      'Widget priority must be a finite number',
    )
  })

  test('rejects Infinity as non-finite', () => {
    expect(() => assertNonNegativeInteger(Infinity, 'Widget priority')).toThrow(
      'Widget priority must be a finite number',
    )
    expect(() => assertNonNegativeInteger(-Infinity, 'Widget priority')).toThrow(
      'must be a finite number',
    )
  })

  test('rejects a fractional value instead of truncating', () => {
    expect(() => assertNonNegativeInteger(2.5, 'Widget priority')).toThrow(
      'Widget priority must be a whole number',
    )
  })

  test('rejects a negative integer', () => {
    expect(() => assertNonNegativeInteger(-1, 'Widget priority')).toThrow(
      'Widget priority must not be negative',
    )
  })

  test('checks finiteness before integer-ness (message order)', () => {
    // NaN is neither finite nor an integer; the finite message must win.
    expect(() => assertNonNegativeInteger(NaN, 'Widget priority')).toThrow('finite number')
  })
})
