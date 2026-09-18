import { Clock, systemClock } from './clock'
import { NotFoundError, ValidationError } from './errors'
import { Store } from './store'
import { CreateWidgetInput, Widget, WidgetFilter } from './types'

export const WIDGET_RESOURCE = 'Widget'

// Pure business logic for widgets. Mirrors ItemService: an injected Clock, a
// private Store, and no I/O. `priority` arrives already parsed as a number so
// the core never deals with raw CLI strings.
export class WidgetService {
  private readonly store = new Store<Widget>()

  constructor(private readonly clock: Clock = systemClock) {}

  create(input: CreateWidgetInput): Widget {
    if (!input.name || input.name.trim() === '') {
      throw new ValidationError('Widget name is required')
    }
    if (!input.itemId || input.itemId.trim() === '') {
      throw new ValidationError('Widget itemId is required')
    }

    // The legacy adapter did `parseInt(opts.priority, 10)` and silently stored
    // NaN for garbage like `--priority abc`. Guard against that here.
    const priority = input.priority ?? 0
    if (!Number.isFinite(priority)) {
      throw new ValidationError('Widget priority must be a finite number')
    }

    return this.store.add({
      id: this.store.nextId(),
      name: input.name,
      itemId: input.itemId,
      priority,
      createdAt: this.clock.now().toISOString(),
    })
  }

  list(filter: WidgetFilter = {}): Widget[] {
    if (filter.itemId) {
      return this.store.filter((widget) => widget.itemId === filter.itemId)
    }
    return this.store.all()
  }

  get(id: string): Widget {
    const widget = this.store.findById(id)
    if (!widget) {
      throw new NotFoundError(WIDGET_RESOURCE, id)
    }
    return widget
  }

  get size(): number {
    return this.store.size
  }
}
