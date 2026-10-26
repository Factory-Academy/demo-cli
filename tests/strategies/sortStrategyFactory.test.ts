import {
  createSortStrategy,
  isSortStrategyKind,
  SORT_STRATEGY_KINDS,
} from '../../src/strategies/sortStrategyFactory'
import { AlphabeticalSortStrategy } from '../../src/strategies/alphabeticalSortStrategy'
import { NumericSortStrategy } from '../../src/strategies/numericSortStrategy'
import { sortWith } from '../../src/strategies/sortStrategy'

interface Row {
  name?: string
  priority?: number
}

describe('createSortStrategy', () => {
  test('builds an alphabetical strategy', () => {
    const strategy = createSortStrategy<Row>({ kind: 'alphabetical', key: 'name' })
    expect(strategy).toBeInstanceOf(AlphabeticalSortStrategy)
    expect(strategy.name).toBe('alphabetical')
  })

  test('builds a numeric strategy', () => {
    const strategy = createSortStrategy<Row>({ kind: 'numeric', key: 'priority' })
    expect(strategy).toBeInstanceOf(NumericSortStrategy)
    expect(strategy.name).toBe('numeric')
  })

  test('forwards order to the built strategy', () => {
    const rows: Row[] = [{ priority: 1 }, { priority: 2 }]
    const strategy = createSortStrategy<Row>({ kind: 'numeric', key: 'priority', order: 'desc' })
    expect(sortWith(rows, strategy).map(r => r.priority)).toEqual([2, 1])
  })

  test('forwards per-kind options', () => {
    const rows: Row[] = [{ priority: 2 }, { priority: undefined }, { priority: 1 }]
    const strategy = createSortStrategy<Row>({
      kind: 'numeric',
      key: 'priority',
      options: { invalidPosition: 'first' },
    })
    expect(sortWith(rows, strategy)[0].priority).toBeUndefined()
  })

  test('produces independent instances per call', () => {
    const a = createSortStrategy<Row>({ kind: 'alphabetical', key: 'name' })
    const b = createSortStrategy<Row>({ kind: 'alphabetical', key: 'name' })
    expect(a).not.toBe(b)
  })

  test('throws on an unknown kind at runtime', () => {
    expect(() =>
      // Cast past the type system to simulate an invalid external input.
      createSortStrategy<Row>({ kind: 'bogus' as never, key: 'name' }),
    ).toThrow(/Unsupported sort strategy kind/)
  })
})

describe('isSortStrategyKind', () => {
  test('accepts every registered kind', () => {
    for (const kind of SORT_STRATEGY_KINDS) {
      expect(isSortStrategyKind(kind)).toBe(true)
    }
  })

  test('rejects unknown values', () => {
    expect(isSortStrategyKind('chronological')).toBe(false)
    expect(isSortStrategyKind('')).toBe(false)
  })
})
