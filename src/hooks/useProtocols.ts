import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import ProtocolsService, { type ProtocolSearchFilters } from '../services/protocols.service'
import type { Database } from '../types/Database.types'
import toast from 'react-hot-toast'

type Protocol = Database['public']['Tables']['protocols']['Row']




// Query keys
export const protocolKeys = {
  all: ['protocols'] as const,
  lists: () => [...protocolKeys.all, 'list'] as const,
  list: (filters: ProtocolSearchFilters) => [...protocolKeys.lists(), filters] as const,
  details: () => [...protocolKeys.all, 'detail'] as const,
  detail: (id: string) => [...protocolKeys.details(), id] as const,
  categories: () => [...protocolKeys.all, 'categories'] as const,
  category: (category: string) => [...protocolKeys.categories(), category] as const,
  top: (limit: number) => [...protocolKeys.all, 'top', limit] as const,
}

// Filter types - using ProtocolSearchFilters from service
export type ProtocolFilters = ProtocolSearchFilters

// Ana protokol listesi hook'u
export function useProtocols(filters: ProtocolFilters = {}) {
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: protocolKeys.list(filters),
    queryFn: async (): Promise<Protocol[]> => {
      const searchFilters: ProtocolSearchFilters = {
        category: filters.category,
        minApy: filters.minApy,
        maxApy: filters.maxApy,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        searchTerm: filters.searchTerm,
      }
      
      const response = await ProtocolsService.searchProtocols(searchFilters)
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch protocols')
      }

      return response.data
    },
    staleTime: 2 * 60 * 1000, // 2 dakika
    gcTime: 5 * 60 * 1000, // 5 dakika (renamed from cacheTime)
    retry: 2,
    refetchOnWindowFocus: false,
  })

  return {
    protocols: data || [],
    isLoading,
    isFetching,
    error,
    success: !error,
    refetch,
  }
}

// Kategoriye göre protokol listesi hook'u
export function useProtocolsByCategory(category: string) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: protocolKeys.category(category),
    queryFn: async (): Promise<Protocol[]> => {
      const response = await ProtocolsService.searchProtocols({ category })
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch protocols by category')
      }

      return response.data
    },
    enabled: !!category,
    staleTime: 3 * 60 * 1000, // 3 dakika
    retry: 2,
  })

  return {
    protocols: data || [],
    isLoading,
    error,
    success: !error,
    refetch,
  }
}

// En iyi protokoller hook'u
export function useTopProtocols(limit: number = 10) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: protocolKeys.top(limit),
    queryFn: async (): Promise<Protocol[]> => {
      const response = await ProtocolsService.getTopProtocols(limit)
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch top protocols')
      }

      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 dakika
    retry: 2,
  })

  return {
    protocols: data || [],
    isLoading,
    error,
    success: !error,
    refetch,
  }
}

// Get all protocol categories
export function useProtocolCategories() {
  return useQuery({
    queryKey: ['protocol-categories'],
    queryFn: async (): Promise<string[]> => {
      const response = await ProtocolsService.getCategories()
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch categories')
      }

      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Search protocols with filters
export function useSearchProtocols(filters: ProtocolSearchFilters = {}) {
  return useQuery({
    queryKey: ['protocols', 'search', filters],
    queryFn: async (): Promise<Protocol[]> => {
      const response = await ProtocolsService.searchProtocols(filters)
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to search protocols')
      }

      return response.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Protokol favorileme hook'u
export function useFavoriteProtocol() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ protocolId, isFavorite }: { protocolId: string; isFavorite: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Kullanıcı giriş yapmamış')
      }

      if (isFavorite) {
        // Favorilerden çıkar
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('protocol_id', protocolId)

        if (error) throw error
      } else {
        // Favorilere ekle
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            protocol_id: protocolId,
          })

        if (error) throw error
      }

      return !isFavorite
    },
    onSuccess: (newFavoriteStatus) => {
      // İlgili cache'leri güncelle
      queryClient.invalidateQueries({ queryKey: protocolKeys.all })
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
      
      toast.success(
        newFavoriteStatus 
          ? 'Protokol favorilere eklendi!' 
          : 'Protokol favorilerden çıkarıldı!'
      )
    },
    onError: (error) => {
      console.error('Favori işlemi hatası:', error)
      toast.error('Favori işlemi gerçekleştirilemedi')
    },
  })
}

// Kullanıcının favori protokollerini getiren hook
export function useFavoriteProtocols() {
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['favorites', 'protocols'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { data: [], error: null, success: true }
      }

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          protocol_id,
          protocols (
            *
          )
        `)
        .eq('user_id', user.id)

      if (error) {
        return {
          data: null,
          error: `Failed to fetch favorites: ${error.message}`,
          success: false
        }
      }

      const protocols = data?.map(fav => fav.protocols).filter(Boolean) || []
      
      return {
        data: protocols,
        error: null,
        success: true
      }
    },
    staleTime: 2 * 60 * 1000, // 2 dakika
  })

  return {
    protocols: data?.data || [],
    isLoading,
    error: data?.error || error,
    success: data?.success ?? false,
  }
}

// Protokol istatistiklerini getiren hook
export function useProtocolStats() {
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['protocols', 'stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('protocols')
        .select('apy, tvl, risk_level')

      if (error) {
        throw new Error(`Failed to fetch protocol stats: ${error.message}`)
      }

      const totalProtocols = data?.length || 0
      const avgApy = data?.reduce((sum, p) => sum + (p.apy || 0), 0) / totalProtocols || 0
      const totalTvl = data?.reduce((sum, p) => sum + (p.tvl || 0), 0) || 0
      const categories = [...new Set(data?.map(p => p.risk_level).filter(Boolean))]

      return {
        totalProtocols,
        avgApy,
        totalTvl,
        categoriesCount: categories.length,
        categories,
      }
    },
    staleTime: 5 * 60 * 1000, // 5 dakika
  })

  return {
    stats: data,
    isLoading,
    error,
  }
}