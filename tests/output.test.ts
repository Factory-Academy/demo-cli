import { renderItemList, renderWidgetList, reportFailure } from '../src/commands/output'
import { Item, Widget } from '../src/core/types'

const ITEM: Item = {
  id: '1',
  name: 'Alpha',
  status: 'active',
  createdAt: '2026-01-01T00:00:00.000Z',
}

const WIDGET: Widget = {
  id: '1',
  name: 'W1',
  itemId: 'i1',
  priority: 3,
  createdAt: '2026-01-01T00:00:00.000Z',
}

describe('renderItemList', () => {
  test('returns the empty-state message for no items', () => {
    expect(renderItemList([])).toBe('No items found.')
  })

  test('renders a table with the expected columns', () => {
    const out = renderItemList([ITEM])
    for (const heading of ['id', 'name', 'status', 'createdAt']) {
      expect(out).toContain(heading)
    }
    expect(out).toContain('Alpha')
  })
})

describe('renderWidgetList', () => {
  test('returns the empty-state message for no widgets', () => {
    expect(renderWidgetList([])).toBe('No widgets found.')
  })

  test('renders a table with the expected columns', () => {
    const out = renderWidgetList([WIDGET])
    for (const heading of ['id', 'name', 'itemId', 'priority']) {
      expect(out).toContain(heading)
    }
    expect(out).toContain('W1')
  })
})

describe('reportFailure', () => {
  const originalExit = process.exit

  afterEach(() => {
    process.exit = originalExit
    jest.restoreAllMocks()
  })

  test('prints the error message to stderr and exits 1', () => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    const exitSpy = jest.fn()
    // process.exit returns `never`; cast keeps the type-checker happy in tests.
    process.exit = exitSpy as unknown as typeof process.exit

    reportFailure(new Error('boom'))

    expect(errSpy).toHaveBeenCalledWith('boom')
    expect(exitSpy).toHaveBeenCalledWith(1)
  })

  test('stringifies non-Error values', () => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    process.exit = jest.fn() as unknown as typeof process.exit

    reportFailure('plain string')

    expect(errSpy).toHaveBeenCalledWith('plain string')
  })
})
