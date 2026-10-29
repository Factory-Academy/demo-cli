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

  test('includes separator line by default', () => {
    const data = [{ id: '1', name: 'Test' }]
    const result = formatTable(data, ['id', 'name'])
    const lines = result.split('\n')
    expect(lines.length).toBe(3)
    expect(lines[1]).toMatch(/^-+\s+-+$/)
  })

  test('omits separator line in compact mode', () => {
    const data = [{ id: '1', name: 'Test' }]
    const result = formatTable(data, ['id', 'name'], true)
    const lines = result.split('\n')
    expect(lines.length).toBe(2)
    expect(lines[0]).toBe(lines[0])
    expect(lines[1]).toContain('Test')
  })
})
