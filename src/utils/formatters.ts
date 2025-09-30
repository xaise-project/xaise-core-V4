/**
 * Data Formatting Utilities
 * Provides comprehensive formatting functions for currency, numbers, dates, and other data types
 */

// Currency formatting options
export interface CurrencyFormatOptions {
  currency?: string
  locale?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  notation?: 'standard' | 'scientific' | 'engineering' | 'compact'
  compactDisplay?: 'short' | 'long'
}

// Number formatting options
export interface NumberFormatOptions {
  locale?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  useGrouping?: boolean
  notation?: 'standard' | 'scientific' | 'engineering' | 'compact'
  compactDisplay?: 'short' | 'long'
}

// Percentage formatting options
export interface PercentageFormatOptions {
  locale?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  showSign?: boolean
}

/**
 * Format currency with proper localization and abbreviation
 */
export const formatCurrency = (
  amount: number,
  options: CurrencyFormatOptions = {}
): string => {
  const {
    currency = 'USD',
    locale = 'en-US',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    notation = 'standard',
    compactDisplay = 'short'
  } = options

  try {
    // Handle edge cases
    if (!isFinite(amount) || isNaN(amount)) {
      return '$0.00'
    }

    // Use compact notation for large numbers
    const useCompact = Math.abs(amount) >= 1000000
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: useCompact ? 1 : minimumFractionDigits,
      maximumFractionDigits: useCompact ? 2 : maximumFractionDigits,
      notation: useCompact ? 'compact' : notation,
      compactDisplay
    }).format(amount)
  } catch (error) {
    console.warn('Currency formatting error:', error)
    return `$${amount.toFixed(2)}`
  }
}

/**
 * Format numbers with abbreviations (K, M, B, T)
 */
export const formatNumberWithAbbreviation = (
  num: number,
  options: NumberFormatOptions = {}
): string => {
  const {
    locale = 'en-US',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    useGrouping = true,
    notation = 'compact',
    compactDisplay = 'short'
  } = options

  try {
    // Handle edge cases
    if (!isFinite(num) || isNaN(num)) {
      return '0'
    }

    // For very small numbers, show full precision
    if (Math.abs(num) < 1000) {
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits,
        maximumFractionDigits,
        useGrouping
      }).format(num)
    }

    // Use compact notation for larger numbers
    return new Intl.NumberFormat(locale, {
      notation,
      compactDisplay,
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
      useGrouping
    }).format(num)
  } catch (error) {
    console.warn('Number formatting error:', error)
    return num.toString()
  }
}

/**
 * Format percentage with proper precision and sign
 */
export const formatPercentage = (
  value: number,
  options: PercentageFormatOptions = {}
): string => {
  const {
    locale = 'en-US',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showSign = false
  } = options

  try {
    // Handle edge cases
    if (!isFinite(value) || isNaN(value)) {
      return '0.00%'
    }

    const formatted = new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits,
      maximumFractionDigits,
      signDisplay: showSign ? 'always' : 'auto'
    }).format(value / 100)

    return formatted
  } catch (error) {
    console.warn('Percentage formatting error:', error)
    return `${value.toFixed(2)}%`
  }
}

/**
 * Format decimal numbers with controlled precision
 */
export const formatDecimal = (
  num: number,
  decimalPlaces: number = 2,
  locale: string = 'en-US'
): string => {
  try {
    // Handle edge cases
    if (!isFinite(num) || isNaN(num)) {
      return '0'.padEnd(decimalPlaces + 2, '.0')
    }

    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
      useGrouping: false
    }).format(num)
  } catch (error) {
    console.warn('Decimal formatting error:', error)
    return num.toFixed(decimalPlaces)
  }
}

/**
 * Format large numbers with custom abbreviations
 */
export const formatLargeNumber = (num: number): string => {
  const abbreviations = [
    { value: 1e12, symbol: 'T' },
    { value: 1e9, symbol: 'B' },
    { value: 1e6, symbol: 'M' },
    { value: 1e3, symbol: 'K' }
  ]

  // Handle edge cases
  if (!isFinite(num) || isNaN(num)) {
    return '0'
  }

  const absNum = Math.abs(num)
  
  for (const abbr of abbreviations) {
    if (absNum >= abbr.value) {
      const formatted = (num / abbr.value).toFixed(1)
      return `${formatted}${abbr.symbol}`
    }
  }

  return num.toString()
}

/**
 * Format time duration in human readable format
 */
export const formatDuration = (seconds: number): string => {
  if (!isFinite(seconds) || isNaN(seconds) || seconds < 0) {
    return '0s'
  }

  const units = [
    { value: 31536000, label: 'y' }, // year
    { value: 2592000, label: 'mo' }, // month
    { value: 86400, label: 'd' },    // day
    { value: 3600, label: 'h' },     // hour
    { value: 60, label: 'm' },       // minute
    { value: 1, label: 's' }         // second
  ]

  for (const unit of units) {
    if (seconds >= unit.value) {
      const value = Math.floor(seconds / unit.value)
      return `${value}${unit.label}`
    }
  }

  return '0s'
}

/**
 * Format date in relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (
  date: Date | string | number,
  locale: string = 'en-US'
): string => {
  try {
    const now = new Date()
    const targetDate = new Date(date)
    
    if (isNaN(targetDate.getTime())) {
      return 'Invalid date'
    }

    const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000)
    
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
    
    const units: Array<[string, number]> = [
      ['year', 31536000],
      ['month', 2592000],
      ['day', 86400],
      ['hour', 3600],
      ['minute', 60],
      ['second', 1]
    ]
    
    for (const [unit, secondsInUnit] of units) {
      if (Math.abs(diffInSeconds) >= secondsInUnit) {
        const value = Math.floor(diffInSeconds / secondsInUnit)
        return rtf.format(-value, unit as Intl.RelativeTimeFormatUnit)
      }
    }
    
    return rtf.format(0, 'second')
  } catch (error) {
    console.warn('Relative time formatting error:', error)
    return 'Unknown'
  }
}

/**
 * Format file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (!isFinite(bytes) || isNaN(bytes) || bytes < 0) {
    return '0 B'
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

/**
 * Truncate text with ellipsis
 */
export const truncateText = (
  text: string,
  maxLength: number,
  ellipsis: string = '...'
): string => {
  if (!text || text.length <= maxLength) {
    return text
  }

  return text.slice(0, maxLength - ellipsis.length) + ellipsis
}

/**
 * Format address (crypto wallet, etc.) with truncation
 */
export const formatAddress = (
  address: string,
  startChars: number = 6,
  endChars: number = 4
): string => {
  if (!address || address.length <= startChars + endChars) {
    return address
  }

  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

/**
 * Format hash (transaction hash, etc.) with truncation
 */
export const formatHash = (hash: string, length: number = 8): string => {
  if (!hash) return ''
  if (hash.length <= length) return hash
  
  return `${hash.slice(0, length)}...`
}

/**
 * Format number with ordinal suffix (1st, 2nd, 3rd, etc.)
 */
export const formatOrdinal = (num: number, locale: string = 'en-US'): string => {
  try {
    return new Intl.PluralRules(locale, { type: 'ordinal' }).select(num)
  } catch (error) {
    // Fallback for English
    const suffixes = ['th', 'st', 'nd', 'rd']
    const remainder = num % 100
    const suffix = suffixes[(remainder - 20) % 10] || suffixes[remainder] || suffixes[0]
    return `${num}${suffix}`
  }
}

/**
 * Utility function to safely parse numbers
 */
export const safeParseNumber = (value: any): number => {
  if (typeof value === 'number') {
    return isFinite(value) ? value : 0
  }
  
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[^\d.-]/g, ''))
    return isFinite(parsed) ? parsed : 0
  }
  
  return 0
}

/**
 * Format number range (e.g., "1-10", "5+")
 */
export const formatNumberRange = (
  min: number,
  max?: number,
  options: NumberFormatOptions = {}
): string => {
  const formatNum = (num: number) => formatNumberWithAbbreviation(num, options)
  
  if (max === undefined || min === max) {
    return formatNum(min)
  }
  
  if (max === Infinity) {
    return `${formatNum(min)}+`
  }
  
  return `${formatNum(min)}-${formatNum(max)}`
}