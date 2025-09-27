import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/Database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bgmdytpjouugjddnmubp.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnbWR5dHBqb3V1Z2pkZG5tdWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MTAyOTIsImV4cCI6MjA3NDQ4NjI5Mn0.YwzOjgZSWkiwborkQyRS9eo8psr1hfuQXdnivkgQXO0'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Database Types
export interface User {
  id: string
  email: string
  name: string
  created_at: string
}

export interface Protocol {
  id: string
  name: string
  description: string
  apy: number
  tvl: number
  risk_level: 'low' | 'medium' | 'high'
  min_stake: number
  website_url: string
  created_at: string
}

export interface Stake {
  id: string
  user_id: string
  protocol_id: string
  amount: number
  lock_period: number
  start_date: string
  end_date: string
  status: 'active' | 'completed' | 'cancelled'
  created_at: string
}

export interface Reward {
  id: string
  user_id: string
  stake_id: string
  amount: number
  reward_date: string
  claimed: boolean
  claim_date?: string
  created_at: string
}

export interface Comment {
  id: string
  user_id: string
  protocol_id: string
  content: string
  created_at: string
}

export interface Favorite {
  id: string
  user_id: string
  protocol_id: string
  created_at: string
}