import { createItemCommand } from '../src/commands/item'
import { createWidgetCommand } from '../src/commands/widget'
import { fixedClock } from '../src/core/clock'
import { ItemService } from '../src/core/itemService'
import { WidgetService } from '../src/core/widgetService'

const CLOCK = fixedClock('2026-01-01T00:00:00.000Z')

// Runs a subcommand through Commander and returns everything written to stdout.
async function run(command: ReturnType<typeof createItemCommand>, args: string[]): Promise<string> {
  const lines: string[] = []
  const logSpy = jest.spyOn(console, 'log').mockImplementation((line?: unknown) => {
    lines.push(String(line))
  })
  try {
    await command.parseAsync(args, { from: 'user' })
  } finally {
    logSpy.mockRestore()
  }
  return lines.join('\n')
}

// Runs a subcommand whose action is expected to hit the failure path, capturing
// the stderr message. process.exit is stubbed so the reporter cannot tear down
// the Jest worker mid-test.
async function runExpectingFailure(
  command: ReturnType<typeof createItemCommand>,
  args: string[],
): Promise<string> {
  const messages: string[] = []
  const errSpy = jest.spyOn(console, 'error').mockImplementation((line?: unknown) => {
    messages.push(String(line))
  })
  const exitSpy = jest.fn()
  const originalExit = process.exit
  // process.exit returns `never`; the cast keeps the type-checker happy while
  // preventing a real exit from tearing down the Jest worker.
  process.exit = exitSpy as unknown as typeof process.exit
  try {
    await command.parseAsync(args, { from: 'user' })
  } finally {
    process.exit = originalExit
    errSpy.mockRestore()
  }
  expect(exitSpy).toHaveBeenCalledWith(1)
  return messages.join('\n')
}

describe('items command (adapter over ItemService)', () => {
  test('create then list produces the legacy messages', async () => {
    const service = new ItemService(CLOCK)

    const createOut = await run(createItemCommand(service), ['create', '--name', 'Alpha'])
    expect(createOut).toBe('Created item 1: Alpha')

    const listOut = await run(createItemCommand(service), ['list'])
    expect(listOut).toContain('Alpha')
    expect(listOut).toContain('active')
  })

  test('list with no items prints the empty-state message', async () => {
    const out = await run(createItemCommand(new ItemService(CLOCK)), ['list'])
    expect(out).toBe('No items found.')
  })

  test('get prints pretty JSON for a stored item', async () => {
    const service = new ItemService(CLOCK)
    service.create({ name: 'Alpha' })

    const out = await run(createItemCommand(service), ['get', '1'])
    expect(JSON.parse(out)).toEqual({
      id: '1',
      name: 'Alpha',
      status: 'active',
      createdAt: '2026-01-01T00:00:00.000Z',
    })
  })
})

describe('widgets command (adapter over WidgetService)', () => {
  test('create parses --priority into a number', async () => {
    const service = new WidgetService(CLOCK)

    const out = await run(createWidgetCommand(service), [
      'create',
      '--name',
      'W1',
      '--item-id',
      'i1',
      '--priority',
      '5',
    ])
    expect(out).toBe('Created widget 1: W1')
    expect(service.get('1').priority).toBe(5)
  })

  test('list filters by --item-id', async () => {
    const service = new WidgetService(CLOCK)
    service.create({ name: 'W1', itemId: 'i1' })
    service.create({ name: 'W2', itemId: 'i2' })

    const out = await run(createWidgetCommand(service), ['list', '--item-id', 'i1'])
    expect(out).toContain('W1')
    expect(out).not.toContain('W2')
  })

  test('defaults --priority to 0 when the flag is omitted', async () => {
    const service = new WidgetService(CLOCK)

    const out = await run(createWidgetCommand(service), [
      'create',
      '--name',
      'W1',
      '--item-id',
      'i1',
    ])
    expect(out).toBe('Created widget 1: W1')
    expect(service.get('1').priority).toBe(0)
  })
})

describe('widgets command --priority edge cases', () => {
  test('rejects a fractional --priority at the adapter boundary', async () => {
    const service = new WidgetService(CLOCK)

    const err = await runExpectingFailure(createWidgetCommand(service), [
      'create',
      '--name',
      'W1',
      '--item-id',
      'i1',
      '--priority',
      '5.9',
    ])
    expect(err).toBe('Widget priority must be an integer')
    expect(service.size).toBe(0)
  })

  test('rejects trailing garbage rather than parsing a prefix', async () => {
    const service = new WidgetService(CLOCK)

    const err = await runExpectingFailure(createWidgetCommand(service), [
      'create',
      '--name',
      'W1',
      '--item-id',
      'i1',
      '--priority',
      '5abc',
    ])
    expect(err).toBe('Widget priority must be an integer')
    expect(service.size).toBe(0)
  })

  test('rejects a negative --priority via the core invariant', async () => {
    const service = new WidgetService(CLOCK)

    // The adapter parses "-1" to a valid integer; the core rejects the sign.
    // Use the `--flag=value` form so Commander does not mistake the leading
    // "-" for another option.
    const err = await runExpectingFailure(createWidgetCommand(service), [
      'create',
      '--name',
      'W1',
      '--item-id',
      'i1',
      '--priority=-1',
    ])
    expect(err).toBe('Widget priority must not be negative')
    expect(service.size).toBe(0)
  })
})
