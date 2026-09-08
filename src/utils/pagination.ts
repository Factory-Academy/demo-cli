/**
 * Cursor-based pagination helper for list operations
 */

export interface PaginationOptions {
  cursor?: string
  limit: number
}

export interface PaginatedResult<T> {
  items: T[]
  nextCursor?: string
  hasMore: boolean
}

/**
 * Maximum allowed page size to prevent performance issues
 */
export const MAX_PAGE_LIMIT = 1000

/**
 * Encode a numeric offset into a cursor string
 */
export function encodeCursor(offset: number): string {
  return Buffer.from(String(offset)).toString('base64')
}

/**
 * Decode a cursor string back to a numeric offset
 */
export function decodeCursor(cursor: string): number {
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8')
    const offset = parseInt(decoded, 10)
    
    // Validate offset is a valid non-negative integer
    if (isNaN(offset) || offset < 0 || !Number.isInteger(Number(decoded))) {
      throw new Error('Invalid cursor value')
    }
    
    return offset
  } catch (error) {
    throw new Error('Invalid cursor format')
  }
}

/**
 * Paginate an array of items using cursor-based pagination
 * 
 * @param items - Array of items to paginate
 * @param options - Pagination options (cursor and limit)
 * @returns Paginated result with items, nextCursor, and hasMore flag
 * @throws Error if limit is invalid (non-positive, non-integer, or exceeds MAX_PAGE_LIMIT)
 */
export function paginate<T>(
  items: T[],
  options: PaginationOptions
): PaginatedResult<T> {
  const { cursor, limit } = options

  // Validate limit is a positive integer within allowed bounds
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error('Limit must be a positive integer')
  }
  if (limit > MAX_PAGE_LIMIT) {
    throw new Error(`Limit cannot exceed ${MAX_PAGE_LIMIT}`)
  }

  // Decode cursor to get starting offset, default to 0
  const offset = cursor ? decodeCursor(cursor) : 0

  // Validate offset is within bounds
  if (offset > items.length) {
    return {
      items: [],
      hasMore: false,
    }
  }

  // Slice the items for current page
  const pageItems = items.slice(offset, offset + limit)

  // Calculate if there are more items
  const nextOffset = offset + limit
  const hasMore = nextOffset < items.length

  return {
    items: pageItems,
    nextCursor: hasMore ? encodeCursor(nextOffset) : undefined,
    hasMore,
  }
}
