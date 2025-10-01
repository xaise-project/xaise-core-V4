import React from 'react'
import { Filter, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import { APYRangeFilter } from './APYRangeFilter'
import { RiskLevelFilter } from './RiskLevelFilter'
import { CategoryFilter } from './CategoryFilter'
import { SortDropdown } from './SortDropdown'
import { SearchInput } from './SearchInput'
import { useProtocolFilters } from '../../../hooks/useProtocolFilters'

interface FilterPanelProps {
  className?: string
  onFiltersChange?: (filters: ReturnType<ReturnType<typeof useProtocolFilters>['getFilterParams']>) => void
}

export function FilterPanel({ className = '', onFiltersChange }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  
  const {
    filters,
    setAPYRange,
    setRiskLevel,
    setCategory,
    setSorting,
    setSearchQuery,
    resetFilters,
    hasActiveFilters,
    getFilterParams
  } = useProtocolFilters()

  // Notify parent component when filters change
  React.useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(getFilterParams())
    }
  }, [filters, onFiltersChange, getFilterParams])

  const togglePanel = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Filter Toggle Button */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          id="filter-icon"
          onClick={togglePanel}
          className="flex items-center justify-between w-full text-left hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
        >
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Filter className={`h-5 w-5 ${hasActiveFilters ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-blue-600 rounded-full"></span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Filtreler ve Sıralama
            </h3>
            {hasActiveFilters && (
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                Aktif
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  resetFilters()
                }}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Sıfırla</span>
              </button>
            )}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            )}
          </div>
        </button>
      </div>

      {/* Expandable Filter Content */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Search */}
          <SearchInput
            value={filters.searchQuery}
            onChange={setSearchQuery}
            placeholder="Protokol adı ile ara..."
          />

          {/* Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* APY Range Filter */}
            <APYRangeFilter
              minAPY={filters.apyRange.min}
              maxAPY={filters.apyRange.max}
              onRangeChange={setAPYRange}
            />

            {/* Risk Level Filter */}
            <RiskLevelFilter
              selectedRisk={filters.riskLevel}
              onRiskChange={setRiskLevel}
            />

            {/* Category Filter */}
            <CategoryFilter
              selectedCategory={filters.category}
              onCategoryChange={setCategory}
            />
          </div>

          {/* Sort Dropdown */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <SortDropdown
              sortBy={filters.sortBy}
              sortOrder={filters.sortOrder}
              onSortChange={setSorting}
            />
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Aktif filtreler:</span>
                
                {filters.searchQuery && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    Arama: {filters.searchQuery}
                  </span>
                )}
                
                {(filters.apyRange.min !== 0 || filters.apyRange.max !== 100) && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    APY: {filters.apyRange.min}% - {filters.apyRange.max}%
                  </span>
                )}
                
                {filters.riskLevel && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                    Risk: {filters.riskLevel}
                  </span>
                )}
                
                {filters.category && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                    Kategori: {filters.category}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}