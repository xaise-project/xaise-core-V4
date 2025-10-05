import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { supabase } from '../src/lib/supabase';

// Import API routes
import * as stakesAPI from './stakes';
import * as rewardsAPI from './rewards';
import * as cronAPI from './cron/cronScheduler';
import * as statisticsAPI from './statistics';

const app = express();

// Initialize cron scheduler on server start
cronAPI.initializeCronScheduler();

const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Authentication middleware
async function authenticateUser(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication token required' });
    }

    const token = authHeader.substring(7);
    
    // Verify JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Add user to request object
    req.user = {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.email || ''
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication service error' });
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Stakes API routes
app.post('/api/stakes', authenticateUser, stakesAPI.createStake);
app.get('/api/stakes', authenticateUser, stakesAPI.getStakes);
app.get('/api/stakes/:id', authenticateUser, stakesAPI.getStakeById);
app.put('/api/stakes/:id', authenticateUser, stakesAPI.updateStake);
app.delete('/api/stakes/:id', authenticateUser, stakesAPI.deleteStake);

// Rewards routes
app.post('/api/rewards', authenticateUser, rewardsAPI.createReward);
app.get('/api/rewards/user/:userId', authenticateUser, rewardsAPI.getRewardsByUser);
app.get('/api/rewards/:id', authenticateUser, rewardsAPI.getRewardById);
app.put('/api/rewards/:id', authenticateUser, rewardsAPI.updateReward);
app.delete('/api/rewards/:id', authenticateUser, rewardsAPI.deleteReward);
app.post('/api/rewards/:id/claim', authenticateUser, rewardsAPI.claimReward);

// Cron job management routes
app.post('/api/cron/trigger', cronAPI.triggerRewardCalculation);
app.post('/api/cron/trigger-daily-stats', cronAPI.triggerDailyStatistics);
app.post('/api/cron/trigger-weekly-stats', cronAPI.triggerWeeklyStatistics);
app.post('/api/cron/trigger-monthly-stats', cronAPI.triggerMonthlyStatistics);
app.get('/api/cron/status', cronAPI.getCronStatus);
app.get('/api/cron/health', cronAPI.cronHealthCheck);

// Statistics routes
app.get('/api/statistics/user', authenticateUser, statisticsAPI.getUserStatistics);
app.get('/api/statistics/snapshots', authenticateUser, statisticsAPI.getPortfolioSnapshots);
app.get('/api/statistics/protocol-performance', authenticateUser, statisticsAPI.getProtocolPerformance);
app.get('/api/statistics/dashboard', authenticateUser, statisticsAPI.getPortfolioDashboard);
app.post('/api/statistics/snapshot', authenticateUser, statisticsAPI.createPortfolioSnapshot);

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 StakeHub API Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔗 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

export default app;