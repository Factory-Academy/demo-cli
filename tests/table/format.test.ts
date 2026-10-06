import { formatTable } from '../../src/utils/table'

describe('formatTable (integration / regression)', () => {
  describe('happy path', () => {
    test('formats aligned columns with a header and separator', () => {
      const data = [
        { id: '1', name: 'Test', status: 'active' },
        { id: '2', name: 'Another', status: 'pending' },
      ]
      const result = formatTable(data, ['id', 'name', 'status'])
      const lines = result.split('\n')

      expect(lines).toHaveLength(4) // header + separator + 2 rows
      expect(lines[0]).toContain('id')
      expect(lines[0]).toContain('name')
      expect(lines[0]).toContain('status')
      expect(lines[1]).toMatch(/^-+( {2}-+)*$/) // dashed separator
      expect(result).toContain('Test')
      expect(result).toContain('Another')

      // Every line is padded to the same visible width.
      const widths = new Set(lines.map(l => l.length))
      expect(widths.size).toBe(1)
    })

    test('respects a custom column separator', () => {
      const data = [{ id: '1', name: 'A' }]
      const result = formatTable(data, ['id', 'name'], { columnSeparator: ' | ' })
      expect(result.split('\n')[0]).toBe('id | name')
    })
  })

  describe('empty inputs', () => {
    test('empty data returns an empty string', () => {
      expect(formatTable([], ['id', 'name'])).toBe('')
    })

    test('empty columns returns an empty string', () => {
      expect(formatTable([{ id: '1' }], [])).toBe('')
    })

    test('rows present but all columns invalid returns an empty string', () => {
      expect(formatTable([{ id: '1' }], [null, 42] as unknown as string[])).toBe('')
    })
  })

  describe('malformed inputs do not throw', () => {
    test('non-array data', () => {
      expect(formatTable(null as unknown, ['id'])).toBe('')
      expect(formatTable(undefined as unknown, ['id'])).toBe('')
      expect(formatTable('nope' as unknown, ['id'])).toBe('')
    })

    test('non-array columns', () => {
      expect(formatTable([{ id: '1' }], null as unknown)).toBe('')
      expect(formatTable([{ id: '1' }], 'id' as unknown)).toBe('')
    })

    test('null / primitive rows are skipped', () => {
      const data = [{ id: '1' }, null, undefined, 7, 'x', [1, 2], { id: '2' }]
      const result = formatTable(data as unknown, ['id'])
      const lines = result.split('\n')
      expect(lines).toHaveLength(4) // header + separator + 2 valid rows
      expect(result).toContain('1')
      expect(result).toContain('2')
    })

    test('missing, null, and object values render safely', () => {
      const data = [
        { id: '1', name: 'ok' },
        { id: '2', name: null },
        { id: '3' },
        { id: '4', name: { nested: true } },
      ]
      const result = formatTable(data, ['id', 'name'])
      expect(result).toContain('{"nested":true}')
      expect(() => formatTable(data, ['id', 'name'])).not.toThrow()
    })

    test('duplicate columns are collapsed', () => {
      const data = [{ id: '1', name: 'A' }]
      const result = formatTable(data, ['id', 'id', 'name'])
      // Header should contain "id" once as a column, not twice.
      const header = result.split('\n')[0]
      expect(header.match(/\bid\b/g)?.length).toBe(1)
    })
  })

  describe('alignment is preserved against layout-breaking values', () => {
    test('newlines and tabs in cells never add rows or break width', () => {
      const data = [
        { id: '1', note: 'first\nsecond' },
        { id: '2', note: 'tab\there' },
      ]
      const result = formatTable(data, ['id', 'note'])
      const lines = result.split('\n')
      expect(lines).toHaveLength(4) // no extra rows from embedded newlines
      const widths = new Set(lines.map(l => l.length))
      expect(widths.size).toBe(1)
    })

    test('maxCellWidth caps column width', () => {
      const data = [{ id: '1', name: 'a-really-long-value' }]
      const result = formatTable(data, ['id', 'name'], { maxCellWidth: 6 })
      for (const line of result.split('\n')) {
        // id header(2) + sep(2) + name(<=6) => <= 10
        expect(line.length).toBeLessThanOrEqual(10)
      }
    })
  })

  describe('scale', () => {
    test('handles a large dataset without stack overflow', () => {
      const data = Array.from({ length: 150_000 }, (_, i) => ({
        id: String(i),
        name: `name-${i}`,
      }))
      let result = ''
      expect(() => {
        result = formatTable(data, ['id', 'name'])
      }).not.toThrow()
      expect(result.split('\n')).toHaveLength(150_000 + 2)
    })
  })
})
