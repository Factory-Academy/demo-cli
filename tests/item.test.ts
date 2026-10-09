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

  test('compact mode omits separator line', () => {
    const data = [
      { id: '1', name: 'Test' },
      { id: '2', name: 'Another' },
    ]
    const result = formatTable(data, ['id', 'name'], true)
    expect(result).not.toContain('---')
    expect(result).toContain('id')
    expect(result).toContain('Test')
    expect(result).toContain('Another')
  })
})
