import { fixedClock } from '../src/core/clock'
import { NotFoundError, ValidationError } from '../src/core/errors'
import { ItemService } from '../src/core/itemService'

const CLOCK = fixedClock('2026-01-01T00:00:00.000Z')

function service(): ItemService {
  return new ItemService(CLOCK)
}

describe('ItemService.create', () => {
  test('assigns sequential ids, defaults status, and stamps createdAt', () => {
    const svc = service()

    const first = svc.create({ name: 'Alpha' })
    const second = svc.create({ name: 'Beta', description: 'second' })

    expect(first).toEqual({
      id: '1',
      name: 'Alpha',
      description: undefined,
      status: 'active',
      createdAt: '2026-01-01T00:00:00.000Z',
    })
    expect(second.id).toBe('2')
    expect(second.description).toBe('second')
  })

  test('preserves the original (untrimmed) name for valid input', () => {
    const item = service().create({ name: '  spaced  ' })
    expect(item.name).toBe('  spaced  ')
  })

  test('rejects an empty or whitespace-only name', () => {
    const svc = service()
    expect(() => svc.create({ name: '' })).toThrow(ValidationError)
    expect(() => svc.create({ name: '   ' })).toThrow('Item name is required')
    expect(svc.size).toBe(0)
  })
})

describe('ItemService.list', () => {
  test('returns all items when no filter is given', () => {
    const svc = service()
    svc.create({ name: 'Alpha' })
    svc.create({ name: 'Beta' })
    expect(svc.list()).toHaveLength(2)
  })

  test('filters by status when provided', () => {
    const svc = service()
    svc.create({ name: 'Alpha' }) // status 'active'
    const results = svc.list({ status: 'active' })
    expect(results).toHaveLength(1)
    expect(svc.list({ status: 'archived' })).toEqual([])
  })

  test('treats an empty status filter as "no filter"', () => {
    const svc = service()
    svc.create({ name: 'Alpha' })
    expect(svc.list({ status: '' })).toHaveLength(1)
  })
})

describe('ItemService.get', () => {
  test('returns a stored item by id', () => {
    const svc = service()
    const created = svc.create({ name: 'Alpha' })
    expect(svc.get(created.id)).toEqual(created)
  })

  test('throws NotFoundError with a legacy-compatible message', () => {
    const svc = service()
    expect(() => svc.get('42')).toThrow(NotFoundError)
    expect(() => svc.get('42')).toThrow('Item 42 not found')
  })
})
