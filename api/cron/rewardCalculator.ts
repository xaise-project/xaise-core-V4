import { supabase } from '../../src/lib/supabase';
import { calculateStakeRewards } from '../../src/utils/stakeCalculations';

// Interfaces for cron job
interface StakeForReward {
  id: string;
  user_id: string;
  protocol_id: string;
  amount: number;
  start_date: string;
  end_date: string;
  lock_period: number;
  status: 'active' | 'completed' | 'withdrawn';
  protocols: {
    id: string;
    name: string;
    apy: number;
  };
}

interface RewardCalculationResult {
  stake_id: string;
  user_id: string;
  protocol_id: string;
  amount: number;
  reward_type: 'staking' | 'compound';
  calculation_method: 'daily' | 'weekly' | 'monthly';
  apy_at_calculation: number;
  compound_frequency: 'daily' | 'weekly' | 'monthly';
  metadata: any;
}

/**
 * Calculate daily rewards for all active stakes
 */
export async function calculateDailyRewards(): Promise<{
  success: boolean;
  processed: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let processed = 0;

  try {
    console.log('🔄 Starting daily reward calculation...');

    // Get all active stakes that haven't been processed today
    const today = new Date().toISOString().split('T')[0];
    
    const { data: stakes, error: stakesError } = await supabase
      .from('stakes')
      .select(`
        id,
        user_id,
        protocol_id,
        amount,
        start_date,
        end_date,
        lock_period,
        status,
        protocols (
          id,
          name,
          apy
        )
      `)
      .eq('status', 'active')
      .lt('start_date', new Date().toISOString())
      .gt('end_date', new Date().toISOString());

    if (stakesError) {
      throw new Error(`Failed to fetch stakes: ${stakesError.message}`);
    }

    if (!stakes || stakes.length === 0) {
      console.log('✅ No active stakes found for reward calculation');
      return { success: true, processed: 0, errors: [] };
    }

    console.log(`📊 Found ${stakes.length} active stakes to process`);

    // Process each stake
    for (const stake of stakes as StakeForReward[]) {
      try {
        // Check if reward already calculated today
        const { data: existingReward } = await supabase
          .from('rewards')
          .select('id')
          .eq('stake_id', stake.id)
          .gte('reward_date', `${today}T00:00:00.000Z`)
          .lt('reward_date', `${today}T23:59:59.999Z`)
          .single();

        if (existingReward) {
          console.log(`⏭️  Reward already calculated today for stake ${stake.id}`);
          continue;
        }

        // Calculate daily reward
        const dailyReward = await calculateDailyRewardForStake(stake);
        
        if (dailyReward.amount > 0) {
          // Insert reward record
          const { error: insertError } = await supabase
            .from('rewards')
            .insert({
              stake_id: dailyReward.stake_id,
              user_id: dailyReward.user_id,
              protocol_id: dailyReward.protocol_id,
              amount: dailyReward.amount,
              reward_type: dailyReward.reward_type,
              calculation_method: dailyReward.calculation_method,
              apy_at_calculation: dailyReward.apy_at_calculation,
              compound_frequency: dailyReward.compound_frequency,
              metadata: dailyReward.metadata,
              claimed: false,
              reward_date: new Date().toISOString()
            });

          if (insertError) {
            errors.push(`Failed to insert reward for stake ${stake.id}: ${insertError.message}`);
            continue;
          }

          processed++;
          console.log(`✅ Calculated reward for stake ${stake.id}: ${dailyReward.amount} tokens`);
        }

      } catch (stakeError) {
        const errorMsg = `Error processing stake ${stake.id}: ${stakeError instanceof Error ? stakeError.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }

    console.log(`🎉 Daily reward calculation completed. Processed: ${processed}, Errors: ${errors.length}`);

    return {
      success: errors.length === 0,
      processed,
      errors
    };

  } catch (error) {
    const errorMsg = `Fatal error in daily reward calculation: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(`💥 ${errorMsg}`);
    return {
      success: false,
      processed,
      errors: [errorMsg, ...errors]
    };
  }
}

/**
 * Calculate daily reward for a single stake
 */
async function calculateDailyRewardForStake(stake: StakeForReward): Promise<RewardCalculationResult> {
  const protocol = stake.protocols;
  const stakeAmount = stake.amount;
  const apy = protocol.apy / 100; // Convert percentage to decimal
  
  // Calculate daily reward using compound interest formula
  const dailyRate = apy / 365; // Daily interest rate
  const dailyReward = stakeAmount * dailyRate;

  // Get current protocol data for metadata
  const startDate = new Date(stake.start_date);
  const endDate = new Date(stake.end_date);
  const now = new Date();
  const daysElapsed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const progress = (daysElapsed / totalDays) * 100;

  return {
    stake_id: stake.id,
    user_id: stake.user_id,
    protocol_id: stake.protocol_id,
    amount: Math.round(dailyReward * 1000000) / 1000000, // Round to 6 decimal places
    reward_type: 'staking',
    calculation_method: 'daily',
    apy_at_calculation: protocol.apy,
    compound_frequency: 'daily',
    metadata: {
      protocol_name: protocol.name,
      stake_amount: stakeAmount,
      daily_rate: dailyRate,
      days_elapsed: daysElapsed,
      total_days: totalDays,
      progress_percentage: Math.round(progress * 100) / 100,
      calculation_timestamp: new Date().toISOString()
    }
  };
}

/**
 * Calculate compound rewards for stakes that support compounding
 */
export async function calculateCompoundRewards(): Promise<{
  success: boolean;
  processed: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let processed = 0;

  try {
    console.log('🔄 Starting compound reward calculation...');

    // Get stakes that are eligible for compounding (weekly compounding)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data: stakes, error: stakesError } = await supabase
      .from('stakes')
      .select(`
        id,
        user_id,
        protocol_id,
        amount,
        start_date,
        end_date,
        lock_period,
        status,
        protocols (
          id,
          name,
          apy
        )
      `)
      .eq('status', 'active')
      .lt('start_date', oneWeekAgo.toISOString());

    if (stakesError) {
      throw new Error(`Failed to fetch stakes for compounding: ${stakesError.message}`);
    }

    if (!stakes || stakes.length === 0) {
      console.log('✅ No stakes found for compound reward calculation');
      return { success: true, processed: 0, errors: [] };
    }

    console.log(`📊 Found ${stakes.length} stakes eligible for compounding`);

    for (const stake of stakes as StakeForReward[]) {
      try {
        // Check if compound reward already calculated this week
        const { data: existingCompound } = await supabase
          .from('rewards')
          .select('id')
          .eq('stake_id', stake.id)
          .eq('reward_type', 'compound')
          .gte('reward_date', oneWeekAgo.toISOString())
          .single();

        if (existingCompound) {
          continue;
        }

        // Calculate total unclaimed rewards for this stake
        const { data: unclaimedRewards, error: rewardsError } = await supabase
          .from('rewards')
          .select('amount')
          .eq('stake_id', stake.id)
          .eq('claimed', false)
          .eq('reward_type', 'staking');

        if (rewardsError) {
          errors.push(`Failed to fetch unclaimed rewards for stake ${stake.id}: ${rewardsError.message}`);
          continue;
        }

        const totalUnclaimed = unclaimedRewards?.reduce((sum, reward) => sum + reward.amount, 0) || 0;

        if (totalUnclaimed > 0) {
          // Calculate compound reward (compound the unclaimed rewards)
          const protocol = stake.protocols;
          const weeklyCompoundRate = (protocol.apy / 100) / 52; // Weekly compound rate
          const compoundReward = totalUnclaimed * weeklyCompoundRate;

          // Insert compound reward
          const { error: insertError } = await supabase
            .from('rewards')
            .insert({
              stake_id: stake.id,
              user_id: stake.user_id,
              protocol_id: stake.protocol_id,
              amount: Math.round(compoundReward * 1000000) / 1000000,
              reward_type: 'compound',
              calculation_method: 'weekly',
              apy_at_calculation: protocol.apy,
              compound_frequency: 'weekly',
              metadata: {
                protocol_name: protocol.name,
                base_unclaimed_amount: totalUnclaimed,
                compound_rate: weeklyCompoundRate,
                calculation_timestamp: new Date().toISOString()
              },
              claimed: false,
              reward_date: new Date().toISOString()
            });

          if (insertError) {
            errors.push(`Failed to insert compound reward for stake ${stake.id}: ${insertError.message}`);
            continue;
          }

          processed++;
          console.log(`✅ Calculated compound reward for stake ${stake.id}: ${compoundReward} tokens`);
        }

      } catch (stakeError) {
        const errorMsg = `Error processing compound for stake ${stake.id}: ${stakeError instanceof Error ? stakeError.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }

    console.log(`🎉 Compound reward calculation completed. Processed: ${processed}, Errors: ${errors.length}`);

    return {
      success: errors.length === 0,
      processed,
      errors
    };

  } catch (error) {
    const errorMsg = `Fatal error in compound reward calculation: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(`💥 ${errorMsg}`);
    return {
      success: false,
      processed,
      errors: [errorMsg, ...errors]
    };
  }
}

/**
 * Update stake status based on end dates
 */
export async function updateStakeStatuses(): Promise<{
  success: boolean;
  updated: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let updated = 0;

  try {
    console.log('🔄 Updating stake statuses...');

    // Update stakes that have reached their end date
    const { data: expiredStakes, error: updateError } = await supabase
      .from('stakes')
      .update({ status: 'completed' })
      .eq('status', 'active')
      .lt('end_date', new Date().toISOString())
      .select('id');

    if (updateError) {
      throw new Error(`Failed to update expired stakes: ${updateError.message}`);
    }

    updated = expiredStakes?.length || 0;
    console.log(`✅ Updated ${updated} stakes to completed status`);

    return {
      success: true,
      updated,
      errors
    };

  } catch (error) {
    const errorMsg = `Error updating stake statuses: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(`❌ ${errorMsg}`);
    return {
      success: false,
      updated,
      errors: [errorMsg]
    };
  }
}

/**
 * Main cron job function - runs all reward calculations
 */
export async function runRewardCalculationCron(): Promise<{
  success: boolean;
  summary: {
    dailyRewards: { processed: number; errors: string[] };
    compoundRewards: { processed: number; errors: string[] };
    statusUpdates: { updated: number; errors: string[] };
  };
}> {
  console.log('🚀 Starting reward calculation cron job...');
  const startTime = Date.now();

  try {
    // Run all calculations
    const [dailyResult, compoundResult, statusResult] = await Promise.all([
      calculateDailyRewards(),
      calculateCompoundRewards(),
      updateStakeStatuses()
    ]);

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`⏱️  Cron job completed in ${duration}ms`);
    console.log(`📊 Summary: Daily: ${dailyResult.processed}, Compound: ${compoundResult.processed}, Status Updates: ${statusResult.updated}`);

    const allErrors = [
      ...dailyResult.errors,
      ...compoundResult.errors,
      ...statusResult.errors
    ];

    return {
      success: allErrors.length === 0,
      summary: {
        dailyRewards: {
          processed: dailyResult.processed,
          errors: dailyResult.errors
        },
        compoundRewards: {
          processed: compoundResult.processed,
          errors: compoundResult.errors
        },
        statusUpdates: {
          updated: statusResult.updated,
          errors: statusResult.errors
        }
      }
    };

  } catch (error) {
    const errorMsg = `Fatal error in cron job: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(`💥 ${errorMsg}`);
    
    return {
      success: false,
      summary: {
        dailyRewards: { processed: 0, errors: [errorMsg] },
        compoundRewards: { processed: 0, errors: [] },
        statusUpdates: { updated: 0, errors: [] }
      }
    };
  }
}