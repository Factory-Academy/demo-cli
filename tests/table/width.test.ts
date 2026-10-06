import { columnWidth, computeWidths } from '../../src/utils/table'
import { resolveTableOptions } from '../../src/utils/table/types'

const opts = resolveTableOptions()

describe('columnWidth', () => {
  test('is at least the header length', () => {
    expect(columnWidth('status', [{ status: 'ok' }], opts)).toBe('status'.length)
  })

  test('grows to the widest rendered cell', () => {
    const rows = [{ name: 'a' }, { name: 'abcdef' }, { name: 'abc' }]
    expect(columnWidth('name', rows, opts)).toBe(6)
  })

  test('accounts for missing values as the placeholder width', () => {
    const rows = [{ name: 'abcd' }, {}]
    expect(columnWidth('name', rows, opts)).toBe(4)
  })

  test('uses the sanitized/stringified length, not the raw value', () => {
    // Newlines are collapsed, so "a\nb" renders as "a b" => width 3.
    expect(columnWidth('x', [{ x: 'a\nb' }], opts)).toBe(3)
    // Objects are JSON-encoded.
    expect(columnWidth('x', [{ x: { a: 1 } }], opts)).toBe('{"a":1}'.length)
  })
})

describe('computeWidths', () => {
  test('returns one width per column, index-aligned', () => {
    const rows = [{ id: '1', name: 'Alice' }]
    expect(computeWidths(['id', 'name'], rows, opts)).toEqual([2, 5])
  })

  test('does not stack-overflow on very large datasets', () => {
    // Regression: the old Math.max(header, ...rows.map()) spread threw
    // RangeError: Maximum call stack size exceeded past ~1e5 rows.
    const big = Array.from({ length: 200_000 }, (_, i) => ({ id: String(i) }))
    expect(() => computeWidths(['id'], big, opts)).not.toThrow()
    expect(computeWidths(['id'], big, opts)).toEqual([String(199_999).length])
  })
})
