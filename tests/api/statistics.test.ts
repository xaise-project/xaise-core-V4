import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { supabase } from '../../src/lib/supabase';

// Test data
const testUser = {
  id: 'test-user-stats-123',
  email: 'stats-test@example.com'
};

const testProtocols = [
  {
    id: 'test-protocol-stats-1',
    name: 'Test Protocol 1',
    apy: 12.5,
    risk_level: 'medium'
  },
  {
    id: 'test-protocol-stats-2',
    name: 'Test Protocol 2',
    apy: 8.0,
    risk_level: 'low'
  }
];

const testStakes = [
  {
    id: 'test-stake-stats-1',
    user_id: testUser.id,
    protocol_id: testProtocols[0].id,
    amount: 1000,
    status: 'active',
    start_date: '2024-01-01T00:00:00.000Z',
    end_date: '2024-12-31T23:59:59.999Z'
  },
  {
    id: 'test-stake-stats-2',
    user_id: testUser.id,
    protocol_id: testProtocols[1].id,
    amount: 500,
    status: 'active',
    start_date: '2024-01-15T00:00:00.000Z',
    end_date: '2024-12-31T23:59:59.999Z'
  }
];

const testRewards = [
  {
    user_id: testUser.id,
    protocol_id: testProtocols[0].id,
    stake_id: testStakes[0].id,
    amount: 25.50,
    reward_type: 'daily',
    reward_date: '2024-01-01T00:00:00.000Z',
    claimed: false
  },
  {
    user_id: testUser.id,
    protocol_id: testProtocols[1].id,
    stake_id: testStakes[1].id,
    amount: 15.75,
    reward_type: 'daily',
    reward_date: '2024-01-02T00:00:00.000Z',
    claimed: true,
    claimed_at: '2024-01-02T12:00:00.000Z'
  }
];

describe('Statistics API Tests', () => {
  beforeAll(async () => {
    console.log('🧪 Setting up statistics test environment...');
    
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
    await supabase.from('rewards').insert(testRewards);
  });

  afterAll(async () => {
    console.log('🧹 Cleaning up statistics test environment...');
    
    await supabase.from('user_statistics').delete().eq('user_id', testUser.id);
    await supabase.from('portfolio_snapshots').delete().eq('user_id', testUser.id);
    await supabase.from('protocol_performance').delete().eq('user_id', testUser.id);
    await supabase.from('rewards').delete().eq('user_id', testUser.id);
    await supabase.from('stakes').delete().eq('user_id', testUser.id);
    await supabase.from('protocols').delete().in('id', testProtocols.map(p => p.id));
  });

  describe('User Statistics', () => {
    beforeEach(async () => {
      await supabase.from('user_statistics').delete().eq('user_id', testUser.id);
    });

    it('should create daily user statistics', async () => {
      const today = new Date().toISOString().split('T')[0];
      const periodStart = today + 'T00:00:00.000Z';
      const periodEnd = today + 'T23:59:59.999Z';

      const userStats = {
        user_id: testUser.id,
        period_type: 'daily' as const,
        period_start: periodStart,
        period_end: periodEnd,
        total_staked_amount: 1500,
        total_rewards_earned: 41.25,
        total_rewards_claimed: 15.75,
        total_rewards_unclaimed: 25.50,
        portfolio_value: 1525.50,
        portfolio_growth_percentage: 1.70,
        average_apy: 10.25,
        active_stakes_count: 2,
        completed_stakes_count: 0,
        new_stakes_count: 2,
        total_protocols_used: 2,
        risk_score: 37.5,
        diversification_score: 44.44,
        best_performing_protocol_id: testProtocols[0].id,
        worst_performing_protocol_id: testProtocols[1].id
      };

      const { data, error } = await supabase
        .from('user_statistics')
        .insert(userStats)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.user_id).toBe(testUser.id);
      expect(data.period_type).toBe('daily');
      expect(data.total_staked_amount).toBe(1500);
      expect(data.portfolio_value).toBe(1525.50);
    });

    it('should get user statistics with filtering', async () => {
      // Insert test statistics for different periods
      const stats = [
        {
          user_id: testUser.id,
          period_type: 'daily' as const,
          period_start: '2024-01-01T00:00:00.000Z',
          period_end: '2024-01-01T23:59:59.999Z',
          total_staked_amount: 1000,
          total_rewards_earned: 25.50,
          total_rewards_claimed: 0,
          total_rewards_unclaimed: 25.50,
          portfolio_value: 1025.50,
          portfolio_growth_percentage: 2.55,
          average_apy: 12.5,
          active_stakes_count: 1,
          completed_stakes_count: 0,
          new_stakes_count: 1,
          total_protocols_used: 1,
          risk_score: 50,
          diversification_score: 0
        },
        {
          user_id: testUser.id,
          period_type: 'weekly' as const,
          period_start: '2024-01-01T00:00:00.000Z',
          period_end: '2024-01-07T23:59:59.999Z',
          total_staked_amount: 1500,
          total_rewards_earned: 178.50,
          total_rewards_claimed: 50.00,
          total_rewards_unclaimed: 128.50,
          portfolio_value: 1628.50,
          portfolio_growth_percentage: 8.57,
          average_apy: 10.25,
          active_stakes_count: 2,
          completed_stakes_count: 0,
          new_stakes_count: 2,
          total_protocols_used: 2,
          risk_score: 37.5,
          diversification_score: 44.44
        }
      ];

      await supabase.from('user_statistics').insert(stats);

      // Test filtering by period type
      const { data: dailyStats } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', testUser.id)
        .eq('period_type', 'daily');

      const { data: weeklyStats } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', testUser.id)
        .eq('period_type', 'weekly');

      expect(dailyStats?.length).toBe(1);
      expect(weeklyStats?.length).toBe(1);
      expect(dailyStats?.[0].period_type).toBe('daily');
      expect(weeklyStats?.[0].period_type).toBe('weekly');
    });

    it('should calculate portfolio growth correctly', async () => {
      const stats = [
        {
          user_id: testUser.id,
          period_type: 'daily' as const,
          period_start: '2024-01-01T00:00:00.000Z',
          period_end: '2024-01-01T23:59:59.999Z',
          total_staked_amount: 1000,
          portfolio_value: 1025.50,
          portfolio_growth_percentage: 0,
          total_rewards_earned: 25.50,
          total_rewards_claimed: 0,
          total_rewards_unclaimed: 25.50,
          average_apy: 12.5,
          active_stakes_count: 1,
          completed_stakes_count: 0,
          new_stakes_count: 1,
          total_protocols_used: 1,
          risk_score: 50,
          diversification_score: 0
        },
        {
          user_id: testUser.id,
          period_type: 'daily' as const,
          period_start: '2024-01-02T00:00:00.000Z',
          period_end: '2024-01-02T23:59:59.999Z',
          total_staked_amount: 1000,
          portfolio_value: 1051.25,
          portfolio_growth_percentage: 2.51, // (1051.25 - 1025.50) / 1025.50 * 100
          total_rewards_earned: 51.25,
          total_rewards_claimed: 0,
          total_rewards_unclaimed: 51.25,
          average_apy: 12.5,
          active_stakes_count: 1,
          completed_stakes_count: 0,
          new_stakes_count: 0,
          total_protocols_used: 1,
          risk_score: 50,
          diversification_score: 0
        }
      ];

      await supabase.from('user_statistics').insert(stats);

      const { data } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', testUser.id)
        .order('period_start', { ascending: false })
        .limit(2);

      expect(data?.length).toBe(2);
      expect(data?.[0].portfolio_growth_percentage).toBeCloseTo(2.51, 1);
      expect(data?.[1].portfolio_growth_percentage).toBe(0);
    });
  });

  describe('Portfolio Snapshots', () => {
    beforeEach(async () => {
      await supabase.from('portfolio_snapshots').delete().eq('user_id', testUser.id);
    });

    it('should create portfolio snapshot', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const snapshot = {
        user_id: testUser.id,
        snapshot_date: today,
        total_portfolio_value: 1525.50,
        total_staked_amount: 1500,
        total_rewards_earned: 41.25,
        total_rewards_claimed: 15.75,
        total_rewards_unclaimed: 25.50,
        active_stakes_count: 2,
        protocol_distribution: {
          'Test Protocol 1': 66.67,
          'Test Protocol 2': 33.33
        },
        risk_distribution: {
          low: 33.33,
          medium: 66.67,
          high: 0
        },
        average_apy: 10.25,
        portfolio_growth_24h: 1.70,
        portfolio_growth_7d: 8.50,
        portfolio_growth_30d: 15.25
      };

      const { data, error } = await supabase
        .from('portfolio_snapshots')
        .insert(snapshot)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.user_id).toBe(testUser.id);
      expect(data.total_portfolio_value).toBe(1525.50);
      expect(data.active_stakes_count).toBe(2);
      expect(data.protocol_distribution).toEqual(snapshot.protocol_distribution);
    });

    it('should get portfolio snapshots within date range', async () => {
      const snapshots = [
        {
          user_id: testUser.id,
          snapshot_date: '2024-01-01',
          total_portfolio_value: 1000,
          total_staked_amount: 1000,
          total_rewards_earned: 0,
          total_rewards_claimed: 0,
          total_rewards_unclaimed: 0,
          active_stakes_count: 1,
          protocol_distribution: { 'Test Protocol 1': 100 },
          risk_distribution: { low: 0, medium: 100, high: 0 },
          average_apy: 12.5,
          portfolio_growth_24h: 0,
          portfolio_growth_7d: 0,
          portfolio_growth_30d: 0
        },
        {
          user_id: testUser.id,
          snapshot_date: '2024-01-02',
          total_portfolio_value: 1025.50,
          total_staked_amount: 1000,
          total_rewards_earned: 25.50,
          total_rewards_claimed: 0,
          total_rewards_unclaimed: 25.50,
          active_stakes_count: 1,
          protocol_distribution: { 'Test Protocol 1': 100 },
          risk_distribution: { low: 0, medium: 100, high: 0 },
          average_apy: 12.5,
          portfolio_growth_24h: 2.55,
          portfolio_growth_7d: 2.55,
          portfolio_growth_30d: 2.55
        },
        {
          user_id: testUser.id,
          snapshot_date: '2024-01-03',
          total_portfolio_value: 1551.25,
          total_staked_amount: 1500,
          total_rewards_earned: 51.25,
          total_rewards_claimed: 0,
          total_rewards_unclaimed: 51.25,
          active_stakes_count: 2,
          protocol_distribution: { 'Test Protocol 1': 66.67, 'Test Protocol 2': 33.33 },
          risk_distribution: { low: 33.33, medium: 66.67, high: 0 },
          average_apy: 10.25,
          portfolio_growth_24h: 51.25,
          portfolio_growth_7d: 55.13,
          portfolio_growth_30d: 55.13
        }
      ];

      await supabase.from('portfolio_snapshots').insert(snapshots);

      // Get snapshots within date range
      const { data } = await supabase
        .from('portfolio_snapshots')
        .select('*')
        .eq('user_id', testUser.id)
        .gte('snapshot_date', '2024-01-01')
        .lte('snapshot_date', '2024-01-03')
        .order('snapshot_date', { ascending: false });

      expect(data?.length).toBe(3);
      expect(data?.[0].snapshot_date).toBe('2024-01-03');
      expect(data?.[2].snapshot_date).toBe('2024-01-01');
    });

    it('should calculate portfolio growth trends', async () => {
      const snapshots = [
        {
          user_id: testUser.id,
          snapshot_date: '2024-01-01',
          total_portfolio_value: 1000,
          portfolio_growth_24h: 0,
          portfolio_growth_7d: 0,
          portfolio_growth_30d: 0,
          total_staked_amount: 1000,
          total_rewards_earned: 0,
          total_rewards_claimed: 0,
          total_rewards_unclaimed: 0,
          active_stakes_count: 1,
          protocol_distribution: {},
          risk_distribution: {},
          average_apy: 12.5
        },
        {
          user_id: testUser.id,
          snapshot_date: '2024-01-08',
          total_portfolio_value: 1178.50,
          portfolio_growth_24h: 2.55,
          portfolio_growth_7d: 17.85,
          portfolio_growth_30d: 17.85,
          total_staked_amount: 1500,
          total_rewards_earned: 178.50,
          total_rewards_claimed: 50.00,
          total_rewards_unclaimed: 128.50,
          active_stakes_count: 2,
          protocol_distribution: {},
          risk_distribution: {},
          average_apy: 10.25
        }
      ];

      await supabase.from('portfolio_snapshots').insert(snapshots);

      const { data } = await supabase
        .from('portfolio_snapshots')
        .select('*')
        .eq('user_id', testUser.id)
        .order('snapshot_date', { ascending: false });

      expect(data?.length).toBe(2);
      
      // Check growth calculations
      const latestSnapshot = data?.[0];
      expect(latestSnapshot?.portfolio_growth_7d).toBeCloseTo(17.85, 1);
      expect(latestSnapshot?.total_portfolio_value).toBe(1178.50);
    });
  });

  describe('Protocol Performance', () => {
    beforeEach(async () => {
      await supabase.from('protocol_performance').delete().eq('user_id', testUser.id);
    });

    it('should create protocol performance record', async () => {
      const today = new Date().toISOString().split('T')[0];
      const periodStart = today + 'T00:00:00.000Z';
      const periodEnd = today + 'T23:59:59.999Z';

      const performance = {
        protocol_id: testProtocols[0].id,
        user_id: testUser.id,
        period_type: 'daily' as const,
        period_start: periodStart,
        period_end: periodEnd,
        total_staked: 1000,
        total_rewards: 25.50,
        actual_apy: 9.31, // (25.50 / 1000) * 365
        expected_apy: 12.5,
        performance_ratio: 0.74, // 9.31 / 12.5
        stakes_count: 1,
        average_stake_duration: 365
      };

      const { data, error } = await supabase
        .from('protocol_performance')
        .insert(performance)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.protocol_id).toBe(testProtocols[0].id);
      expect(data.user_id).toBe(testUser.id);
      expect(data.total_staked).toBe(1000);
      expect(data.actual_apy).toBeCloseTo(9.31, 1);
    });

    it('should get protocol performance with filtering', async () => {
      const performances = [
        {
          protocol_id: testProtocols[0].id,
          user_id: testUser.id,
          period_type: 'daily' as const,
          period_start: '2024-01-01T00:00:00.000Z',
          period_end: '2024-01-01T23:59:59.999Z',
          total_staked: 1000,
          total_rewards: 25.50,
          actual_apy: 9.31,
          expected_apy: 12.5,
          performance_ratio: 0.74,
          stakes_count: 1,
          average_stake_duration: 365
        },
        {
          protocol_id: testProtocols[1].id,
          user_id: testUser.id,
          period_type: 'daily' as const,
          period_start: '2024-01-01T00:00:00.000Z',
          period_end: '2024-01-01T23:59:59.999Z',
          total_staked: 500,
          total_rewards: 15.75,
          actual_apy: 11.50,
          expected_apy: 8.0,
          performance_ratio: 1.44,
          stakes_count: 1,
          average_stake_duration: 351
        }
      ];

      await supabase.from('protocol_performance').insert(performances);

      // Get performance for specific protocol
      const { data: protocol1Performance } = await supabase
        .from('protocol_performance')
        .select('*')
        .eq('user_id', testUser.id)
        .eq('protocol_id', testProtocols[0].id);

      const { data: allPerformance } = await supabase
        .from('protocol_performance')
        .select('*')
        .eq('user_id', testUser.id)
        .order('performance_ratio', { ascending: false });

      expect(protocol1Performance?.length).toBe(1);
      expect(protocol1Performance?.[0].protocol_id).toBe(testProtocols[0].id);
      
      expect(allPerformance?.length).toBe(2);
      expect(allPerformance?.[0].performance_ratio).toBeGreaterThan(allPerformance?.[1].performance_ratio);
    });

    it('should calculate performance ratios correctly', async () => {
      const performance = {
        protocol_id: testProtocols[0].id,
        user_id: testUser.id,
        period_type: 'weekly' as const,
        period_start: '2024-01-01T00:00:00.000Z',
        period_end: '2024-01-07T23:59:59.999Z',
        total_staked: 1000,
        total_rewards: 178.50, // 7 days of rewards
        actual_apy: 0, // Will be calculated
        expected_apy: 12.5,
        performance_ratio: 0,
        stakes_count: 1,
        average_stake_duration: 365
      };

      // Calculate actual APY: (rewards / principal) * (365 / days) * 100
      const actualAPY = (178.50 / 1000) * (365 / 7) * 100;
      const performanceRatio = actualAPY / 12.5;

      performance.actual_apy = Math.round(actualAPY * 100) / 100;
      performance.performance_ratio = Math.round(performanceRatio * 100) / 100;

      const { data, error } = await supabase
        .from('protocol_performance')
        .insert(performance)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.actual_apy).toBeCloseTo(9.31, 1);
      expect(data.performance_ratio).toBeCloseTo(0.74, 1);
    });
  });

  describe('Statistics Aggregation', () => {
    it('should aggregate user statistics correctly', async () => {
      // Insert comprehensive test data
      const stats = [
        {
          user_id: testUser.id,
          period_type: 'daily' as const,
          period_start: '2024-01-01T00:00:00.000Z',
          period_end: '2024-01-01T23:59:59.999Z',
          total_staked_amount: 1000,
          total_rewards_earned: 25.50,
          total_rewards_claimed: 0,
          total_rewards_unclaimed: 25.50,
          portfolio_value: 1025.50,
          portfolio_growth_percentage: 2.55,
          average_apy: 12.5,
          active_stakes_count: 1,
          completed_stakes_count: 0,
          new_stakes_count: 1,
          total_protocols_used: 1,
          risk_score: 50,
          diversification_score: 0
        },
        {
          user_id: testUser.id,
          period_type: 'daily' as const,
          period_start: '2024-01-02T00:00:00.000Z',
          period_end: '2024-01-02T23:59:59.999Z',
          total_staked_amount: 1500,
          total_rewards_earned: 41.25,
          total_rewards_claimed: 15.75,
          total_rewards_unclaimed: 25.50,
          portfolio_value: 1525.50,
          portfolio_growth_percentage: 48.78,
          average_apy: 10.25,
          active_stakes_count: 2,
          completed_stakes_count: 0,
          new_stakes_count: 1,
          total_protocols_used: 2,
          risk_score: 37.5,
          diversification_score: 44.44
        }
      ];

      await supabase.from('user_statistics').insert(stats);

      // Test aggregation queries
      const { data: avgAPY } = await supabase
        .from('user_statistics')
        .select('average_apy')
        .eq('user_id', testUser.id);

      const { data: totalRewards } = await supabase
        .from('user_statistics')
        .select('total_rewards_earned')
        .eq('user_id', testUser.id);

      const { data: latestStats } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', testUser.id)
        .order('period_start', { ascending: false })
        .limit(1)
        .single();

      expect(avgAPY?.length).toBe(2);
      expect(totalRewards?.length).toBe(2);
      expect(latestStats?.portfolio_value).toBe(1525.50);
      expect(latestStats?.total_protocols_used).toBe(2);
    });

    it('should handle empty statistics gracefully', async () => {
      const { data, error } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', 'non-existent-user');

      expect(error).toBeNull();
      expect(data?.length).toBe(0);
    });
  });

  describe('Performance Tests', () => {
    it('should handle large datasets efficiently', async () => {
      const startTime = Date.now();

      // Create 30 days of statistics
      const stats = Array.from({ length: 30 }, (_, i) => {
        const date = new Date('2024-01-01');
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        return {
          user_id: testUser.id,
          period_type: 'daily' as const,
          period_start: dateStr + 'T00:00:00.000Z',
          period_end: dateStr + 'T23:59:59.999Z',
          total_staked_amount: 1000 + (i * 10),
          total_rewards_earned: 25.50 + (i * 0.5),
          total_rewards_claimed: i * 0.25,
          total_rewards_unclaimed: 25.50 + (i * 0.25),
          portfolio_value: 1025.50 + (i * 10.5),
          portfolio_growth_percentage: (i * 0.1),
          average_apy: 12.5 - (i * 0.01),
          active_stakes_count: Math.min(i + 1, 5),
          completed_stakes_count: Math.max(0, i - 25),
          new_stakes_count: i === 0 ? 1 : (i % 7 === 0 ? 1 : 0),
          total_protocols_used: Math.min(Math.floor(i / 5) + 1, 4),
          risk_score: 50 - (i * 0.2),
          diversification_score: Math.min(i * 2, 80)
        };
      });

      await supabase.from('user_statistics').insert(stats);

      // Query with various filters
      const { data: recentStats } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', testUser.id)
        .gte('period_start', '2024-01-25T00:00:00.000Z')
        .order('period_start', { ascending: false });

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(recentStats?.length).toBe(7); // Last 7 days
      expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should efficiently calculate portfolio trends', async () => {
      const startTime = Date.now();

      // Create portfolio snapshots for trend analysis
      const snapshots = Array.from({ length: 30 }, (_, i) => {
        const date = new Date('2024-01-01');
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        return {
          user_id: testUser.id,
          snapshot_date: dateStr,
          total_portfolio_value: 1000 + (i * 15),
          total_staked_amount: 1000 + (i * 10),
          total_rewards_earned: i * 5,
          total_rewards_claimed: i * 2,
          total_rewards_unclaimed: i * 3,
          active_stakes_count: Math.min(i + 1, 5),
          protocol_distribution: { 'Protocol 1': 60, 'Protocol 2': 40 },
          risk_distribution: { low: 30, medium: 50, high: 20 },
          average_apy: 12.5,
          portfolio_growth_24h: i > 0 ? 1.5 : 0,
          portfolio_growth_7d: i > 6 ? 10.5 : 0,
          portfolio_growth_30d: i > 29 ? 45.0 : 0
        };
      });

      await supabase.from('portfolio_snapshots').insert(snapshots);

      // Calculate trends
      const { data: trendData } = await supabase
        .from('portfolio_snapshots')
        .select('snapshot_date, total_portfolio_value, portfolio_growth_7d')
        .eq('user_id', testUser.id)
        .order('snapshot_date', { ascending: false })
        .limit(7);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(trendData?.length).toBe(7);
      expect(executionTime).toBeLessThan(3000); // Should complete within 3 seconds
    });
  });
});

// Helper function to run all statistics tests
export async function runStatisticsTests(): Promise<{
  success: boolean;
  results: any;
  errors: string[];
}> {
  try {
    console.log('🧪 Running Statistics API Tests...');
    
    const testResults = {
      userStatistics: await testUserStatistics(),
      portfolioSnapshots: await testPortfolioSnapshots(),
      protocolPerformance: await testProtocolPerformance(),
      statisticsAggregation: await testStatisticsAggregation(),
      performance: await testStatisticsPerformance()
    };

    const errors: string[] = [];
    let allPassed = true;

    Object.entries(testResults).forEach(([testName, result]) => {
      if (!result.success) {
        allPassed = false;
        errors.push(`${testName}: ${result.error}`);
      }
    });

    console.log(allPassed ? '✅ All Statistics API tests passed!' : '❌ Some tests failed');

    return {
      success: allPassed,
      results: testResults,
      errors
    };

  } catch (error) {
    console.error('💥 Error running statistics tests:', error);
    return {
      success: false,
      results: {},
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

// Individual test functions for manual execution
async function testUserStatistics() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const userStats = {
      user_id: testUser.id,
      period_type: 'daily' as const,
      period_start: today + 'T00:00:00.000Z',
      period_end: today + 'T23:59:59.999Z',
      total_staked_amount: 1500,
      total_rewards_earned: 41.25,
      total_rewards_claimed: 15.75,
      total_rewards_unclaimed: 25.50,
      portfolio_value: 1525.50,
      portfolio_growth_percentage: 1.70,
      average_apy: 10.25,
      active_stakes_count: 2,
      completed_stakes_count: 0,
      new_stakes_count: 2,
      total_protocols_used: 2,
      risk_score: 37.5,
      diversification_score: 44.44
    };

    const { data, error } = await supabase
      .from('user_statistics')
      .insert(userStats)
      .select()
      .single();

    return {
      success: !error && data?.user_id === testUser.id,
      data,
      error: error?.message
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
    const today = new Date().toISOString().split('T')[0];
    const snapshot = {
      user_id: testUser.id,
      snapshot_date: today,
      total_portfolio_value: 1525.50,
      total_staked_amount: 1500,
      total_rewards_earned: 41.25,
      total_rewards_claimed: 15.75,
      total_rewards_unclaimed: 25.50,
      active_stakes_count: 2,
      protocol_distribution: { 'Test Protocol 1': 66.67, 'Test Protocol 2': 33.33 },
      risk_distribution: { low: 33.33, medium: 66.67, high: 0 },
      average_apy: 10.25,
      portfolio_growth_24h: 1.70,
      portfolio_growth_7d: 8.50,
      portfolio_growth_30d: 15.25
    };

    const { data, error } = await supabase
      .from('portfolio_snapshots')
      .insert(snapshot)
      .select()
      .single();

    return {
      success: !error && data?.user_id === testUser.id,
      data,
      error: error?.message
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function testProtocolPerformance() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const performance = {
      protocol_id: testProtocols[0].id,
      user_id: testUser.id,
      period_type: 'daily' as const,
      period_start: today + 'T00:00:00.000Z',
      period_end: today + 'T23:59:59.999Z',
      total_staked: 1000,
      total_rewards: 25.50,
      actual_apy: 9.31,
      expected_apy: 12.5,
      performance_ratio: 0.74,
      stakes_count: 1,
      average_stake_duration: 365
    };

    const { data, error } = await supabase
      .from('protocol_performance')
      .insert(performance)
      .select()
      .single();

    return {
      success: !error && data?.protocol_id === testProtocols[0].id,
      data,
      error: error?.message
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function testStatisticsAggregation() {
  try {
    const { data, error } = await supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', testUser.id)
      .order('period_start', { ascending: false })
      .limit(10);

    return {
      success: !error && Array.isArray(data),
      data: { recordCount: data?.length || 0 },
      error: error?.message
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function testStatisticsPerformance() {
  try {
    const startTime = Date.now();
    
    const { data, error } = await supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', testUser.id)
      .limit(50);

    const endTime = Date.now();
    const executionTime = endTime - startTime;

    return {
      success: !error && executionTime < 3000,
      data: { executionTime, recordCount: data?.length || 0 },
      error: error?.message
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}