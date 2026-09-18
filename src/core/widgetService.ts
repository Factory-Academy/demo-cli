import { Clock, systemClock } from './clock'
import { NotFoundError } from './errors'
import { Store } from './store'
import { CreateWidgetInput, Widget, WidgetFilter } from './types'
import { assertNonNegativeInteger, requireNonEmptyString } from './validation'

export const WIDGET_RESOURCE = 'Widget'

// Pure business logic for widgets. Mirrors ItemService: an injected Clock, a
// private Store, and no I/O. `priority` arrives already parsed as a number so
// the core never deals with raw CLI strings.
export class WidgetService {
  private readonly store = new Store<Widget>()

  constructor(private readonly clock: Clock = systemClock) {}

  create(input: CreateWidgetInput): Widget {
    const name = requireNonEmptyString(input.name, 'Widget name')
    const itemId = requireNonEmptyString(input.itemId, 'Widget itemId')

    // The legacy adapter did `parseInt(opts.priority, 10)`, which stored NaN
    // for garbage like `--priority abc` and silently truncated floats. Priority
    // is a rank, so require a finite, non-negative integer; the default is 0.
    const priority = assertNonNegativeInteger(input.priority ?? 0, 'Widget priority')

    return this.store.add({
      id: this.store.nextId(),
      name,
      itemId,
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
    const lookupId = requireNonEmptyString(id, 'Widget id')
    const widget = this.store.findById(lookupId)
    if (!widget) {
      throw new NotFoundError(WIDGET_RESOURCE, lookupId)
    }
    return widget
  }

  get size(): number {
    return this.store.size
  }
}
