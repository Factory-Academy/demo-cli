import { Mutex } from './async'

let nextId = 1
const mutex = new Mutex()

/**
 * Generate a unique ID asynchronously.
 * Uses a Mutex to ensure that concurrent calls do not result in duplicate IDs.
 */
export async function getNextId(): Promise<string> {
  return mutex.runExclusive(async () => {
    const id = nextId
    // Simulate some async work (e.g., persistence) that creates a race condition
    // if not properly serialized.
    await new Promise(resolve => setTimeout(resolve, 0))
    nextId = id + 1
    return String(id)
  })
}
