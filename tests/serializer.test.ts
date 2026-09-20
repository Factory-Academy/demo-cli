import { Serializer } from '../src/utils/serializer'

describe('Serializer', () => {
  let serializer: Serializer

  beforeEach(() => {
    serializer = new Serializer()
  })

  test('executes operations sequentially for the same key', async () => {
    const results: number[] = []
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    const operation1 = async () => {
      await delay(50)
      results.push(1)
      return 1
    }

    const operation2 = async () => {
      await delay(20)
      results.push(2)
      return 2
    }

    const operation3 = async () => {
      await delay(10)
      results.push(3)
      return 3
    }

    // Execute all with the same key
    const promises = [
      serializer.execute('key1', operation1),
      serializer.execute('key1', operation2),
      serializer.execute('key1', operation3),
    ]

    await Promise.all(promises)

    // Operations should complete in order despite different delays
    expect(results).toEqual([1, 2, 3])
  })

  test('allows parallel execution for different keys', async () => {
    const results: string[] = []
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    const operation1 = async () => {
      await delay(50)
      results.push('key1')
      return 'key1'
    }

    const operation2 = async () => {
      await delay(20)
      results.push('key2')
      return 'key2'
    }

    const promises = [
      serializer.execute('key1', operation1),
      serializer.execute('key2', operation2),
    ]

    await Promise.all(promises)

    // key2 should complete before key1 due to shorter delay
    expect(results).toEqual(['key2', 'key1'])
  })

  test('propagates errors from operations', async () => {
    const errorOperation = async () => {
      throw new Error('Test error')
    }

    await expect(
      serializer.execute('key1', errorOperation)
    ).rejects.toThrow('Test error')
  })

  test('continues processing queue after error', async () => {
    const results: number[] = []

    const errorOperation = async () => {
      throw new Error('Error')
    }

    const successOperation = async () => {
      results.push(1)
      return 1
    }

    const promises = [
      serializer.execute('key1', errorOperation).catch(() => 'error'),
      serializer.execute('key1', successOperation),
    ]

    await Promise.all(promises)

    expect(results).toEqual([1])
  })

  test('returns operation result', async () => {
    const operation = async () => {
      return { value: 42 }
    }

    const result = await serializer.execute('key1', operation)

    expect(result).toEqual({ value: 42 })
  })

  test('prevents race conditions in concurrent ID generation', async () => {
    let counter = 0
    const ids: number[] = []

    const generateId = async () => {
      // Simulate read-modify-write with a delay
      const current = counter
      await new Promise(resolve => setTimeout(resolve, 10))
      counter = current + 1
      ids.push(counter)
      return counter
    }

    // Without serialization, these would race
    const promises = Array.from({ length: 10 }, () =>
      serializer.execute('counter', generateId)
    )

    await Promise.all(promises)

    // All IDs should be unique and sequential
    expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })
})
