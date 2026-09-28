import { displayList } from '../src/utils/display'

describe('displayList', () => {
  let consoleSpy: any

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation()
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  test('displays formatted table when data is not empty', () => {
    const data = [
      { id: '1', name: 'First', status: 'active' },
      { id: '2', name: 'Second', status: 'pending' },
    ]
    displayList(data, 'items', ['id', 'name', 'status'])

    expect(consoleSpy).toHaveBeenCalledTimes(1)
    const output = consoleSpy.mock.calls[0][0]
    expect(output).toContain('id')
    expect(output).toContain('name')
    expect(output).toContain('status')
    expect(output).toContain('First')
    expect(output).toContain('Second')
  })

  test('displays empty message when data is empty', () => {
    displayList([], 'items', ['id', 'name'])

    expect(consoleSpy).toHaveBeenCalledWith('No items found.')
  })

  test('uses correct resource name in empty message', () => {
    displayList([], 'widgets', ['id', 'name'])

    expect(consoleSpy).toHaveBeenCalledWith('No widgets found.')
  })

  test('displays only specified columns', () => {
    const data = [
      { id: '1', name: 'Test', status: 'active', extra: 'ignored' },
    ]
    displayList(data, 'items', ['id', 'name'])

    const output = consoleSpy.mock.calls[0][0]
    expect(output).toContain('id')
    expect(output).toContain('name')
    expect(output).not.toContain('status')
    expect(output).not.toContain('extra')
  })
})
