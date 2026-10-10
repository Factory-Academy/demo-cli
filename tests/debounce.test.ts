import { debounce } from '../src/utils/debounce'

describe('debounce', () => {
  test('delays function execution', (done) => {
    const fn = jest.fn()
    const debouncedFn = debounce(fn, 50)

    debouncedFn()
    expect(fn).not.toHaveBeenCalled()

    setTimeout(() => {
      expect(fn).toHaveBeenCalledTimes(1)
      done()
    }, 100)
  })

  test('cancels previous call when invoked again', (done) => {
    const fn = jest.fn()
    const debouncedFn = debounce(fn, 50)

    debouncedFn()
    debouncedFn()
    debouncedFn()

    setTimeout(() => {
      expect(fn).toHaveBeenCalledTimes(1)
      done()
    }, 100)
  })

  test('preserves function arguments', (done) => {
    const fn = jest.fn()
    const debouncedFn = debounce(fn, 50)

    debouncedFn('test', 42)

    setTimeout(() => {
      expect(fn).toHaveBeenCalledWith('test', 42)
      done()
    }, 100)
  })

  test('throws error for negative delay', () => {
    expect(() => debounce(() => {}, -1)).toThrow('delayMs must be a non-negative number')
  })

  test('cleans up timeout after execution', (done) => {
    const fn = jest.fn()
    const debouncedFn = debounce(fn, 50)

    debouncedFn('first')

    setTimeout(() => {
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('first')

      // Call again after cleanup
      debouncedFn('second')

      setTimeout(() => {
        expect(fn).toHaveBeenCalledTimes(2)
        expect(fn).toHaveBeenLastCalledWith('second')
        done()
      }, 100)
    }, 100)
  })
})
