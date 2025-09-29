import { supabase } from '../lib/supabase'
import type { Database } from '../types/Database.types'

// Database Types
type Protocol = Database['public']['Tables']['protocols']['Row']
type Stake = Database['public']['Tables']['stakes']['Row']
type StakeInsert = Database['public']['Tables']['stakes']['Insert']

// API Response Types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

// Protocol Categories Response
export interface ProtocolCategoriesResponse {
  categories: string[]
}

// Protocol Search Filters
export interface ProtocolSearchFilters {
  category?: string
  minApy?: number
  maxApy?: number
  sortBy?: 'apy' | 'tvl' | 'name' | 'created_at'
  sortOrder?: 'asc' | 'desc'
  searchTerm?: string
}

// Stake Creation Data
export interface CreateStakeData {
  protocol_id: string
  amount: number
  lock_period: number
  end_date: string
}

/**
 * Protocol Service Layer
 * Handles all protocol-related API operations
 */
export class ProtocolsService {
  /**
   * Get all protocol categories
   */
  static async getCategories(): Promise<ApiResponse<string[]>> {
    try {
      // Protocols tablosunda category sütunu yok, risk_level'ı kullanıyoruz
      const { data, error } = await supabase
        .from('protocols')
        .select('risk_level')

      if (error) {
        throw error
      }

      // Benzersiz risk seviyelerini kategoriler olarak kullan
        const riskLevels = data?.map(item => item.risk_level).filter(Boolean) || []
        const categories = [...new Set(riskLevels)] as string[]
        
        return {
          data: categories,
          error: null,
          success: true
        }
    } catch (error) {
      console.error('Error fetching categories:', error)
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      }
    }
  }

  /**
   * Search protocols with filters
   */
  static async searchProtocols(filters: ProtocolSearchFilters = {}): Promise<ApiResponse<Protocol[]>> {
    try {
      let query = supabase
        .from('protocols')
        .select('*')

      // Apply search term filter
      if (filters.searchTerm) {
        query = query.or(`name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`)
      }

      // Apply category filter
      if (filters.category) {
        query = query.eq('category', filters.category)
      }

      // Apply APY filters
      if (filters.minApy !== undefined) {
        query = query.gte('apy', filters.minApy)
      }

      if (filters.maxApy !== undefined) {
        query = query.lte('apy', filters.maxApy)
      }

      // Apply sorting
      if (filters.sortBy) {
        const order = filters.sortOrder || 'desc'
        query = query.order(filters.sortBy, { ascending: order === 'asc' })
      } else {
        // Default sort by APY descending
        query = query.order('apy', { ascending: false })
      }

      const { data, error } = await query

      if (error) {
        console.error('Error searching protocols:', error)
        return {
          data: null,
          error: `Failed to search protocols: ${error.message}`,
          success: false
        }
      }

      return {
        data: data || [],
        error: null,
        success: true
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('Unexpected error in searchProtocols:', err)
      return {
        data: null,
        error: `Unexpected error: ${errorMessage}`,
        success: false
      }
    }
  }

  /**
   * Get all protocols with optional filtering
   */
  static async getProtocols(filters?: ProtocolSearchFilters): Promise<ApiResponse<Protocol[]>> {
    return this.searchProtocols(filters || {})
  }

  /**
   * Get a single protocol by ID
   */
  static async getProtocolById(id: string): Promise<ApiResponse<Protocol>> {
    try {
      if (!id || typeof id !== 'string') {
        return {
          data: null,
          error: 'Invalid protocol ID provided',
          success: false
        }
      }

      const { data, error } = await supabase
        .from('protocols')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching protocol:', error)
        return {
          data: null,
          error: `Failed to fetch protocol: ${error.message}`,
          success: false
        }
      }

      if (!data) {
        return {
          data: null,
          error: 'Protocol not found',
          success: false
        }
      }

      return {
        data,
        error: null,
        success: true
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('Unexpected error in getProtocolById:', err)
      return {
        data: null,
        error: `Unexpected error: ${errorMessage}`,
        success: false
      }
    }
  }

  /**
   * Get all stakes for a specific protocol
   */
  static async getProtocolStakes(protocolId: string): Promise<ApiResponse<Stake[]>> {
    try {
      if (!protocolId || typeof protocolId !== 'string') {
        return {
          data: null,
          error: 'Invalid protocol ID provided',
          success: false
        }
      }

      const { data, error } = await supabase
        .from('stakes')
        .select('*')
        .eq('protocol_id', protocolId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching protocol stakes:', error)
        return {
          data: null,
          error: `Failed to fetch protocol stakes: ${error.message}`,
          success: false
        }
      }

      return {
        data: data || [],
        error: null,
        success: true
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('Unexpected error in getProtocolStakes:', err)
      return {
        data: null,
        error: `Unexpected error: ${errorMessage}`,
        success: false
      }
    }
  }

  /**
   * Get user's stakes for a specific protocol
   */
  static async getUserProtocolStakes(protocolId: string, userId: string): Promise<ApiResponse<Stake[]>> {
    try {
      if (!protocolId || typeof protocolId !== 'string') {
        return {
          data: null,
          error: 'Invalid protocol ID provided',
          success: false
        }
      }

      if (!userId || typeof userId !== 'string') {
        return {
          data: null,
          error: 'Invalid user ID provided',
          success: false
        }
      }

      const { data, error } = await supabase
        .from('stakes')
        .select('*')
        .eq('protocol_id', protocolId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user protocol stakes:', error)
        return {
          data: null,
          error: `Failed to fetch user protocol stakes: ${error.message}`,
          success: false
        }
      }

      return {
        data: data || [],
        error: null,
        success: true
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('Unexpected error in getUserProtocolStakes:', err)
      return {
        data: null,
        error: `Unexpected error: ${errorMessage}`,
        success: false
      }
    }
  }

  /**
   * Create a new stake for a protocol
   */
  static async createStake(stakeData: CreateStakeData, userId: string): Promise<ApiResponse<Stake>> {
    try {
      if (!userId || typeof userId !== 'string') {
        return {
          data: null,
          error: 'User authentication required',
          success: false
        }
      }

      if (!stakeData.protocol_id || !stakeData.amount || !stakeData.lock_period || !stakeData.end_date) {
        return {
          data: null,
          error: 'Missing required stake data',
          success: false
        }
      }

      if (stakeData.amount <= 0) {
        return {
          data: null,
          error: 'Stake amount must be greater than 0',
          success: false
        }
      }

      if (stakeData.lock_period <= 0) {
        return {
          data: null,
          error: 'Lock period must be greater than 0 days',
          success: false
        }
      }

      const insertData: StakeInsert = {
        protocol_id: stakeData.protocol_id,
        user_id: userId,
        amount: stakeData.amount,
        lock_period: stakeData.lock_period,
        end_date: stakeData.end_date,
        status: 'active',
        start_date: new Date().toISOString(),
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('stakes')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        console.error('Error creating stake:', error)
        return {
          data: null,
          error: `Failed to create stake: ${error.message}`,
          success: false
        }
      }

      if (!data) {
        return {
          data: null,
          error: 'Failed to create stake - no data returned',
          success: false
        }
      }

      return {
        data,
        error: null,
        success: true
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('Unexpected error in createStake:', err)
      return {
        data: null,
        error: `Unexpected error: ${errorMessage}`,
        success: false
      }
    }
  }

  /**
   * Get protocols by category
   */
  static async getProtocolsByCategory(category: string): Promise<ApiResponse<Protocol[]>> {
    return this.getProtocols({ category, sortBy: 'apy', sortOrder: 'desc' })
  }

  /**
   * Get top protocols by APY
   */
  static async getTopProtocols(limit: number = 10): Promise<ApiResponse<Protocol[]>> {
    try {
      const { data, error } = await supabase
        .from('protocols')
        .select('*')
        .order('apy', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching top protocols:', error)
        return {
          data: null,
          error: `Failed to fetch top protocols: ${error.message}`,
          success: false
        }
      }

      return {
        data: data || [],
        error: null,
        success: true
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('Unexpected error in getTopProtocols:', err)
      return {
        data: null,
        error: `Unexpected error: ${errorMessage}`,
        success: false
      }
    }
  }
}

// Export individual functions for backward compatibility
export const {
  getCategories,
  searchProtocols,
  getProtocols,
  getProtocolById,
  getProtocolStakes,
  getUserProtocolStakes,
  createStake,
  getProtocolsByCategory,
  getTopProtocols
} = ProtocolsService

// Default export
export default ProtocolsService