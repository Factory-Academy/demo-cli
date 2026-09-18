import { Clock, systemClock } from './clock'
import { NotFoundError, ValidationError } from './errors'
import { Store } from './store'
import { CreateItemInput, Item, ItemFilter } from './types'

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
    // empty or whitespace-only value. Reject that here so the core never
    // stores a nameless item. The original untrimmed value is preserved for
    // valid names to keep existing behavior intact.
    if (!input.name || input.name.trim() === '') {
      throw new ValidationError('Item name is required')
    }

    return this.store.add({
      id: this.store.nextId(),
      name: input.name,
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
    const item = this.store.findById(id)
    if (!item) {
      throw new NotFoundError(ITEM_RESOURCE, id)
    }
    return item
  }

  get size(): number {
    return this.store.size
  }
}
