import { NumericSortStrategy } from '../../src/strategies/numericSortStrategy'
import { sortWith } from '../../src/strategies/sortStrategy'

interface Row {
  priority?: number | string | null
}

const priorities = (rows: Row[]) => rows.map(r => r.priority)

describe('NumericSortStrategy', () => {
  test('sorts ascending by numeric value', () => {
    const rows: Row[] = [{ priority: 3 }, { priority: 1 }, { priority: 2 }]
    const sorted = sortWith(rows, new NumericSortStrategy<Row>('priority'))
    expect(priorities(sorted)).toEqual([1, 2, 3])
  })

  test('sorts descending when order is desc', () => {
    const rows: Row[] = [{ priority: 1 }, { priority: 3 }, { priority: 2 }]
    const sorted = sortWith(rows, new NumericSortStrategy<Row>('priority', { order: 'desc' }))
    expect(priorities(sorted)).toEqual([3, 2, 1])
  })

  test('compares numeric strings by value, not lexically', () => {
    const rows: Row[] = [{ priority: '10' }, { priority: '9' }, { priority: '100' }]
    const sorted = sortWith(rows, new NumericSortStrategy<Row>('priority'))
    expect(priorities(sorted)).toEqual(['9', '10', '100'])
  })

  test('places invalid values last by default regardless of order', () => {
    const rows: Row[] = [{ priority: 'abc' }, { priority: 2 }, { priority: null }, { priority: 1 }]
    const asc = sortWith(rows, new NumericSortStrategy<Row>('priority'))
    expect(asc.slice(0, 2).map(r => r.priority)).toEqual([1, 2])

    const desc = sortWith(rows, new NumericSortStrategy<Row>('priority', { order: 'desc' }))
    expect(desc.slice(0, 2).map(r => r.priority)).toEqual([2, 1])
    // Invalids remain at the tail even when sorting descending.
    expect(desc.slice(2).every(r => Number.isNaN(Number(r.priority ?? NaN)))).toBe(true)
  })

  test('places invalid values first when configured', () => {
    const rows: Row[] = [{ priority: 2 }, { priority: 'abc' }, { priority: 1 }]
    const sorted = sortWith(
      rows,
      new NumericSortStrategy<Row>('priority', { invalidPosition: 'first' }),
    )
    expect(sorted[0].priority).toBe('abc')
    expect(sorted.slice(1).map(r => r.priority)).toEqual([1, 2])
  })

  test('treats empty string, null, and undefined as invalid', () => {
    const strategy = new NumericSortStrategy<Row>('priority')
    expect(strategy.compare({ priority: '' }, { priority: 5 })).toBe(1)
    expect(strategy.compare({ priority: null }, { priority: 5 })).toBe(1)
    expect(strategy.compare({}, { priority: 5 })).toBe(1)
  })

  test('two invalid values compare as equal', () => {
    const strategy = new NumericSortStrategy<Row>('priority')
    expect(strategy.compare({ priority: 'x' }, { priority: null })).toBe(0)
  })

  test('handles negative numbers', () => {
    const rows: Row[] = [{ priority: -1 }, { priority: -5 }, { priority: 3 }]
    const sorted = sortWith(rows, new NumericSortStrategy<Row>('priority'))
    expect(priorities(sorted)).toEqual([-5, -1, 3])
  })

  test('does not mutate the input array', () => {
    const rows: Row[] = [{ priority: 2 }, { priority: 1 }]
    const snapshot = [...rows]
    sortWith(rows, new NumericSortStrategy<Row>('priority'))
    expect(rows).toEqual(snapshot)
  })

  test('exposes a stable name', () => {
    expect(new NumericSortStrategy<Row>('priority').name).toBe('numeric')
  })
})
