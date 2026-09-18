import { Clock, systemClock } from './clock'
import { NotFoundError } from './errors'
import { Store } from './store'
import { CreateItemInput, Item, ItemFilter } from './types'
import { requireNonEmptyString } from './validation'

export const ITEM_RESOURCE = 'Item'

// Pure business logic for items. No Commander, no console, no process.exit.
//
// State lives in a private Store; time comes from an injected Clock. Everything
// here is deterministic and directly unit-testable. The CLI adapter
// (commands/item.ts) is responsible for turning options into these calls and
// for rendering / exiting.
export class ItemService {
  private readonly store = new Store<Item>()

  constructor(private readonly clock: Clock = systemClock) {}

  create(input: CreateItemInput): Item {
    // Commander enforces that `--name` is present, but it happily accepts an
    // empty or whitespace-only value. `requireNonEmptyString` rejects that
    // while preserving the exact untrimmed name for valid input.
    const name = requireNonEmptyString(input.name, 'Item name')

    return this.store.add({
      id: this.store.nextId(),
      name,
      description: input.description,
      status: 'active',
      createdAt: this.clock.now().toISOString(),
    })
  }

  list(filter: ItemFilter = {}): Item[] {
    if (filter.status) {
      return this.store.filter((item) => item.status === filter.status)
    }
    return this.store.all()
  }

  get(id: string): Item {
    // A blank id can never match a stored record; treat it as bad input rather
    // than reporting a confusing "Item  not found".
    const lookupId = requireNonEmptyString(id, 'Item id')
    const item = this.store.findById(lookupId)
    if (!item) {
      throw new NotFoundError(ITEM_RESOURCE, lookupId)
    }
    return item
  }

  get size(): number {
    return this.store.size
  }
}
