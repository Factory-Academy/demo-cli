import {
  padCell,
  renderHeader,
  renderRow,
  renderRows,
  renderSeparator,
} from '../../src/utils/table'
import { resolveTableOptions } from '../../src/utils/table/types'

const opts = resolveTableOptions()

describe('padCell', () => {
  test('pads to the target width', () => {
    expect(padCell('ab', 5)).toBe('ab   ')
  })

  test('leaves already-wide values unchanged', () => {
    expect(padCell('abcdef', 3)).toBe('abcdef')
  })
})

describe('renderHeader', () => {
  test('joins padded columns with the separator', () => {
    expect(renderHeader(['id', 'name'], [2, 5], opts)).toBe('id  name ')
  })

  test('honors a custom separator', () => {
    const o = resolveTableOptions({ columnSeparator: ' | ' })
    expect(renderHeader(['id', 'name'], [2, 4], o)).toBe('id | name')
  })
})

describe('renderSeparator', () => {
  test('emits dashes sized to each column', () => {
    expect(renderSeparator([2, 5], opts)).toBe('--  -----')
  })
})

describe('renderRow', () => {
  test('renders cells aligned to widths', () => {
    const row = { id: '1', name: 'Alice' }
    expect(renderRow(row, ['id', 'name'], [2, 5], opts)).toBe('1   Alice')
  })

  test('fills missing columns with the placeholder', () => {
    const row = { id: '1' }
    expect(renderRow(row, ['id', 'name'], [2, 5], opts)).toBe('1        ')
  })
})

describe('renderRows', () => {
  test('renders every row', () => {
    const rows = [
      { id: '1', name: 'A' },
      { id: '2', name: 'B' },
    ]
    expect(renderRows(rows, ['id', 'name'], [2, 4], opts)).toEqual(['1   A   ', '2   B   '])
  })
})
