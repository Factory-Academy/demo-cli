import { formatTable } from '../src/utils/format'
import { itemCommand } from '../src/commands/item'

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
})

describe('itemCommand', () => {
  test('command is defined', () => {
    expect(itemCommand).toBeDefined()
    expect(itemCommand.name()).toBe('items')
  })

  test('has subcommands', () => {
    const commands = itemCommand.commands
    const commandNames = commands.map(cmd => cmd.name())
    expect(commandNames).toContain('list')
    expect(commandNames).toContain('create')
    expect(commandNames).toContain('get')
  })
})
