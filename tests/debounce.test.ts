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
})
