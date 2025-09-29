// Database Types - Auto-generated from Supabase Schema
// Geliştirici B - Gün 2 Yüksek Öncelik Görevleri
// TypeScript type definitions for StakeHub database

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      protocols: {
        Row: {
          id: string
          name: string
          description: string | null
          apy: number
          tvl: number
          risk_level: 'low' | 'medium' | 'high' | null
          min_stake: number
          website_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          apy: number
          tvl?: number
          risk_level?: 'low' | 'medium' | 'high' | null
          min_stake?: number
          website_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          apy?: number
          tvl?: number
          risk_level?: 'low' | 'medium' | 'high' | null
          min_stake?: number
          website_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          id: string
          user_id: string
          protocol_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          protocol_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          protocol_id?: string
          content?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_protocol_id_fkey"
            columns: ["protocol_id"]
            referencedRelation: "protocols"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          protocol_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          protocol_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          protocol_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_protocol_id_fkey"
            columns: ["protocol_id"]
            referencedRelation: "protocols"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      stakes: {
        Row: {
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
        Insert: {
          id?: string
          user_id: string
          protocol_id: string
          amount: number
          lock_period: number
          start_date?: string
          end_date: string
          status?: 'active' | 'completed' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          protocol_id?: string
          amount?: number
          lock_period?: number
          start_date?: string
          end_date?: string
          status?: 'active' | 'completed' | 'cancelled'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stakes_protocol_id_fkey"
            columns: ["protocol_id"]
            referencedRelation: "protocols"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stakes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      rewards: {
        Row: {
          id: string
          user_id: string
          stake_id: string
          amount: number
          reward_date: string
          claimed: boolean
          claim_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stake_id: string
          amount: number
          reward_date?: string
          claimed?: boolean
          claim_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stake_id?: string
          amount?: number
          reward_date?: string
          claimed?: boolean
          claim_date?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_stake_id_fkey"
            columns: ["stake_id"]
            referencedRelation: "stakes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific table types
export type User = Tables<'users'>
export type Protocol = Tables<'protocols'>
export type CommentType = Tables<'comments'>
export type Favorite = Tables<'favorites'>
export type Stake = Tables<'stakes'>
export type Reward = Tables<'rewards'>

// Insert types
export type UserInsert = TablesInsert<'users'>
export type ProtocolInsert = TablesInsert<'protocols'>
export type CommentInsert = TablesInsert<'comments'>
export type FavoriteInsert = TablesInsert<'favorites'>
export type StakeInsert = TablesInsert<'stakes'>
export type RewardInsert = TablesInsert<'rewards'>

// Update types
export type UserUpdate = TablesUpdate<'users'>
export type ProtocolUpdate = TablesUpdate<'protocols'>
export type CommentUpdate = TablesUpdate<'comments'>
export type FavoriteUpdate = TablesUpdate<'favorites'>
export type StakeUpdate = TablesUpdate<'stakes'>
export type RewardUpdate = TablesUpdate<'rewards'>

// Enum types
export type RiskLevel = 'low' | 'medium' | 'high'
export type StakeStatus = 'active' | 'completed' | 'cancelled'

// API Response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
  totalPages: number
}

// Extended types with relationships
export interface ProtocolWithStats extends Protocol {
  totalStakers?: number
  averageStake?: number
  totalRewards?: number
}

export interface StakeWithProtocol extends Stake {
  protocol?: Protocol
}

export interface UserWithStats extends User {
  totalStaked?: number
  totalRewards?: number
  activeStakes?: number
}