/**
 * Serializer for async operations to prevent race conditions.
 * Ensures operations on a given key are executed sequentially.
 */

type QueueItem = {
  operation: () => Promise<any>
  resolve: (value: any) => void
  reject: (error: any) => void
}

export class Serializer {
  private queues: Map<string, QueueItem[]> = new Map()
  private processing: Set<string> = new Set()

  /**
   * Execute an async operation with serialized access for the given key.
   * Operations with the same key will be executed sequentially.
   */
  async execute<T>(key: string, operation: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const item: QueueItem = { operation, resolve, reject }
      
      // Add to queue
      if (!this.queues.has(key)) {
        this.queues.set(key, [])
      }
      this.queues.get(key)!.push(item)

      // Start processing if not already running
      if (!this.processing.has(key)) {
        this.processQueue(key)
      }
    })
  }

  private async processQueue(key: string): Promise<void> {
    this.processing.add(key)

    const queue = this.queues.get(key)
    if (!queue || queue.length === 0) {
      this.processing.delete(key)
      return
    }

    const item = queue.shift()!
    
    try {
      const result = await item.operation()
      item.resolve(result)
    } catch (error) {
      item.reject(error)
    }

    // Process next item
    if (queue.length > 0) {
      await this.processQueue(key)
    } else {
      this.processing.delete(key)
      this.queues.delete(key)
    }
  }
}

// Global instance for shared serialization
export const globalSerializer = new Serializer()
