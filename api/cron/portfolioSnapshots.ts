import { supabase } from '../../src/lib/supabase';

// Interface for portfolio snapshot calculation
interface PortfolioSnapshotData {
  user_id: string;
  snapshot_date: string;
  total_portfolio_value: number;
  total_staked_amount: number;
  total_rewards_earned: number;
  total_rewards_claimed: number;
  total_rewards_unclaimed: number;
  active_stakes_count: number;
  protocol_distribution: Record<string, number>;
  risk_distribution: Record<string, number>;
  average_apy: number;
  portfolio_growth_24h: number;
  portfolio_growth_7d: number;
  portfolio_growth_30d: number;
}

/**
 * Create daily portfolio snapshots for all users
 */
export async function createDailyPortfolioSnapshots(): Promise<{
  success: boolean;
  processed: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let processed = 0;

  try {
    console.log('📸 Starting daily portfolio snapshots creation...');

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
    const snapshotDate = today.toISOString().split('T')[0];

    // Process each user
    for (const userId of uniqueUserIds) {
      try {
        // Check if snapshot already exists for today
        const { data: existingSnapshot } = await supabase
          .from('portfolio_snapshots')
          .select('id')
          .eq('user_id', userId)
          .eq('snapshot_date', snapshotDate)
          .single();

        if (existingSnapshot) {
          console.log(`⏭️  Portfolio snapshot already exists for user ${userId} on ${snapshotDate}`);
          continue;
        }

        // Calculate portfolio snapshot data
        const snapshotData = await calculatePortfolioSnapshot(userId, snapshotDate);
        
        if (snapshotData) {
          // Insert portfolio snapshot
          const { error: insertError } = await supabase
            .from('portfolio_snapshots')
            .insert(snapshotData);

          if (insertError) {
            errors.push(`Failed to insert portfolio snapshot for ${userId}: ${insertError.message}`);
            continue;
          }

          processed++;
          console.log(`✅ Created portfolio snapshot for user ${userId}`);
        }

      } catch (userError) {
        const errorMsg = `Error processing portfolio snapshot for user ${userId}: ${userError instanceof Error ? userError.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }

    console.log(`🎉 Daily portfolio snapshots creation completed. Processed: ${processed}, Errors: ${errors.length}`);

    return {
      success: errors.length === 0,
      processed,
      errors
    };

  } catch (error) {
    const errorMsg = `Fatal error in daily portfolio snapshots creation: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(`💥 ${errorMsg}`);
    return {
      success: false,
      processed,
      errors: [errorMsg, ...errors]
    };
  }
}

/**
 * Calculate portfolio snapshot for a specific user
 */
async function calculatePortfolioSnapshot(
  userId: string,
  snapshotDate: string
): Promise<PortfolioSnapshotData | null> {
  try {
    // Get user's current stakes
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

    // Get all rewards for the user
    const { data: allRewards } = await supabase
      .from('rewards')
      .select('amount, claimed, reward_date')
      .eq('user_id', userId);

    // Calculate basic metrics
    const activeStakes = stakes.filter(s => s.status === 'active');
    const totalStaked = activeStakes.reduce((sum, stake) => sum + stake.amount, 0);
    const totalRewardsEarned = allRewards?.reduce((sum, reward) => sum + reward.amount, 0) || 0;
    const totalRewardsClaimed = allRewards?.filter(r => r.claimed).reduce((sum, reward) => sum + reward.amount, 0) || 0;
    const totalRewardsUnclaimed = allRewards?.filter(r => !r.claimed).reduce((sum, reward) => sum + reward.amount, 0) || 0;
    const totalPortfolioValue = totalStaked + totalRewardsUnclaimed;

    // Calculate average APY
    const averageAPY = activeStakes.length > 0 ? 
      activeStakes.reduce((sum, stake) => sum + (stake.protocols?.apy || 0), 0) / activeStakes.length : 0;

    // Calculate protocol distribution
    const protocolDistribution: Record<string, number> = {};
    activeStakes.forEach(stake => {
      const protocolName = stake.protocols?.name || `Protocol ${stake.protocol_id}`;
      if (!protocolDistribution[protocolName]) {
        protocolDistribution[protocolName] = 0;
      }
      protocolDistribution[protocolName] += stake.amount;
    });

    // Convert to percentages
    Object.keys(protocolDistribution).forEach(protocol => {
      protocolDistribution[protocol] = totalStaked > 0 ? 
        Math.round((protocolDistribution[protocol] / totalStaked) * 10000) / 100 : 0;
    });

    // Calculate risk distribution
    const riskDistribution: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0
    };

    activeStakes.forEach(stake => {
      const riskLevel = stake.protocols?.risk_level || 'medium';
      riskDistribution[riskLevel] += stake.amount;
    });

    // Convert to percentages
    Object.keys(riskDistribution).forEach(risk => {
      riskDistribution[risk] = totalStaked > 0 ? 
        Math.round((riskDistribution[risk] / totalStaked) * 10000) / 100 : 0;
    });

    // Calculate portfolio growth rates
    const growth24h = await calculatePortfolioGrowth(userId, 1);
    const growth7d = await calculatePortfolioGrowth(userId, 7);
    const growth30d = await calculatePortfolioGrowth(userId, 30);

    return {
      user_id: userId,
      snapshot_date: snapshotDate,
      total_portfolio_value: Math.round(totalPortfolioValue * 100) / 100,
      total_staked_amount: Math.round(totalStaked * 100) / 100,
      total_rewards_earned: Math.round(totalRewardsEarned * 100) / 100,
      total_rewards_claimed: Math.round(totalRewardsClaimed * 100) / 100,
      total_rewards_unclaimed: Math.round(totalRewardsUnclaimed * 100) / 100,
      active_stakes_count: activeStakes.length,
      protocol_distribution: protocolDistribution,
      risk_distribution: riskDistribution,
      average_apy: Math.round(averageAPY * 100) / 100,
      portfolio_growth_24h: growth24h,
      portfolio_growth_7d: growth7d,
      portfolio_growth_30d: growth30d
    };

  } catch (error) {
    console.error(`Error calculating portfolio snapshot for ${userId}:`, error);
    return null;
  }
}

/**
 * Calculate portfolio growth over a specific number of days
 */
async function calculatePortfolioGrowth(userId: string, days: number): Promise<number> {
  try {
    const currentDate = new Date();
    const pastDate = new Date(currentDate);
    pastDate.setDate(pastDate.getDate() - days);

    const pastDateString = pastDate.toISOString().split('T')[0];

    // Get the closest snapshot from the past
    const { data: pastSnapshot } = await supabase
      .from('portfolio_snapshots')
      .select('total_portfolio_value')
      .eq('user_id', userId)
      .lte('snapshot_date', pastDateString)
      .order('snapshot_date', { ascending: false })
      .limit(1)
      .single();

    if (!pastSnapshot) {
      return 0; // No historical data available
    }

    // Get current portfolio value
    const { data: stakes } = await supabase
      .from('stakes')
      .select('amount, status')
      .eq('user_id', userId)
      .eq('status', 'active');

    const { data: rewards } = await supabase
      .from('rewards')
      .select('amount, claimed')
      .eq('user_id', userId)
      .eq('claimed', false);

    const currentStaked = stakes?.reduce((sum, stake) => sum + stake.amount, 0) || 0;
    const currentUnclaimed = rewards?.reduce((sum, reward) => sum + reward.amount, 0) || 0;
    const currentValue = currentStaked + currentUnclaimed;

    // Calculate growth percentage
    const pastValue = pastSnapshot.total_portfolio_value;
    if (pastValue === 0) {
      return currentValue > 0 ? 100 : 0;
    }

    const growthPercentage = ((currentValue - pastValue) / pastValue) * 100;
    return Math.round(growthPercentage * 100) / 100;

  } catch (error) {
    console.error(`Error calculating portfolio growth for ${userId} over ${days} days:`, error);
    return 0;
  }
}

/**
 * Get portfolio snapshots for a user within a date range
 */
export async function getPortfolioSnapshotsForUser(
  userId: string,
  startDate: string,
  endDate: string,
  limit: number = 30
): Promise<{
  success: boolean;
  data: any[];
  error?: string;
}> {
  try {
    const { data: snapshots, error } = await supabase
      .from('portfolio_snapshots')
      .select('*')
      .eq('user_id', userId)
      .gte('snapshot_date', startDate)
      .lte('snapshot_date', endDate)
      .order('snapshot_date', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch portfolio snapshots: ${error.message}`);
    }

    return {
      success: true,
      data: snapshots || []
    };

  } catch (error) {
    console.error('Error fetching portfolio snapshots:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get latest portfolio snapshot for a user
 */
export async function getLatestPortfolioSnapshot(userId: string): Promise<{
  success: boolean;
  data: any | null;
  error?: string;
}> {
  try {
    const { data: snapshot, error } = await supabase
      .from('portfolio_snapshots')
      .select('*')
      .eq('user_id', userId)
      .order('snapshot_date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw new Error(`Failed to fetch latest portfolio snapshot: ${error.message}`);
    }

    return {
      success: true,
      data: snapshot || null
    };

  } catch (error) {
    console.error('Error fetching latest portfolio snapshot:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Clean up old portfolio snapshots (keep only last 365 days)
 */
export async function cleanupOldPortfolioSnapshots(): Promise<{
  success: boolean;
  deleted: number;
  error?: string;
}> {
  try {
    console.log('🧹 Starting cleanup of old portfolio snapshots...');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 365);
    const cutoffDateString = cutoffDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('portfolio_snapshots')
      .delete()
      .lt('snapshot_date', cutoffDateString);

    if (error) {
      throw new Error(`Failed to cleanup old snapshots: ${error.message}`);
    }

    const deletedCount = Array.isArray(data) ? data.length : 0;
    console.log(`✅ Cleaned up ${deletedCount} old portfolio snapshots`);

    return {
      success: true,
      deleted: deletedCount
    };

  } catch (error) {
    console.error('Error cleaning up old portfolio snapshots:', error);
    return {
      success: false,
      deleted: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Export all functions for module usage
export {
  calculatePortfolioSnapshot,
  calculatePortfolioGrowth
};