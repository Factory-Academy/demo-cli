import { AlphabeticalSortStrategy } from '../../src/strategies/alphabeticalSortStrategy'
import { sortWith } from '../../src/strategies/sortStrategy'

interface Row {
  name?: string | null
  label?: string
}

const names = (rows: Row[]) => rows.map(r => r.name)

describe('AlphabeticalSortStrategy', () => {
  test('sorts ascending by the chosen key', () => {
    const rows: Row[] = [{ name: 'Charlie' }, { name: 'Alice' }, { name: 'Bob' }]
    const sorted = sortWith(rows, new AlphabeticalSortStrategy<Row>('name'))
    expect(names(sorted)).toEqual(['Alice', 'Bob', 'Charlie'])
  })

  test('sorts descending when order is desc', () => {
    const rows: Row[] = [{ name: 'Alice' }, { name: 'Charlie' }, { name: 'Bob' }]
    const sorted = sortWith(rows, new AlphabeticalSortStrategy<Row>('name', { order: 'desc' }))
    expect(names(sorted)).toEqual(['Charlie', 'Bob', 'Alice'])
  })

  test('is case-insensitive by default', () => {
    const strategy = new AlphabeticalSortStrategy<Row>('name')
    expect(strategy.compare({ name: 'apple' }, { name: 'Apple' })).toBe(0)
  })

  test('distinguishes case when caseInsensitive is false', () => {
    const strategy = new AlphabeticalSortStrategy<Row>('name', { caseInsensitive: false })
    expect(strategy.compare({ name: 'apple' }, { name: 'Apple' })).not.toBe(0)
  })

  test('treats missing, null, and undefined keys as empty string', () => {
    const rows: Row[] = [{ name: 'Zebra' }, { name: null }, {}, { name: 'Apple' }]
    const sorted = sortWith(rows, new AlphabeticalSortStrategy<Row>('name'))
    // The two empty values sort first, then Apple, then Zebra.
    expect(names(sorted.slice(2))).toEqual(['Apple', 'Zebra'])
    expect(sorted[0].name ?? '').toBe('')
    expect(sorted[1].name ?? '').toBe('')
  })

  test('does not mutate the input array', () => {
    const rows: Row[] = [{ name: 'B' }, { name: 'A' }]
    const snapshot = [...rows]
    sortWith(rows, new AlphabeticalSortStrategy<Row>('name'))
    expect(rows).toEqual(snapshot)
  })

  test('exposes a stable name', () => {
    expect(new AlphabeticalSortStrategy<Row>('name').name).toBe('alphabetical')
  })

  test('orders accented characters by locale, not code point', () => {
    const rows: Row[] = [{ name: 'z' }, { name: 'é' }, { name: 'a' }]
    const sorted = sortWith(rows, new AlphabeticalSortStrategy<Row>('name', { locale: 'en' }))
    expect(names(sorted)).toEqual(['a', 'é', 'z'])
  })
})
