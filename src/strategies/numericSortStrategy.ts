import { SortOrder, SortStrategy, orderSign } from './sortStrategy'

export interface NumericSortOptions {
  /** Ascending (smallest first) by default. */
  order?: SortOrder
  /**
   * Where to place values that cannot be parsed as finite numbers
   * (`NaN`, `undefined`, non-numeric strings). Defaults to `'last'`,
   * regardless of sort order, so junk never crowds out real data.
   */
  invalidPosition?: 'first' | 'last'
}

/**
 * Orders records by a numeric key. String values are coerced with
 * `Number(...)` so inputs parsed from CLI flags (always strings) still sort
 * numerically rather than lexically ('10' before '9').
 */
export class NumericSortStrategy<T> implements SortStrategy<T> {
  readonly name = 'numeric'

  private readonly key: keyof T
  private readonly sign: 1 | -1
  private readonly invalidPosition: 'first' | 'last'

  constructor(key: keyof T, options: NumericSortOptions = {}) {
    this.key = key
    this.sign = orderSign(options.order ?? 'asc')
    this.invalidPosition = options.invalidPosition ?? 'last'
  }

  compare(a: T, b: T): number {
    const left = this.toNumber(a[this.key])
    const right = this.toNumber(b[this.key])

    const leftInvalid = Number.isNaN(left)
    const rightInvalid = Number.isNaN(right)
    if (leftInvalid || rightInvalid) {
      return this.compareInvalid(leftInvalid, rightInvalid)
    }

    return this.sign * Math.sign(left - right)
  }

  private toNumber(value: unknown): number {
    if (value === null || value === undefined || value === '') return NaN
    return Number(value)
  }

  /**
   * Invalid placement is independent of ascending/descending: the sign is not
   * applied here, so invalid values always land on the configured side.
   */
  private compareInvalid(leftInvalid: boolean, rightInvalid: boolean): number {
    if (leftInvalid && rightInvalid) return 0
    const invalidGoesLast = this.invalidPosition === 'last'
    if (leftInvalid) return invalidGoesLast ? 1 : -1
    return invalidGoesLast ? -1 : 1
  }
}
