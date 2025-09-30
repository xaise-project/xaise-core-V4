/**
 * APY (Annual Percentage Yield) calculation utilities
 * Handles dynamic APY calculations, compound interest, and yield projections
 */

import type { Database } from '../types/Database.types'

type Protocol = Database['public']['Tables']['protocols']['Row']

// APY calculation types
export interface APYCalculationParams {
  principal: number // Initial investment amount
  apy: number // Annual Percentage Yield
  compoundingFrequency: number // Times compounded per year (daily=365, monthly=12, etc.)
  timeInYears: number // Investment duration in years
}

export interface APYProjection {
  timeInYears: number
  principal: number
  finalAmount: number
  totalInterest: number
  effectiveAPY: number
}

export interface DynamicAPYParams {
  baseAPY: number
  tvlMultiplier?: number // TVL impact on APY
  demandMultiplier?: number // Demand impact on APY
  riskMultiplier?: number // Risk level impact on APY
  marketConditions?: 'bull' | 'bear' | 'neutral'
}

/**
 * Calculate compound interest with APY
 */
export function calculateCompoundInterest(params: APYCalculationParams): number {
  const { principal, apy, compoundingFrequency, timeInYears } = params
  
  if (principal <= 0 || apy < 0 || compoundingFrequency <= 0 || timeInYears < 0) {
    return principal
  }
  
  // Convert APY percentage to decimal
  const rate = apy / 100
  
  // Compound interest formula: A = P(1 + r/n)^(nt)
  const finalAmount = principal * Math.pow(
    1 + rate / compoundingFrequency,
    compoundingFrequency * timeInYears
  )
  
  return finalAmount
}

/**
 * Calculate simple interest (for comparison)
 */
export function calculateSimpleInterest(
  principal: number,
  apy: number,
  timeInYears: number
): number {
  if (principal <= 0 || apy < 0 || timeInYears < 0) {
    return principal
  }
  
  const rate = apy / 100
  return principal * (1 + rate * timeInYears)
}

/**
 * Generate APY projections for different time periods
 */
export function generateAPYProjections(
  principal: number,
  apy: number,
  compoundingFrequency: number = 365 // Daily compounding by default
): APYProjection[] {
  const timePeriods = [0.25, 0.5, 1, 2, 3, 5, 10] // Years
  
  return timePeriods.map(timeInYears => {
    const finalAmount = calculateCompoundInterest({
      principal,
      apy,
      compoundingFrequency,
      timeInYears,
    })
    
    const totalInterest = finalAmount - principal
    const effectiveAPY = timeInYears > 0 
      ? ((finalAmount / principal) ** (1 / timeInYears) - 1) * 100
      : apy
    
    return {
      timeInYears,
      principal,
      finalAmount,
      totalInterest,
      effectiveAPY,
    }
  })
}

/**
 * Calculate dynamic APY based on various factors
 */
export function calculateDynamicAPY(params: DynamicAPYParams): number {
  const {
    baseAPY,
    tvlMultiplier = 1,
    demandMultiplier = 1,
    riskMultiplier = 1,
    marketConditions = 'neutral',
  } = params
  
  let adjustedAPY = baseAPY
  
  // Apply TVL multiplier (higher TVL might reduce APY due to dilution)
  adjustedAPY *= tvlMultiplier
  
  // Apply demand multiplier (higher demand might increase APY)
  adjustedAPY *= demandMultiplier
  
  // Apply risk multiplier (higher risk typically means higher APY)
  adjustedAPY *= riskMultiplier
  
  // Apply market conditions
  switch (marketConditions) {
    case 'bull':
      adjustedAPY *= 1.2 // 20% boost in bull market
      break
    case 'bear':
      adjustedAPY *= 0.8 // 20% reduction in bear market
      break
    case 'neutral':
    default:
      // No adjustment
      break
  }
  
  // Ensure APY doesn't go negative
  return Math.max(0, adjustedAPY)
}

/**
 * Calculate APY based on protocol's TVL and other metrics
 */
export function calculateProtocolAPY(protocol: Protocol): number {
  if (!protocol.apy) {
    return 0
  }
  
  const baseAPY = protocol.apy
  
  // TVL impact (higher TVL might reduce APY)
  const tvlMultiplier = protocol.tvl && protocol.tvl > 0
    ? Math.max(0.5, 1 - (protocol.tvl / 1000000000) * 0.1) // Reduce APY as TVL increases
    : 1
  
  // Risk level impact
  const riskMultiplier = (() => {
    switch (protocol.risk_level?.toLowerCase()) {
      case 'low':
        return 0.8 // Lower risk, lower APY
      case 'high':
        return 1.3 // Higher risk, higher APY
      case 'medium':
      default:
        return 1.0 // Neutral
    }
  })()
  
  return calculateDynamicAPY({
    baseAPY,
    tvlMultiplier,
    riskMultiplier,
  })
}

/**
 * Calculate daily yield from APY
 */
export function calculateDailyYield(apy: number): number {
  if (apy <= 0) return 0
  
  // Convert APY to daily yield: (1 + APY)^(1/365) - 1
  const dailyRate = Math.pow(1 + apy / 100, 1 / 365) - 1
  return dailyRate * 100
}

/**
 * Calculate monthly yield from APY
 */
export function calculateMonthlyYield(apy: number): number {
  if (apy <= 0) return 0
  
  // Convert APY to monthly yield: (1 + APY)^(1/12) - 1
  const monthlyRate = Math.pow(1 + apy / 100, 1 / 12) - 1
  return monthlyRate * 100
}

/**
 * Calculate break-even time (time to recover initial investment)
 */
export function calculateBreakEvenTime(
  principal: number,
  apy: number,
  fees: number = 0
): number {
  if (apy <= 0) return Infinity
  
  const dailyYield = calculateDailyYield(apy)
  const dailyReturn = principal * (dailyYield / 100)
  
  if (dailyReturn <= 0) return Infinity
  
  // Days to break even
  return fees / dailyReturn
}

/**
 * Compare APY between protocols
 */
export function compareAPY(
  protocol1: Protocol,
  protocol2: Protocol
): {
  winner: 'protocol1' | 'protocol2' | 'tie'
  difference: number
  percentageDifference: number
} {
  const apy1 = calculateProtocolAPY(protocol1)
  const apy2 = calculateProtocolAPY(protocol2)
  
  const difference = apy1 - apy2
  const percentageDifference = apy2 > 0 ? (difference / apy2) * 100 : 0
  
  let winner: 'protocol1' | 'protocol2' | 'tie'
  if (Math.abs(difference) < 0.01) {
    winner = 'tie'
  } else if (difference > 0) {
    winner = 'protocol1'
  } else {
    winner = 'protocol2'
  }
  
  return {
    winner,
    difference: Math.abs(difference),
    percentageDifference: Math.abs(percentageDifference),
  }
}

/**
 * Calculate risk-adjusted APY (Sharpe ratio equivalent)
 */
export function calculateRiskAdjustedAPY(
  apy: number,
  riskLevel: string | null,
  riskFreeRate: number = 2 // 2% risk-free rate
): number {
  const riskMultiplier = (() => {
    switch (riskLevel?.toLowerCase()) {
      case 'low':
        return 0.5
      case 'medium':
        return 1.0
      case 'high':
        return 2.0
      default:
        return 1.0
    }
  })()
  
  // Risk-adjusted return = (APY - Risk-free rate) / Risk multiplier
  return Math.max(0, (apy - riskFreeRate) / riskMultiplier + riskFreeRate)
}

/**
 * Calculate optimal staking amount based on APY and risk
 */
export function calculateOptimalStakingAmount(
  availableAmount: number,
  protocol: Protocol,
  riskTolerance: 'conservative' | 'moderate' | 'aggressive' = 'moderate'
): {
  recommendedAmount: number
  percentage: number
  reasoning: string
} {
  if (availableAmount <= 0 || !protocol.min_stake) {
    return {
      recommendedAmount: 0,
      percentage: 0,
      reasoning: 'Geçersiz miktar veya minimum stake bilgisi yok',
    }
  }
  
  const minStake = protocol.min_stake
  const apy = calculateProtocolAPY(protocol)
  const riskLevel = protocol.risk_level?.toLowerCase()
  
  // Risk tolerance multipliers
  const riskMultipliers = {
    conservative: 0.1, // 10% of available amount
    moderate: 0.25,    // 25% of available amount
    aggressive: 0.5,   // 50% of available amount
  }
  
  let basePercentage = riskMultipliers[riskTolerance]
  
  // Adjust based on APY (higher APY = higher allocation)
  if (apy > 20) {
    basePercentage *= 1.2
  } else if (apy < 5) {
    basePercentage *= 0.8
  }
  
  // Adjust based on risk level
  if (riskLevel === 'high') {
    basePercentage *= 0.7 // Reduce allocation for high risk
  } else if (riskLevel === 'low') {
    basePercentage *= 1.3 // Increase allocation for low risk
  }
  
  // Ensure we don't exceed available amount or go below minimum
  const calculatedAmount = availableAmount * basePercentage
  const recommendedAmount = Math.max(minStake, Math.min(calculatedAmount, availableAmount))
  const percentage = (recommendedAmount / availableAmount) * 100
  
  const reasoning = `${riskTolerance} risk profili, ${apy.toFixed(2)}% APY ve ${riskLevel} risk seviyesi baz alınarak hesaplandı.`
  
  return {
    recommendedAmount,
    percentage,
    reasoning,
  }
}

/**
 * Validate APY value
 */
export function validateAPY(apy: number): {
  isValid: boolean
  warnings: string[]
  errors: string[]
} {
  const warnings: string[] = []
  const errors: string[] = []
  
  if (isNaN(apy) || !isFinite(apy)) {
    errors.push('APY değeri geçerli bir sayı olmalıdır')
  }
  
  if (apy < 0) {
    errors.push('APY değeri negatif olamaz')
  }
  
  if (apy > 1000) {
    warnings.push('APY değeri çok yüksek görünüyor (%1000+). Lütfen doğruluğunu kontrol edin.')
  }
  
  if (apy > 100) {
    warnings.push('Yüksek APY değeri (%100+) yüksek risk içerebilir.')
  }
  
  if (apy < 1) {
    warnings.push('Düşük APY değeri (%1-) beklenen getiriyi karşılamayabilir.')
  }
  
  return {
    isValid: errors.length === 0,
    warnings,
    errors,
  }
}