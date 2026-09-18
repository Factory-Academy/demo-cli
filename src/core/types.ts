// Domain types for the CLI's in-memory resources.
//
// These describe *data only*. They carry no behavior, no I/O, and no
// dependency on Commander, so both the pure core and the CLI adapters can
// share them without pulling in the command-line machinery.

export interface Item {
  id: string
  name: string
  description?: string
  status: string
  createdAt: string
}

export interface CreateItemInput {
  name: string
  description?: string
}

export interface ItemFilter {
  status?: string
}

export interface Widget {
  id: string
  name: string
  itemId: string
  priority: number
  createdAt: string
}

export interface CreateWidgetInput {
  name: string
  itemId: string
  priority?: number
}

export interface WidgetFilter {
  itemId?: string
}
