import { parseIntegerOption } from '../src/commands/parse'
import { ValidationError } from '../src/core/errors'

describe('parseIntegerOption', () => {
  test('parses a plain integer string', () => {
    expect(parseIntegerOption('5', 'Priority')).toBe(5)
    expect(parseIntegerOption('0', 'Priority')).toBe(0)
  })

  test('trims surrounding whitespace', () => {
    expect(parseIntegerOption('  7 ', 'Priority')).toBe(7)
  })

  test('accepts an explicit sign', () => {
    expect(parseIntegerOption('+3', 'Priority')).toBe(3)
    expect(parseIntegerOption('-2', 'Priority')).toBe(-2)
  })

  test('rejects an empty or whitespace-only string', () => {
    expect(() => parseIntegerOption('', 'Priority')).toThrow(ValidationError)
    expect(() => parseIntegerOption('   ', 'Priority')).toThrow('Priority must be an integer')
  })

  test('rejects a fractional value instead of truncating', () => {
    // parseInt('5.9', 10) would return 5; this must not.
    expect(() => parseIntegerOption('5.9', 'Priority')).toThrow('Priority must be an integer')
  })

  test('rejects trailing garbage instead of parsing a prefix', () => {
    // parseInt('5abc', 10) would return 5; this must not.
    expect(() => parseIntegerOption('5abc', 'Priority')).toThrow(ValidationError)
  })

  test('rejects exponent and hex/binary forms', () => {
    expect(() => parseIntegerOption('1e3', 'Priority')).toThrow(ValidationError)
    expect(() => parseIntegerOption('0x10', 'Priority')).toThrow(ValidationError)
    expect(() => parseIntegerOption('0b101', 'Priority')).toThrow(ValidationError)
  })

  test('rejects non-numeric input', () => {
    expect(() => parseIntegerOption('abc', 'Priority')).toThrow('Priority must be an integer')
  })
})
