import React, { useState, useCallback } from 'react'

interface APYRangeFilterProps {
  minAPY: number
  maxAPY: number
  onRangeChange: (range: [number, number]) => void
  className?: string
}

export function APYRangeFilter({ 
  minAPY, 
  maxAPY, 
  onRangeChange, 
  className = '' 
}: APYRangeFilterProps) {
  const [range, setRange] = useState<[number, number]>([minAPY || 0, maxAPY || 50])

  const handleMinChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = parseFloat(e.target.value)
    const newRange: [number, number] = [newMin, range[1]]
    setRange(newRange)
    onRangeChange(newRange)
  }, [range, onRangeChange])

  const handleMaxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = parseFloat(e.target.value)
    const newRange: [number, number] = [range[0], newMax]
    setRange(newRange)
    onRangeChange(newRange)
  }, [range, onRangeChange])

  const formatAPY = (value: number) => `${value.toFixed(1)}%`

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          APY Aralığı
        </label>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatAPY(range[0])} - {formatAPY(range[1])}
        </span>
      </div>
      
      <div className="px-2 space-y-2">
        <div className="relative">
          <input
            type="range"
            min={0}
            max={50}
            step={0.1}
            value={range[0]}
            onChange={handleMinChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider-thumb"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(range[0] / 50) * 100}%, #e5e7eb ${(range[0] / 50) * 100}%, #e5e7eb 100%)`
            }}
          />
          <input
            type="range"
            min={0}
            max={50}
            step={0.1}
            value={range[1]}
            onChange={handleMaxChange}
            className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer absolute top-0 slider-thumb"
            style={{
              background: `linear-gradient(to right, transparent 0%, transparent ${(range[0] / 50) * 100}%, #3b82f6 ${(range[0] / 50) * 100}%, #3b82f6 ${(range[1] / 50) * 100}%, transparent ${(range[1] / 50) * 100}%, transparent 100%)`
            }}
          />
        </div>
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>0%</span>
        <span>50%</span>
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          .slider-thumb::-webkit-slider-thumb {
            appearance: none;
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
          
          .slider-thumb::-moz-range-thumb {
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
        `
      }} />
    </div>
  )
}