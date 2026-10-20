export interface CursorPaginationOptions {
  cursor?: string
  limit?: number
}

export interface CursorPaginationResult<T> {
  items: T[]
  nextCursor?: string
}

export function paginateByCursor<T extends { id: string }>(
  items: T[],
  options: CursorPaginationOptions = {}
): CursorPaginationResult<T> {
  const startIndex = getStartIndex(items, options.cursor)
  if (startIndex === -1) {
    return { items: [] }
  }

  const limit = getLimit(items.length, options.limit)
  const paginatedItems = items.slice(startIndex, startIndex + limit)
  const hasMore = startIndex + limit < items.length

  return {
    items: paginatedItems,
    nextCursor: hasMore ? paginatedItems[paginatedItems.length - 1]?.id : undefined,
  }
}

function getStartIndex<T extends { id: string }>(items: T[], cursor?: string): number {
  if (!cursor) {
    return 0
  }

  const cursorIndex = items.findIndex(item => item.id === cursor)
  if (cursorIndex === -1) {
    return -1
  }

  return cursorIndex + 1
}

function getLimit(totalItems: number, requestedLimit?: number): number {
  if (
    requestedLimit === undefined ||
    !Number.isInteger(requestedLimit) ||
    requestedLimit < 1
  ) {
    return totalItems
  }

  return requestedLimit
}
