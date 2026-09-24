import { debounce } from '../src/utils/debounce'

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('delays function execution', () => {
    const func = jest.fn()
    const debounced = debounce(func, 100)

    debounced()
    expect(func).not.toHaveBeenCalled()

    jest.advanceTimersByTime(100)
    expect(func).toHaveBeenCalledTimes(1)
  })

  test('cancels previous calls when invoked rapidly', () => {
    const func = jest.fn()
    const debounced = debounce(func, 100)

    debounced()
    jest.advanceTimersByTime(50)
    debounced()
    jest.advanceTimersByTime(50)
    debounced()

    expect(func).not.toHaveBeenCalled()

    jest.advanceTimersByTime(100)
    expect(func).toHaveBeenCalledTimes(1)
  })

  test('passes arguments to debounced function', () => {
    const func = jest.fn()
    const debounced = debounce(func, 100)

    debounced('arg1', 'arg2')
    jest.advanceTimersByTime(100)

    expect(func).toHaveBeenCalledWith('arg1', 'arg2')
  })
})
