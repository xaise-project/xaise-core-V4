/**
 * Data transformation utilities for protocol data
 * Handles APY, TVL, risk level formatting and data processing
 */

import type { Database } from '../types/Database.types'

type Protocol = Database['public']['Tables']['protocols']['Row']

// Risk level mapping and formatting
export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const

export type RiskLevel = typeof RISK_LEVELS[keyof typeof RISK_LEVELS]

// Risk level display configuration
export const RISK_LEVEL_CONFIG = {
  [RISK_LEVELS.LOW]: {
    label: 'Düşük Risk',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
  },
  [RISK_LEVELS.MEDIUM]: {
    label: 'Orta Risk',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200',
  },
  [RISK_LEVELS.HIGH]: {
    label: 'Yüksek Risk',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
  },
} as const

/**
 * Format APY value with proper percentage display
 */
export function formatAPY(apy: number | null | undefined): string {
  if (apy === null || apy === undefined || isNaN(apy)) {
    return 'N/A'
  }
  
  // Handle very small values
  if (apy < 0.01) {
    return '<0.01%'
  }
  
  // Handle very large values
  if (apy > 1000) {
    return '>1000%'
  }
  
  return `${apy.toFixed(2)}%`
}

/**
 * Format APY with color coding based on value ranges
 */
export function formatAPYWithColor(apy: number | null | undefined): {
  formatted: string
  colorClass: string
  bgColorClass: string
} {
  const formatted = formatAPY(apy)
  
  if (apy === null || apy === undefined || isNaN(apy)) {
    return {
      formatted,
      colorClass: 'text-gray-500',
      bgColorClass: 'bg-gray-100',
    }
  }
  
  // Color coding based on APY ranges
  if (apy >= 20) {
    return {
      formatted,
      colorClass: 'text-green-600',
      bgColorClass: 'bg-green-100',
    }
  } else if (apy >= 10) {
    return {
      formatted,
      colorClass: 'text-blue-600',
      bgColorClass: 'bg-blue-100',
    }
  } else if (apy >= 5) {
    return {
      formatted,
      colorClass: 'text-yellow-600',
      bgColorClass: 'bg-yellow-100',
    }
  } else {
    return {
      formatted,
      colorClass: 'text-red-600',
      bgColorClass: 'bg-red-100',
    }
  }
}

/**
 * Format TVL (Total Value Locked) with appropriate units
 */
export function formatTVL(tvl: number | null | undefined): string {
  if (tvl === null || tvl === undefined || isNaN(tvl)) {
    return 'N/A'
  }
  
  if (tvl === 0) {
    return '$0'
  }
  
  // Format with appropriate units
  if (tvl >= 1e9) {
    return `$${(tvl / 1e9).toFixed(2)}B`
  } else if (tvl >= 1e6) {
    return `$${(tvl / 1e6).toFixed(2)}M`
  } else if (tvl >= 1e3) {
    return `$${(tvl / 1e3).toFixed(2)}K`
  } else {
    return `$${tvl.toFixed(2)}`
  }
}

/**
 * Format currency with proper locale and precision
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: string = 'USD',
  locale: string = 'tr-TR'
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'N/A'
  }
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch (error) {
    // Fallback formatting
    return `$${amount.toFixed(2)}`
  }
}

/**
 * Format risk level with proper display configuration
 */
export function formatRiskLevel(riskLevel: string | null | undefined) {
  if (!riskLevel) {
    return {
      label: 'Bilinmiyor',
      color: 'gray',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      borderColor: 'border-gray-200',
    }
  }
  
  const normalizedRisk = riskLevel.toLowerCase() as RiskLevel
  return RISK_LEVEL_CONFIG[normalizedRisk] || RISK_LEVEL_CONFIG[RISK_LEVELS.MEDIUM]
}

/**
 * Format number with abbreviations (K, M, B)
 */
export function formatNumberAbbreviation(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) {
    return 'N/A'
  }
  
  if (num === 0) {
    return '0'
  }
  
  const absNum = Math.abs(num)
  const sign = num < 0 ? '-' : ''
  
  if (absNum >= 1e9) {
    return `${sign}${(absNum / 1e9).toFixed(1)}B`
  } else if (absNum >= 1e6) {
    return `${sign}${(absNum / 1e6).toFixed(1)}M`
  } else if (absNum >= 1e3) {
    return `${sign}${(absNum / 1e3).toFixed(1)}K`
  } else {
    return `${sign}${absNum.toFixed(0)}`
  }
}

/**
 * Transform protocol data for display
 */
export function transformProtocolData(protocol: Protocol) {
  return {
    ...protocol,
    formattedAPY: formatAPY(protocol.apy),
    apyWithColor: formatAPYWithColor(protocol.apy),
    formattedTVL: formatTVL(protocol.tvl),
    formattedMinStake: formatCurrency(protocol.min_stake),
    riskLevelConfig: formatRiskLevel(protocol.risk_level),
    formattedCreatedAt: protocol.created_at ? new Date(protocol.created_at).toLocaleDateString('tr-TR') : 'N/A',
  }
}

/**
 * Transform multiple protocols for display
 */
export function transformProtocolsData(protocols: Protocol[]) {
  return protocols.map(transformProtocolData)
}

/**
 * Calculate protocol statistics
 */
export function calculateProtocolStats(protocols: Protocol[]) {
  if (!protocols.length) {
    return {
      totalProtocols: 0,
      averageAPY: 0,
      totalTVL: 0,
      highestAPY: 0,
      lowestAPY: 0,
      riskDistribution: {
        low: 0,
        medium: 0,
        high: 0,
      },
    }
  }
  
  const validAPYs = protocols.filter(p => p.apy !== null && !isNaN(p.apy!)).map(p => p.apy!)
  const validTVLs = protocols.filter(p => p.tvl !== null && !isNaN(p.tvl!)).map(p => p.tvl!)
  
  const riskDistribution = protocols.reduce(
    (acc, protocol) => {
      const risk = protocol.risk_level?.toLowerCase() as RiskLevel
      if (risk && acc[risk] !== undefined) {
        acc[risk]++
      }
      return acc
    },
    { low: 0, medium: 0, high: 0 }
  )
  
  return {
    totalProtocols: protocols.length,
    averageAPY: validAPYs.length ? validAPYs.reduce((sum, apy) => sum + apy, 0) / validAPYs.length : 0,
    totalTVL: validTVLs.reduce((sum, tvl) => sum + tvl, 0),
    highestAPY: validAPYs.length ? Math.max(...validAPYs) : 0,
    lowestAPY: validAPYs.length ? Math.min(...validAPYs) : 0,
    riskDistribution,
  }
}

/**
 * Sort protocols by different criteria
 */
export function sortProtocols(
  protocols: Protocol[],
  sortBy: 'apy' | 'tvl' | 'name' | 'created_at' = 'apy',
  sortOrder: 'asc' | 'desc' = 'desc'
) {
  return [...protocols].sort((a, b) => {
    let aValue: any
    let bValue: any
    
    switch (sortBy) {
      case 'apy':
        aValue = a.apy ?? 0
        bValue = b.apy ?? 0
        break
      case 'tvl':
        aValue = a.tvl ?? 0
        bValue = b.tvl ?? 0
        break
      case 'name':
        aValue = a.name?.toLowerCase() ?? ''
        bValue = b.name?.toLowerCase() ?? ''
        break
      case 'created_at':
        aValue = new Date(a.created_at ?? 0).getTime()
        bValue = new Date(b.created_at ?? 0).getTime()
        break
      default:
        return 0
    }
    
    if (aValue < bValue) {
      return sortOrder === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortOrder === 'asc' ? 1 : -1
    }
    return 0
  })
}

/**
 * Filter protocols by various criteria
 */
export function filterProtocols(
  protocols: Protocol[],
  filters: {
    searchTerm?: string
    category?: string
    minAPY?: number
    maxAPY?: number
    riskLevel?: RiskLevel
    minTVL?: number
  }
) {
  return protocols.filter(protocol => {
    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      const matchesName = protocol.name?.toLowerCase().includes(searchLower)
      const matchesDescription = protocol.description?.toLowerCase().includes(searchLower)
      if (!matchesName && !matchesDescription) {
        return false
      }
    }
    
    // Note: Category filter removed as Protocol type doesn't have category field
    // If category filtering is needed, it should be handled at the service level
    
    // APY range filter
    if (filters.minAPY !== undefined && (protocol.apy === null || protocol.apy < filters.minAPY)) {
      return false
    }
    if (filters.maxAPY !== undefined && (protocol.apy === null || protocol.apy > filters.maxAPY)) {
      return false
    }
    
    // Risk level filter
    if (filters.riskLevel && protocol.risk_level?.toLowerCase() !== filters.riskLevel) {
      return false
    }
    
    // TVL filter
    if (filters.minTVL !== undefined && (protocol.tvl === null || protocol.tvl < filters.minTVL)) {
      return false
    }
    
    return true
  })
}