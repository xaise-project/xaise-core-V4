-- Expand test data with 10 protocols and realistic APY values
-- This migration adds more comprehensive test data for development and testing

-- First, clear existing test data to avoid conflicts
DELETE FROM protocols WHERE name IN (
  'Ethereum 2.0 Staking',
  'Lido Finance',
  'Rocket Pool',
  'Frax Finance'
);

-- Insert 10 comprehensive protocols with realistic data
INSERT INTO protocols (
  name,
  description,
  apy,
  tvl,
  category,
  risk_level,
  min_stake,
  logo_url,
  website_url,
  is_active
) VALUES
-- High APY DeFi Protocols
(
  'Ethereum 2.0 Staking',
  'Native Ethereum staking with validator rewards. Secure and decentralized consensus mechanism.',
  4.2,
  45000000000,
  'Native Staking',
  'Low',
  32.0,
  'https://ethereum.org/static/ethereum-logo.png',
  'https://ethereum.org/en/staking/',
  true
),
(
  'Lido Finance (stETH)',
  'Liquid staking solution for Ethereum. Stake ETH and receive stETH tokens while maintaining liquidity.',
  3.8,
  32000000000,
  'Liquid Staking',
  'Medium',
  0.01,
  'https://lido.fi/static/lido-logo.svg',
  'https://lido.fi/',
  true
),
(
  'Rocket Pool (rETH)',
  'Decentralized Ethereum staking protocol. Community-driven liquid staking with node operator rewards.',
  4.1,
  2800000000,
  'Liquid Staking',
  'Medium',
  0.01,
  'https://rocketpool.net/images/logo-small.png',
  'https://rocketpool.net/',
  true
),
(
  'Frax Finance (sfrxETH)',
  'Staked Frax Ether with auto-compounding rewards. Part of the Frax ecosystem.',
  5.2,
  890000000,
  'Liquid Staking',
  'Medium',
  0.001,
  'https://frax.finance/static/frax-logo.svg',
  'https://frax.finance/',
  true
),
(
  'Coinbase Staking (cbETH)',
  'Centralized staking service by Coinbase. Easy access to Ethereum staking rewards.',
  3.2,
  1200000000,
  'Centralized Staking',
  'Low',
  0.01,
  'https://coinbase.com/img/favicon.ico',
  'https://www.coinbase.com/staking',
  true
),
-- Medium APY Protocols
(
  'Binance Staking (BETH)',
  'Binance exchange staking service. Trade BETH tokens while earning staking rewards.',
  2.8,
  3500000000,
  'Centralized Staking',
  'Low',
  0.0001,
  'https://binance.com/favicon.ico',
  'https://www.binance.com/en/eth2',
  true
),
(
  'Ankr Staking (ankrETH)',
  'Multi-chain liquid staking platform. Stake ETH and receive ankrETH with DeFi integration.',
  3.9,
  450000000,
  'Liquid Staking',
  'Medium',
  0.5,
  'https://ankr.com/favicon.ico',
  'https://www.ankr.com/staking/',
  true
),
(
  'StakeWise (sETH2)',
  'Tokenized staking with separate reward and principal tokens. Advanced staking mechanics.',
  4.3,
  180000000,
  'Liquid Staking',
  'High',
  0.1,
  'https://stakewise.io/favicon.ico',
  'https://stakewise.io/',
  true
),
-- Lower APY but Stable Protocols
(
  'Kraken Staking',
  'Professional staking service by Kraken exchange. Institutional-grade security.',
  2.5,
  800000000,
  'Centralized Staking',
  'Low',
  0.00001,
  'https://kraken.com/favicon.ico',
  'https://www.kraken.com/features/staking',
  true
),
(
  'Swell Network (swETH)',
  'Non-custodial liquid staking with MEV rewards. Community-governed protocol.',
  4.8,
  95000000,
  'Liquid Staking',
  'Medium',
  0.05,
  'https://swellnetwork.io/favicon.ico',
  'https://swellnetwork.io/',
  true
);

-- Add some sample users for testing
INSERT INTO users (
  id,
  email,
  username,
  full_name,
  avatar_url,
  total_staked,
  total_rewards,
  created_at
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001',
  'alice@example.com',
  'alice_staker',
  'Alice Johnson',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
  15.5,
  2.3,
  NOW() - INTERVAL '30 days'
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  'bob@example.com',
  'bob_validator',
  'Bob Smith',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
  32.0,
  4.8,
  NOW() - INTERVAL '60 days'
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  'carol@example.com',
  'carol_defi',
  'Carol Williams',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol',
  8.2,
  1.1,
  NOW() - INTERVAL '15 days'
);

-- Add sample stakes for the test users
INSERT INTO stakes (
  user_id,
  protocol_id,
  amount,
  status,
  created_at
) VALUES
-- Alice's stakes
(
  '550e8400-e29b-41d4-a716-446655440001',
  (SELECT id FROM protocols WHERE name = 'Lido Finance (stETH)' LIMIT 1),
  10.0,
  'active',
  NOW() - INTERVAL '25 days'
),
(
  '550e8400-e29b-41d4-a716-446655440001',
  (SELECT id FROM protocols WHERE name = 'Rocket Pool (rETH)' LIMIT 1),
  5.5,
  'active',
  NOW() - INTERVAL '20 days'
),
-- Bob's stakes
(
  '550e8400-e29b-41d4-a716-446655440002',
  (SELECT id FROM protocols WHERE name = 'Ethereum 2.0 Staking' LIMIT 1),
  32.0,
  'active',
  NOW() - INTERVAL '55 days'
),
-- Carol's stakes
(
  '550e8400-e29b-41d4-a716-446655440003',
  (SELECT id FROM protocols WHERE name = 'Frax Finance (sfrxETH)' LIMIT 1),
  8.2,
  'active',
  NOW() - INTERVAL '12 days'
);

-- Add sample rewards for active stakes
INSERT INTO rewards (
  user_id,
  protocol_id,
  amount,
  reward_type,
  created_at
) VALUES
-- Alice's rewards
(
  '550e8400-e29b-41d4-a716-446655440001',
  (SELECT id FROM protocols WHERE name = 'Lido Finance (stETH)' LIMIT 1),
  1.5,
  'staking',
  NOW() - INTERVAL '5 days'
),
(
  '550e8400-e29b-41d4-a716-446655440001',
  (SELECT id FROM protocols WHERE name = 'Rocket Pool (rETH)' LIMIT 1),
  0.8,
  'staking',
  NOW() - INTERVAL '3 days'
),
-- Bob's rewards
(
  '550e8400-e29b-41d4-a716-446655440002',
  (SELECT id FROM protocols WHERE name = 'Ethereum 2.0 Staking' LIMIT 1),
  4.8,
  'staking',
  NOW() - INTERVAL '7 days'
),
-- Carol's rewards
(
  '550e8400-e29b-41d4-a716-446655440003',
  (SELECT id FROM protocols WHERE name = 'Frax Finance (sfrxETH)' LIMIT 1),
  1.1,
  'staking',
  NOW() - INTERVAL '2 days'
);

-- Add some sample comments
INSERT INTO comments (
  user_id,
  protocol_id,
  content,
  rating,
  created_at
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001',
  (SELECT id FROM protocols WHERE name = 'Lido Finance (stETH)' LIMIT 1),
  'Great liquid staking solution! Easy to use and reliable rewards.',
  5,
  NOW() - INTERVAL '10 days'
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  (SELECT id FROM protocols WHERE name = 'Ethereum 2.0 Staking' LIMIT 1),
  'Native staking is the most secure option. Takes time to set up but worth it.',
  4,
  NOW() - INTERVAL '15 days'
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  (SELECT id FROM protocols WHERE name = 'Frax Finance (sfrxETH)' LIMIT 1),
  'Higher APY than most competitors. Good for maximizing returns.',
  4,
  NOW() - INTERVAL '8 days'
);

-- Add some favorites
INSERT INTO favorites (
  user_id,
  protocol_id,
  created_at
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001',
  (SELECT id FROM protocols WHERE name = 'Lido Finance (stETH)' LIMIT 1),
  NOW() - INTERVAL '20 days'
),
(
  '550e8400-e29b-41d4-a716-446655440001',
  (SELECT id FROM protocols WHERE name = 'Rocket Pool (rETH)' LIMIT 1),
  NOW() - INTERVAL '18 days'
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  (SELECT id FROM protocols WHERE name = 'Ethereum 2.0 Staking' LIMIT 1),
  NOW() - INTERVAL '50 days'
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  (SELECT id FROM protocols WHERE name = 'Frax Finance (sfrxETH)' LIMIT 1),
  NOW() - INTERVAL '10 days'
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  (SELECT id FROM protocols WHERE name = 'Swell Network (swETH)' LIMIT 1),
  NOW() - INTERVAL '5 days'
);

-- Update statistics
ANALYZE protocols;
ANALYZE users;
ANALYZE stakes;
ANALYZE rewards;
ANALYZE comments;
ANALYZE favorites;