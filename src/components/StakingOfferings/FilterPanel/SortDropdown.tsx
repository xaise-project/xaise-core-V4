import { ArrowUpDown, ChevronDown } from 'lucide-react'

type SortOption = 'apy' | 'name' | 'min_stake' | 'tvl'
type SortOrder = 'asc' | 'desc'

interface SortDropdownProps {
  sortBy: SortOption
  sortOrder: SortOrder
  onSortChange: (sortBy: SortOption, sortOrder: SortOrder) => void
  className?: string
}

const sortOptions = [
  { value: 'apy' as const, label: 'APY', icon: '📈' },
  { value: 'name' as const, label: 'İsim', icon: '🔤' },
  { value: 'min_stake' as const, label: 'Min. Stake', icon: '💰' },
  { value: 'tvl' as const, label: 'TVL', icon: '📊' }
]

export function SortDropdown({ 
  sortBy, 
  sortOrder, 
  onSortChange, 
  className = '' 
}: SortDropdownProps) {
  const selectedOption = sortOptions.find(option => option.value === sortBy) || sortOptions[0]

  const handleSortByChange = (newSortBy: SortOption) => {
    onSortChange(newSortBy, sortOrder)
  }

  const toggleSortOrder = () => {
    onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Sıralama
      </label>
      
      <div className="flex space-x-2">
        {/* Sort By Dropdown */}
        <div className="relative flex-1">
          <select
            value={sortBy}
            onChange={(e) => handleSortByChange(e.target.value as SortOption)}
            className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.icon} {option.label}
              </option>
            ))}
          </select>
          
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Sort Order Toggle */}
        <button
          onClick={toggleSortOrder}
          className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          title={sortOrder === 'asc' ? 'Artan sıralama' : 'Azalan sıralama'}
        >
          <ArrowUpDown 
            className={`h-4 w-4 text-gray-600 dark:text-gray-400 transition-transform ${
              sortOrder === 'desc' ? 'rotate-180' : ''
            }`} 
          />
        </button>
      </div>
      
      <div className="flex items-center space-x-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {selectedOption.icon} {selectedOption.label} - {sortOrder === 'asc' ? 'Artan' : 'Azalan'}
        </span>
      </div>
    </div>
  )
}