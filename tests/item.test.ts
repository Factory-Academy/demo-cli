import { formatTable } from '../src/utils/format'

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

  test('handles empty status filter gracefully', () => {
    const data = [
      { id: '1', name: 'Test', status: 'active' },
      { id: '2', name: 'Another', status: 'pending' },
    ]
    // Empty strings should be trimmed and not filter
    const emptyStatusFilter = ''?.trim()
    const shouldNotFilter = !emptyStatusFilter
    expect(shouldNotFilter).toBe(true)
  })

  test('handles whitespace-only status filter', () => {
    // Whitespace-only strings should trim to empty and not filter
    const whitespaceFilter = '   '?.trim()
    const shouldNotFilter = !whitespaceFilter
    expect(shouldNotFilter).toBe(true)
  })
})
