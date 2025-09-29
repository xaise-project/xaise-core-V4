#!/usr/bin/env tsx
// Database Seeding Script
// Day 4 - Medium Priority Task: Development Tools
// Script to populate database with development and test data

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/types/Database.types'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration')
  console.error('Please ensure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

// Seed Data Definitions
const SEED_PROTOCOLS = [
  {
    name: 'Ethereum 2.0 Staking',
    description: 'Native Ethereum staking with validator rewards. Secure and decentralized consensus mechanism.',
    apy: 4.2,
    tvl: 45000000000,
    category: 'Native Staking',
    risk_level: 'low' as const,
    min_stake: 32.0,
    max_stake: 1000000.0,
    lock_period: 365,
    logo_url: 'https://ethereum.org/static/ethereum-logo.png',
    website_url: 'https://ethereum.org/en/staking/',
    is_active: true
  },
  {
    name: 'Lido Finance (stETH)',
    description: 'Liquid staking solution for Ethereum. Stake ETH and receive stETH tokens while maintaining liquidity.',
    apy: 3.8,
    tvl: 32000000000,
    category: 'Liquid Staking',
    risk_level: 'medium' as const,
    min_stake: 0.01,
    max_stake: 100000.0,
    lock_period: 1,
    logo_url: 'https://lido.fi/static/lido-logo.svg',
    website_url: 'https://lido.fi/',
    is_active: true
  },
  {
    name: 'Rocket Pool (rETH)',
    description: 'Decentralized Ethereum staking protocol. Community-driven liquid staking with node operator rewards.',
    apy: 4.1,
    tvl: 2800000000,
    category: 'Liquid Staking',
    risk_level: 'medium' as const,
    min_stake: 0.01,
    max_stake: 50000.0,
    lock_period: 1,
    logo_url: 'https://rocketpool.net/images/logo-small.png',
    website_url: 'https://rocketpool.net/',
    is_active: true
  },
  {
    name: 'Frax Finance (sfrxETH)',
    description: 'Staked Frax Ether with auto-compounding rewards. Part of the Frax ecosystem.',
    apy: 5.2,
    tvl: 890000000,
    category: 'Liquid Staking',
    risk_level: 'medium' as const,
    min_stake: 0.001,
    max_stake: 25000.0,
    lock_period: 7,
    logo_url: 'https://frax.finance/static/frax-logo.svg',
    website_url: 'https://frax.finance/',
    is_active: true
  },
  {
    name: 'Coinbase Staking (cbETH)',
    description: 'Centralized staking service by Coinbase. Easy access to Ethereum staking rewards.',
    apy: 3.2,
    tvl: 1200000000,
    category: 'Centralized Staking',
    risk_level: 'low' as const,
    min_stake: 0.01,
    max_stake: 75000.0,
    lock_period: 1,
    logo_url: 'https://coinbase.com/img/favicon.ico',
    website_url: 'https://www.coinbase.com/staking',
    is_active: true
  }
]

const SEED_USERS = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    email: 'alice@example.com',
    name: 'Alice Johnson',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    email: 'bob@example.com',
    name: 'Bob Smith',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    email: 'carol@example.com',
    name: 'Carol Williams',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    email: 'david@example.com',
    name: 'David Brown',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    email: 'eve@example.com',
    name: 'Eve Davis',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eve'
  }
]

// Utility Functions
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomNumber(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function getRandomDate(daysAgo: number): string {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo))
  return date.toISOString()
}

// Seeding Functions
async function clearExistingData() {
  console.log('🧹 Clearing existing test data...')
  
  // Clear in correct order due to foreign key constraints
  await supabase.from('rewards').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('comments').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('favorites').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('stakes').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('protocols').delete().in('name', SEED_PROTOCOLS.map(p => p.name))
  await supabase.from('users').delete().in('id', SEED_USERS.map(u => u.id))
  
  console.log('✅ Existing test data cleared')
}

async function seedProtocols() {
  console.log('🌱 Seeding protocols...')
  
  const { data, error } = await supabase
    .from('protocols')
    .insert(SEED_PROTOCOLS)
    .select()
  
  if (error) {
    console.error('❌ Error seeding protocols:', error)
    throw error
  }
  
  console.log(`✅ Seeded ${data.length} protocols`)
  return data
}

async function seedUsers() {
  console.log('🌱 Seeding users...')
  
  const { data, error } = await supabase
    .from('users')
    .insert(SEED_USERS)
    .select()
  
  if (error) {
    console.error('❌ Error seeding users:', error)
    throw error
  }
  
  console.log(`✅ Seeded ${data.length} users`)
  return data
}

async function seedStakes(protocols: any[], users: any[]) {
  console.log('🌱 Seeding stakes...')
  
  const stakes = []
  
  // Create 2-4 stakes per user
  for (const user of users) {
    const stakeCount = Math.floor(Math.random() * 3) + 2 // 2-4 stakes
    
    for (let i = 0; i < stakeCount; i++) {
      const protocol = getRandomElement(protocols)
      const amount = getRandomNumber(protocol.min_stake, protocol.min_stake * 100)
      const createdAt = getRandomDate(90)
      const endDate = new Date(createdAt)
      endDate.setDate(endDate.getDate() + protocol.lock_period)
      
      stakes.push({
        user_id: user.id,
        protocol_id: protocol.id,
        amount: Math.round(amount * 100) / 100,
        status: Math.random() > 0.3 ? 'active' : 'completed',
        created_at: createdAt,
        end_date: endDate.toISOString()
      })
    }
  }
  
  const { data, error } = await supabase
    .from('stakes')
    .insert(stakes)
    .select()
  
  if (error) {
    console.error('❌ Error seeding stakes:', error)
    throw error
  }
  
  console.log(`✅ Seeded ${data.length} stakes`)
  return data
}

async function seedComments(protocols: any[], users: any[]) {
  console.log('🌱 Seeding comments...')
  
  const comments = []
  const sampleComments = [
    'Great protocol with consistent rewards!',
    'Easy to use interface and good APY.',
    'Reliable staking option, highly recommended.',
    'Good for beginners, low risk.',
    'Excellent customer support and documentation.',
    'Fast unstaking process.',
    'Competitive rates compared to others.',
    'Transparent fee structure.',
    'Regular updates and improvements.',
    'Solid choice for long-term staking.'
  ]
  
  // Create 1-3 comments per protocol
  for (const protocol of protocols) {
    const commentCount = Math.floor(Math.random() * 3) + 1 // 1-3 comments
    
    for (let i = 0; i < commentCount; i++) {
      const user = getRandomElement(users)
      const content = getRandomElement(sampleComments)
      const rating = Math.floor(Math.random() * 2) + 4 // 4-5 stars
      
      comments.push({
        protocol_id: protocol.id,
        user_id: user.id,
        content,
        rating,
        created_at: getRandomDate(60)
      })
    }
  }
  
  const { data, error } = await supabase
    .from('comments')
    .insert(comments)
    .select()
  
  if (error) {
    console.error('❌ Error seeding comments:', error)
    throw error
  }
  
  console.log(`✅ Seeded ${data.length} comments`)
  return data
}

async function seedFavorites(protocols: any[], users: any[]) {
  console.log('🌱 Seeding favorites...')
  
  const favorites = []
  
  // Each user favorites 1-3 protocols
  for (const user of users) {
    const favoriteCount = Math.floor(Math.random() * 3) + 1 // 1-3 favorites
    const selectedProtocols = protocols
      .sort(() => 0.5 - Math.random())
      .slice(0, favoriteCount)
    
    for (const protocol of selectedProtocols) {
      favorites.push({
        user_id: user.id,
        protocol_id: protocol.id,
        created_at: getRandomDate(30)
      })
    }
  }
  
  const { data, error } = await supabase
    .from('favorites')
    .insert(favorites)
    .select()
  
  if (error) {
    console.error('❌ Error seeding favorites:', error)
    throw error
  }
  
  console.log(`✅ Seeded ${data.length} favorites`)
  return data
}

async function seedRewards(stakes: any[], protocols: any[]) {
  console.log('🌱 Seeding rewards...')
  
  const rewards = []
  
  // Create rewards for completed stakes
  for (const stake of stakes.filter(s => s.status === 'completed')) {
    const protocol = protocols.find(p => p.id === stake.protocol_id)
    if (!protocol) continue
    
    // Calculate reward based on stake amount and APY
    const dailyRate = protocol.apy / 100 / 365
    const stakeDays = Math.floor(Math.random() * protocol.lock_period) + 1
    const rewardAmount = stake.amount * dailyRate * stakeDays
    
    rewards.push({
      user_id: stake.user_id,
      protocol_id: stake.protocol_id,
      stake_id: stake.id,
      amount: Math.round(rewardAmount * 1000) / 1000,
      reward_type: 'staking',
      is_claimed: Math.random() > 0.3, // 70% claimed
      reward_date: getRandomDate(30),
      created_at: getRandomDate(30)
    })
  }
  
  const { data, error } = await supabase
    .from('rewards')
    .insert(rewards)
    .select()
  
  if (error) {
    console.error('❌ Error seeding rewards:', error)
    throw error
  }
  
  console.log(`✅ Seeded ${data.length} rewards`)
  return data
}

// Main Seeding Function
async function seedDatabase() {
  try {
    console.log('🚀 Starting database seeding...')
    console.log('📊 This will populate the database with development data')
    
    // Clear existing data
    await clearExistingData()
    
    // Seed base data
    const protocols = await seedProtocols()
    const users = await seedUsers()
    
    // Seed related data
    const stakes = await seedStakes(protocols, users)
    const comments = await seedComments(protocols, users)
    const favorites = await seedFavorites(protocols, users)
    const rewards = await seedRewards(stakes, protocols)
    
    console.log('\n🎉 Database seeding completed successfully!')
    console.log('📈 Summary:')
    console.log(`   • ${protocols.length} protocols`)
    console.log(`   • ${users.length} users`)
    console.log(`   • ${stakes.length} stakes`)
    console.log(`   • ${comments.length} comments`)
    console.log(`   • ${favorites.length} favorites`)
    console.log(`   • ${rewards.length} rewards`)
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error)
    process.exit(1)
  }
}

// Reset Database Function
async function resetDatabase() {
  try {
    console.log('🔄 Resetting database...')
    await clearExistingData()
    console.log('✅ Database reset completed')
  } catch (error) {
    console.error('❌ Database reset failed:', error)
    process.exit(1)
  }
}

// CLI Interface
const command = process.argv[2]

switch (command) {
  case 'seed':
    seedDatabase()
    break
  case 'reset':
    resetDatabase()
    break
  case 'reseed':
    resetDatabase().then(() => seedDatabase())
    break
  default:
    console.log('📖 Usage:')
    console.log('  npm run seed        # Seed database with test data')
    console.log('  npm run seed:reset  # Clear all test data')
    console.log('  npm run seed:reseed # Reset and seed database')
    console.log('')
    console.log('🔧 Available commands:')
    console.log('  seed    - Add development data to database')
    console.log('  reset   - Clear all test data from database')
    console.log('  reseed  - Reset and seed database with fresh data')
    break
}