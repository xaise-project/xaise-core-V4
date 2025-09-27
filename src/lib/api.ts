import { supabase } from './supabase'
import type { Database } from '../types/Database.types'

type Protocol = Database['public']['Tables']['protocols']['Row']
type User = Database['public']['Tables']['users']['Row']

// API Response Types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

// Get all protocols with optional filtering
export async function getProtocols(filters?: {
  category?: string
  minApy?: number
  maxApy?: number
  sortBy?: 'apy' | 'tvl' | 'name' | 'created_at'
  sortOrder?: 'asc' | 'desc'
}): Promise<ApiResponse<Protocol[]>> {
  try {
    let query = supabase
      .from('protocols')
      .select('*')

    // Apply filters
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.minApy !== undefined) {
      query = query.gte('apy', filters.minApy)
    }

    if (filters?.maxApy !== undefined) {
      query = query.lte('apy', filters.maxApy)
    }

    // Apply sorting
    if (filters?.sortBy) {
      const order = filters.sortOrder || 'desc'
      query = query.order(filters.sortBy, { ascending: order === 'asc' })
    } else {
      // Default sort by APY descending
      query = query.order('apy', { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching protocols:', error)
      return {
        data: null,
        error: `Failed to fetch protocols: ${error.message}`,
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
    console.error('Unexpected error in getProtocols:', err)
    return {
      data: null,
      error: `Unexpected error: ${errorMessage}`,
      success: false
    }
  }
}

// Get user profile by ID
export async function getUserProfile(userId: string): Promise<ApiResponse<User>> {
  try {
    if (!userId || typeof userId !== 'string') {
      return {
        data: null,
        error: 'Invalid user ID provided',
        success: false
      }
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return {
        data: null,
        error: `Failed to fetch user profile: ${error.message}`,
        success: false
      }
    }

    if (!data) {
      return {
        data: null,
        error: 'User not found',
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
    console.error('Unexpected error in getUserProfile:', err)
    return {
      data: null,
      error: `Unexpected error: ${errorMessage}`,
      success: false
    }
  }
}

// Get current authenticated user profile
export async function getCurrentUserProfile(): Promise<ApiResponse<User>> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      return {
        data: null,
        error: `Authentication error: ${authError.message}`,
        success: false
      }
    }

    if (!user) {
      return {
        data: null,
        error: 'No authenticated user found',
        success: false
      }
    }

    return await getUserProfile(user.id)
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
    console.error('Unexpected error in getCurrentUserProfile:', err)
    return {
      data: null,
      error: `Unexpected error: ${errorMessage}`,
      success: false
    }
  }
}

// Get protocols by category
export async function getProtocolsByCategory(category: string): Promise<ApiResponse<Protocol[]>> {
  return await getProtocols({ category, sortBy: 'apy', sortOrder: 'desc' })
}

// Get top protocols by APY
export async function getTopProtocols(limit: number = 10): Promise<ApiResponse<Protocol[]>> {
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