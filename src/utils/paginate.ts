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
  // Validate and normalize inputs
  const normalizedPageSize = Math.max(1, Math.floor(Math.abs(pageSize)))
  const normalizedPage = Math.max(1, Math.floor(Math.abs(page)))
  
  const totalItems = items.length
  const totalPages = Math.ceil(totalItems / normalizedPageSize)
  
  // Clamp page to valid range
  const currentPage = Math.max(1, Math.min(normalizedPage, totalPages || 1))
  
  // Calculate slice boundaries (fix: use correct zero-based indexing)
  const startIndex = (currentPage - 1) * normalizedPageSize
  const endIndex = startIndex + normalizedPageSize
  
  const pageItems = items.slice(startIndex, endIndex)
  
  return {
    items: pageItems,
    page: currentPage,
    pageSize: normalizedPageSize,
    totalItems,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  }
}
