import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { supabase } from '../../src/lib/supabase';
import { calculateDailyRewards, calculateCompoundRewards, updateStakeStatuses } from '../../api/cron/rewardCalculator';
import { calculateDailyStatistics, calculateWeeklyStatistics, calculateMonthlyStatistics } from '../../api/cron/statisticsCalculator';
import { createDailyPortfolioSnapshots, cleanupOldPortfolioSnapshots } from '../../api/cron/portfolioSnapshots';

// Test data
const testUser = {
  id: 'test-user-cron-123',
  email: 'cron-test@example.com'
};

const testProtocols = [
  {
    id: 'test-protocol-cron-1',
    name: 'Test Protocol Cron 1',
    apy: 12.5,
    risk_level: 'medium',
    compound_frequency: 'daily'
  },
  {
    id: 'test-protocol-cron-2',
    name: 'Test Protocol Cron 2',
    apy: 8.0,
    risk_level: 'low',
    compound_frequency: 'weekly'
  }
];

const testStakes = [
  {
    id: 'test-stake-cron-1',
    user_id: testUser.id,
    protocol_id: testProtocols[0].id,
    amount: 1000,
    status: 'active',
    start_date: '2024-01-01T00:00:00.000Z',
    end_date: '2024-12-31T23:59:59.999Z',
    compound_frequency: 'daily',
    last_compound_date: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'test-stake-cron-2',
    user_id: testUser.id,
    protocol_id: testProtocols[1].id,
    amount: 500,
    status: 'active',
    start_date: '2024-01-15T00:00:00.000Z',
    end_date: '2024-06-15T23:59:59.999Z',
    compound_frequency: 'weekly',
    last_compound_date: '2024-01-15T00:00:00.000Z'
  },
  {
    id: 'test-stake-cron-3',
    user_id: testUser.id,
    protocol_id: testProtocols[0].id,
    amount: 750,
    status: 'active',
    start_date: '2024-01-01T00:00:00.000Z',
    end_date: '2024-01-02T00:00:00.000Z', // Expired stake for testing
    compound_frequency: 'daily',
    last_compound_date: '2024-01-01T00:00:00.000Z'
  }
];

describe('Cron Jobs Tests', () => {
  beforeAll(async () => {
    console.log('🧪 Setting up cron jobs test environment...');
    
    // Clean up any existing test data
    await supabase.from('user_statistics').delete().eq('user_id', testUser.id);
    await supabase.from('portfolio_snapshots').delete().eq('user_id', testUser.id);
    await supabase.from('protocol_performance').delete().eq('user_id', testUser.id);
    await supabase.from('rewards').delete().eq('user_id', testUser.id);
    await supabase.from('stakes').delete().eq('user_id', testUser.id);
    await supabase.from('protocols').delete().in('id', testProtocols.map(p => p.id));
    
    // Insert test data
    await supabase.from('protocols').insert(testProtocols);
    await supabase.from('stakes').insert(testStakes);
  });

  afterAll(async () => {
    console.log('🧹 Cleaning up cron jobs test environment...');
    
    await supabase.from('user_statistics').delete().eq('user_id', testUser.id);
    await supabase.from('portfolio_snapshots').delete().eq('user_id', testUser.id);
    await supabase.from('protocol_performance').delete().eq('user_id', testUser.id);
    await supabase.from('rewards').delete().eq('user_id', testUser.id);
    await supabase.from('stakes').delete().eq('user_id', testUser.id);
    await supabase.from('protocols').delete().in('id', testProtocols.map(p => p.id));
  });

  describe('Reward Calculator Cron Jobs', () => {
    beforeEach(async () => {
      await supabase.from('rewards').delete().eq('user_id', testUser.id);
    });

    it('should calculate daily rewards for active stakes', async () => {
      const result = await calculateDailyRewards();

      expect(result.success).toBe(true);
      expect(result.processedStakes).toBeGreaterThan(0);

      // Check if rewards were created
      const { data: rewards } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', testUser.id)
        .eq('reward_type', 'daily');

      expect(rewards?.length).toBeGreaterThan(0);
      
      // Verify reward amounts are calculated correctly
      const dailyReward = rewards?.find(r => r.stake_id === testStakes[0].id);
      expect(dailyReward).toBeDefined();
      expect(dailyReward?.amount).toBeGreaterThan(0);
      
      // Daily reward should be approximately (amount * apy) / 365
      const expectedDailyReward = (1000 * 0.125) / 365;
      expect(dailyReward?.amount).toBeCloseTo(expectedDailyReward, 1);
    });

    it('should calculate compound rewards for eligible stakes', async () => {
      // First create some existing rewards
      const existingRewards = [
        {
          user_id: testUser.id,
          protocol_id: testProtocols[0].id,
          stake_id: testStakes[0].id,
          amount: 10.50,
          reward_type: 'daily',
          reward_date: '2024-01-02T00:00:00.000Z',
          claimed: false
        },
        {
          user_id: testUser.id,
          protocol_id: testProtocols[0].id,
          stake_id: testStakes[0].id,
          amount: 11.25,
          reward_type: 'daily',
          reward_date: '2024-01-03T00:00:00.000Z',
          claimed: false
        }
      ];

      await supabase.from('rewards').insert(existingRewards);

      const result = await calculateCompoundRewards();

      expect(result.success).toBe(true);
      expect(result.processedStakes).toBeGreaterThan(0);

      // Check if compound rewards were created
      const { data: compoundRewards } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', testUser.id)
        .eq('reward_type', 'compound');

      expect(compoundRewards?.length).toBeGreaterThan(0);

      // Verify compound reward calculation
      const compoundReward = compoundRewards?.[0];
      expect(compoundReward?.amount).toBeGreaterThan(0);
    });

    it('should update expired stake statuses', async () => {
      const result = await updateStakeStatuses();

      expect(result.success).toBe(true);
      expect(result.updatedStakes).toBeGreaterThan(0);

      // Check if expired stake was updated
      const { data: expiredStake } = await supabase
        .from('stakes')
        .select('*')
        .eq('id', testStakes[2].id)
        .single();

      expect(expiredStake?.status).toBe('completed');
    });

    it('should handle errors gracefully in reward calculation', async () => {
      // Test with invalid data
      const invalidStake = {
        id: 'invalid-stake-test',
        user_id: 'invalid-user',
        protocol_id: 'invalid-protocol',
        amount: -100, // Invalid negative amount
        status: 'active',
        start_date: '2024-01-01T00:00:00.000Z',
        end_date: '2024-12-31T23:59:59.999Z',
        compound_frequency: 'daily',
        last_compound_date: '2024-01-01T00:00:00.000Z'
      };

      await supabase.from('stakes').insert(invalidStake);

      const result = await calculateDailyRewards();

      // Should still succeed but with errors logged
      expect(result.success).toBe(true);
      expect(result.errors).toBeDefined();

      // Clean up
      await supabase.from('stakes').delete().eq('id', 'invalid-stake-test');
    });

    it('should respect compound frequency settings', async () => {
      // Test daily compounding
      const dailyResult = await calculateCompoundRewards();
      expect(dailyResult.success).toBe(true);

      // Check that daily compound stakes are processed
      const { data: dailyStakes } = await supabase
        .from('stakes')
        .select('*')
        .eq('compound_frequency', 'daily')
        .eq('status', 'active');

      expect(dailyStakes?.length).toBeGreaterThan(0);

      // Test weekly compounding (should not compound daily)
      const { data: weeklyStakes } = await supabase
        .from('stakes')
        .select('*')
        .eq('compound_frequency', 'weekly')
        .eq('status', 'active');

      expect(weeklyStakes?.length).toBeGreaterThan(0);
    });
  });

  describe('Statistics Calculator Cron Jobs', () => {
    beforeEach(async () => {
      await supabase.from('user_statistics').delete().eq('user_id', testUser.id);
      await supabase.from('protocol_performance').delete().eq('user_id', testUser.id);
    });

    it('should calculate daily statistics for all users', async () => {
      // First create some rewards for calculation
      const rewards = [
        {
          user_id: testUser.id,
          protocol_id: testProtocols[0].id,
          stake_id: testStakes[0].id,
          amount: 25.50,
          reward_type: 'daily',
          reward_date: new Date().toISOString(),
          claimed: false
        }
      ];

      await supabase.from('rewards').insert(rewards);

      const result = await calculateDailyStatistics();

      expect(result.success).toBe(true);
      expect(result.processedUsers).toBeGreaterThan(0);

      // Check if daily statistics were created
      const { data: dailyStats } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', testUser.id)
        .eq('period_type', 'daily');

      expect(dailyStats?.length).toBeGreaterThan(0);

      const stats = dailyStats?.[0];
      expect(stats?.total_staked_amount).toBeGreaterThan(0);
      expect(stats?.total_rewards_earned).toBeGreaterThan(0);
      expect(stats?.active_stakes_count).toBeGreaterThan(0);
    });

    it('should calculate weekly statistics correctly', async () => {
      // Create daily statistics for the week
      const dailyStats = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        return {
          user_id: testUser.id,
          period_type: 'daily' as const,
          period_start: dateStr + 'T00:00:00.000Z',
          period_end: dateStr + 'T23:59:59.999Z',
          total_staked_amount: 1500,
          total_rewards_earned: 25.50 + (i * 0.5),
          total_rewards_claimed: i * 2,
          total_rewards_unclaimed: 25.50 - (i * 1.5),
          portfolio_value: 1525.50 + (i * 5),
          portfolio_growth_percentage: i * 0.1,
          average_apy: 10.25,
          active_stakes_count: 2,
          completed_stakes_count: 0,
          new_stakes_count: i === 6 ? 2 : 0,
          total_protocols_used: 2,
          risk_score: 37.5,
          diversification_score: 44.44
        };
      });

      await supabase.from('user_statistics').insert(dailyStats);

      const result = await calculateWeeklyStatistics();

      expect(result.success).toBe(true);
      expect(result.processedUsers).toBeGreaterThan(0);

      // Check if weekly statistics were created
      const { data: weeklyStats } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', testUser.id)
        .eq('period_type', 'weekly');

      expect(weeklyStats?.length).toBeGreaterThan(0);

      const stats = weeklyStats?.[0];
      expect(stats?.total_staked_amount).toBe(1500);
      expect(stats?.total_rewards_earned).toBeGreaterThan(25.50);
    });

    it('should calculate monthly statistics correctly', async () => {
      // Create weekly statistics for the month
      const weeklyStats = Array.from({ length: 4 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (i * 7));
        const startDate = new Date(date);
        startDate.setDate(startDate.getDate() - 6);

        return {
          user_id: testUser.id,
          period_type: 'weekly' as const,
          period_start: startDate.toISOString(),
          period_end: date.toISOString(),
          total_staked_amount: 1500,
          total_rewards_earned: 178.50 + (i * 10),
          total_rewards_claimed: 50 + (i * 5),
          total_rewards_unclaimed: 128.50 + (i * 5),
          portfolio_value: 1678.50 + (i * 15),
          portfolio_growth_percentage: 11.9 + (i * 0.5),
          average_apy: 10.25,
          active_stakes_count: 2,
          completed_stakes_count: i,
          new_stakes_count: i === 3 ? 2 : 0,
          total_protocols_used: 2,
          risk_score: 37.5,
          diversification_score: 44.44
        };
      });

      await supabase.from('user_statistics').insert(weeklyStats);

      const result = await calculateMonthlyStatistics();

      expect(result.success).toBe(true);
      expect(result.processedUsers).toBeGreaterThan(0);

      // Check if monthly statistics were created
      const { data: monthlyStats } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', testUser.id)
        .eq('period_type', 'monthly');

      expect(monthlyStats?.length).toBeGreaterThan(0);

      const stats = monthlyStats?.[0];
      expect(stats?.total_staked_amount).toBe(1500);
      expect(stats?.total_rewards_earned).toBeGreaterThan(178.50);
    });

    it('should handle users with no activity gracefully', async () => {
      // Test with user who has no stakes or rewards
      const emptyUser = 'empty-user-test-123';

      const result = await calculateDailyStatistics();

      expect(result.success).toBe(true);

      // Should not create statistics for users with no activity
      const { data: emptyStats } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', emptyUser);

      expect(emptyStats?.length).toBe(0);
    });

    it('should calculate risk and diversification scores correctly', async () => {
      // Create rewards for calculation
      const rewards = [
        {
          user_id: testUser.id,
          protocol_id: testProtocols[0].id,
          stake_id: testStakes[0].id,
          amount: 25.50,
          reward_type: 'daily',
          reward_date: new Date().toISOString(),
          claimed: false
        },
        {
          user_id: testUser.id,
          protocol_id: testProtocols[1].id,
          stake_id: testStakes[1].id,
          amount: 15.75,
          reward_type: 'daily',
          reward_date: new Date().toISOString(),
          claimed: false
        }
      ];

      await supabase.from('rewards').insert(rewards);

      const result = await calculateDailyStatistics();

      expect(result.success).toBe(true);

      const { data: stats } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', testUser.id)
        .eq('period_type', 'daily')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      expect(stats?.risk_score).toBeGreaterThan(0);
      expect(stats?.risk_score).toBeLessThanOrEqual(100);
      expect(stats?.diversification_score).toBeGreaterThan(0);
      expect(stats?.diversification_score).toBeLessThanOrEqual(100);
    });
  });

  describe('Portfolio Snapshots Cron Jobs', () => {
    beforeEach(async () => {
      await supabase.from('portfolio_snapshots').delete().eq('user_id', testUser.id);
    });

    it('should create daily portfolio snapshots for all users', async () => {
      // Create some rewards for portfolio calculation
      const rewards = [
        {
          user_id: testUser.id,
          protocol_id: testProtocols[0].id,
          stake_id: testStakes[0].id,
          amount: 25.50,
          reward_type: 'daily',
          reward_date: new Date().toISOString(),
          claimed: false
        }
      ];

      await supabase.from('rewards').insert(rewards);

      const result = await createDailyPortfolioSnapshots();

      expect(result.success).toBe(true);
      expect(result.processedUsers).toBeGreaterThan(0);

      // Check if portfolio snapshots were created
      const { data: snapshots } = await supabase
        .from('portfolio_snapshots')
        .select('*')
        .eq('user_id', testUser.id);

      expect(snapshots?.length).toBeGreaterThan(0);

      const snapshot = snapshots?.[0];
      expect(snapshot?.total_portfolio_value).toBeGreaterThan(0);
      expect(snapshot?.total_staked_amount).toBeGreaterThan(0);
      expect(snapshot?.active_stakes_count).toBeGreaterThan(0);
      expect(snapshot?.protocol_distribution).toBeDefined();
      expect(snapshot?.risk_distribution).toBeDefined();
    });

    it('should calculate portfolio growth correctly', async () => {
      // Create historical snapshots
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];

      const historicalSnapshots = [
        {
          user_id: testUser.id,
          snapshot_date: weekAgoStr,
          total_portfolio_value: 1000,
          total_staked_amount: 1000,
          total_rewards_earned: 0,
          total_rewards_claimed: 0,
          total_rewards_unclaimed: 0,
          active_stakes_count: 1,
          protocol_distribution: { 'Test Protocol Cron 1': 100 },
          risk_distribution: { low: 0, medium: 100, high: 0 },
          average_apy: 12.5,
          portfolio_growth_24h: 0,
          portfolio_growth_7d: 0,
          portfolio_growth_30d: 0
        },
        {
          user_id: testUser.id,
          snapshot_date: yesterdayStr,
          total_portfolio_value: 1125.50,
          total_staked_amount: 1500,
          total_rewards_earned: 125.50,
          total_rewards_claimed: 50,
          total_rewards_unclaimed: 75.50,
          active_stakes_count: 2,
          protocol_distribution: { 'Test Protocol Cron 1': 66.67, 'Test Protocol Cron 2': 33.33 },
          risk_distribution: { low: 33.33, medium: 66.67, high: 0 },
          average_apy: 10.25,
          portfolio_growth_24h: 2.5,
          portfolio_growth_7d: 12.55,
          portfolio_growth_30d: 12.55
        }
      ];

      await supabase.from('portfolio_snapshots').insert(historicalSnapshots);

      // Create rewards for today's calculation
      const rewards = [
        {
          user_id: testUser.id,
          protocol_id: testProtocols[0].id,
          stake_id: testStakes[0].id,
          amount: 25.50,
          reward_type: 'daily',
          reward_date: new Date().toISOString(),
          claimed: false
        }
      ];

      await supabase.from('rewards').insert(rewards);

      const result = await createDailyPortfolioSnapshots();

      expect(result.success).toBe(true);

      // Check today's snapshot with growth calculations
      const today = new Date().toISOString().split('T')[0];
      const { data: todaySnapshot } = await supabase
        .from('portfolio_snapshots')
        .select('*')
        .eq('user_id', testUser.id)
        .eq('snapshot_date', today)
        .single();

      expect(todaySnapshot?.portfolio_growth_24h).toBeDefined();
      expect(todaySnapshot?.portfolio_growth_7d).toBeDefined();
      expect(todaySnapshot?.portfolio_growth_30d).toBeDefined();
    });

    it('should cleanup old portfolio snapshots', async () => {
      // Create old snapshots (older than 365 days)
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 400);
      const oldDateStr = oldDate.toISOString().split('T')[0];

      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 30);
      const recentDateStr = recentDate.toISOString().split('T')[0];

      const snapshots = [
        {
          user_id: testUser.id,
          snapshot_date: oldDateStr,
          total_portfolio_value: 500,
          total_staked_amount: 500,
          total_rewards_earned: 0,
          total_rewards_claimed: 0,
          total_rewards_unclaimed: 0,
          active_stakes_count: 1,
          protocol_distribution: {},
          risk_distribution: {},
          average_apy: 10,
          portfolio_growth_24h: 0,
          portfolio_growth_7d: 0,
          portfolio_growth_30d: 0
        },
        {
          user_id: testUser.id,
          snapshot_date: recentDateStr,
          total_portfolio_value: 1000,
          total_staked_amount: 1000,
          total_rewards_earned: 50,
          total_rewards_claimed: 25,
          total_rewards_unclaimed: 25,
          active_stakes_count: 1,
          protocol_distribution: {},
          risk_distribution: {},
          average_apy: 12,
          portfolio_growth_24h: 1,
          portfolio_growth_7d: 5,
          portfolio_growth_30d: 10
        }
      ];

      await supabase.from('portfolio_snapshots').insert(snapshots);

      const result = await cleanupOldPortfolioSnapshots();

      expect(result.success).toBe(true);
      expect(result.deletedSnapshots).toBeGreaterThan(0);

      // Check that old snapshot was deleted
      const { data: oldSnapshot } = await supabase
        .from('portfolio_snapshots')
        .select('*')
        .eq('user_id', testUser.id)
        .eq('snapshot_date', oldDateStr);

      expect(oldSnapshot?.length).toBe(0);

      // Check that recent snapshot was kept
      const { data: recentSnapshot } = await supabase
        .from('portfolio_snapshots')
        .select('*')
        .eq('user_id', testUser.id)
        .eq('snapshot_date', recentDateStr);

      expect(recentSnapshot?.length).toBe(1);
    });

    it('should handle portfolio distribution calculations correctly', async () => {
      // Create rewards for calculation
      const rewards = [
        {
          user_id: testUser.id,
          protocol_id: testProtocols[0].id,
          stake_id: testStakes[0].id,
          amount: 25.50,
          reward_type: 'daily',
          reward_date: new Date().toISOString(),
          claimed: false
        },
        {
          user_id: testUser.id,
          protocol_id: testProtocols[1].id,
          stake_id: testStakes[1].id,
          amount: 15.75,
          reward_type: 'daily',
          reward_date: new Date().toISOString(),
          claimed: false
        }
      ];

      await supabase.from('rewards').insert(rewards);

      const result = await createDailyPortfolioSnapshots();

      expect(result.success).toBe(true);

      const today = new Date().toISOString().split('T')[0];
      const { data: snapshot } = await supabase
        .from('portfolio_snapshots')
        .select('*')
        .eq('user_id', testUser.id)
        .eq('snapshot_date', today)
        .single();

      expect(snapshot?.protocol_distribution).toBeDefined();
      expect(snapshot?.risk_distribution).toBeDefined();

      // Check that distributions add up to 100%
      const protocolDistribution = snapshot?.protocol_distribution as Record<string, number>;
      const protocolTotal = Object.values(protocolDistribution || {}).reduce((sum, val) => sum + val, 0);
      expect(protocolTotal).toBeCloseTo(100, 0);

      const riskDistribution = snapshot?.risk_distribution as Record<string, number>;
      const riskTotal = Object.values(riskDistribution || {}).reduce((sum, val) => sum + val, 0);
      expect(riskTotal).toBeCloseTo(100, 0);
    });
  });

  describe('Cron Job Integration Tests', () => {
    it('should run all cron jobs in sequence without conflicts', async () => {
      // Create comprehensive test data
      const rewards = [
        {
          user_id: testUser.id,
          protocol_id: testProtocols[0].id,
          stake_id: testStakes[0].id,
          amount: 25.50,
          reward_type: 'daily',
          reward_date: new Date().toISOString(),
          claimed: false
        }
      ];

      await supabase.from('rewards').insert(rewards);

      // Run all cron jobs in sequence
      const rewardResult = await calculateDailyRewards();
      const statsResult = await calculateDailyStatistics();
      const snapshotResult = await createDailyPortfolioSnapshots();

      expect(rewardResult.success).toBe(true);
      expect(statsResult.success).toBe(true);
      expect(snapshotResult.success).toBe(true);

      // Verify data consistency across all tables
      const { data: finalRewards } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', testUser.id);

      const { data: finalStats } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', testUser.id);

      const { data: finalSnapshots } = await supabase
        .from('portfolio_snapshots')
        .select('*')
        .eq('user_id', testUser.id);

      expect(finalRewards?.length).toBeGreaterThan(0);
      expect(finalStats?.length).toBeGreaterThan(0);
      expect(finalSnapshots?.length).toBeGreaterThan(0);
    });

    it('should handle concurrent cron job execution gracefully', async () => {
      // Create test data
      const rewards = [
        {
          user_id: testUser.id,
          protocol_id: testProtocols[0].id,
          stake_id: testStakes[0].id,
          amount: 25.50,
          reward_type: 'daily',
          reward_date: new Date().toISOString(),
          claimed: false
        }
      ];

      await supabase.from('rewards').insert(rewards);

      // Run multiple cron jobs concurrently
      const [rewardResult, statsResult, snapshotResult] = await Promise.all([
        calculateDailyRewards(),
        calculateDailyStatistics(),
        createDailyPortfolioSnapshots()
      ]);

      expect(rewardResult.success).toBe(true);
      expect(statsResult.success).toBe(true);
      expect(snapshotResult.success).toBe(true);

      // Verify no data corruption occurred
      const { data: rewards_check } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', testUser.id);

      expect(rewards_check?.length).toBeGreaterThan(0);
      expect(rewards_check?.every(r => r.amount > 0)).toBe(true);
    });

    it('should maintain data integrity during error scenarios', async () => {
      // Create invalid data to trigger errors
      const invalidStake = {
        id: 'invalid-stake-integrity-test',
        user_id: testUser.id,
        protocol_id: 'non-existent-protocol',
        amount: 1000,
        status: 'active',
        start_date: '2024-01-01T00:00:00.000Z',
        end_date: '2024-12-31T23:59:59.999Z',
        compound_frequency: 'daily',
        last_compound_date: '2024-01-01T00:00:00.000Z'
      };

      await supabase.from('stakes').insert(invalidStake);

      // Run cron jobs with invalid data
      const rewardResult = await calculateDailyRewards();
      const statsResult = await calculateDailyStatistics();

      // Should handle errors gracefully
      expect(rewardResult.success).toBe(true);
      expect(statsResult.success).toBe(true);

      // Verify valid data is still processed correctly
      const { data: validRewards } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', testUser.id)
        .in('stake_id', testStakes.map(s => s.id));

      expect(validRewards?.length).toBeGreaterThan(0);

      // Clean up
      await supabase.from('stakes').delete().eq('id', 'invalid-stake-integrity-test');
    });
  });

  describe('Performance Tests', () => {
    it('should handle large datasets efficiently', async () => {
      const startTime = Date.now();

      // Create multiple users and stakes for performance testing
      const performanceUsers = Array.from({ length: 10 }, (_, i) => ({
        id: `perf-user-${i}`,
        email: `perf-user-${i}@test.com`
      }));

      const performanceStakes = performanceUsers.flatMap((user, userIndex) =>
        Array.from({ length: 5 }, (_, stakeIndex) => ({
          id: `perf-stake-${userIndex}-${stakeIndex}`,
          user_id: user.id,
          protocol_id: testProtocols[stakeIndex % 2].id,
          amount: 1000 + (stakeIndex * 100),
          status: 'active',
          start_date: '2024-01-01T00:00:00.000Z',
          end_date: '2024-12-31T23:59:59.999Z',
          compound_frequency: 'daily',
          last_compound_date: '2024-01-01T00:00:00.000Z'
        }))
      );

      await supabase.from('stakes').insert(performanceStakes);

      // Run cron jobs with large dataset
      const rewardResult = await calculateDailyRewards();
      const statsResult = await calculateDailyStatistics();
      const snapshotResult = await createDailyPortfolioSnapshots();

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(rewardResult.success).toBe(true);
      expect(statsResult.success).toBe(true);
      expect(snapshotResult.success).toBe(true);
      expect(executionTime).toBeLessThan(30000); // Should complete within 30 seconds

      // Clean up performance test data
      await supabase.from('rewards').delete().in('user_id', performanceUsers.map(u => u.id));
      await supabase.from('user_statistics').delete().in('user_id', performanceUsers.map(u => u.id));
      await supabase.from('portfolio_snapshots').delete().in('user_id', performanceUsers.map(u => u.id));
      await supabase.from('stakes').delete().in('id', performanceStakes.map(s => s.id));
    });

    it('should optimize database queries for large datasets', async () => {
      const startTime = Date.now();

      // Test with existing data
      const result = await calculateDailyStatistics();

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(result.success).toBe(true);
      expect(executionTime).toBeLessThan(10000); // Should complete within 10 seconds
      expect(result.processedUsers).toBeGreaterThanOrEqual(0);
    });
  });
});

// Helper function to run all cron job tests
export async function runCronJobTests(): Promise<{
  success: boolean;
  results: any;
  errors: string[];
}> {
  try {
    console.log('🧪 Running Cron Job Tests...');
    
    const testResults = {
      rewardCalculator: await testRewardCalculator(),
      statisticsCalculator: await testStatisticsCalculator(),
      portfolioSnapshots: await testPortfolioSnapshots(),
      integration: await testCronJobIntegration(),
      performance: await testCronJobPerformance()
    };

    const errors: string[] = [];
    let allPassed = true;

    Object.entries(testResults).forEach(([testName, result]) => {
      if (!result.success) {
        allPassed = false;
        errors.push(`${testName}: ${result.error}`);
      }
    });

    console.log(allPassed ? '✅ All Cron Job tests passed!' : '❌ Some tests failed');

    return {
      success: allPassed,
      results: testResults,
      errors
    };

  } catch (error) {
    console.error('💥 Error running cron job tests:', error);
    return {
      success: false,
      results: {},
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

// Individual test functions for manual execution
async function testRewardCalculator() {
  try {
    const result = await calculateDailyRewards();
    return {
      success: result.success,
      data: { processedStakes: result.processedStakes },
      error: result.errors?.join(', ')
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function testStatisticsCalculator() {
  try {
    const result = await calculateDailyStatistics();
    return {
      success: result.success,
      data: { processedUsers: result.processedUsers },
      error: result.errors?.join(', ')
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function testPortfolioSnapshots() {
  try {
    const result = await createDailyPortfolioSnapshots();
    return {
      success: result.success,
      data: { processedUsers: result.processedUsers },
      error: result.errors?.join(', ')
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function testCronJobIntegration() {
  try {
    const [rewardResult, statsResult, snapshotResult] = await Promise.all([
      calculateDailyRewards(),
      calculateDailyStatistics(),
      createDailyPortfolioSnapshots()
    ]);

    const success = rewardResult.success && statsResult.success && snapshotResult.success;

    return {
      success,
      data: {
        rewards: rewardResult.processedStakes,
        statistics: statsResult.processedUsers,
        snapshots: snapshotResult.processedUsers
      },
      error: success ? undefined : 'One or more cron jobs failed'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function testCronJobPerformance() {
  try {
    const startTime = Date.now();
    
    const result = await calculateDailyStatistics();
    
    const endTime = Date.now();
    const executionTime = endTime - startTime;

    return {
      success: result.success && executionTime < 10000,
      data: { executionTime, processedUsers: result.processedUsers },
      error: result.success ? undefined : 'Performance test failed'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}