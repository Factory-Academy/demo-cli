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

  test('handles empty columns', () => {
    expect(formatTable([{ id: '1' }], [])).toBe('')
  })

  test('handles null and undefined data', () => {
    expect(formatTable(null as any, ['id'])).toBe('')
    expect(formatTable(undefined as any, ['id'])).toBe('')
  })

  test('handles null and undefined columns', () => {
    expect(formatTable([{ id: '1' }], null as any)).toBe('')
    expect(formatTable([{ id: '1' }], undefined as any)).toBe('')
  })

  test('handles missing field values', () => {
    const data = [
      { id: '1', name: 'Test' },
      { id: '2', status: 'pending' },
    ]
    const result = formatTable(data, ['id', 'name', 'status'])
    expect(result).toContain('id')
    expect(result).toContain('Test')
    expect(result).toContain('pending')
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

  test('compact mode with single row', () => {
    const data = [{ id: '1', name: 'Single' }]
    const result = formatTable(data, ['id', 'name'], true)
    expect(result).not.toContain('---')
    expect(result).toContain('id')
    expect(result).toContain('Single')
    expect(result.split('\n')).toHaveLength(2) // header + 1 row
  })

  test('compact mode with empty data', () => {
    expect(formatTable([], ['id', 'name'], true)).toBe('')
  })

  test('compact mode handles missing values', () => {
    const data = [
      { id: '1' },
      { name: 'Test' },
    ]
    const result = formatTable(data, ['id', 'name'], true)
    expect(result).not.toContain('---')
    expect(result.split('\n')).toHaveLength(3) // header + 2 rows
  })
})
