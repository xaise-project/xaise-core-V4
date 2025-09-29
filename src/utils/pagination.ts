// Pagination Utilities
// Day 4 - High Priority Task: Pagination Preparation

import { useState, useCallback, useMemo } from 'react'

export interface PaginationParams {
  page: number
  limit: number
  offset?: number
}

export interface PaginationMeta {
  currentPage: number
  totalPages: number
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  limit: number
}

export interface PaginatedResult<T> {
  data: T[]
  meta: PaginationMeta
}

export interface PaginationOptions {
  defaultLimit?: number
  maxLimit?: number
}

/**
 * Calculate pagination parameters
 */
export function calculatePagination(
  page: number = 1,
  limit: number = 10,
  options: PaginationOptions = {}
): PaginationParams {
  const { defaultLimit = 10, maxLimit = 100 } = options
  
  // Validate and normalize inputs
  const normalizedPage = Math.max(1, Math.floor(page))
  const normalizedLimit = Math.min(
    Math.max(1, Math.floor(limit || defaultLimit)),
    maxLimit
  )
  
  const offset = (normalizedPage - 1) * normalizedLimit
  
  return {
    page: normalizedPage,
    limit: normalizedLimit,
    offset
  }
}

/**
 * Create pagination metadata
 */
export function createPaginationMeta(
  totalCount: number,
  currentPage: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(totalCount / limit)
  
  return {
    currentPage,
    totalPages,
    totalCount,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    limit
  }
}

/**
 * Create paginated result
 */
export function createPaginatedResult<T>(
  data: T[],
  totalCount: number,
  currentPage: number,
  limit: number
): PaginatedResult<T> {
  return {
    data,
    meta: createPaginationMeta(totalCount, currentPage, limit)
  }
}

/**
 * Generate Supabase range for pagination
 */
export function getSupabaseRange(page: number, limit: number): { from: number; to: number } {
  const { offset } = calculatePagination(page, limit)
  const safeOffset = offset || 0
  return {
    from: safeOffset,
    to: safeOffset + limit - 1
  }
}

/**
 * Parse pagination from URL search params
 */
export function parsePaginationFromURL(searchParams: URLSearchParams): PaginationParams {
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '10', 10)
  
  return calculatePagination(page, limit)
}

/**
 * Generate pagination URLs
 */
export function generatePaginationURLs(
  baseURL: string,
  meta: PaginationMeta,
  additionalParams: Record<string, string> = {}
): {
  first: string
  previous: string | null
  next: string | null
  last: string
} {
  const createURL = (page: number) => {
    const url = new URL(baseURL)
    url.searchParams.set('page', page.toString())
    url.searchParams.set('limit', meta.limit.toString())
    
    Object.entries(additionalParams).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
    
    return url.toString()
  }
  
  return {
    first: createURL(1),
    previous: meta.hasPreviousPage ? createURL(meta.currentPage - 1) : null,
    next: meta.hasNextPage ? createURL(meta.currentPage + 1) : null,
    last: createURL(meta.totalPages)
  }
}

/**
 * Pagination hook utilities
 */
export interface UsePaginationOptions {
  initialPage?: number
  initialLimit?: number
  maxLimit?: number
}

export interface UsePaginationResult {
  page: number
  limit: number
  offset: number
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  nextPage: () => void
  previousPage: () => void
  reset: () => void
}

/**
 * React hook for pagination state management
 */
export function usePagination(options: UsePaginationOptions = {}): UsePaginationResult {
  const { initialPage = 1, initialLimit = 10, maxLimit = 100 } = options
  
  const [page, setPageState] = useState(initialPage)
  const [limit, setLimitState] = useState(initialLimit)
  
  const setPage = useCallback((newPage: number) => {
    setPageState(Math.max(1, Math.floor(newPage)))
  }, [])
  
  const setLimit = useCallback((newLimit: number) => {
    const normalizedLimit = Math.min(Math.max(1, Math.floor(newLimit)), maxLimit)
    setLimitState(normalizedLimit)
    setPageState(1) // Reset to first page when limit changes
  }, [maxLimit])
  
  const nextPage = useCallback(() => {
    setPageState(prev => prev + 1)
  }, [])
  
  const previousPage = useCallback(() => {
    setPageState(prev => Math.max(1, prev - 1))
  }, [])
  
  const reset = useCallback(() => {
    setPageState(initialPage)
    setLimitState(initialLimit)
  }, [initialPage, initialLimit])
  
  const offset = useMemo(() => {
    return (page - 1) * limit
  }, [page, limit])
  
  return {
    page,
    limit,
    offset,
    setPage,
    setLimit,
    nextPage,
    previousPage,
    reset
  }
}

/**
 * Default pagination configurations
 */
export const PAGINATION_DEFAULTS = {
  PROTOCOLS: { limit: 12, maxLimit: 50 },
  COMMENTS: { limit: 10, maxLimit: 100 },
  STAKES: { limit: 20, maxLimit: 100 },
  FAVORITES: { limit: 15, maxLimit: 50 },
  SEARCH: { limit: 20, maxLimit: 100 }
} as const