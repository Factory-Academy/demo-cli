import { formatTable, sumArray, isDateBefore } from '../src/utils/format'

describe('isDateBefore', () => {
  test('compares two Date objects correctly', () => {
    const date1 = new Date('2024-01-01')
    const date2 = new Date('2024-01-02')
    expect(isDateBefore(date1, date2)).toBe(true)
    expect(isDateBefore(date2, date1)).toBe(false)
  })

  test('compares two ISO string dates correctly', () => {
    const dateA = '2024-01-01T00:00:00Z'
    const dateB = '2024-01-02T00:00:00Z'
    expect(isDateBefore(dateA, dateB)).toBe(true)
  })

  test('handles mixed Date and string comparisons', () => {
    const date = new Date('2024-01-01')
    const str = '2024-01-02T00:00:00Z'
    expect(isDateBefore(date, str)).toBe(true)
  })

  test('returns false for equal dates', () => {
    const date1 = new Date('2024-01-01T12:00:00Z')
    const date2 = '2024-01-01T12:00:00Z'
    expect(isDateBefore(date1, date2)).toBe(false)
  })
})

describe('sumArray', () => {
  test('sums array of numbers', () => {
    expect(sumArray([1, 2, 3, 4])).toBe(10)
  })

  test('handles empty array', () => {
    expect(sumArray([])).toBe(0)
  })

  test('handles single element', () => {
    expect(sumArray([5])).toBe(5)
  })

  test('handles negative numbers', () => {
    expect(sumArray([1, -2, 3, -4])).toBe(-2)
  })
})

describe('formatTable', () => {
  test('formats data into aligned columns', () => {
    const data = [
      { id: '1', name: 'Test', status: 'active' },
      { id: '2', name: 'Another', status: 'pending' },
    ]
    const result = formatTable(data, ['id', 'name', 'status'])
    expect(result).toContain('id')
    expect(result).toContain('Test')
    expect(result).toContain('Another')
  })

  test('handles empty data', () => {
    expect(formatTable([], ['id', 'name'])).toBe('')
  })
})
