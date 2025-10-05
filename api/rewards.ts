import { Request, Response } from 'express';
import { supabase } from '../src/lib/supabase';
import { calculateStakeRewards } from '../src/utils/stakeCalculations';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
      };
    }
  }
}

// Reward interfaces
interface CreateRewardRequest {
  stake_id: string;
  amount: number;
  reward_type?: 'staking' | 'compound' | 'bonus' | 'referral' | 'loyalty';
  calculation_method?: 'daily' | 'weekly' | 'monthly' | 'compound';
  apy_at_calculation?: number;
  compound_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  transaction_hash?: string;
  metadata?: Record<string, any>;
}

interface UpdateRewardRequest {
  amount?: number;
  claimed?: boolean;
  claim_date?: string;
  transaction_hash?: string;
  metadata?: Record<string, any>;
}

interface RewardValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate reward data
 */
function validateRewardData(data: CreateRewardRequest): RewardValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields validation
  if (!data.stake_id) errors.push('Stake ID is required');
  if (!data.amount || data.amount <= 0) errors.push('Amount must be greater than 0');

  // Amount validation
  if (data.amount < 0.000001) {
    errors.push('Minimum reward amount is 0.000001');
  }

  if (data.amount > 100000) {
    warnings.push('Large reward amount detected. Please verify the amount.');
  }

  // Type validation
  const validRewardTypes = ['staking', 'compound', 'bonus', 'referral', 'loyalty'];
  if (data.reward_type && !validRewardTypes.includes(data.reward_type)) {
    errors.push('Invalid reward type');
  }

  const validCalculationMethods = ['daily', 'weekly', 'monthly', 'compound'];
  if (data.calculation_method && !validCalculationMethods.includes(data.calculation_method)) {
    errors.push('Invalid calculation method');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Create a new reward
 */
export async function createReward(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const rewardData: CreateRewardRequest = req.body;

    // Validate input data
    const validation = validateRewardData(rewardData);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors,
        warnings: validation.warnings
      });
    }

    // Get stake information and verify ownership
    const { data: stake, error: stakeError } = await supabase
      .from('stakes')
      .select(`
        *,
        protocols (
          id,
          name,
          apy,
          risk_level
        )
      `)
      .eq('id', rewardData.stake_id)
      .eq('user_id', userId)
      .single();

    if (stakeError || !stake) {
      return res.status(404).json({
        error: 'Stake not found',
        message: 'The specified stake does not exist or you do not have permission to access it'
      });
    }

    // Get protocol_id from stake
    const protocol = stake.protocols as any;
    const protocol_id = protocol?.id;

    // Create reward record
    const { data: reward, error: dbError } = await supabase
      .from('rewards')
      .insert({
        user_id: userId,
        stake_id: rewardData.stake_id,
        protocol_id: protocol_id,
        amount: rewardData.amount,
        reward_type: rewardData.reward_type || 'staking',
        calculation_method: rewardData.calculation_method || 'daily',
        apy_at_calculation: rewardData.apy_at_calculation || protocol?.apy,
        compound_frequency: rewardData.compound_frequency || 'daily',
        transaction_hash: rewardData.transaction_hash,
        metadata: rewardData.metadata || {},
        claimed: false,
        reward_date: new Date().toISOString()
      })
      .select(`
        *,
        stakes (
          amount,
          lock_period,
          protocols (
            name,
            apy
          )
        )
      `)
      .single();

    if (dbError) {
      console.error('Database error creating reward:', dbError);
      return res.status(500).json({
        error: 'Failed to create reward',
        message: 'Database error occurred while creating the reward'
      });
    }

    res.status(201).json({
      success: true,
      data: reward,
      message: 'Reward created successfully'
    });

  } catch (error) {
    console.error('Error creating reward:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while creating the reward'
    });
  }
}

/**
 * Update an existing reward
 */
export async function updateReward(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const updateData: UpdateRewardRequest = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Reward ID is required' });
    }

    // Verify reward ownership
    const { data: existingReward, error: fetchError } = await supabase
      .from('rewards')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingReward) {
      return res.status(404).json({
        error: 'Reward not found',
        message: 'The specified reward does not exist or you do not have permission to access it'
      });
    }

    // Prepare update data
    const updateFields: any = {};
    
    if (updateData.amount !== undefined) {
      if (updateData.amount <= 0) {
        return res.status(400).json({ error: 'Amount must be greater than 0' });
      }
      updateFields.amount = updateData.amount;
    }

    if (updateData.claimed !== undefined) {
      updateFields.claimed = updateData.claimed;
      if (updateData.claimed && !existingReward.claimed) {
        updateFields.claim_date = new Date().toISOString();
      } else if (!updateData.claimed) {
        updateFields.claim_date = null;
      }
    }

    if (updateData.claim_date !== undefined) {
      updateFields.claim_date = updateData.claim_date;
    }

    if (updateData.transaction_hash !== undefined) {
      updateFields.transaction_hash = updateData.transaction_hash;
    }

    if (updateData.metadata !== undefined) {
      updateFields.metadata = updateData.metadata;
    }

    // Update reward
    const { data: updatedReward, error: updateError } = await supabase
      .from('rewards')
      .update(updateFields)
      .eq('id', id)
      .eq('user_id', userId)
      .select(`
        *,
        stakes (
          amount,
          lock_period,
          protocols (
            name,
            apy
          )
        )
      `)
      .single();

    if (updateError) {
      console.error('Database error updating reward:', updateError);
      return res.status(500).json({
        error: 'Failed to update reward',
        message: 'Database error occurred while updating the reward'
      });
    }

    res.json({
      success: true,
      data: updatedReward,
      message: 'Reward updated successfully'
    });

  } catch (error) {
    console.error('Error updating reward:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while updating the reward'
    });
  }
}

/**
 * Delete a reward
 */
export async function deleteReward(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Reward ID is required' });
    }

    // Verify reward ownership and check if it's claimed
    const { data: existingReward, error: fetchError } = await supabase
      .from('rewards')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingReward) {
      return res.status(404).json({
        error: 'Reward not found',
        message: 'The specified reward does not exist or you do not have permission to access it'
      });
    }

    // Prevent deletion of claimed rewards
    if (existingReward.claimed) {
      return res.status(400).json({
        error: 'Cannot delete claimed reward',
        message: 'Claimed rewards cannot be deleted for audit purposes'
      });
    }

    // Delete reward
    const { error: deleteError } = await supabase
      .from('rewards')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Database error deleting reward:', deleteError);
      return res.status(500).json({
        error: 'Failed to delete reward',
        message: 'Database error occurred while deleting the reward'
      });
    }

    res.json({
      success: true,
      message: 'Reward deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting reward:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while deleting the reward'
    });
  }
}

/**
 * Get rewards for the authenticated user
 */
export async function getRewardsByUser(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Parse query parameters
    const {
      page = '1',
      limit = '20',
      stake_id,
      protocol_id,
      reward_type,
      claimed,
      sort_by = 'reward_date',
      sort_order = 'desc'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const offset = (pageNum - 1) * limitNum;

    // Build query
    let query = supabase
      .from('rewards')
      .select(`
        *,
        stakes (
          id,
          amount,
          lock_period,
          start_date,
          end_date,
          status,
          protocols (
            id,
            name,
            apy,
            risk_level
          )
        )
      `, { count: 'exact' })
      .eq('user_id', userId);

    // Apply filters
    if (stake_id) {
      query = query.eq('stake_id', stake_id);
    }

    if (protocol_id) {
      query = query.eq('protocol_id', protocol_id);
    }

    if (reward_type) {
      query = query.eq('reward_type', reward_type);
    }

    if (claimed !== undefined) {
      query = query.eq('claimed', claimed === 'true');
    }

    // Apply sorting
    const validSortFields = ['reward_date', 'amount', 'created_at', 'claim_date'];
    const sortField = validSortFields.includes(sort_by as string) ? sort_by as string : 'reward_date';
    const sortDirection = sort_order === 'asc' ? false : true;

    query = query.order(sortField, { ascending: !sortDirection });

    // Apply pagination
    query = query.range(offset, offset + limitNum - 1);

    const { data: rewards, error: dbError, count } = await query;

    if (dbError) {
      console.error('Database error fetching rewards:', dbError);
      return res.status(500).json({
        error: 'Failed to fetch rewards',
        message: 'Database error occurred while fetching rewards'
      });
    }

    // Calculate summary statistics
    const { data: summaryData } = await supabase
      .from('rewards')
      .select('amount, claimed, reward_type')
      .eq('user_id', userId);

    const summary = {
      total_rewards: summaryData?.length || 0,
      total_amount: summaryData?.reduce((sum, r) => sum + parseFloat(r.amount.toString()), 0) || 0,
      claimed_amount: summaryData?.filter(r => r.claimed).reduce((sum, r) => sum + parseFloat(r.amount.toString()), 0) || 0,
      unclaimed_amount: summaryData?.filter(r => !r.claimed).reduce((sum, r) => sum + parseFloat(r.amount.toString()), 0) || 0,
      by_type: summaryData?.reduce((acc, r) => {
        acc[r.reward_type] = (acc[r.reward_type] || 0) + parseFloat(r.amount.toString());
        return acc;
      }, {} as Record<string, number>) || {}
    };

    res.json({
      success: true,
      data: rewards || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        pages: Math.ceil((count || 0) / limitNum)
      },
      summary,
      message: 'Rewards fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while fetching rewards'
    });
  }
}

/**
 * Get reward by ID
 */
export async function getRewardById(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Reward ID is required' });
    }

    const { data: reward, error: dbError } = await supabase
      .from('rewards')
      .select(`
        *,
        stakes (
          id,
          amount,
          lock_period,
          start_date,
          end_date,
          status,
          protocols (
            id,
            name,
            apy,
            risk_level,
            description
          )
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (dbError || !reward) {
      return res.status(404).json({
        error: 'Reward not found',
        message: 'The specified reward does not exist or you do not have permission to access it'
      });
    }

    res.json({
      success: true,
      data: reward,
      message: 'Reward fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching reward:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while fetching the reward'
    });
  }
}

/**
 * Claim a reward
 */
export async function claimReward(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const { transaction_hash } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Reward ID is required' });
    }

    // Verify reward ownership and check if it's already claimed
    const { data: existingReward, error: fetchError } = await supabase
      .from('rewards')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingReward) {
      return res.status(404).json({
        error: 'Reward not found',
        message: 'The specified reward does not exist or you do not have permission to access it'
      });
    }

    if (existingReward.claimed) {
      return res.status(400).json({
        error: 'Reward already claimed',
        message: 'This reward has already been claimed'
      });
    }

    // Update reward as claimed
    const { data: claimedReward, error: updateError } = await supabase
      .from('rewards')
      .update({
        claimed: true,
        claim_date: new Date().toISOString(),
        transaction_hash: transaction_hash || null
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select(`
        *,
        stakes (
          amount,
          lock_period,
          protocols (
            name,
            apy
          )
        )
      `)
      .single();

    if (updateError) {
      console.error('Database error claiming reward:', updateError);
      return res.status(500).json({
        error: 'Failed to claim reward',
        message: 'Database error occurred while claiming the reward'
      });
    }

    res.json({
      success: true,
      data: claimedReward,
      message: 'Reward claimed successfully'
    });

  } catch (error) {
    console.error('Error claiming reward:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while claiming the reward'
    });
  }
}