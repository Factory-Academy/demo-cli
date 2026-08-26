import { formatTable, sumArray } from '../src/utils/format'

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
