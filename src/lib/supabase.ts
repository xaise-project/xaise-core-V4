import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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