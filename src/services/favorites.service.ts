import { supabase } from '../lib/supabase'

// Types
export interface FavoriteResponse {
  success: boolean
  data?: any
  error?: string
}

export interface FavoriteProtocolsResponse {
  success: boolean
  data?: any[]
  error?: string
}

export interface FavoriteStats {
  totalFavorites: number
  recentFavorites: any[]
  topCategories: string[]
}

export interface FavoriteStatsResponse {
  success: boolean
  data?: FavoriteStats
  error?: string
}

/**
 * Favorites Service - Centralized favorite operations
 */
export class FavoritesService {
  /**
   * Get user's favorite protocols
   */
  static async getFavoriteProtocols(userId?: string): Promise<FavoriteProtocolsResponse> {
    try {
      let currentUserId = userId
      
      if (!currentUserId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          return {
            success: true,
            data: [],
            error: undefined
          }
        }
        currentUserId = user.id
      }

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          protocol_id,
          created_at,
          protocols (
            *
          )
        `)
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false })

      if (error) {
        return {
          success: false,
          error: `Failed to fetch favorites: ${error.message}`
        }
      }

      const protocols = data?.map(fav => fav.protocols).filter(Boolean) || []
      
      return {
        success: true,
        data: protocols as any[]
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Add protocol to favorites
   */
  static async addToFavorites(protocolId: string, userId?: string): Promise<FavoriteResponse> {
    try {
      let currentUserId = userId
      
      if (!currentUserId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          return {
            success: false,
            error: 'User not authenticated'
          }
        }
        currentUserId = user.id
      }

      // Check if already favorited
      const { data: existing } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', currentUserId)
        .eq('protocol_id', protocolId)
        .single()

      if (existing) {
        return {
          success: false,
          error: 'Protocol already in favorites'
        }
      }

      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: currentUserId,
          protocol_id: protocolId,
        })

      if (error) {
        return {
          success: false,
          error: `Failed to add to favorites: ${error.message}`
        }
      }

      return {
        success: true,
        data: { protocolId, isFavorite: true }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Remove protocol from favorites
   */
  static async removeFromFavorites(protocolId: string, userId?: string): Promise<FavoriteResponse> {
    try {
      let currentUserId = userId
      
      if (!currentUserId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          return {
            success: false,
            error: 'User not authenticated'
          }
        }
        currentUserId = user.id
      }

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', currentUserId)
        .eq('protocol_id', protocolId)

      if (error) {
        return {
          success: false,
          error: `Failed to remove from favorites: ${error.message}`
        }
      }

      return {
        success: true,
        data: { protocolId, isFavorite: false }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Toggle favorite status
   */
  static async toggleFavorite(protocolId: string, isFavorite: boolean, userId?: string): Promise<FavoriteResponse> {
    if (isFavorite) {
      return this.removeFromFavorites(protocolId, userId)
    } else {
      return this.addToFavorites(protocolId, userId)
    }
  }

  /**
   * Check if protocol is favorited by user
   */
  static async isFavorited(protocolId: string, userId?: string): Promise<{ success: boolean; data?: boolean; error?: string }> {
    try {
      let currentUserId = userId
      
      if (!currentUserId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          return {
            success: true,
            data: false
          }
        }
        currentUserId = user.id
      }

      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', currentUserId)
        .eq('protocol_id', protocolId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        return {
          success: false,
          error: `Failed to check favorite status: ${error.message}`
        }
      }

      return {
        success: true,
        data: !!data
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Get favorite statistics for user
   */
  static async getFavoriteStats(userId?: string): Promise<FavoriteStatsResponse> {
    try {
      let currentUserId = userId
      
      if (!currentUserId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          return {
            success: true,
            data: {
              totalFavorites: 0,
              recentFavorites: [],
              topCategories: []
            }
          }
        }
        currentUserId = user.id
      }

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          protocol_id,
          created_at,
          protocols (
            *
          )
        `)
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false })

      if (error) {
        return {
          success: false,
          error: `Failed to fetch favorite stats: ${error.message}`
        }
      }

      const protocols = data?.map(fav => fav.protocols).filter(Boolean) || []
      const recentFavorites = protocols.slice(0, 5) as any[]
      // Note: Protocol type doesn't have category field, using empty array for now
      const topCategories: string[] = []

      return {
        success: true,
        data: {
          totalFavorites: protocols.length,
          recentFavorites,
          topCategories
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Get all favorites count (admin function)
   */
  static async getAllFavoritesCount(): Promise<{ success: boolean; data?: number; error?: string }> {
    try {
      const { count, error } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })

      if (error) {
        return {
          success: false,
          error: `Failed to get favorites count: ${error.message}`
        }
      }

      return {
        success: true,
        data: count || 0
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Clear all favorites for user
   */
  static async clearAllFavorites(userId?: string): Promise<FavoriteResponse> {
    try {
      let currentUserId = userId
      
      if (!currentUserId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          return {
            success: false,
            error: 'User not authenticated'
          }
        }
        currentUserId = user.id
      }

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', currentUserId)

      if (error) {
        return {
          success: false,
          error: `Failed to clear favorites: ${error.message}`
        }
      }

      return {
        success: true,
        data: { cleared: true }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }
}