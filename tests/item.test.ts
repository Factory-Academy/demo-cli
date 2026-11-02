import { formatTable, formatDuration } from '../src/utils/format'

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

describe('formatDuration', () => {
  test('formats milliseconds', () => {
    expect(formatDuration(500)).toBe('500ms')
  })

  test('formats seconds', () => {
    expect(formatDuration(5000)).toBe('5s')
  })

  test('formats minutes and seconds', () => {
    expect(formatDuration(125000)).toBe('2m 5s')
  })

  test('formats hours and minutes', () => {
    expect(formatDuration(5400000)).toBe('1h 30m')
  })

  test('formats days and hours', () => {
    expect(formatDuration(90000000)).toBe('1d 1h')
  })

  test('handles zero', () => {
    expect(formatDuration(0)).toBe('0ms')
  })

  test('handles negative values', () => {
    expect(formatDuration(-5000)).toBe('-5s')
  })
})
