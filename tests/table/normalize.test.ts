import {
  normalizeColumns,
  normalizeRows,
  renderCellValue,
  stringifyCell,
  truncateCell,
} from '../../src/utils/table'
import { resolveTableOptions } from '../../src/utils/table/types'

const opts = resolveTableOptions()

describe('normalizeColumns', () => {
  test('keeps non-empty string columns in order', () => {
    expect(normalizeColumns(['id', 'name', 'status'])).toEqual(['id', 'name', 'status'])
  })

  test('drops non-string and empty columns', () => {
    expect(normalizeColumns(['id', '', null, 42, undefined, 'name'] as unknown)).toEqual([
      'id',
      'name',
    ])
  })

  test('de-duplicates while preserving first position', () => {
    expect(normalizeColumns(['id', 'name', 'id', 'name'])).toEqual(['id', 'name'])
  })

  test('returns [] for non-array input', () => {
    expect(normalizeColumns(null)).toEqual([])
    expect(normalizeColumns(undefined)).toEqual([])
    expect(normalizeColumns('id' as unknown)).toEqual([])
  })
})

describe('normalizeRows', () => {
  test('keeps plain object rows', () => {
    const rows = [{ id: '1' }, { id: '2' }]
    expect(normalizeRows(rows)).toEqual(rows)
  })

  test('drops null, undefined, arrays, and primitives', () => {
    const input = [{ id: '1' }, null, undefined, [1, 2], 'x', 7, { id: '2' }]
    expect(normalizeRows(input as unknown)).toEqual([{ id: '1' }, { id: '2' }])
  })

  test('returns [] for non-array input', () => {
    expect(normalizeRows(null)).toEqual([])
    expect(normalizeRows({ id: '1' } as unknown)).toEqual([])
  })
})

describe('stringifyCell', () => {
  test('passes through strings', () => {
    expect(stringifyCell('hello', opts)).toBe('hello')
  })

  test('maps null/undefined to the placeholder', () => {
    expect(stringifyCell(null, opts)).toBe('')
    expect(stringifyCell(undefined, opts)).toBe('')
    const custom = resolveTableOptions({ nullPlaceholder: 'N/A' })
    expect(stringifyCell(null, custom)).toBe('N/A')
  })

  test('renders finite numbers but not NaN/Infinity', () => {
    expect(stringifyCell(42, opts)).toBe('42')
    expect(stringifyCell(0, opts)).toBe('0')
    expect(stringifyCell(NaN, opts)).toBe('')
    expect(stringifyCell(Infinity, opts)).toBe('')
  })

  test('renders booleans and bigints', () => {
    expect(stringifyCell(true, opts)).toBe('true')
    expect(stringifyCell(false, opts)).toBe('false')
    expect(stringifyCell(BigInt(9), opts)).toBe('9')
  })

  test('JSON-encodes objects instead of [object Object]', () => {
    expect(stringifyCell({ a: 1 }, opts)).toBe('{"a":1}')
  })

  test('falls back to placeholder for circular objects', () => {
    const circular: Record<string, unknown> = {}
    circular.self = circular
    expect(stringifyCell(circular, opts)).toBe('')
  })

  test('drops symbols and functions to the placeholder', () => {
    expect(stringifyCell(Symbol('x'), opts)).toBe('')
    expect(stringifyCell(() => 1, opts)).toBe('')
  })

  test('collapses newlines, tabs, and control chars to spaces', () => {
    expect(stringifyCell('a\nb\tc\rd', opts)).toBe('a b c d')
    expect(stringifyCell('line1\n\n\nline2', opts)).toBe('line1 line2')
  })
})

describe('truncateCell', () => {
  test('leaves values within the limit untouched', () => {
    const o = resolveTableOptions({ maxCellWidth: 10 })
    expect(truncateCell('short', o)).toBe('short')
  })

  test('truncates with the marker and never exceeds the limit', () => {
    const o = resolveTableOptions({ maxCellWidth: 5 })
    const result = truncateCell('abcdefghij', o)
    expect(result.length).toBeLessThanOrEqual(5)
    expect(result).toBe('abcd…')
  })

  test('hard-slices when the marker alone is too wide', () => {
    const o = resolveTableOptions({ maxCellWidth: 2, truncationMarker: '...' })
    expect(truncateCell('abcdef', o)).toBe('ab')
  })

  test('no limit by default', () => {
    const long = 'x'.repeat(1000)
    expect(truncateCell(long, opts)).toBe(long)
  })
})

describe('renderCellValue', () => {
  test('stringifies then truncates', () => {
    const o = resolveTableOptions({ maxCellWidth: 6 })
    expect(renderCellValue({ hello: 'world' }, o)).toBe('{"hel…')
  })
})
