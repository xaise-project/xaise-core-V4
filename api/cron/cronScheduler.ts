import { Request, Response } from 'express';
import cron from 'node-cron';
import { runRewardCalculationCron } from './rewardCalculator';
import { 
  calculateDailyStatistics, 
  calculateWeeklyStatistics, 
  calculateMonthlyStatistics 
} from './statisticsCalculator';
import { 
  createDailyPortfolioSnapshots,
  cleanupOldPortfolioSnapshots 
} from './portfolioSnapshots';

// Cron job status tracking
interface CronJobStatus {
  isRunning: boolean;
  lastRun: Date | null;
  nextRun: Date | null;
  status: 'idle' | 'running' | 'error';
  lastError?: string;
}

let cronJobStatus: CronJobStatus = {
  isRunning: false,
  lastRun: null,
  nextRun: null,
  status: 'idle'
};

let rewardCalculationTask: cron.ScheduledTask | null = null;
let dailyStatsTask: cron.ScheduledTask | null = null;
let weeklyStatsTask: cron.ScheduledTask | null = null;
let monthlyStatsTask: cron.ScheduledTask | null = null;

/**
 * Manual trigger for reward calculation cron job
 */
export async function triggerRewardCalculation(req: Request, res: Response): Promise<void> {
  try {
    if (cronJobStatus.isRunning) {
      res.status(409).json({
        success: false,
        message: 'Reward calculation is already running',
        status: cronJobStatus
      });
      return;
    }

    cronJobStatus.isRunning = true;
    cronJobStatus.status = 'running';
    cronJobStatus.lastError = undefined;

    console.log('🚀 Manual reward calculation triggered');
    
    const result = await runRewardCalculationCron();
    
    cronJobStatus.isRunning = false;
    cronJobStatus.lastRun = new Date();
    cronJobStatus.status = result.success ? 'idle' : 'error';
    
    if (!result.success && result.summary) {
      const totalErrors = result.summary.dailyRewards.errors.length +
                         result.summary.compoundRewards.errors.length +
                         result.summary.statusUpdates.errors.length;
      cronJobStatus.lastError = `${totalErrors} errors occurred during reward calculation`;
      console.error('❌ Scheduled reward calculation failed');
    } else {
      console.log('✅ Scheduled reward calculation completed successfully');
    }

    res.json({
      success: true,
      message: 'Reward calculation completed',
      result,
      status: cronJobStatus
    });

  } catch (error) {
    cronJobStatus.isRunning = false;
    cronJobStatus.status = 'error';
    cronJobStatus.lastError = error instanceof Error ? error.message : 'Unknown error';

    console.error('❌ Error in manual reward calculation:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to run reward calculation',
      error: error instanceof Error ? error.message : 'Unknown error',
      status: cronJobStatus
    });
  }
}

/**
 * Manual trigger for daily statistics calculation
 */
export async function triggerDailyStatistics(req: Request, res: Response): Promise<void> {
  try {
    console.log('📊 Manual daily statistics calculation triggered');
    
    const result = await calculateDailyStatistics();
    
    res.json({
      success: true,
      message: 'Daily statistics calculation completed',
      result
    });

  } catch (error) {
    console.error('❌ Error in manual daily statistics calculation:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to run daily statistics calculation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Manual trigger for weekly statistics calculation
 */
export async function triggerWeeklyStatistics(req: Request, res: Response): Promise<void> {
  try {
    console.log('📊 Manual weekly statistics calculation triggered');
    
    const result = await calculateWeeklyStatistics();
    
    res.json({
      success: true,
      message: 'Weekly statistics calculation completed',
      result
    });

  } catch (error) {
    console.error('❌ Error in manual weekly statistics calculation:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to run weekly statistics calculation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Manual trigger for monthly statistics calculation
 */
export async function triggerMonthlyStatistics(req: Request, res: Response): Promise<void> {
  try {
    console.log('📊 Manual monthly statistics calculation triggered');
    
    const result = await calculateMonthlyStatistics();
    
    res.json({
      success: true,
      message: 'Monthly statistics calculation completed',
      result
    });

  } catch (error) {
    console.error('❌ Error in manual monthly statistics calculation:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to run monthly statistics calculation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get current cron job status
 */
export async function getCronStatus(req: Request, res: Response): Promise<void> {
  try {
    // Calculate next scheduled run if not set
    if (!cronJobStatus.nextRun) {
      const tomorrow = new Date();
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      tomorrow.setUTCHours(0, 0, 0, 0);
      cronJobStatus.nextRun = tomorrow;
    }

    res.json({
      success: true,
      status: cronJobStatus,
      scheduledTasks: {
        rewardCalculation: {
          schedule: '0 0 * * *', // Daily at midnight UTC
          description: 'Daily reward calculation and compound processing',
          isActive: rewardCalculationTask?.running || false
        },
        dailyStatistics: {
          schedule: '0 1 * * *', // Daily at 1 AM UTC
          description: 'Daily statistics calculation',
          isActive: dailyStatsTask?.running || false
        },
        weeklyStatistics: {
          schedule: '0 2 * * 0', // Weekly on Sunday at 2 AM UTC
          description: 'Weekly statistics calculation',
          isActive: weeklyStatsTask?.running || false
        },
        monthlyStatistics: {
          schedule: '0 3 1 * *', // Monthly on 1st at 3 AM UTC
          description: 'Monthly statistics calculation',
          isActive: monthlyStatsTask?.running || false
        }
      }
    });

  } catch (error) {
    console.error('❌ Error getting cron status:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to get cron status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Scheduled reward calculation function (runs daily at midnight UTC)
 */
export async function scheduledRewardCalculation(): Promise<void> {
  try {
    if (cronJobStatus.isRunning) {
      console.log('⏭️  Skipping scheduled reward calculation - already running');
      return;
    }

    cronJobStatus.isRunning = true;
    cronJobStatus.status = 'running';
    cronJobStatus.lastError = undefined;

    console.log('⏰ Scheduled reward calculation started');
    
    const result = await runRewardCalculationCron();
    
    cronJobStatus.isRunning = false;
    cronJobStatus.lastRun = new Date();
    cronJobStatus.status = result.success ? 'idle' : 'error';
    
    if (!result.success && result.summary) {
      const totalErrors = result.summary.dailyRewards.errors.length +
                         result.summary.compoundRewards.errors.length +
                         result.summary.statusUpdates.errors.length;
      cronJobStatus.lastError = `${totalErrors} errors occurred during reward calculation`;
      console.error('❌ Scheduled reward calculation failed');
    } else {
      console.log('✅ Scheduled reward calculation completed successfully');
    }

    // Set next run time
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    cronJobStatus.nextRun = tomorrow;

  } catch (error) {
    cronJobStatus.isRunning = false;
    cronJobStatus.status = 'error';
    cronJobStatus.lastError = error instanceof Error ? error.message : 'Unknown error';
    
    console.error('💥 Fatal error in scheduled reward calculation:', error);
  }
}

/**
 * Scheduled daily statistics calculation function
 */
async function scheduledDailyStatistics(): Promise<void> {
  try {
    console.log('⏰ Scheduled daily statistics calculation started');
    
    // Calculate daily statistics
    const statsResult = await calculateDailyStatistics();
    
    if (!statsResult.success) {
      console.error('❌ Scheduled daily statistics calculation failed:', statsResult.errors);
    } else {
      console.log('✅ Scheduled daily statistics calculation completed successfully');
    }

    // Create daily portfolio snapshots
    console.log('📸 Creating daily portfolio snapshots...');
    const snapshotsResult = await createDailyPortfolioSnapshots();
    
    if (!snapshotsResult.success) {
      console.error('❌ Daily portfolio snapshots creation failed:', snapshotsResult.errors);
    } else {
      console.log('✅ Daily portfolio snapshots creation completed successfully');
    }

  } catch (error) {
    console.error('💥 Fatal error in scheduled daily statistics calculation:', error);
  }
}

/**
 * Scheduled weekly statistics calculation function
 */
async function scheduledWeeklyStatistics(): Promise<void> {
  try {
    console.log('⏰ Scheduled weekly statistics calculation started');
    
    const result = await calculateWeeklyStatistics();
    
    if (!result.success) {
      console.error('❌ Scheduled weekly statistics calculation failed:', result.errors);
    } else {
      console.log('✅ Scheduled weekly statistics calculation completed successfully');
    }

  } catch (error) {
    console.error('💥 Fatal error in scheduled weekly statistics calculation:', error);
  }
}

/**
 * Scheduled monthly statistics calculation function
 */
async function scheduledMonthlyStatistics(): Promise<void> {
  try {
    console.log('⏰ Scheduled monthly statistics calculation started');
    
    const result = await calculateMonthlyStatistics();
    
    if (!result.success) {
      console.error('❌ Scheduled monthly statistics calculation failed:', result.errors);
    } else {
      console.log('✅ Scheduled monthly statistics calculation completed successfully');
    }

    // Cleanup old portfolio snapshots (monthly maintenance)
    console.log('🧹 Running monthly cleanup of old portfolio snapshots...');
    const cleanupResult = await cleanupOldPortfolioSnapshots();
    
    if (!cleanupResult.success) {
      console.error('❌ Portfolio snapshots cleanup failed:', cleanupResult.error);
    } else {
      console.log(`✅ Portfolio snapshots cleanup completed. Deleted ${cleanupResult.deleted} old snapshots`);
    }

  } catch (error) {
    console.error('💥 Fatal error in scheduled monthly statistics calculation:', error);
  }
}

/**
 * Initialize the cron scheduler
 */
export function initializeCronScheduler(): void {
  try {
    console.log('🚀 Initializing cron scheduler...');

    // Schedule daily reward calculation at midnight UTC
    rewardCalculationTask = cron.schedule('0 0 * * *', scheduledRewardCalculation, {
      timezone: 'UTC'
    });

    // Schedule daily statistics calculation at 1 AM UTC
    dailyStatsTask = cron.schedule('0 1 * * *', scheduledDailyStatistics, {
      timezone: 'UTC'
    });

    // Schedule weekly statistics calculation on Sunday at 2 AM UTC
    weeklyStatsTask = cron.schedule('0 2 * * 0', scheduledWeeklyStatistics, {
      timezone: 'UTC'
    });

    // Schedule monthly statistics calculation on 1st of month at 3 AM UTC
    monthlyStatsTask = cron.schedule('0 3 1 * *', scheduledMonthlyStatistics, {
      timezone: 'UTC'
    });

    // Set initial next run time
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    cronJobStatus.nextRun = tomorrow;

    console.log('✅ Cron scheduler initialized successfully');
    console.log(`📅 Next scheduled run: ${cronJobStatus.nextRun?.toISOString()}`);

  } catch (error) {
    console.error('❌ Failed to initialize cron scheduler:', error);
    cronJobStatus.status = 'error';
    cronJobStatus.lastError = error instanceof Error ? error.message : 'Unknown error';
  }
}

/**
 * Health check for cron system
 */
export async function cronHealthCheck(req: Request, res: Response) {
  try {
    const now = new Date();
    const lastRunAge = cronJobStatus.lastRun ? now.getTime() - cronJobStatus.lastRun.getTime() : null;
    const lastRunHours = lastRunAge ? Math.floor(lastRunAge / (1000 * 60 * 60)) : null;

    // Health status
    const isHealthy = !cronJobStatus.isRunning && 
                     (lastRunHours === null || lastRunHours < 25); // Should run daily

    const healthStatus = {
      healthy: isHealthy,
      status: cronJobStatus.isRunning ? 'running' : 'idle',
      lastRun: cronJobStatus.lastRun,
      lastRunHoursAgo: lastRunHours,
      nextScheduledRun: cronJobStatus.nextRun,
      lastError: cronJobStatus.lastError
    };

    res.json({
      success: true,
      data: healthStatus
    });

  } catch (error) {
    console.error('❌ Cron health check error:', error);
    
    res.status(500).json({
      error: 'Failed to check cron health',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Export cron status for monitoring
export { cronJobStatus as cronStatus };