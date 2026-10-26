import { SortOrder, SortStrategy } from './sortStrategy'
import { AlphabeticalSortStrategy, AlphabeticalSortOptions } from './alphabeticalSortStrategy'
import { NumericSortStrategy, NumericSortOptions } from './numericSortStrategy'

export type SortStrategyKind = 'alphabetical' | 'numeric'

export const SORT_STRATEGY_KINDS: readonly SortStrategyKind[] = ['alphabetical', 'numeric']

export interface SortStrategySpec<T> {
  kind: SortStrategyKind
  key: keyof T
  order?: SortOrder
  /** Extra per-kind tuning; ignored by kinds that do not use it. */
  options?: AlphabeticalSortOptions & NumericSortOptions
}

/**
 * Builds a concrete {@link SortStrategy} from a declarative spec. Keeping
 * construction here means command handlers depend only on the interface and
 * never on individual strategy classes, so adding a kind touches one place.
 */
export function createSortStrategy<T>(spec: SortStrategySpec<T>): SortStrategy<T> {
  const { kind, key, order, options } = spec
  switch (kind) {
    case 'alphabetical':
      return new AlphabeticalSortStrategy<T>(key, { ...options, order })
    case 'numeric':
      return new NumericSortStrategy<T>(key, { ...options, order })
    default:
      return assertNever(kind)
  }
}

export function isSortStrategyKind(value: string): value is SortStrategyKind {
  return (SORT_STRATEGY_KINDS as readonly string[]).includes(value)
}

/** Compile-time guarantee that the switch above is exhaustive. */
function assertNever(value: never): never {
  throw new Error(`Unsupported sort strategy kind: ${String(value)}`)
}
