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

  test('formats data in compact mode', () => {
    const data = [
      { id: '1', name: 'Test', status: 'active' },
      { id: '2', name: 'Another', status: 'pending' },
    ]
    const result = formatTable(data, ['id', 'name', 'status'], true)
    expect(result).not.toContain('---')
    expect(result).toContain('1 | Test | active')
    expect(result).toContain('2 | Another | pending')
  })

  test('handles empty data in compact mode', () => {
    expect(formatTable([], ['id', 'name'], true)).toBe('')
  })
})
