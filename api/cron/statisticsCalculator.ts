import { supabase } from '../../src/lib/supabase';

// Interfaces for statistics calculation
interface UserStatsCalculation {
  user_id: string;
  period_type: 'daily' | 'weekly' | 'monthly';
  period_start: string;
  period_end: string;
  total_staked_amount: number;
  total_rewards_earned: number;
  total_rewards_claimed: number;
  total_rewards_unclaimed: number;
  portfolio_value: number;
  portfolio_growth_percentage: number;
  average_apy: number;
  active_stakes_count: number;
  completed_stakes_count: number;
  new_stakes_count: number;
  total_protocols_used: number;
  risk_score: number;
  diversification_score: number;
  best_performing_protocol_id?: string;
  worst_performing_protocol_id?: string;
}

interface ProtocolPerformanceCalculation {
  protocol_id: string;
  user_id: string;
  period_type: 'daily' | 'weekly' | 'monthly';
  period_start: string;
  period_end: string;
  total_staked: number;
  total_rewards: number;
  actual_apy: number;
  expected_apy: number;
  performance_ratio: number;
  stakes_count: number;
  average_stake_duration: number;
}

/**
 * Calculate and store daily statistics for all users
 */
export async function calculateDailyStatistics(): Promise<{
  success: boolean;
  processed: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let processed = 0;

  try {
    console.log('📊 Starting daily statistics calculation...');

    // Get all users who have stakes
    const { data: users, error: usersError } = await supabase
      .from('stakes')
      .select('user_id')
      .not('user_id', 'is', null);

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    // Get unique user IDs
    const uniqueUserIds = [...new Set(users?.map(u => u.user_id) || [])];

    if (uniqueUserIds.length === 0) {
      console.log('✅ No users found with stakes');
      return { success: true, processed: 0, errors: [] };
    }

    console.log(`👥 Found ${uniqueUserIds.length} users to process`);

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const periodStart = yesterday.toISOString().split('T')[0] + 'T00:00:00.000Z';
    const periodEnd = yesterday.toISOString().split('T')[0] + 'T23:59:59.999Z';

    // Process each user
    for (const userId of uniqueUserIds) {
      try {
        // Check if statistics already calculated for yesterday
        const { data: existingStats } = await supabase
          .from('user_statistics')
          .select('id')
          .eq('user_id', userId)
          .eq('period_type', 'daily')
          .eq('period_start', periodStart)
          .single();

        if (existingStats) {
          console.log(`⏭️  Daily stats already calculated for user ${userId}`);
          continue;
        }

        // Calculate user statistics
        const userStats = await calculateUserStatistics(userId, 'daily', periodStart, periodEnd);
        
        if (userStats) {
          // Insert user statistics
          const { error: insertError } = await supabase
            .from('user_statistics')
            .insert(userStats);

          if (insertError) {
            errors.push(`Failed to insert user stats for ${userId}: ${insertError.message}`);
            continue;
          }

          // Calculate protocol performance for this user
          await calculateUserProtocolPerformance(userId, 'daily', periodStart, periodEnd);

          processed++;
          console.log(`✅ Calculated daily stats for user ${userId}`);
        }

      } catch (userError) {
        const errorMsg = `Error processing user ${userId}: ${userError instanceof Error ? userError.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }

    console.log(`🎉 Daily statistics calculation completed. Processed: ${processed}, Errors: ${errors.length}`);

    return {
      success: errors.length === 0,
      processed,
      errors
    };

  } catch (error) {
    const errorMsg = `Fatal error in daily statistics calculation: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(`💥 ${errorMsg}`);
    return {
      success: false,
      processed,
      errors: [errorMsg, ...errors]
    };
  }
}

/**
 * Calculate statistics for a specific user and period
 */
async function calculateUserStatistics(
  userId: string,
  periodType: 'daily' | 'weekly' | 'monthly',
  periodStart: string,
  periodEnd: string
): Promise<UserStatsCalculation | null> {
  try {
    // Get user's stakes for the period
    const { data: stakes } = await supabase
      .from('stakes')
      .select(`
        id,
        amount,
        status,
        start_date,
        end_date,
        protocol_id,
        created_at,
        protocols (
          id,
          name,
          apy,
          risk_level
        )
      `)
      .eq('user_id', userId);

    if (!stakes || stakes.length === 0) {
      return null;
    }

    // Get rewards for the period
    const { data: rewards } = await supabase
      .from('rewards')
      .select('amount, claimed, reward_date')
      .eq('user_id', userId)
      .gte('reward_date', periodStart)
      .lte('reward_date', periodEnd);

    // Get all rewards for total calculations
    const { data: allRewards } = await supabase
      .from('rewards')
      .select('amount, claimed')
      .eq('user_id', userId);

    // Calculate metrics
    const activeStakes = stakes.filter(s => s.status === 'active');
    const completedStakes = stakes.filter(s => s.status === 'completed');
    const newStakes = stakes.filter(s => 
      new Date(s.created_at) >= new Date(periodStart) && 
      new Date(s.created_at) <= new Date(periodEnd)
    );

    const totalStaked = activeStakes.reduce((sum, stake) => sum + stake.amount, 0);
    const totalRewardsEarned = rewards?.reduce((sum, reward) => sum + reward.amount, 0) || 0;
    const totalRewardsClaimed = allRewards?.filter(r => r.claimed).reduce((sum, reward) => sum + reward.amount, 0) || 0;
    const totalRewardsUnclaimed = allRewards?.filter(r => !r.claimed).reduce((sum, reward) => sum + reward.amount, 0) || 0;

    const portfolioValue = totalStaked + totalRewardsUnclaimed;
    
    // Calculate average APY
    const averageAPY = activeStakes.length > 0 ? 
      activeStakes.reduce((sum, stake) => sum + (stake.protocols?.apy || 0), 0) / activeStakes.length : 0;

    // Calculate portfolio growth (compare with previous period)
    const previousPeriodEnd = new Date(periodStart);
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
    const previousPeriodStart = new Date(previousPeriodEnd);
    
    if (periodType === 'daily') {
      previousPeriodStart.setDate(previousPeriodStart.getDate() - 1);
    } else if (periodType === 'weekly') {
      previousPeriodStart.setDate(previousPeriodStart.getDate() - 7);
    } else {
      previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1);
    }

    const { data: previousStats } = await supabase
      .from('user_statistics')
      .select('portfolio_value')
      .eq('user_id', userId)
      .eq('period_type', periodType)
      .eq('period_start', previousPeriodStart.toISOString())
      .single();

    const previousValue = previousStats?.portfolio_value || portfolioValue;
    const portfolioGrowthPercentage = previousValue > 0 ? 
      ((portfolioValue - previousValue) / previousValue) * 100 : 0;

    // Calculate risk and diversification scores
    const riskScore = calculateRiskScore(activeStakes);
    const diversificationScore = calculateDiversificationScore(activeStakes);

    // Find best and worst performing protocols
    const protocolPerformance = await calculateProtocolPerformanceForUser(userId, activeStakes);
    const bestProtocol = protocolPerformance.length > 0 ? 
      protocolPerformance.reduce((best, current) => 
        current.performance_ratio > best.performance_ratio ? current : best
      ) : null;
    const worstProtocol = protocolPerformance.length > 0 ? 
      protocolPerformance.reduce((worst, current) => 
        current.performance_ratio < worst.performance_ratio ? current : worst
      ) : null;

    // Get unique protocols used
    const uniqueProtocols = new Set(activeStakes.map(s => s.protocol_id));

    return {
      user_id: userId,
      period_type: periodType,
      period_start: periodStart,
      period_end: periodEnd,
      total_staked_amount: totalStaked,
      total_rewards_earned: totalRewardsEarned,
      total_rewards_claimed: totalRewardsClaimed,
      total_rewards_unclaimed: totalRewardsUnclaimed,
      portfolio_value: portfolioValue,
      portfolio_growth_percentage: Math.round(portfolioGrowthPercentage * 100) / 100,
      average_apy: Math.round(averageAPY * 100) / 100,
      active_stakes_count: activeStakes.length,
      completed_stakes_count: completedStakes.length,
      new_stakes_count: newStakes.length,
      total_protocols_used: uniqueProtocols.size,
      risk_score: riskScore,
      diversification_score: diversificationScore,
      best_performing_protocol_id: bestProtocol?.protocol_id,
      worst_performing_protocol_id: worstProtocol?.protocol_id
    };

  } catch (error) {
    console.error(`Error calculating user statistics for ${userId}:`, error);
    return null;
  }
}

/**
 * Calculate protocol performance for a user
 */
async function calculateUserProtocolPerformance(
  userId: string,
  periodType: 'daily' | 'weekly' | 'monthly',
  periodStart: string,
  periodEnd: string
): Promise<void> {
  try {
    // Get user's stakes grouped by protocol
    const { data: stakes } = await supabase
      .from('stakes')
      .select(`
        protocol_id,
        amount,
        start_date,
        end_date,
        status,
        protocols (
          apy
        )
      `)
      .eq('user_id', userId);

    if (!stakes || stakes.length === 0) {
      return;
    }

    // Group stakes by protocol
    const protocolGroups: { [key: string]: any[] } = {};
    stakes.forEach(stake => {
      if (!protocolGroups[stake.protocol_id]) {
        protocolGroups[stake.protocol_id] = [];
      }
      protocolGroups[stake.protocol_id].push(stake);
    });

    // Calculate performance for each protocol
    for (const [protocolId, protocolStakes] of Object.entries(protocolGroups)) {
      // Check if performance already calculated
      const { data: existingPerformance } = await supabase
        .from('protocol_performance')
        .select('id')
        .eq('user_id', userId)
        .eq('protocol_id', protocolId)
        .eq('period_type', periodType)
        .eq('period_start', periodStart)
        .single();

      if (existingPerformance) {
        continue;
      }

      // Get rewards for this protocol in the period
      const { data: protocolRewards } = await supabase
        .from('rewards')
        .select('amount')
        .eq('user_id', userId)
        .eq('protocol_id', protocolId)
        .gte('reward_date', periodStart)
        .lte('reward_date', periodEnd);

      const totalStaked = protocolStakes.reduce((sum, stake) => sum + stake.amount, 0);
      const totalRewards = protocolRewards?.reduce((sum, reward) => sum + reward.amount, 0) || 0;
      const expectedAPY = protocolStakes[0]?.protocols?.apy || 0;
      
      // Calculate actual APY based on rewards earned
      const periodDays = periodType === 'daily' ? 1 : periodType === 'weekly' ? 7 : 30;
      const actualAPY = totalStaked > 0 ? 
        (totalRewards / totalStaked) * (365 / periodDays) * 100 : 0;
      
      const performanceRatio = expectedAPY > 0 ? actualAPY / expectedAPY : 0;

      // Calculate average stake duration
      const activeDurations = protocolStakes
        .filter(s => s.status === 'active')
        .map(s => {
          const start = new Date(s.start_date);
          const end = new Date(s.end_date);
          return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        });
      
      const averageDuration = activeDurations.length > 0 ? 
        activeDurations.reduce((sum, duration) => sum + duration, 0) / activeDurations.length : 0;

      // Insert protocol performance
      await supabase
        .from('protocol_performance')
        .insert({
          protocol_id: protocolId,
          user_id: userId,
          period_type: periodType,
          period_start: periodStart,
          period_end: periodEnd,
          total_staked: totalStaked,
          total_rewards: totalRewards,
          actual_apy: Math.round(actualAPY * 100) / 100,
          expected_apy: expectedAPY,
          performance_ratio: Math.round(performanceRatio * 100) / 100,
          stakes_count: protocolStakes.length,
          average_stake_duration: Math.round(averageDuration)
        });
    }

  } catch (error) {
    console.error(`Error calculating protocol performance for user ${userId}:`, error);
  }
}

/**
 * Helper function to calculate protocol performance for ranking
 */
async function calculateProtocolPerformanceForUser(userId: string, stakes: any[]): Promise<any[]> {
  const protocolGroups: { [key: string]: any[] } = {};
  stakes.forEach(stake => {
    if (!protocolGroups[stake.protocol_id]) {
      protocolGroups[stake.protocol_id] = [];
    }
    protocolGroups[stake.protocol_id].push(stake);
  });

  const performance = [];
  
  for (const [protocolId, protocolStakes] of Object.entries(protocolGroups)) {
    const { data: rewards } = await supabase
      .from('rewards')
      .select('amount')
      .eq('user_id', userId)
      .eq('protocol_id', protocolId);

    const totalStaked = protocolStakes.reduce((sum: number, stake: any) => sum + stake.amount, 0);
    const totalRewards = rewards?.reduce((sum, reward) => sum + reward.amount, 0) || 0;
    const expectedAPY = protocolStakes[0]?.protocols?.apy || 0;
    const actualAPY = totalStaked > 0 ? (totalRewards / totalStaked) * 100 : 0;
    const performanceRatio = expectedAPY > 0 ? actualAPY / expectedAPY : 0;

    performance.push({
      protocol_id: protocolId,
      performance_ratio: performanceRatio
    });
  }

  return performance;
}

/**
 * Helper function to calculate risk score
 */
function calculateRiskScore(stakes: any[]): number {
  if (!stakes || stakes.length === 0) return 50; // Medium risk

  const riskScores = stakes.map(stake => {
    const riskLevel = stake.protocols?.risk_level || 'medium';
    return riskLevel === 'low' ? 25 : riskLevel === 'medium' ? 50 : 75;
  });

  const totalAmount = stakes.reduce((sum, stake) => sum + stake.amount, 0);
  const weightedRisk = stakes.reduce((sum, stake, index) => {
    const weight = stake.amount / totalAmount;
    return sum + (riskScores[index] * weight);
  }, 0);

  return Math.round(weightedRisk * 100) / 100;
}

/**
 * Helper function to calculate diversification score
 */
function calculateDiversificationScore(stakes: any[]): number {
  if (!stakes || stakes.length === 0) return 0;

  const protocolCounts: { [key: string]: number } = {};
  const totalAmount = stakes.reduce((sum, stake) => sum + stake.amount, 0);

  stakes.forEach(stake => {
    const protocolId = stake.protocol_id;
    if (!protocolCounts[protocolId]) {
      protocolCounts[protocolId] = 0;
    }
    protocolCounts[protocolId] += stake.amount;
  });

  // Calculate Herfindahl-Hirschman Index (HHI)
  const shares = Object.values(protocolCounts).map(amount => amount / totalAmount);
  const hhi = shares.reduce((sum, share) => sum + (share * share), 0);
  
  // Convert to diversification score (0-100, higher is more diversified)
  const diversificationScore = (1 - hhi) * 100;
  
  return Math.round(diversificationScore * 100) / 100;
}

/**
 * Calculate weekly statistics (runs every Sunday)
 */
export async function calculateWeeklyStatistics(): Promise<{
  success: boolean;
  processed: number;
  errors: string[];
}> {
  console.log('📊 Starting weekly statistics calculation...');
  
  const lastSunday = new Date();
  lastSunday.setDate(lastSunday.getDate() - lastSunday.getDay() - 7);
  const periodStart = lastSunday.toISOString().split('T')[0] + 'T00:00:00.000Z';
  
  const thisSunday = new Date(lastSunday);
  thisSunday.setDate(thisSunday.getDate() + 6);
  const periodEnd = thisSunday.toISOString().split('T')[0] + 'T23:59:59.999Z';

  return await calculateStatisticsForPeriod('weekly', periodStart, periodEnd);
}

/**
 * Calculate monthly statistics (runs on the 1st of each month)
 */
export async function calculateMonthlyStatistics(): Promise<{
  success: boolean;
  processed: number;
  errors: string[];
}> {
  console.log('📊 Starting monthly statistics calculation...');
  
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  lastMonth.setDate(1);
  const periodStart = lastMonth.toISOString().split('T')[0] + 'T00:00:00.000Z';
  
  const lastDayOfMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
  const periodEnd = lastDayOfMonth.toISOString().split('T')[0] + 'T23:59:59.999Z';

  return await calculateStatisticsForPeriod('monthly', periodStart, periodEnd);
}

/**
 * Generic function to calculate statistics for any period
 */
async function calculateStatisticsForPeriod(
  periodType: 'daily' | 'weekly' | 'monthly',
  periodStart: string,
  periodEnd: string
): Promise<{
  success: boolean;
  processed: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let processed = 0;

  try {
    // Get all users who have stakes
    const { data: users, error: usersError } = await supabase
      .from('stakes')
      .select('user_id')
      .not('user_id', 'is', null);

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    const uniqueUserIds = [...new Set(users?.map(u => u.user_id) || [])];

    for (const userId of uniqueUserIds) {
      try {
        const userStats = await calculateUserStatistics(userId, periodType, periodStart, periodEnd);
        
        if (userStats) {
          const { error: insertError } = await supabase
            .from('user_statistics')
            .insert(userStats);

          if (insertError) {
            errors.push(`Failed to insert ${periodType} stats for ${userId}: ${insertError.message}`);
            continue;
          }

          await calculateUserProtocolPerformance(userId, periodType, periodStart, periodEnd);
          processed++;
        }

      } catch (userError) {
        const errorMsg = `Error processing ${periodType} stats for user ${userId}: ${userError instanceof Error ? userError.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }

    console.log(`🎉 ${periodType} statistics calculation completed. Processed: ${processed}, Errors: ${errors.length}`);

    return {
      success: errors.length === 0,
      processed,
      errors
    };

  } catch (error) {
    const errorMsg = `Fatal error in ${periodType} statistics calculation: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(`💥 ${errorMsg}`);
    return {
      success: false,
      processed,
      errors: [errorMsg, ...errors]
    };
  }
}

// Export all functions for module usage
export {
  calculateUserStatistics,
  calculateUserProtocolPerformance,
  calculateProtocolPerformanceForUser,
  calculateRiskScore,
  calculateDiversificationScore,
  calculateStatisticsForPeriod
};