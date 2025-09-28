import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProtocols, getProtocolsByCategory, getTopProtocols } from '../lib/api'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'




// Query keys
export const protocolKeys = {
  all: ['protocols'] as const,
  lists: () => [...protocolKeys.all, 'list'] as const,
  list: (filters: ProtocolFilters) => [...protocolKeys.lists(), filters] as const,
  details: () => [...protocolKeys.all, 'detail'] as const,
  detail: (id: string) => [...protocolKeys.details(), id] as const,
  categories: () => [...protocolKeys.all, 'categories'] as const,
  category: (category: string) => [...protocolKeys.categories(), category] as const,
  top: (limit: number) => [...protocolKeys.all, 'top', limit] as const,
}

// Filter types
export interface ProtocolFilters {
  category?: string
  minApy?: number
  maxApy?: number
  sortBy?: 'apy' | 'tvl' | 'name' | 'created_at'
  sortOrder?: 'asc' | 'desc'
  search?: string
}

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
    queryFn: () => getProtocols(filters),
    staleTime: 2 * 60 * 1000, // 2 dakika
    gcTime: 5 * 60 * 1000, // 5 dakika (renamed from cacheTime)
    retry: 2,
    refetchOnWindowFocus: false,
  })

  return {
    protocols: data?.data || [],
    isLoading,
    isFetching,
    error: data?.error || error,
    success: data?.success ?? false,
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
    queryFn: () => getProtocolsByCategory(category),
    enabled: !!category,
    staleTime: 3 * 60 * 1000, // 3 dakika
    retry: 2,
  })

  return {
    protocols: data?.data || [],
    isLoading,
    error: data?.error || error,
    success: data?.success ?? false,
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
    queryFn: () => getTopProtocols(limit),
    staleTime: 5 * 60 * 1000, // 5 dakika
    retry: 2,
  })

  return {
    protocols: data?.data || [],
    isLoading,
    error: data?.error || error,
    success: data?.success ?? false,
    refetch,
  }
}

// Protokol kategorilerini getiren hook
export function useProtocolCategories() {
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: protocolKeys.categories(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('protocols')
        .select('risk_level')
        .not('risk_level', 'is', null)

      if (error) {
        throw new Error(`Failed to fetch categories: ${error.message}`)
      }

      // Benzersiz kategorileri al
      const uniqueCategories = [...new Set(data?.map(item => item.risk_level).filter(Boolean))]
      return uniqueCategories
    },
    staleTime: 10 * 60 * 1000, // 10 dakika
    retry: 1,
  })

  return {
    categories: data || [],
    isLoading,
    error,
  }
}

// Protokol arama hook'u
export function useSearchProtocols(searchTerm: string, filters: Omit<ProtocolFilters, 'search'> = {}) {
  const searchFilters = { ...filters, search: searchTerm }
  
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['protocols', 'search', searchFilters],
    queryFn: async () => {
      if (!searchTerm.trim()) {
        return { data: [], error: null, success: true }
      }

      let query = supabase
        .from('protocols')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)

      // Diğer filtreleri uygula
      if (filters.category) {
        query = query.eq('risk_level', filters.category as 'low' | 'medium' | 'high')
      }
      if (filters.minApy !== undefined) {
        query = query.gte('apy', filters.minApy)
      }
      if (filters.maxApy !== undefined) {
        query = query.lte('apy', filters.maxApy)
      }

      // Sıralama
      const sortBy = filters.sortBy || 'apy'
      const sortOrder = filters.sortOrder || 'desc'
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      const { data, error } = await query

      if (error) {
        return {
          data: null,
          error: `Search failed: ${error.message}`,
          success: false
        }
      }

      return {
        data: data || [],
        error: null,
        success: true
      }
    },
    enabled: searchTerm.trim().length >= 2, // En az 2 karakter
    staleTime: 30 * 1000, // 30 saniye
    retry: 1,
  })

  return {
    protocols: data?.data || [],
    isLoading,
    error: data?.error || error,
    success: data?.success ?? false,
    refetch,
  }
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