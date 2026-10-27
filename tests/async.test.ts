import { Mutex } from '../src/utils/async'
import { getNextId } from '../src/utils/id'

describe('Mutex', () => {
  test('serializes async operations', async () => {
    const mutex = new Mutex()
    let count = 0
    const results: number[] = []

    const op = async (id: number) => {
      return mutex.runExclusive(async () => {
        const current = count
        // Simulate async delay
        await new Promise(resolve => setTimeout(resolve, 10))
        count = current + 1
        results.push(id)
        return count
      })
    }

    // Run multiple operations concurrently
    await Promise.all([op(1), op(2), op(3)])

    expect(count).toBe(3)
    expect(results).toHaveLength(3)
  })
})

describe('getNextId', () => {
  test('generates unique IDs even when called concurrently', async () => {
    const ids = await Promise.all([
      getNextId(),
      getNextId(),
      getNextId(),
      getNextId(),
      getNextId(),
    ])

    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(5)
    expect(ids).toContain('1')
    expect(ids).toContain('5')
  })
})
