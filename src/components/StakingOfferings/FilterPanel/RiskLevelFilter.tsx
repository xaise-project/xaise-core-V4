import { ChevronDown } from 'lucide-react'

import { RiskLevel } from '../../../types/api.types'



interface RiskLevelFilterProps {
  selectedRisk: RiskLevel | '' | 'all'
  onRiskChange: (risk: RiskLevel | '' | 'all') => void
  className?: string
}

const riskOptions: { value: RiskLevel | '' | 'all'; label: string; color: string }[] = [
  { value: 'all' as const, label: 'Tüm Risk Seviyeleri', color: 'text-gray-600' },
  { value: 'low' as const, label: 'Düşük Risk', color: 'text-green-600' },
  { value: 'medium' as const, label: 'Orta Risk', color: 'text-yellow-600' },
  { value: 'high' as const, label: 'Yüksek Risk', color: 'text-red-600' }
]

export function RiskLevelFilter({ 
  selectedRisk, 
  onRiskChange, 
  className = '' 
}: RiskLevelFilterProps) {
  const selectedOption = riskOptions.find(option => option.value === selectedRisk) || riskOptions[0]

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Risk Seviyesi
      </label>
      
      <div className="relative">
        <select
          value={selectedRisk}
          onChange={(e) => onRiskChange(e.target.value as RiskLevel)}
          className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {riskOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>
      
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${
          selectedRisk === 'low' ? 'bg-green-500' :
          selectedRisk === 'medium' ? 'bg-yellow-500' :
          selectedRisk === 'high' ? 'bg-red-500' : 'bg-gray-400'
        }`} />
        <span className={`text-xs ${selectedOption.color} dark:text-gray-400`}>
          {selectedOption.label}
        </span>
      </div>
    </div>
  )
}