import { fixedClock } from '../src/core/clock'
import { NotFoundError, ValidationError } from '../src/core/errors'
import { WidgetService } from '../src/core/widgetService'

const CLOCK = fixedClock('2026-01-01T00:00:00.000Z')

function service(): WidgetService {
  return new WidgetService(CLOCK)
}

describe('WidgetService.create', () => {
  test('assigns ids, keeps priority, and stamps createdAt', () => {
    const widget = service().create({ name: 'W1', itemId: 'i1', priority: 5 })
    expect(widget).toEqual({
      id: '1',
      name: 'W1',
      itemId: 'i1',
      priority: 5,
      createdAt: '2026-01-01T00:00:00.000Z',
    })
  })

  test('defaults priority to 0 when omitted', () => {
    const widget = service().create({ name: 'W1', itemId: 'i1' })
    expect(widget.priority).toBe(0)
  })

  test('rejects a missing name or itemId', () => {
    const svc = service()
    expect(() => svc.create({ name: '', itemId: 'i1' })).toThrow(ValidationError)
    expect(() => svc.create({ name: 'W1', itemId: '  ' })).toThrow('Widget itemId is required')
    expect(svc.size).toBe(0)
  })

  test('rejects a non-finite priority (e.g. NaN from a bad CLI string)', () => {
    const svc = service()
    expect(() => svc.create({ name: 'W1', itemId: 'i1', priority: NaN })).toThrow(
      'Widget priority must be a finite number',
    )
    expect(svc.size).toBe(0)
  })

  test('rejects a fractional priority instead of truncating it', () => {
    const svc = service()
    expect(() => svc.create({ name: 'W1', itemId: 'i1', priority: 2.5 })).toThrow(
      'Widget priority must be a whole number',
    )
    expect(svc.size).toBe(0)
  })

  test('rejects a negative priority', () => {
    const svc = service()
    expect(() => svc.create({ name: 'W1', itemId: 'i1', priority: -1 })).toThrow(
      'Widget priority must not be negative',
    )
    expect(svc.size).toBe(0)
  })

  test('accepts a priority of 0 explicitly', () => {
    const widget = service().create({ name: 'W1', itemId: 'i1', priority: 0 })
    expect(widget.priority).toBe(0)
  })
})

describe('WidgetService.list', () => {
  test('returns all widgets when no filter is given', () => {
    const svc = service()
    svc.create({ name: 'W1', itemId: 'i1' })
    svc.create({ name: 'W2', itemId: 'i2' })
    expect(svc.list()).toHaveLength(2)
  })

  test('filters by itemId when provided', () => {
    const svc = service()
    svc.create({ name: 'W1', itemId: 'i1' })
    svc.create({ name: 'W2', itemId: 'i2' })
    svc.create({ name: 'W3', itemId: 'i1' })

    const results = svc.list({ itemId: 'i1' })
    expect(results.map((w) => w.name)).toEqual(['W1', 'W3'])
  })
})

describe('WidgetService.get', () => {
  test('returns a stored widget by id', () => {
    const svc = service()
    const created = svc.create({ name: 'W1', itemId: 'i1' })
    expect(svc.get(created.id)).toEqual(created)
  })

  test('throws NotFoundError with a widget-specific message', () => {
    expect(() => service().get('7')).toThrow(NotFoundError)
    expect(() => service().get('7')).toThrow('Widget 7 not found')
  })

  test('rejects a blank id as invalid rather than "not found"', () => {
    const svc = service()
    expect(() => svc.get('')).toThrow(ValidationError)
    expect(() => svc.get('   ')).toThrow('Widget id is required')
  })
})
