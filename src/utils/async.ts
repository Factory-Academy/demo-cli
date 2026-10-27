/**
 * A Mutex allows serializing access to an asynchronous resource.
 * It ensures that only one task can execute a given block of code at a time.
 */
export class Mutex {
  private queue: Promise<any> = Promise.resolve()

  /**
   * Run a function exclusively.
   * If another task is already running, it waits for it to finish.
   */
  async runExclusive<T>(fn: () => Promise<T>): Promise<T> {
    const next = this.queue.then(() => fn())
    this.queue = next.catch(() => {})
    return next
  }
}
