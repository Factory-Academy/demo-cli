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
    const result = formatTable(data, ['id', 'name', 'status'], { compact: true })
    expect(result).toBe('id\tname\tstatus\n1\tTest\tactive\n2\tAnother\tpending')
  })

  test('compact mode skips separator line', () => {
    const data = [{ id: '1', name: 'Test' }]
    const normal = formatTable(data, ['id', 'name'])
    const compact = formatTable(data, ['id', 'name'], { compact: true })
    expect(normal).toContain('---')
    expect(compact).not.toContain('---')
  })

  test('compact mode handles empty data', () => {
    expect(formatTable([], ['id', 'name'], { compact: true })).toBe('')
  })

  test('compact mode handles values with spaces', () => {
    const data = [
      { id: '1', name: 'Test Item', status: 'in progress' },
      { id: '2', name: 'Another Item', status: 'pending review' },
    ]
    const result = formatTable(data, ['id', 'name', 'status'], { compact: true })
    expect(result).toBe('id\tname\tstatus\n1\tTest Item\tin progress\n2\tAnother Item\tpending review')
  })
})
