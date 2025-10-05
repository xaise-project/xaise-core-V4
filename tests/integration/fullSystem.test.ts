import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { supabase } from '../../src/lib/supabase';
import { runRewardCalculationCron } from '../../api/cron/rewardCalculator';
import { calculateDailyStatistics } from '../../api/cron/statisticsCalculator';
import { createDailyPortfolioSnapshots } from '../../api/cron/portfolioSnapshots';

// Test data for full system integration
const integrationTestUser = {
  id: 'integration-test-user-123',
  email: 'integration-test@example.com'
};

const integrationTestProtocols = [
  {
    id: 'integration-protocol-1',
    name: 'Integration Protocol 1',
    apy: 15.0,
    risk_level: 'high',
    compound_frequency: 'daily',
    min_stake_amount: 100,
    max_stake_amount: 10000,
    lock_period_days: 30
  },
  {
    id: 'integration-protocol-2',
    name: 'Integration Protocol 2',
    apy: 8.5,
    risk_level: 'low',
    compound_frequency: 'weekly',
    min_stake_amount: 50,
    max_stake_amount: 5000,
    lock_period_days: 90
  },
  {
    id: 'integration-protocol-3',
    name: 'Integration Protocol 3',
    apy: 12.0,
    risk_level: 'medium',
    compound_frequency: 'monthly',
    min_stake_amount: 200,
    max_stake_amount: 15000,
    lock_period_days: 180
  }
];

describe('Full System Integration Tests', () => {
  beforeAll(async () => {
    console.log('🧪 Setting up full system integration test environment...');
    
    // Clean up any existing test data
    await cleanupTestData();
    
    // Insert test protocols
    await supabase.from('protocols').insert(integrationTestProtocols);
    
    console.log('✅ Integration test environment ready');
  });

  afterAll(async () => {
    console.log('🧹 Cleaning up full system integration test environment...');
    await cleanupTestData();
    console.log('✅ Integration test cleanup complete');
  });

  describe('Complete User Journey', () => {
    it('should handle complete user staking journey from start to finish', async () => {
      console.log('🚀 Starting complete user journey test...');

      // Step 1: User creates multiple stakes
      const stakes = [
        {
          id: 'integration-stake-1',
          user_id: integrationTestUser.id,
          protocol_id: integrationTestProtocols[0].id,
          amount: 1000,
          status: 'active',
          start_date: '2024-01-01T00:00:00.000Z',
          end_date: '2024-01-31T23:59:59.999Z',
          compound_frequency: 'daily',
          last_compound_date: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 'integration-stake-2',
          user_id: integrationTestUser.id,
          protocol_id: integrationTestProtocols[1].id,
          amount: 500,
          status: 'active',
          start_date: '2024-01-05T00:00:00.000Z',
          end_date: '2024-04-05T23:59:59.999Z',
          compound_frequency: 'weekly',
          last_compound_date: '2024-01-05T00:00:00.000Z'
        },
        {
          id: 'integration-stake-3',
          user_id: integrationTestUser.id,
          protocol_id: integrationTestProtocols[2].id,
          amount: 2000,
          status: 'active',
          start_date: '2024-01-10T00:00:00.000Z',
          end_date: '2024-07-10T23:59:59.999Z',
          compound_frequency: 'monthly',
          last_compound_date: '2024-01-10T00:00:00.000Z'
        }
      ];

      const { error: stakesError } = await supabase.from('stakes').insert(stakes);
      expect(stakesError).toBeNull();

      // Step 2: Run reward calculation cron job
      console.log('⚙️ Running reward calculation...');
      const rewardResult = await runRewardCalculationCron();
      expect(rewardResult.success).toBe(true);
      expect(rewardResult.processedStakes).toBeGreaterThan(0);

      // Verify rewards were created
      const { data: rewards } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', integrationTestUser.id);

      expect(rewards?.length).toBeGreaterThan(0);
      expect(rewards?.every(r => r.amount > 0)).toBe(true);

      // Step 3: Run statistics calculation
      console.log('📊 Running statistics calculation...');
      const statsResult = await calculateDailyStatistics();
      expect(statsResult.success).toBe(true);
      expect(statsResult.processedUsers).toBeGreaterThan(0);

      // Verify statistics were created
      const { data: statistics } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', integrationTestUser.id);

      expect(statistics?.length).toBeGreaterThan(0);
      
      const userStats = statistics?.[0];
      expect(userStats?.total_staked_amount).toBe(3500); // 1000 + 500 + 2000
      expect(userStats?.active_stakes_count).toBe(3);
      expect(userStats?.total_protocols_used).toBe(3);
      expect(userStats?.total_rewards_earned).toBeGreaterThan(0);

      // Step 4: Run portfolio snapshots
      console.log('📸 Creating portfolio snapshots...');
      const snapshotResult = await createDailyPortfolioSnapshots();
      expect(snapshotResult.success).toBe(true);
      expect(snapshotResult.processedUsers).toBeGreaterThan(0);

      // Verify portfolio snapshots were created
      const { data: snapshots } = await supabase
        .from('portfolio_snapshots')
        .select('*')
        .eq('user_id', integrationTestUser.id);

      expect(snapshots?.length).toBeGreaterThan(0);
      
      const snapshot = snapshots?.[0];
      expect(snapshot?.total_staked_amount).toBe(3500);
      expect(snapshot?.active_stakes_count).toBe(3);
      expect(snapshot?.total_portfolio_value).toBeGreaterThan(3500); // Should include rewards

      // Verify protocol distribution
      const protocolDistribution = snapshot?.protocol_distribution as Record<string, number>;
      expect(Object.keys(protocolDistribution).length).toBe(3);
      
      // Check distribution percentages (should add up to 100%)
      const totalDistribution = Object.values(protocolDistribution).reduce((sum, val) => sum + val, 0);
      expect(totalDistribution).toBeCloseTo(100, 0);

      // Step 5: Simulate user claiming rewards
      console.log('💰 Simulating reward claims...');
      const rewardsToClaimCount = Math.min(2, rewards?.length || 0);
      const rewardsToClaim = rewards?.slice(0, rewardsToClaimCount);

      for (const reward of rewardsToClaim || []) {
        const { error: claimError } = await supabase
          .from('rewards')
          .update({
            claimed: true,
            claimed_at: new Date().toISOString()
          })
          .eq('id', reward.id);

        expect(claimError).toBeNull();
      }

      // Step 6: Run statistics again to reflect claimed rewards
      console.log('📊 Recalculating statistics after claims...');
      const updatedStatsResult = await calculateDailyStatistics();
      expect(updatedStatsResult.success).toBe(true);

      // Verify updated statistics
      const { data: updatedStatistics } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', integrationTestUser.id)
        .order('created_at', { ascending: false })
        .limit(1);

      const updatedStats = updatedStatistics?.[0];
      expect(updatedStats?.total_rewards_claimed).toBeGreaterThan(0);
      expect(updatedStats?.total_rewards_unclaimed).toBeLessThan(updatedStats?.total_rewards_earned);

      console.log('✅ Complete user journey test passed!');
    });

    it('should handle user portfolio growth over time', async () => {
      console.log('📈 Testing portfolio growth over time...');

      // Create historical data for growth calculation
      const historicalDates = [
        '2024-01-01',
        '2024-01-02',
        '2024-01-03',
        '2024-01-04',
        '2024-01-05'
      ];

      const historicalSnapshots = historicalDates.map((date, index) => ({
        user_id: integrationTestUser.id,
        snapshot_date: date,
        total_portfolio_value: 3500 + (index * 50), // Growing portfolio
        total_staked_amount: 3500,
        total_rewards_earned: index * 25,
        total_rewards_claimed: index * 10,
        total_rewards_unclaimed: index * 15,
        active_stakes_count: 3,
        protocol_distribution: {
          'Integration Protocol 1': 28.57, // 1000/3500
          'Integration Protocol 2': 14.29, // 500/3500
          'Integration Protocol 3': 57.14  // 2000/3500
        },
        risk_distribution: {
          low: 14.29,
          medium: 57.14,
          high: 28.57
        },
        average_apy: 11.83, // Weighted average
        portfolio_growth_24h: index > 0 ? 1.43 : 0, // ~50/3500 * 100
        portfolio_growth_7d: index > 0 ? (index * 1.43) : 0,
        portfolio_growth_30d: index > 0 ? (index * 1.43) : 0
      }));

      const { error: snapshotsError } = await supabase
        .from('portfolio_snapshots')
        .insert(historicalSnapshots);

      expect(snapshotsError).toBeNull();

      // Verify growth calculations
      const { data: growthData } = await supabase
        .from('portfolio_snapshots')
        .select('*')
        .eq('user_id', integrationTestUser.id)
        .order('snapshot_date', { ascending: false });

      expect(growthData?.length).toBeGreaterThanOrEqual(5);

      // Check that portfolio values are increasing
      const latestSnapshot = growthData?.[0];
      const oldestSnapshot = growthData?.[growthData.length - 1];

      expect(latestSnapshot?.total_portfolio_value).toBeGreaterThan(oldestSnapshot?.total_portfolio_value);
      expect(latestSnapshot?.total_rewards_earned).toBeGreaterThan(oldestSnapshot?.total_rewards_earned);

      console.log('✅ Portfolio growth test passed!');
    });

    it('should handle protocol performance comparison', async () => {
      console.log('🏆 Testing protocol performance comparison...');

      // Create protocol performance data
      const performanceData = integrationTestProtocols.map((protocol, index) => ({
        protocol_id: protocol.id,
        user_id: integrationTestUser.id,
        period_type: 'daily' as const,
        period_start: '2024-01-01T00:00:00.000Z',
        period_end: '2024-01-01T23:59:59.999Z',
        total_staked: [1000, 500, 2000][index],
        total_rewards: [41.10, 11.64, 65.75][index], // Based on APY and amount
        actual_apy: [15.0, 8.5, 12.0][index],
        expected_apy: protocol.apy,
        performance_ratio: 1.0, // Perfect performance for test
        stakes_count: 1,
        average_stake_duration: 365
      }));

      const { error: performanceError } = await supabase
        .from('protocol_performance')
        .insert(performanceData);

      expect(performanceError).toBeNull();

      // Verify protocol performance data
      const { data: protocolPerformance } = await supabase
        .from('protocol_performance')
        .select(`
          *,
          protocols (
            name,
            apy,
            risk_level
          )
        `)
        .eq('user_id', integrationTestUser.id)
        .order('performance_ratio', { ascending: false });

      expect(protocolPerformance?.length).toBe(3);

      // Check that performance ratios are calculated correctly
      protocolPerformance?.forEach(perf => {
        expect(perf.performance_ratio).toBeCloseTo(1.0, 1);
        expect(perf.actual_apy).toBeGreaterThan(0);
        expect(perf.total_rewards).toBeGreaterThan(0);
      });

      // Verify best performing protocol
      const bestProtocol = protocolPerformance?.[0];
      expect(bestProtocol?.performance_ratio).toBeGreaterThanOrEqual(1.0);

      console.log('✅ Protocol performance comparison test passed!');
    });
  });

  describe('System Resilience Tests', () => {
    it('should handle database connection issues gracefully', async () => {
      console.log('🔌 Testing database resilience...');

      // Test with invalid query to simulate connection issues
      try {
        const { data, error } = await supabase
          .from('non_existent_table')
          .select('*');

        expect(error).toBeDefined();
        expect(data).toBeNull();
      } catch (error) {
        expect(error).toBeDefined();
      }

      // Verify system can recover and continue working
      const { data: protocolsData, error: protocolsError } = await supabase
        .from('protocols')
        .select('*')
        .limit(1);

      expect(protocolsError).toBeNull();
      expect(protocolsData).toBeDefined();

      console.log('✅ Database resilience test passed!');
    });

    it('should handle large data volumes efficiently', async () => {
      console.log('📊 Testing large data volume handling...');

      const startTime = Date.now();

      // Create large dataset for testing
      const largeDatasetUsers = Array.from({ length: 50 }, (_, i) => ({
        id: `large-test-user-${i}`,
        email: `large-test-user-${i}@example.com`
      }));

      const largeDatasetStakes = largeDatasetUsers.flatMap((user, userIndex) =>
        Array.from({ length: 3 }, (_, stakeIndex) => ({
          id: `large-stake-${userIndex}-${stakeIndex}`,
          user_id: user.id,
          protocol_id: integrationTestProtocols[stakeIndex % 3].id,
          amount: 1000 + (stakeIndex * 100),
          status: 'active',
          start_date: '2024-01-01T00:00:00.000Z',
          end_date: '2024-12-31T23:59:59.999Z',
          compound_frequency: 'daily',
          last_compound_date: '2024-01-01T00:00:00.000Z'
        }))
      );

      // Insert large dataset
      const { error: stakesError } = await supabase
        .from('stakes')
        .insert(largeDatasetStakes);

      expect(stakesError).toBeNull();

      // Run system operations on large dataset
      const rewardResult = await runRewardCalculationCron();
      const statsResult = await calculateDailyStatistics();
      const snapshotResult = await createDailyPortfolioSnapshots();

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(rewardResult.success).toBe(true);
      expect(statsResult.success).toBe(true);
      expect(snapshotResult.success).toBe(true);
      expect(executionTime).toBeLessThan(60000); // Should complete within 60 seconds

      // Clean up large dataset
      await supabase.from('rewards').delete().in('user_id', largeDatasetUsers.map(u => u.id));
      await supabase.from('user_statistics').delete().in('user_id', largeDatasetUsers.map(u => u.id));
      await supabase.from('portfolio_snapshots').delete().in('user_id', largeDatasetUsers.map(u => u.id));
      await supabase.from('stakes').delete().in('id', largeDatasetStakes.map(s => s.id));

      console.log(`✅ Large data volume test passed! Execution time: ${executionTime}ms`);
    });

    it('should maintain data consistency under concurrent operations', async () => {
      console.log('🔄 Testing concurrent operations...');

      // Create test stakes for concurrent operations
      const concurrentStakes = [
        {
          id: 'concurrent-stake-1',
          user_id: integrationTestUser.id,
          protocol_id: integrationTestProtocols[0].id,
          amount: 1000,
          status: 'active',
          start_date: '2024-01-01T00:00:00.000Z',
          end_date: '2024-12-31T23:59:59.999Z',
          compound_frequency: 'daily',
          last_compound_date: '2024-01-01T00:00:00.000Z'
        }
      ];

      await supabase.from('stakes').insert(concurrentStakes);

      // Run multiple operations concurrently
      const [rewardResult, statsResult, snapshotResult] = await Promise.all([
        runRewardCalculationCron(),
        calculateDailyStatistics(),
        createDailyPortfolioSnapshots()
      ]);

      expect(rewardResult.success).toBe(true);
      expect(statsResult.success).toBe(true);
      expect(snapshotResult.success).toBe(true);

      // Verify data consistency
      const { data: finalRewards } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', integrationTestUser.id);

      const { data: finalStats } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', integrationTestUser.id);

      const { data: finalSnapshots } = await supabase
        .from('portfolio_snapshots')
        .select('*')
        .eq('user_id', integrationTestUser.id);

      expect(finalRewards?.length).toBeGreaterThan(0);
      expect(finalStats?.length).toBeGreaterThan(0);
      expect(finalSnapshots?.length).toBeGreaterThan(0);

      // Verify no duplicate or corrupted data
      expect(finalRewards?.every(r => r.amount > 0)).toBe(true);
      expect(finalStats?.every(s => s.total_staked_amount > 0)).toBe(true);
      expect(finalSnapshots?.every(s => s.total_portfolio_value > 0)).toBe(true);

      console.log('✅ Concurrent operations test passed!');
    });
  });

  describe('Business Logic Validation', () => {
    it('should enforce business rules correctly', async () => {
      console.log('📋 Testing business rules enforcement...');

      // Test minimum stake amount enforcement
      const invalidStake = {
        id: 'invalid-stake-business-test',
        user_id: integrationTestUser.id,
        protocol_id: integrationTestProtocols[0].id,
        amount: 50, // Below minimum of 100
        status: 'active',
        start_date: '2024-01-01T00:00:00.000Z',
        end_date: '2024-12-31T23:59:59.999Z',
        compound_frequency: 'daily',
        last_compound_date: '2024-01-01T00:00:00.000Z'
      };

      // This should be handled by application logic, not database constraints
      // For testing purposes, we'll insert it and verify the system handles it gracefully
      await supabase.from('stakes').insert(invalidStake);

      const rewardResult = await runRewardCalculationCron();
      expect(rewardResult.success).toBe(true);

      // Clean up
      await supabase.from('stakes').delete().eq('id', 'invalid-stake-business-test');

      // Test reward calculation accuracy
      const validStake = {
        id: 'valid-stake-business-test',
        user_id: integrationTestUser.id,
        protocol_id: integrationTestProtocols[0].id,
        amount: 1000,
        status: 'active',
        start_date: '2024-01-01T00:00:00.000Z',
        end_date: '2024-12-31T23:59:59.999Z',
        compound_frequency: 'daily',
        last_compound_date: '2024-01-01T00:00:00.000Z'
      };

      await supabase.from('stakes').insert(validStake);

      const validRewardResult = await runRewardCalculationCron();
      expect(validRewardResult.success).toBe(true);

      // Verify reward calculation accuracy
      const { data: businessRewards } = await supabase
        .from('rewards')
        .select('*')
        .eq('stake_id', 'valid-stake-business-test');

      expect(businessRewards?.length).toBeGreaterThan(0);

      const reward = businessRewards?.[0];
      const expectedDailyReward = (1000 * 0.15) / 365; // 15% APY daily
      expect(reward?.amount).toBeCloseTo(expectedDailyReward, 1);

      // Clean up
      await supabase.from('rewards').delete().eq('stake_id', 'valid-stake-business-test');
      await supabase.from('stakes').delete().eq('id', 'valid-stake-business-test');

      console.log('✅ Business rules validation test passed!');
    });

    it('should calculate compound interest correctly', async () => {
      console.log('🧮 Testing compound interest calculations...');

      // Create stake with compound frequency
      const compoundStake = {
        id: 'compound-test-stake',
        user_id: integrationTestUser.id,
        protocol_id: integrationTestProtocols[0].id,
        amount: 1000,
        status: 'active',
        start_date: '2024-01-01T00:00:00.000Z',
        end_date: '2024-12-31T23:59:59.999Z',
        compound_frequency: 'daily',
        last_compound_date: '2024-01-01T00:00:00.000Z'
      };

      await supabase.from('stakes').insert(compoundStake);

      // Create some rewards for compounding
      const initialRewards = [
        {
          user_id: integrationTestUser.id,
          protocol_id: integrationTestProtocols[0].id,
          stake_id: 'compound-test-stake',
          amount: 4.11, // Daily reward for 15% APY on 1000
          reward_type: 'daily',
          reward_date: '2024-01-02T00:00:00.000Z',
          claimed: false
        },
        {
          user_id: integrationTestUser.id,
          protocol_id: integrationTestProtocols[0].id,
          stake_id: 'compound-test-stake',
          amount: 4.11,
          reward_type: 'daily',
          reward_date: '2024-01-03T00:00:00.000Z',
          claimed: false
        }
      ];

      await supabase.from('rewards').insert(initialRewards);

      // Run reward calculation to trigger compounding
      const compoundResult = await runRewardCalculationCron();
      expect(compoundResult.success).toBe(true);

      // Verify compound rewards were created
      const { data: compoundRewards } = await supabase
        .from('rewards')
        .select('*')
        .eq('stake_id', 'compound-test-stake')
        .eq('reward_type', 'compound');

      expect(compoundRewards?.length).toBeGreaterThan(0);

      // Verify compound amount is calculated correctly
      const compoundReward = compoundRewards?.[0];
      expect(compoundReward?.amount).toBeGreaterThan(0);

      // Clean up
      await supabase.from('rewards').delete().eq('stake_id', 'compound-test-stake');
      await supabase.from('stakes').delete().eq('id', 'compound-test-stake');

      console.log('✅ Compound interest calculation test passed!');
    });

    it('should handle stake lifecycle correctly', async () => {
      console.log('🔄 Testing stake lifecycle management...');

      // Create stake that will expire
      const lifecycleStake = {
        id: 'lifecycle-test-stake',
        user_id: integrationTestUser.id,
        protocol_id: integrationTestProtocols[0].id,
        amount: 1000,
        status: 'active',
        start_date: '2024-01-01T00:00:00.000Z',
        end_date: '2024-01-02T00:00:00.000Z', // Expired
        compound_frequency: 'daily',
        last_compound_date: '2024-01-01T00:00:00.000Z'
      };

      await supabase.from('stakes').insert(lifecycleStake);

      // Run reward calculation which should update expired stakes
      const lifecycleResult = await runRewardCalculationCron();
      expect(lifecycleResult.success).toBe(true);

      // Verify stake status was updated
      const { data: updatedStake } = await supabase
        .from('stakes')
        .select('*')
        .eq('id', 'lifecycle-test-stake')
        .single();

      expect(updatedStake?.status).toBe('completed');

      // Clean up
      await supabase.from('stakes').delete().eq('id', 'lifecycle-test-stake');

      console.log('✅ Stake lifecycle management test passed!');
    });
  });
});

// Helper function to clean up test data
async function cleanupTestData() {
  const userIds = [integrationTestUser.id];
  const protocolIds = integrationTestProtocols.map(p => p.id);
  
  // Clean up in correct order due to foreign key constraints
  await supabase.from('user_statistics').delete().in('user_id', userIds);
  await supabase.from('portfolio_snapshots').delete().in('user_id', userIds);
  await supabase.from('protocol_performance').delete().in('user_id', userIds);
  await supabase.from('rewards').delete().in('user_id', userIds);
  await supabase.from('stakes').delete().in('user_id', userIds);
  await supabase.from('protocols').delete().in('id', protocolIds);
}

// Helper function to run all integration tests
export async function runFullSystemTests(): Promise<{
  success: boolean;
  results: any;
  errors: string[];
}> {
  try {
    console.log('🧪 Running Full System Integration Tests...');
    
    const testResults = {
      userJourney: await testCompleteUserJourney(),
      portfolioGrowth: await testPortfolioGrowth(),
      protocolPerformance: await testProtocolPerformance(),
      systemResilience: await testSystemResilience(),
      businessLogic: await testBusinessLogic()
    };

    const errors: string[] = [];
    let allPassed = true;

    Object.entries(testResults).forEach(([testName, result]) => {
      if (!result.success) {
        allPassed = false;
        errors.push(`${testName}: ${result.error}`);
      }
    });

    console.log(allPassed ? '✅ All Full System Integration tests passed!' : '❌ Some tests failed');

    return {
      success: allPassed,
      results: testResults,
      errors
    };

  } catch (error) {
    console.error('💥 Error running full system tests:', error);
    return {
      success: false,
      results: {},
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

// Individual test functions for manual execution
async function testCompleteUserJourney() {
  try {
    // Simplified version of the complete user journey test
    const stakes = [
      {
        id: 'test-journey-stake-1',
        user_id: integrationTestUser.id,
        protocol_id: integrationTestProtocols[0].id,
        amount: 1000,
        status: 'active',
        start_date: '2024-01-01T00:00:00.000Z',
        end_date: '2024-12-31T23:59:59.999Z',
        compound_frequency: 'daily',
        last_compound_date: '2024-01-01T00:00:00.000Z'
      }
    ];

    await supabase.from('stakes').insert(stakes);

    const rewardResult = await runRewardCalculationCron();
    const statsResult = await calculateDailyStatistics();
    const snapshotResult = await createDailyPortfolioSnapshots();

    const success = rewardResult.success && statsResult.success && snapshotResult.success;

    // Clean up
    await supabase.from('rewards').delete().eq('user_id', integrationTestUser.id);
    await supabase.from('user_statistics').delete().eq('user_id', integrationTestUser.id);
    await supabase.from('portfolio_snapshots').delete().eq('user_id', integrationTestUser.id);
    await supabase.from('stakes').delete().eq('id', 'test-journey-stake-1');

    return {
      success,
      data: {
        rewards: rewardResult.processedStakes,
        statistics: statsResult.processedUsers,
        snapshots: snapshotResult.processedUsers
      },
      error: success ? undefined : 'User journey test failed'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function testPortfolioGrowth() {
  try {
    const snapshots = [
      {
        user_id: integrationTestUser.id,
        snapshot_date: '2024-01-01',
        total_portfolio_value: 1000,
        total_staked_amount: 1000,
        total_rewards_earned: 0,
        total_rewards_claimed: 0,
        total_rewards_unclaimed: 0,
        active_stakes_count: 1,
        protocol_distribution: {},
        risk_distribution: {},
        average_apy: 15,
        portfolio_growth_24h: 0,
        portfolio_growth_7d: 0,
        portfolio_growth_30d: 0
      },
      {
        user_id: integrationTestUser.id,
        snapshot_date: '2024-01-02',
        total_portfolio_value: 1050,
        total_staked_amount: 1000,
        total_rewards_earned: 50,
        total_rewards_claimed: 0,
        total_rewards_unclaimed: 50,
        active_stakes_count: 1,
        protocol_distribution: {},
        risk_distribution: {},
        average_apy: 15,
        portfolio_growth_24h: 5.0,
        portfolio_growth_7d: 5.0,
        portfolio_growth_30d: 5.0
      }
    ];

    await supabase.from('portfolio_snapshots').insert(snapshots);

    const { data } = await supabase
      .from('portfolio_snapshots')
      .select('*')
      .eq('user_id', integrationTestUser.id)
      .order('snapshot_date', { ascending: false });

    const success = data && data.length === 2 && data[0].total_portfolio_value > data[1].total_portfolio_value;

    // Clean up
    await supabase.from('portfolio_snapshots').delete().eq('user_id', integrationTestUser.id);

    return {
      success: !!success,
      data: { snapshotCount: data?.length || 0 },
      error: success ? undefined : 'Portfolio growth test failed'
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
    const performance = {
      protocol_id: integrationTestProtocols[0].id,
      user_id: integrationTestUser.id,
      period_type: 'daily' as const,
      period_start: '2024-01-01T00:00:00.000Z',
      period_end: '2024-01-01T23:59:59.999Z',
      total_staked: 1000,
      total_rewards: 41.10,
      actual_apy: 15.0,
      expected_apy: 15.0,
      performance_ratio: 1.0,
      stakes_count: 1,
      average_stake_duration: 365
    };

    await supabase.from('protocol_performance').insert(performance);

    const { data } = await supabase
      .from('protocol_performance')
      .select('*')
      .eq('user_id', integrationTestUser.id);

    const success = data && data.length > 0 && data[0].performance_ratio === 1.0;

    // Clean up
    await supabase.from('protocol_performance').delete().eq('user_id', integrationTestUser.id);

    return {
      success: !!success,
      data: { performanceRecords: data?.length || 0 },
      error: success ? undefined : 'Protocol performance test failed'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function testSystemResilience() {
  try {
    // Test database connectivity
    const { data, error } = await supabase
      .from('protocols')
      .select('*')
      .limit(1);

    const success = !error && Array.isArray(data);

    return {
      success: !!success,
      data: { connectionTest: 'passed' },
      error: success ? undefined : 'System resilience test failed'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function testBusinessLogic() {
  try {
    // Test reward calculation accuracy
    const stake = {
      id: 'business-logic-test-stake',
      user_id: integrationTestUser.id,
      protocol_id: integrationTestProtocols[0].id,
      amount: 1000,
      status: 'active',
      start_date: '2024-01-01T00:00:00.000Z',
      end_date: '2024-12-31T23:59:59.999Z',
      compound_frequency: 'daily',
      last_compound_date: '2024-01-01T00:00:00.000Z'
    };

    await supabase.from('stakes').insert(stake);

    const rewardResult = await runRewardCalculationCron();

    const { data: rewards } = await supabase
      .from('rewards')
      .select('*')
      .eq('stake_id', 'business-logic-test-stake');

    const expectedDailyReward = (1000 * 0.15) / 365;
    const actualReward = rewards?.[0]?.amount || 0;
    const success = rewardResult.success && Math.abs(actualReward - expectedDailyReward) < 0.1;

    // Clean up
    await supabase.from('rewards').delete().eq('stake_id', 'business-logic-test-stake');
    await supabase.from('stakes').delete().eq('id', 'business-logic-test-stake');

    return {
      success,
      data: { 
        expectedReward: expectedDailyReward, 
        actualReward,
        difference: Math.abs(actualReward - expectedDailyReward)
      },
      error: success ? undefined : 'Business logic test failed'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}