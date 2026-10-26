import { SortOrder, SortStrategy, orderSign } from './sortStrategy'

export interface AlphabeticalSortOptions {
  /** Ascending (A→Z) by default. */
  order?: SortOrder
  /** When `true`, 'Apple' and 'apple' compare as equal. Defaults to `true`. */
  caseInsensitive?: boolean
  /**
   * Locale passed to `localeCompare`. Defaults to the host locale, which keeps
   * accented characters ordered sensibly rather than by raw code point.
   */
  locale?: string | string[]
}

/**
 * Orders records by a string-valued key using locale-aware comparison.
 *
 * Missing, `null`, or `undefined` keys coerce to the empty string so they
 * group together at the start (ascending) rather than throwing.
 */
export class AlphabeticalSortStrategy<T> implements SortStrategy<T> {
  readonly name = 'alphabetical'

  private readonly key: keyof T
  private readonly sign: 1 | -1
  private readonly caseInsensitive: boolean
  private readonly locale?: string | string[]

  constructor(key: keyof T, options: AlphabeticalSortOptions = {}) {
    this.key = key
    this.sign = orderSign(options.order ?? 'asc')
    this.caseInsensitive = options.caseInsensitive ?? true
    this.locale = options.locale
  }

  compare(a: T, b: T): number {
    const left = this.normalize(a[this.key])
    const right = this.normalize(b[this.key])
    return this.sign * left.localeCompare(right, this.locale, {
      sensitivity: this.caseInsensitive ? 'accent' : 'variant',
    })
  }

  private normalize(value: unknown): string {
    if (value === null || value === undefined) return ''
    return String(value)
  }
}
