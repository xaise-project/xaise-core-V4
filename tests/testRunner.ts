import { runRewardsTests } from './api/rewards.test';
import { runStatisticsTests } from './api/statistics.test';
import { runCronJobTests } from './cron/cronJobs.test';
import { runFullSystemTests } from './integration/fullSystem.test';

// Test configuration
interface TestConfig {
  runRewardsTests: boolean;
  runStatisticsTests: boolean;
  runCronJobTests: boolean;
  runIntegrationTests: boolean;
  verbose: boolean;
}

const defaultConfig: TestConfig = {
  runRewardsTests: true,
  runStatisticsTests: true,
  runCronJobTests: true,
  runIntegrationTests: true,
  verbose: true
};

// Test results interface
interface TestResults {
  rewards?: any;
  statistics?: any;
  cronJobs?: any;
  integration?: any;
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    executionTime: number;
    success: boolean;
  };
  errors: string[];
}

/**
 * Main test runner function
 * Executes all test suites and provides comprehensive reporting
 */
export async function runAllTests(config: Partial<TestConfig> = {}): Promise<TestResults> {
  const testConfig = { ...defaultConfig, ...config };
  const startTime = Date.now();
  
  console.log('🧪 Starting comprehensive test suite...');
  console.log('=====================================');
  
  const results: TestResults = {
    summary: {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      executionTime: 0,
      success: false
    },
    errors: []
  };

  try {
    // Run Rewards API Tests
    if (testConfig.runRewardsTests) {
      console.log('\n🎯 Running Rewards API Tests...');
      console.log('--------------------------------');
      
      try {
        const rewardsResults = await runRewardsTests();
        results.rewards = rewardsResults;
        
        if (rewardsResults.success) {
          console.log('✅ Rewards API Tests: PASSED');
          results.summary.passedTests++;
        } else {
          console.log('❌ Rewards API Tests: FAILED');
          results.summary.failedTests++;
          results.errors.push(...rewardsResults.errors);
        }
        results.summary.totalTests++;
        
        if (testConfig.verbose) {
          console.log(`   - Test Results: ${JSON.stringify(rewardsResults.results, null, 2)}`);
        }
      } catch (error) {
        console.log('💥 Rewards API Tests: ERROR');
        results.summary.failedTests++;
        results.summary.totalTests++;
        results.errors.push(`Rewards Tests: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Run Statistics API Tests
    if (testConfig.runStatisticsTests) {
      console.log('\n📊 Running Statistics API Tests...');
      console.log('-----------------------------------');
      
      try {
        const statisticsResults = await runStatisticsTests();
        results.statistics = statisticsResults;
        
        if (statisticsResults.success) {
          console.log('✅ Statistics API Tests: PASSED');
          results.summary.passedTests++;
        } else {
          console.log('❌ Statistics API Tests: FAILED');
          results.summary.failedTests++;
          results.errors.push(...statisticsResults.errors);
        }
        results.summary.totalTests++;
        
        if (testConfig.verbose) {
          console.log(`   - Test Results: ${JSON.stringify(statisticsResults.results, null, 2)}`);
        }
      } catch (error) {
        console.log('💥 Statistics API Tests: ERROR');
        results.summary.failedTests++;
        results.summary.totalTests++;
        results.errors.push(`Statistics Tests: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Run Cron Job Tests
    if (testConfig.runCronJobTests) {
      console.log('\n⚙️ Running Cron Job Tests...');
      console.log('-----------------------------');
      
      try {
        const cronJobResults = await runCronJobTests();
        results.cronJobs = cronJobResults;
        
        if (cronJobResults.success) {
          console.log('✅ Cron Job Tests: PASSED');
          results.summary.passedTests++;
        } else {
          console.log('❌ Cron Job Tests: FAILED');
          results.summary.failedTests++;
          results.errors.push(...cronJobResults.errors);
        }
        results.summary.totalTests++;
        
        if (testConfig.verbose) {
          console.log(`   - Test Results: ${JSON.stringify(cronJobResults.results, null, 2)}`);
        }
      } catch (error) {
        console.log('💥 Cron Job Tests: ERROR');
        results.summary.failedTests++;
        results.summary.totalTests++;
        results.errors.push(`Cron Job Tests: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Run Full System Integration Tests
    if (testConfig.runIntegrationTests) {
      console.log('\n🔗 Running Full System Integration Tests...');
      console.log('--------------------------------------------');
      
      try {
        const integrationResults = await runFullSystemTests();
        results.integration = integrationResults;
        
        if (integrationResults.success) {
          console.log('✅ Integration Tests: PASSED');
          results.summary.passedTests++;
        } else {
          console.log('❌ Integration Tests: FAILED');
          results.summary.failedTests++;
          results.errors.push(...integrationResults.errors);
        }
        results.summary.totalTests++;
        
        if (testConfig.verbose) {
          console.log(`   - Test Results: ${JSON.stringify(integrationResults.results, null, 2)}`);
        }
      } catch (error) {
        console.log('💥 Integration Tests: ERROR');
        results.summary.failedTests++;
        results.summary.totalTests++;
        results.errors.push(`Integration Tests: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Calculate final results
    const endTime = Date.now();
    results.summary.executionTime = endTime - startTime;
    results.summary.success = results.summary.failedTests === 0 && results.summary.totalTests > 0;

    // Print final summary
    console.log('\n🏁 Test Suite Summary');
    console.log('=====================');
    console.log(`Total Tests: ${results.summary.totalTests}`);
    console.log(`Passed: ${results.summary.passedTests}`);
    console.log(`Failed: ${results.summary.failedTests}`);
    console.log(`Execution Time: ${results.summary.executionTime}ms`);
    console.log(`Overall Result: ${results.summary.success ? '✅ SUCCESS' : '❌ FAILURE'}`);

    if (results.errors.length > 0) {
      console.log('\n❌ Error Details:');
      results.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    if (results.summary.success) {
      console.log('\n🎉 All tests passed! System is ready for deployment.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review and fix issues before deployment.');
    }

    return results;

  } catch (error) {
    console.error('💥 Critical error in test runner:', error);
    
    const endTime = Date.now();
    results.summary.executionTime = endTime - startTime;
    results.summary.success = false;
    results.errors.push(`Test Runner Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    return results;
  }
}

/**
 * Run specific test suite
 */
export async function runSpecificTests(testSuite: keyof TestConfig): Promise<any> {
  console.log(`🧪 Running ${testSuite} tests...`);
  
  try {
    switch (testSuite) {
      case 'runRewardsTests':
        return await runRewardsTests();
      case 'runStatisticsTests':
        return await runStatisticsTests();
      case 'runCronJobTests':
        return await runCronJobTests();
      case 'runIntegrationTests':
        return await runFullSystemTests();
      default:
        throw new Error(`Unknown test suite: ${testSuite}`);
    }
  } catch (error) {
    console.error(`💥 Error running ${testSuite}:`, error);
    return {
      success: false,
      results: {},
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

/**
 * Quick health check - runs minimal tests to verify system is working
 */
export async function runHealthCheck(): Promise<{
  success: boolean;
  checks: Record<string, boolean>;
  errors: string[];
}> {
  console.log('🏥 Running system health check...');
  
  const checks: Record<string, boolean> = {};
  const errors: string[] = [];

  try {
    // Test database connectivity
    console.log('   - Testing database connectivity...');
    try {
      const { supabase } = await import('../src/lib/supabase');
      const { data, error } = await supabase.from('protocols').select('*').limit(1);
      checks.database = !error;
      if (error) errors.push(`Database: ${error.message}`);
    } catch (error) {
      checks.database = false;
      errors.push(`Database: ${error instanceof Error ? error.message : 'Connection failed'}`);
    }

    // Test reward calculation
    console.log('   - Testing reward calculation...');
    try {
      const { calculateDailyRewards } = await import('../api/cron/rewardCalculator');
      const result = await calculateDailyRewards();
      checks.rewardCalculation = result.success;
      if (!result.success) errors.push(`Reward Calculation: ${result.errors?.join(', ')}`);
    } catch (error) {
      checks.rewardCalculation = false;
      errors.push(`Reward Calculation: ${error instanceof Error ? error.message : 'Failed'}`);
    }

    // Test statistics calculation
    console.log('   - Testing statistics calculation...');
    try {
      const { calculateDailyStatistics } = await import('../api/cron/statisticsCalculator');
      const result = await calculateDailyStatistics();
      checks.statisticsCalculation = result.success;
      if (!result.success) errors.push(`Statistics Calculation: ${result.errors?.join(', ')}`);
    } catch (error) {
      checks.statisticsCalculation = false;
      errors.push(`Statistics Calculation: ${error instanceof Error ? error.message : 'Failed'}`);
    }

    // Test portfolio snapshots
    console.log('   - Testing portfolio snapshots...');
    try {
      const { createDailyPortfolioSnapshots } = await import('../api/cron/portfolioSnapshots');
      const result = await createDailyPortfolioSnapshots();
      checks.portfolioSnapshots = result.success;
      if (!result.success) errors.push(`Portfolio Snapshots: ${result.errors?.join(', ')}`);
    } catch (error) {
      checks.portfolioSnapshots = false;
      errors.push(`Portfolio Snapshots: ${error instanceof Error ? error.message : 'Failed'}`);
    }

    const allPassed = Object.values(checks).every(check => check);
    
    console.log('\n🏥 Health Check Results:');
    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`   ${passed ? '✅' : '❌'} ${check}`);
    });
    
    console.log(`\nOverall Health: ${allPassed ? '✅ HEALTHY' : '❌ ISSUES DETECTED'}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Issues Found:');
      errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    return {
      success: allPassed,
      checks,
      errors
    };

  } catch (error) {
    console.error('💥 Critical error in health check:', error);
    return {
      success: false,
      checks,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

/**
 * Performance benchmark - measures system performance under load
 */
export async function runPerformanceBenchmark(): Promise<{
  success: boolean;
  benchmarks: Record<string, number>;
  recommendations: string[];
}> {
  console.log('🚀 Running performance benchmark...');
  
  const benchmarks: Record<string, number> = {};
  const recommendations: string[] = [];

  try {
    // Benchmark reward calculation
    console.log('   - Benchmarking reward calculation...');
    const rewardStartTime = Date.now();
    const { calculateDailyRewards } = await import('../api/cron/rewardCalculator');
    await calculateDailyRewards();
    benchmarks.rewardCalculation = Date.now() - rewardStartTime;

    // Benchmark statistics calculation
    console.log('   - Benchmarking statistics calculation...');
    const statsStartTime = Date.now();
    const { calculateDailyStatistics } = await import('../api/cron/statisticsCalculator');
    await calculateDailyStatistics();
    benchmarks.statisticsCalculation = Date.now() - statsStartTime;

    // Benchmark portfolio snapshots
    console.log('   - Benchmarking portfolio snapshots...');
    const snapshotStartTime = Date.now();
    const { createDailyPortfolioSnapshots } = await import('../api/cron/portfolioSnapshots');
    await createDailyPortfolioSnapshots();
    benchmarks.portfolioSnapshots = Date.now() - snapshotStartTime;

    // Generate recommendations
    if (benchmarks.rewardCalculation > 10000) {
      recommendations.push('Reward calculation is slow (>10s). Consider optimizing database queries.');
    }
    if (benchmarks.statisticsCalculation > 15000) {
      recommendations.push('Statistics calculation is slow (>15s). Consider adding database indexes.');
    }
    if (benchmarks.portfolioSnapshots > 8000) {
      recommendations.push('Portfolio snapshots are slow (>8s). Consider batch processing optimization.');
    }

    console.log('\n🚀 Performance Benchmark Results:');
    Object.entries(benchmarks).forEach(([operation, time]) => {
      const status = time < 5000 ? '🟢' : time < 10000 ? '🟡' : '🔴';
      console.log(`   ${status} ${operation}: ${time}ms`);
    });

    if (recommendations.length > 0) {
      console.log('\n💡 Performance Recommendations:');
      recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    } else {
      console.log('\n✅ All operations are performing well!');
    }

    return {
      success: true,
      benchmarks,
      recommendations
    };

  } catch (error) {
    console.error('💥 Error in performance benchmark:', error);
    return {
      success: false,
      benchmarks,
      recommendations: [`Benchmark failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

// CLI interface for running tests
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || 'all';

  switch (command) {
    case 'all':
      runAllTests().then(results => {
        process.exit(results.summary.success ? 0 : 1);
      });
      break;
    case 'health':
      runHealthCheck().then(results => {
        process.exit(results.success ? 0 : 1);
      });
      break;
    case 'performance':
      runPerformanceBenchmark().then(results => {
        process.exit(results.success ? 0 : 1);
      });
      break;
    case 'rewards':
      runSpecificTests('runRewardsTests').then(results => {
        process.exit(results.success ? 0 : 1);
      });
      break;
    case 'statistics':
      runSpecificTests('runStatisticsTests').then(results => {
        process.exit(results.success ? 0 : 1);
      });
      break;
    case 'cron':
      runSpecificTests('runCronJobTests').then(results => {
        process.exit(results.success ? 0 : 1);
      });
      break;
    case 'integration':
      runSpecificTests('runIntegrationTests').then(results => {
        process.exit(results.success ? 0 : 1);
      });
      break;
    default:
      console.log('Usage: npm run test [all|health|performance|rewards|statistics|cron|integration]');
      process.exit(1);
  }
}