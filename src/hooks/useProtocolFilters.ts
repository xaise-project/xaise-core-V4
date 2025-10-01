import { useState, useCallback, useMemo } from 'react'
import { RiskLevel } from '../types/api.types'

export interface ProtocolFilters {
  apyRange: {
    min: number
    max: number
  }
  riskLevel: RiskLevel | '' | 'all'
  category: string
  sortBy: 'apy' | 'name' | 'min_stake' | 'tvl'
  sortOrder: 'asc' | 'desc'
  searchQuery: string
}

export interface UseProtocolFiltersReturn {
  filters: ProtocolFilters
  setAPYRange: (range: [number, number]) => void
  setRiskLevel: (riskLevel: RiskLevel | '' | 'all') => void
  setCategory: (category: string) => void
  setSorting: (sortBy: ProtocolFilters['sortBy'], sortOrder: ProtocolFilters['sortOrder']) => void
  setSearchQuery: (query: string) => void
  resetFilters: () => void
  hasActiveFilters: boolean
  getFilterParams: () => {
    minApy?: number
    maxApy?: number
    riskLevel?: RiskLevel
    category?: string
    sortBy: string
    sortOrder: string
    search?: string
  }
}

const defaultFilters: ProtocolFilters = {
  apyRange: {
    min: 0,
    max: 100
  },
  riskLevel: '',
  category: '',
  sortBy: 'apy',
  sortOrder: 'desc',
  searchQuery: ''
}

export function useProtocolFilters(): UseProtocolFiltersReturn {
  const [filters, setFilters] = useState<ProtocolFilters>(defaultFilters)

  const setAPYRange = useCallback((range: [number, number]) => {
    const [min, max] = range
    setFilters(prev => ({
      ...prev,
      apyRange: { min, max }
    }))
  }, [])

  const setRiskLevel = useCallback((riskLevel: RiskLevel | '' | 'all') => {
    setFilters(prev => ({
      ...prev,
      riskLevel
    }))
  }, [])

  const setCategory = useCallback((category: string) => {
    setFilters(prev => ({
      ...prev,
      category
    }))
  }, [])

  const setSorting = useCallback((sortBy: ProtocolFilters['sortBy'], sortOrder: ProtocolFilters['sortOrder']) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder
    }))
  }, [])

  const setSearchQuery = useCallback((searchQuery: string) => {
    setFilters(prev => ({
      ...prev,
      searchQuery
    }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [])

  const hasActiveFilters = useMemo(() => {
    return (
      filters.apyRange.min !== defaultFilters.apyRange.min ||
      filters.apyRange.max !== defaultFilters.apyRange.max ||
      filters.riskLevel !== defaultFilters.riskLevel ||
      filters.category !== defaultFilters.category ||
      filters.searchQuery !== defaultFilters.searchQuery
    )
  }, [filters])

  const getFilterParams = useCallback(() => {
    const params: ReturnType<UseProtocolFiltersReturn['getFilterParams']> = {
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder
    }

    // Only include non-default filter values
    if (filters.apyRange.min !== defaultFilters.apyRange.min) {
      params.minApy = filters.apyRange.min
    }
    
    if (filters.apyRange.max !== defaultFilters.apyRange.max) {
      params.maxApy = filters.apyRange.max
    }

    if (filters.riskLevel && filters.riskLevel !== 'all') {
      params.riskLevel = filters.riskLevel as RiskLevel
    }

    if (filters.category) {
      params.category = filters.category
    }

    if (filters.searchQuery.trim()) {
      params.search = filters.searchQuery.trim()
    }

    return params
  }, [filters])

  return {
    filters,
    setAPYRange,
    setRiskLevel,
    setCategory,
    setSorting,
    setSearchQuery,
    resetFilters,
    hasActiveFilters,
    getFilterParams
  }
}