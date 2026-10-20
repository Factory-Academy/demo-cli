import { paginateByCursor } from '../src/utils/pagination'

describe('paginateByCursor', () => {
  const sampleItems = [
    { id: '1', name: 'One' },
    { id: '2', name: 'Two' },
    { id: '3', name: 'Three' },
  ]

  test('returns first page and next cursor', () => {
    const result = paginateByCursor(sampleItems, { limit: 2 })

    expect(result.items.map(item => item.id)).toEqual(['1', '2'])
    expect(result.nextCursor).toBe('2')
  })

  test('returns items after cursor', () => {
    const result = paginateByCursor(sampleItems, { cursor: '2', limit: 2 })

    expect(result.items.map(item => item.id)).toEqual(['3'])
    expect(result.nextCursor).toBeUndefined()
  })

  test('returns no items for unknown cursor', () => {
    const result = paginateByCursor(sampleItems, { cursor: '999', limit: 2 })

    expect(result.items).toEqual([])
    expect(result.nextCursor).toBeUndefined()
  })

  test('returns all items when limit is invalid', () => {
    const result = paginateByCursor(sampleItems, { limit: 0 })

    expect(result.items.map(item => item.id)).toEqual(['1', '2', '3'])
    expect(result.nextCursor).toBeUndefined()
  })
})
