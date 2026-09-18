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
})
