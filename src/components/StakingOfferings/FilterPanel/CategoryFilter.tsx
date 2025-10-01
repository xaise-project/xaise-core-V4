import { ChevronDown } from 'lucide-react'

interface CategoryFilterProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  className?: string
}

const categoryOptions = [
  { value: '', label: 'Tüm Kategoriler' },
  { value: 'Native Staking', label: 'Native Staking' },
  { value: 'Liquid Staking', label: 'Liquid Staking' },
  { value: 'Centralized Staking', label: 'Centralized Staking' }
]

export function CategoryFilter({ 
  selectedCategory, 
  onCategoryChange, 
  className = '' 
}: CategoryFilterProps) {
  const selectedOption = categoryOptions.find(option => option.value === selectedCategory) || categoryOptions[0]

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Kategori
      </label>
      
      <div className="relative">
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>
      
      {selectedCategory && (
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-xs text-blue-600 dark:text-blue-400">
            {selectedOption.label}
          </span>
        </div>
      )}
    </div>
  )
}