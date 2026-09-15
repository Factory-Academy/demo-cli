export interface PaginationResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number
): PaginationResult<T> {
  const totalItems = items.length
  const totalPages = Math.ceil(totalItems / pageSize)
  
  // Clamp page to valid range
  const currentPage = Math.max(1, Math.min(page, totalPages || 1))
  
  // Calculate slice boundaries (fix: use correct zero-based indexing)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  
  const pageItems = items.slice(startIndex, endIndex)
  
  return {
    items: pageItems,
    page: currentPage,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  }
}
