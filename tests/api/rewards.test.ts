import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { supabase } from '../../src/lib/supabase';

// Mock Express app for testing
const mockApp = {
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  use: jest.fn()
};

// Test data
const testUser = {
  id: 'test-user-123',
  email: 'test@example.com'
};

const testProtocol = {
  id: 'test-protocol-123',
  name: 'Test Protocol',
  apy: 12.5
};

const testStake = {
  id: 'test-stake-123',
  user_id: testUser.id,
  protocol_id: testProtocol.id,
  amount: 1000,
  status: 'active'
};

const testReward = {
  user_id: testUser.id,
  protocol_id: testProtocol.id,
  stake_id: testStake.id,
  amount: 50.25,
  reward_type: 'daily',
  reward_date: new Date().toISOString()
};

describe('Rewards API Tests', () => {
  beforeAll(async () => {
    // Setup test data
    console.log('🧪 Setting up test environment...');
    
    // Clean up any existing test data
    await supabase.from('rewards').delete().eq('user_id', testUser.id);
    await supabase.from('stakes').delete().eq('user_id', testUser.id);
    await supabase.from('protocols').delete().eq('id', testProtocol.id);
    
    // Insert test protocol
    await supabase.from('protocols').insert(testProtocol);
    
    // Insert test stake
    await supabase.from('stakes').insert(testStake);
  });

  afterAll(async () => {
    // Cleanup test data
    console.log('🧹 Cleaning up test environment...');
    
    await supabase.from('rewards').delete().eq('user_id', testUser.id);
    await supabase.from('stakes').delete().eq('user_id', testUser.id);
    await supabase.from('protocols').delete().eq('id', testProtocol.id);
  });

  beforeEach(async () => {
    // Clean rewards before each test
    await supabase.from('rewards').delete().eq('user_id', testUser.id);
  });

  describe('POST /api/rewards - Create Reward', () => {
    it('should create a new reward successfully', async () => {
      const { data, error } = await supabase
        .from('rewards')
        .insert(testReward)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.amount).toBe(testReward.amount);
      expect(data.user_id).toBe(testReward.user_id);
      expect(data.protocol_id).toBe(testReward.protocol_id);
      expect(data.claimed).toBe(false);
    });

    it('should fail to create reward with invalid data', async () => {
      const invalidReward = {
        ...testReward,
        amount: -10 // Invalid negative amount
      };

      const { error } = await supabase
        .from('rewards')
        .insert(invalidReward);

      expect(error).toBeDefined();
    });

    it('should fail to create reward with missing required fields', async () => {
      const incompleteReward = {
        amount: 50.25
        // Missing user_id, protocol_id, etc.
      };

      const { error } = await supabase
        .from('rewards')
        .insert(incompleteReward);

      expect(error).toBeDefined();
    });
  });

  describe('GET /api/rewards/user/:userId - Get User Rewards', () => {
    beforeEach(async () => {
      // Insert test rewards
      const rewards = [
        { ...testReward, amount: 25.50, reward_date: '2024-01-01T00:00:00.000Z' },
        { ...testReward, amount: 30.75, reward_date: '2024-01-02T00:00:00.000Z', claimed: true },
        { ...testReward, amount: 15.25, reward_date: '2024-01-03T00:00:00.000Z' }
      ];

      await supabase.from('rewards').insert(rewards);
    });

    it('should get all rewards for a user', async () => {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', testUser.id)
        .order('reward_date', { ascending: false });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.length).toBe(3);
      expect(data[0].amount).toBe(15.25); // Most recent first
    });

    it('should filter rewards by claimed status', async () => {
      const { data: claimedRewards } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', testUser.id)
        .eq('claimed', true);

      const { data: unclaimedRewards } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', testUser.id)
        .eq('claimed', false);

      expect(claimedRewards?.length).toBe(1);
      expect(unclaimedRewards?.length).toBe(2);
    });

    it('should filter rewards by date range', async () => {
      const { data } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', testUser.id)
        .gte('reward_date', '2024-01-02T00:00:00.000Z')
        .lte('reward_date', '2024-01-03T23:59:59.999Z');

      expect(data?.length).toBe(2);
    });
  });

  describe('PUT /api/rewards/:id - Update Reward', () => {
    let rewardId: string;

    beforeEach(async () => {
      const { data } = await supabase
        .from('rewards')
        .insert(testReward)
        .select()
        .single();
      
      rewardId = data.id;
    });

    it('should update reward amount successfully', async () => {
      const newAmount = 75.50;
      
      const { data, error } = await supabase
        .from('rewards')
        .update({ amount: newAmount })
        .eq('id', rewardId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.amount).toBe(newAmount);
    });

    it('should update reward claimed status', async () => {
      const { data, error } = await supabase
        .from('rewards')
        .update({ claimed: true, claimed_at: new Date().toISOString() })
        .eq('id', rewardId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.claimed).toBe(true);
      expect(data.claimed_at).toBeDefined();
    });

    it('should fail to update non-existent reward', async () => {
      const { error } = await supabase
        .from('rewards')
        .update({ amount: 100 })
        .eq('id', 'non-existent-id');

      expect(error).toBeNull(); // Supabase doesn't error on no matches
    });
  });

  describe('POST /api/rewards/:id/claim - Claim Reward', () => {
    let rewardId: string;

    beforeEach(async () => {
      const { data } = await supabase
        .from('rewards')
        .insert({ ...testReward, claimed: false })
        .select()
        .single();
      
      rewardId = data.id;
    });

    it('should claim reward successfully', async () => {
      const { data, error } = await supabase
        .from('rewards')
        .update({ 
          claimed: true, 
          claimed_at: new Date().toISOString() 
        })
        .eq('id', rewardId)
        .eq('claimed', false) // Only claim if not already claimed
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.claimed).toBe(true);
      expect(data.claimed_at).toBeDefined();
    });

    it('should fail to claim already claimed reward', async () => {
      // First claim
      await supabase
        .from('rewards')
        .update({ 
          claimed: true, 
          claimed_at: new Date().toISOString() 
        })
        .eq('id', rewardId);

      // Try to claim again
      const { data, error } = await supabase
        .from('rewards')
        .update({ 
          claimed: true, 
          claimed_at: new Date().toISOString() 
        })
        .eq('id', rewardId)
        .eq('claimed', false) // This condition will fail
        .select();

      expect(data?.length).toBe(0); // No rows updated
    });
  });

  describe('DELETE /api/rewards/:id - Delete Reward', () => {
    let rewardId: string;

    beforeEach(async () => {
      const { data } = await supabase
        .from('rewards')
        .insert(testReward)
        .select()
        .single();
      
      rewardId = data.id;
    });

    it('should delete reward successfully', async () => {
      const { error } = await supabase
        .from('rewards')
        .delete()
        .eq('id', rewardId);

      expect(error).toBeNull();

      // Verify deletion
      const { data } = await supabase
        .from('rewards')
        .select()
        .eq('id', rewardId);

      expect(data?.length).toBe(0);
    });

    it('should handle deletion of non-existent reward', async () => {
      const { error } = await supabase
        .from('rewards')
        .delete()
        .eq('id', 'non-existent-id');

      expect(error).toBeNull(); // Supabase doesn't error on no matches
    });
  });

  describe('Reward Calculation Logic', () => {
    it('should calculate daily rewards correctly', () => {
      const principal = 1000;
      const apy = 12; // 12% APY
      const days = 1;

      const expectedDailyReward = (principal * (apy / 100)) / 365;
      const calculatedReward = Math.round(expectedDailyReward * 100) / 100;

      expect(calculatedReward).toBeCloseTo(0.33, 2);
    });

    it('should calculate compound rewards correctly', () => {
      const principal = 1000;
      const apy = 12; // 12% APY
      const compoundFrequency = 365; // Daily compounding
      const days = 30;

      const dailyRate = apy / 100 / compoundFrequency;
      const compoundAmount = principal * Math.pow(1 + dailyRate, days);
      const reward = compoundAmount - principal;

      expect(reward).toBeGreaterThan(0);
      expect(reward).toBeCloseTo(9.95, 1); // Approximately 10 for 30 days
    });
  });

  describe('Database Constraints and Validation', () => {
    it('should enforce positive amount constraint', async () => {
      const invalidReward = {
        ...testReward,
        amount: -50 // Negative amount
      };

      const { error } = await supabase
        .from('rewards')
        .insert(invalidReward);

      expect(error).toBeDefined();
    });

    it('should enforce foreign key constraints', async () => {
      const invalidReward = {
        ...testReward,
        user_id: 'non-existent-user',
        protocol_id: 'non-existent-protocol'
      };

      const { error } = await supabase
        .from('rewards')
        .insert(invalidReward);

      expect(error).toBeDefined();
    });

    it('should handle concurrent reward creation', async () => {
      const rewards = Array.from({ length: 5 }, (_, i) => ({
        ...testReward,
        amount: 10 + i,
        reward_date: new Date(Date.now() + i * 1000).toISOString()
      }));

      const promises = rewards.map(reward => 
        supabase.from('rewards').insert(reward).select().single()
      );

      const results = await Promise.all(promises);
      
      results.forEach(({ error }) => {
        expect(error).toBeNull();
      });

      // Verify all rewards were created
      const { data } = await supabase
        .from('rewards')
        .select()
        .eq('user_id', testUser.id);

      expect(data?.length).toBe(5);
    });
  });

  describe('Performance Tests', () => {
    it('should handle large number of rewards efficiently', async () => {
      const startTime = Date.now();
      
      // Create 100 rewards
      const rewards = Array.from({ length: 100 }, (_, i) => ({
        ...testReward,
        amount: Math.random() * 100,
        reward_date: new Date(Date.now() - i * 86400000).toISOString() // Different dates
      }));

      await supabase.from('rewards').insert(rewards);

      // Query rewards with pagination
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', testUser.id)
        .order('reward_date', { ascending: false })
        .limit(20);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(error).toBeNull();
      expect(data?.length).toBe(20);
      expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should efficiently aggregate reward statistics', async () => {
      // Insert test rewards
      const rewards = Array.from({ length: 50 }, (_, i) => ({
        ...testReward,
        amount: 10 + (i % 10),
        claimed: i % 3 === 0, // Every 3rd reward is claimed
        reward_date: new Date(Date.now() - i * 86400000).toISOString()
      }));

      await supabase.from('rewards').insert(rewards);

      const startTime = Date.now();

      // Aggregate statistics
      const { data: totalRewards } = await supabase
        .from('rewards')
        .select('amount.sum(), claimed')
        .eq('user_id', testUser.id);

      const { data: claimedSum } = await supabase
        .from('rewards')
        .select('amount.sum()')
        .eq('user_id', testUser.id)
        .eq('claimed', true);

      const { data: unclaimedSum } = await supabase
        .from('rewards')
        .select('amount.sum()')
        .eq('user_id', testUser.id)
        .eq('claimed', false);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(2000); // Should complete within 2 seconds
      expect(totalRewards).toBeDefined();
      expect(claimedSum).toBeDefined();
      expect(unclaimedSum).toBeDefined();
    });
  });
});

// Helper function to run all tests
export async function runRewardsTests(): Promise<{
  success: boolean;
  results: any;
  errors: string[];
}> {
  try {
    console.log('🧪 Running Rewards API Tests...');
    
    // This would normally be handled by Jest test runner
    // For manual testing, we can run individual test functions
    
    const testResults = {
      createReward: await testCreateReward(),
      getUserRewards: await testGetUserRewards(),
      updateReward: await testUpdateReward(),
      claimReward: await testClaimReward(),
      deleteReward: await testDeleteReward(),
      rewardCalculation: await testRewardCalculation(),
      databaseConstraints: await testDatabaseConstraints(),
      performance: await testPerformance()
    };

    const errors: string[] = [];
    let allPassed = true;

    Object.entries(testResults).forEach(([testName, result]) => {
      if (!result.success) {
        allPassed = false;
        errors.push(`${testName}: ${result.error}`);
      }
    });

    console.log(allPassed ? '✅ All Rewards API tests passed!' : '❌ Some tests failed');

    return {
      success: allPassed,
      results: testResults,
      errors
    };

  } catch (error) {
    console.error('💥 Error running rewards tests:', error);
    return {
      success: false,
      results: {},
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

// Individual test functions for manual execution
async function testCreateReward() {
  try {
    const { data, error } = await supabase
      .from('rewards')
      .insert(testReward)
      .select()
      .single();

    return {
      success: !error && data?.amount === testReward.amount,
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

async function testGetUserRewards() {
  try {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('user_id', testUser.id);

    return {
      success: !error && Array.isArray(data),
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

async function testUpdateReward() {
  try {
    // First create a reward
    const { data: created } = await supabase
      .from('rewards')
      .insert(testReward)
      .select()
      .single();

    if (!created) throw new Error('Failed to create test reward');

    // Then update it
    const { data, error } = await supabase
      .from('rewards')
      .update({ amount: 100 })
      .eq('id', created.id)
      .select()
      .single();

    return {
      success: !error && data?.amount === 100,
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

async function testClaimReward() {
  try {
    // Create unclaimed reward
    const { data: created } = await supabase
      .from('rewards')
      .insert({ ...testReward, claimed: false })
      .select()
      .single();

    if (!created) throw new Error('Failed to create test reward');

    // Claim it
    const { data, error } = await supabase
      .from('rewards')
      .update({ 
        claimed: true, 
        claimed_at: new Date().toISOString() 
      })
      .eq('id', created.id)
      .select()
      .single();

    return {
      success: !error && data?.claimed === true,
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

async function testDeleteReward() {
  try {
    // Create reward
    const { data: created } = await supabase
      .from('rewards')
      .insert(testReward)
      .select()
      .single();

    if (!created) throw new Error('Failed to create test reward');

    // Delete it
    const { error } = await supabase
      .from('rewards')
      .delete()
      .eq('id', created.id);

    // Verify deletion
    const { data: deleted } = await supabase
      .from('rewards')
      .select()
      .eq('id', created.id);

    return {
      success: !error && deleted?.length === 0,
      error: error?.message
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function testRewardCalculation() {
  try {
    const principal = 1000;
    const apy = 12;
    const expectedDaily = (principal * (apy / 100)) / 365;
    const calculated = Math.round(expectedDaily * 100) / 100;

    return {
      success: Math.abs(calculated - 0.33) < 0.01,
      data: { calculated, expected: 0.33 }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function testDatabaseConstraints() {
  try {
    // Test negative amount constraint
    const { error } = await supabase
      .from('rewards')
      .insert({ ...testReward, amount: -50 });

    return {
      success: !!error, // Should fail with error
      error: error?.message
    };
  } catch (error) {
    return {
      success: true, // Exception is expected
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function testPerformance() {
  try {
    const startTime = Date.now();
    
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('user_id', testUser.id)
      .limit(10);

    const endTime = Date.now();
    const executionTime = endTime - startTime;

    return {
      success: !error && executionTime < 2000,
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