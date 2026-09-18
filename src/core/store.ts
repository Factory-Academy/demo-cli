import { Identifiable } from './identifiable'

// A generic, in-memory collection with sequential string ids.
//
// Both `item` and `widget` previously carried their own copy of this logic:
// a module-level array, a `let nextId = 1` counter, `.push`, `.filter`, and
// `.find`. Pulling it into one reusable structure removes that duplication and
// gives a single place to reason about id generation and read isolation.
//
// The store is intentionally I/O-free. It owns mutable state but performs no
// console, process, or network work, so it is fully deterministic given its
// method calls.
export class Store<T extends Identifiable> {
  private readonly records: T[] = []
  private sequence = 0

  /** Produces the next id: "1", "2", "3", ... matching the legacy counter. */
  nextId(): string {
    this.sequence += 1
    return String(this.sequence)
  }

  add(record: T): T {
    this.records.push(record)
    return record
  }

  /** Returns a shallow copy so callers cannot mutate internal state. */
  all(): T[] {
    return this.records.slice()
  }

  filter(predicate: (record: T) => boolean): T[] {
    return this.records.filter(predicate)
  }

  findById(id: string): T | undefined {
    return this.records.find((record) => record.id === id)
  }

  get size(): number {
    return this.records.length
  }
}
