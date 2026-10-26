export type SortOrder = 'asc' | 'desc'

/**
 * A pluggable comparison strategy. Implementations know how to order two
 * records of type `T`; callers stay agnostic about which concrete rule runs.
 */
export interface SortStrategy<T> {
  /** Stable identifier used by the factory and for diagnostics. */
  readonly name: string
  /**
   * Returns a negative number when `a` should sort before `b`, a positive
   * number when after, and `0` when the two are equivalent under this strategy.
   */
  compare(a: T, b: T): number
}

/** Multiplier that flips a comparator's result for descending order. */
export function orderSign(order: SortOrder): 1 | -1 {
  return order === 'desc' ? -1 : 1
}

/**
 * Returns a new array sorted by the given strategy. The input is not mutated,
 * which keeps callers (such as command handlers holding shared state) safe.
 */
export function sortWith<T>(items: readonly T[], strategy: SortStrategy<T>): T[] {
  return [...items].sort((a, b) => strategy.compare(a, b))
}
