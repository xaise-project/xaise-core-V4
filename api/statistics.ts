import { Request, Response } from 'express';
import { supabase } from '../src/lib/supabase';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
      };
    }
  }
}

// Statistics interfaces
interface UserStatisticsRequest {
  period_type: 'daily' | 'weekly' | 'monthly';
  period_start: string;
  period_end: string;
}

interface PortfolioSnapshotRequest {
  snapshot_date: string;
}

interface StatisticsFilters {
  period_type?: 'daily' | 'weekly' | 'monthly';
  start_date?: string;
  end_date?: string;
  protocol_id?: string;
}

/**
 * Get user statistics for a specific period
 */
export async function getUserStatistics(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { period_type, start_date, end_date } = req.query as {
      period_type?: 'daily' | 'weekly' | 'monthly';
      start_date?: string;
      end_date?: string;
    };

    // Build query
    let query = supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', userId)
      .order('period_start', { ascending: false });

    // Apply filters
    if (period_type) {
      query = query.eq('period_type', period_type);
    }

    if (start_date) {
      query = query.gte('period_start', start_date);
    }

    if (end_date) {
      query = query.lte('period_end', end_date);
    }

    const { data: statistics, error } = await query;

    if (error) {
      console.error('Database query error:', error);
      return res.status(500).json({
        error: 'Failed to fetch user statistics',
        message: 'Database operation failed'
      });
    }

    res.json({
      success: true,
      data: statistics || []
    });

  } catch (error) {
    console.error('Get user statistics error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch user statistics'
    });
  }
}

/**
 * Get portfolio snapshots for historical tracking
 */
export async function getPortfolioSnapshots(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { start_date, end_date, limit = '30' } = req.query as {
      start_date?: string;
      end_date?: string;
      limit?: string;
    };

    // Build query
    let query = supabase
      .from('portfolio_snapshots')
      .select('*')
      .eq('user_id', userId)
      .order('snapshot_date', { ascending: false })
      .limit(parseInt(limit));

    // Apply date filters
    if (start_date) {
      query = query.gte('snapshot_date', start_date);
    }

    if (end_date) {
      query = query.lte('snapshot_date', end_date);
    }

    const { data: snapshots, error } = await query;

    if (error) {
      console.error('Database query error:', error);
      return res.status(500).json({
        error: 'Failed to fetch portfolio snapshots',
        message: 'Database operation failed'
      });
    }

    res.json({
      success: true,
      data: snapshots || []
    });

  } catch (error) {
    console.error('Get portfolio snapshots error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch portfolio snapshots'
    });
  }
}

/**
 * Get protocol performance data
 */
export async function getProtocolPerformance(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { period_type, protocol_id, start_date, end_date } = req.query as {
      period_type?: 'daily' | 'weekly' | 'monthly';
      protocol_id?: string;
      start_date?: string;
      end_date?: string;
    };

    // Build query
    let query = supabase
      .from('protocol_performance')
      .select(`
        *,
        protocols (
          id,
          name,
          apy,
          risk_level
        )
      `)
      .eq('user_id', userId)
      .order('period_start', { ascending: false });

    // Apply filters
    if (period_type) {
      query = query.eq('period_type', period_type);
    }

    if (protocol_id) {
      query = query.eq('protocol_id', protocol_id);
    }

    if (start_date) {
      query = query.gte('period_start', start_date);
    }

    if (end_date) {
      query = query.lte('period_end', end_date);
    }

    const { data: performance, error } = await query;

    if (error) {
      console.error('Database query error:', error);
      return res.status(500).json({
        error: 'Failed to fetch protocol performance',
        message: 'Database operation failed'
      });
    }

    res.json({
      success: true,
      data: performance || []
    });

  } catch (error) {
    console.error('Get protocol performance error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch protocol performance'
    });
  }
}

/**
 * Get portfolio dashboard summary
 */
export async function getPortfolioDashboard(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get current portfolio snapshot
    const { data: latestSnapshot } = await supabase
      .from('portfolio_snapshots')
      .select('*')
      .eq('user_id', userId)
      .order('snapshot_date', { ascending: false })
      .limit(1)
      .single();

    // Get recent statistics (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentStats } = await supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', userId)
      .eq('period_type', 'daily')
      .gte('period_start', thirtyDaysAgo.toISOString())
      .order('period_start', { ascending: false });

    // Get active stakes summary
    const { data: activeStakes } = await supabase
      .from('stakes')
      .select(`
        id,
        amount,
        protocol_id,
        start_date,
        end_date,
        protocols (
          name,
          apy,
          risk_level
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active');

    // Get total unclaimed rewards
    const { data: unclaimedRewards } = await supabase
      .from('rewards')
      .select('amount')
      .eq('user_id', userId)
      .eq('claimed', false);

    const totalUnclaimed = unclaimedRewards?.reduce((sum, reward) => sum + reward.amount, 0) || 0;

    // Calculate portfolio metrics
    const totalStaked = activeStakes?.reduce((sum, stake) => sum + stake.amount, 0) || 0;
    const averageAPY = activeStakes?.length ? 
      activeStakes.reduce((sum, stake) => sum + (stake.protocols?.apy || 0), 0) / activeStakes.length : 0;

    // Calculate 30-day performance
    const thirtyDayGrowth = recentStats && recentStats.length > 1 ? 
      ((recentStats[0]?.portfolio_value || 0) - (recentStats[recentStats.length - 1]?.portfolio_value || 0)) : 0;

    const dashboard = {
      current_portfolio_value: latestSnapshot?.total_portfolio_value || totalStaked,
      total_staked_amount: totalStaked,
      total_unclaimed_rewards: totalUnclaimed,
      active_stakes_count: activeStakes?.length || 0,
      average_apy: Math.round(averageAPY * 100) / 100,
      thirty_day_growth: Math.round(thirtyDayGrowth * 100) / 100,
      thirty_day_growth_percentage: totalStaked > 0 ? 
        Math.round((thirtyDayGrowth / totalStaked) * 10000) / 100 : 0,
      portfolio_risk_level: calculatePortfolioRiskLevel(activeStakes || []),
      protocol_distribution: calculateProtocolDistribution(activeStakes || []),
      recent_performance: recentStats?.slice(0, 7) || [], // Last 7 days
      latest_snapshot: latestSnapshot
    };

    res.json({
      success: true,
      data: dashboard
    });

  } catch (error) {
    console.error('Get portfolio dashboard error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch portfolio dashboard'
    });
  }
}

/**
 * Create or update daily portfolio snapshot
 */
export async function createPortfolioSnapshot(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const today = new Date().toISOString().split('T')[0];

    // Check if snapshot already exists for today
    const { data: existingSnapshot } = await supabase
      .from('portfolio_snapshots')
      .select('id')
      .eq('user_id', userId)
      .eq('snapshot_date', today)
      .single();

    if (existingSnapshot) {
      return res.status(409).json({
        error: 'Snapshot already exists for today',
        message: 'Portfolio snapshot has already been created for today'
      });
    }

    // Calculate current portfolio values
    const portfolioData = await calculateCurrentPortfolioValues(userId);

    // Get yesterday's snapshot for comparison
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const { data: yesterdaySnapshot } = await supabase
      .from('portfolio_snapshots')
      .select('total_portfolio_value')
      .eq('user_id', userId)
      .eq('snapshot_date', yesterdayStr)
      .single();

    const yesterdayValue = yesterdaySnapshot?.total_portfolio_value || portfolioData.total_portfolio_value;
    const dailyChange = portfolioData.total_portfolio_value - yesterdayValue;
    const dailyChangePercentage = yesterdayValue > 0 ? (dailyChange / yesterdayValue) * 100 : 0;

    // Create new snapshot
    const { data: newSnapshot, error } = await supabase
      .from('portfolio_snapshots')
      .insert({
        user_id: userId,
        snapshot_date: today,
        total_portfolio_value: portfolioData.total_portfolio_value,
        total_staked_amount: portfolioData.total_staked_amount,
        total_available_rewards: portfolioData.total_available_rewards,
        total_claimed_rewards: portfolioData.total_claimed_rewards,
        daily_change_amount: dailyChange,
        daily_change_percentage: Math.round(dailyChangePercentage * 100) / 100,
        daily_rewards_earned: portfolioData.daily_rewards_earned,
        protocol_distribution: portfolioData.protocol_distribution,
        portfolio_risk_level: portfolioData.portfolio_risk_level,
        diversification_index: portfolioData.diversification_index
      })
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error);
      return res.status(500).json({
        error: 'Failed to create portfolio snapshot',
        message: 'Database operation failed'
      });
    }

    res.json({
      success: true,
      data: newSnapshot
    });

  } catch (error) {
    console.error('Create portfolio snapshot error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create portfolio snapshot'
    });
  }
}

/**
 * Helper function to calculate current portfolio values
 */
async function calculateCurrentPortfolioValues(userId: string) {
  // Get active stakes
  const { data: activeStakes } = await supabase
    .from('stakes')
    .select(`
      amount,
      protocol_id,
      protocols (
        name,
        apy,
        risk_level
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'active');

  // Get rewards data
  const { data: unclaimedRewards } = await supabase
    .from('rewards')
    .select('amount')
    .eq('user_id', userId)
    .eq('claimed', false);

  const { data: claimedRewards } = await supabase
    .from('rewards')
    .select('amount')
    .eq('user_id', userId)
    .eq('claimed', true);

  // Get today's rewards
  const today = new Date().toISOString().split('T')[0];
  const { data: todayRewards } = await supabase
    .from('rewards')
    .select('amount')
    .eq('user_id', userId)
    .gte('reward_date', `${today}T00:00:00.000Z`)
    .lt('reward_date', `${today}T23:59:59.999Z`);

  const totalStaked = activeStakes?.reduce((sum, stake) => sum + stake.amount, 0) || 0;
  const totalUnclaimed = unclaimedRewards?.reduce((sum, reward) => sum + reward.amount, 0) || 0;
  const totalClaimed = claimedRewards?.reduce((sum, reward) => sum + reward.amount, 0) || 0;
  const dailyRewards = todayRewards?.reduce((sum, reward) => sum + reward.amount, 0) || 0;

  const protocolDistribution = calculateProtocolDistribution(activeStakes || []);
  const riskLevel = calculatePortfolioRiskLevel(activeStakes || []);
  const diversificationIndex = calculateDiversificationIndex(activeStakes || []);

  return {
    total_portfolio_value: totalStaked + totalUnclaimed,
    total_staked_amount: totalStaked,
    total_available_rewards: totalUnclaimed,
    total_claimed_rewards: totalClaimed,
    daily_rewards_earned: dailyRewards,
    protocol_distribution: protocolDistribution,
    portfolio_risk_level: riskLevel,
    diversification_index: diversificationIndex
  };
}

/**
 * Helper function to calculate protocol distribution
 */
function calculateProtocolDistribution(stakes: any[]): any {
  if (!stakes || stakes.length === 0) return {};

  const totalAmount = stakes.reduce((sum, stake) => sum + stake.amount, 0);
  const distribution: any = {};

  stakes.forEach(stake => {
    const protocolName = stake.protocols?.name || 'Unknown';
    if (!distribution[protocolName]) {
      distribution[protocolName] = 0;
    }
    distribution[protocolName] += (stake.amount / totalAmount) * 100;
  });

  // Round percentages
  Object.keys(distribution).forEach(key => {
    distribution[key] = Math.round(distribution[key] * 100) / 100;
  });

  return distribution;
}

/**
 * Helper function to calculate portfolio risk level
 */
function calculatePortfolioRiskLevel(stakes: any[]): 'low' | 'medium' | 'high' {
  if (!stakes || stakes.length === 0) return 'medium';

  const riskScores = stakes.map(stake => {
    const riskLevel = stake.protocols?.risk_level || 'medium';
    return riskLevel === 'low' ? 1 : riskLevel === 'medium' ? 2 : 3;
  });

  const averageRisk = riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length;

  if (averageRisk <= 1.5) return 'low';
  if (averageRisk <= 2.5) return 'medium';
  return 'high';
}

/**
 * Helper function to calculate diversification index
 */
function calculateDiversificationIndex(stakes: any[]): number {
  if (!stakes || stakes.length === 0) return 0;

  const protocolCounts: { [key: string]: number } = {};
  const totalAmount = stakes.reduce((sum, stake) => sum + stake.amount, 0);

  stakes.forEach(stake => {
    const protocolName = stake.protocols?.name || 'Unknown';
    if (!protocolCounts[protocolName]) {
      protocolCounts[protocolName] = 0;
    }
    protocolCounts[protocolName] += stake.amount;
  });

  // Calculate Herfindahl-Hirschman Index (HHI) for diversification
  const shares = Object.values(protocolCounts).map(amount => amount / totalAmount);
  const hhi = shares.reduce((sum, share) => sum + (share * share), 0);
  
  // Convert to diversification index (0-100, higher is more diversified)
  const diversificationIndex = (1 - hhi) * 100;
  
  return Math.round(diversificationIndex * 100) / 100;
}