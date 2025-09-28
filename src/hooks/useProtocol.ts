import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import toast from 'react-hot-toast'




// Query keys
export const protocolDetailKeys = {
  all: ['protocol-detail'] as const,
  detail: (id: string) => [...protocolDetailKeys.all, id] as const,
  stakes: (protocolId: string) => [...protocolDetailKeys.all, protocolId, 'stakes'] as const,
  userStakes: (protocolId: string, userId: string) => [...protocolDetailKeys.stakes(protocolId), userId] as const,
  comments: (protocolId: string) => [...protocolDetailKeys.all, protocolId, 'comments'] as const,
  rewards: (protocolId: string) => [...protocolDetailKeys.all, protocolId, 'rewards'] as const,
}

// Tekil protokol detayları hook'u
export function useProtocol(protocolId: string) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: protocolDetailKeys.detail(protocolId),
    queryFn: async () => {
      if (!protocolId) {
        throw new Error('Protocol ID is required')
      }

      const { data, error } = await supabase
        .from('protocols')
        .select('*')
        .eq('id', protocolId)
        .single()

      if (error) {
        throw new Error(`Failed to fetch protocol: ${error.message}`)
      }

      if (!data) {
        throw new Error('Protocol not found')
      }

      return data
    },
    enabled: !!protocolId,
    staleTime: 5 * 60 * 1000, // 5 dakika
    retry: 2,
  })

  return {
    protocol: data,
    isLoading,
    error,
    refetch,
  }
}

// Protokol stake'lerini getiren hook
export function useProtocolStakes(protocolId: string) {
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: protocolDetailKeys.stakes(protocolId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stakes')
        .select(`
          *,
          users (
            id,
            name,
            email
          )
        `)
        .eq('protocol_id', protocolId)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch stakes: ${error.message}`)
      }

      return data || []
    },
    enabled: !!protocolId,
    staleTime: 2 * 60 * 1000, // 2 dakika
  })

  return {
    stakes: data || [],
    isLoading,
    error,
  }
}

// Kullanıcının belirli protokoldeki stake'lerini getiren hook
export function useUserProtocolStakes(protocolId: string) {
  const { user } = useAuth()
  
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: protocolDetailKeys.userStakes(protocolId, user?.id || ''),
    queryFn: async () => {
      if (!user) {
        return []
      }

      const { data, error } = await supabase
        .from('stakes')
        .select('*')
        .eq('protocol_id', protocolId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch user stakes: ${error.message}`)
      }

      return data || []
    },
    enabled: !!protocolId && !!user,
    staleTime: 1 * 60 * 1000, // 1 dakika
  })

  return {
    stakes: data || [],
    isLoading,
    error,
    refetch,
  }
}

// Stake oluşturma hook'u
export function useCreateStake() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      protocolId,
      amount,
      lockPeriod,
    }: {
      protocolId: string
      amount: number
      lockPeriod: number
    }) => {
      if (!user) {
        throw new Error('Kullanıcı giriş yapmamış')
      }

      const startDate = new Date()
      const endDate = new Date(startDate.getTime() + lockPeriod * 24 * 60 * 60 * 1000)

      const { data, error } = await supabase
        .from('stakes')
        .insert({
          user_id: user.id,
          protocol_id: protocolId,
          amount,
          lock_period: lockPeriod,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: 'active',
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Stake oluşturulamadı: ${error.message}`)
      }

      return data
    },
    onSuccess: (_, variables) => {
      // İlgili cache'leri güncelle
      queryClient.invalidateQueries({ 
        queryKey: protocolDetailKeys.stakes(variables.protocolId) 
      })
      queryClient.invalidateQueries({ 
        queryKey: protocolDetailKeys.userStakes(variables.protocolId, user?.id || '') 
      })
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
      
      toast.success('Stake başarıyla oluşturuldu!')
    },
    onError: (error) => {
      console.error('Stake oluşturma hatası:', error)
      toast.error(error.message || 'Stake oluşturulamadı')
    },
  })
}

// Stake iptal etme hook'u
export function useCancelStake() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (stakeId: string) => {
      if (!user) {
        throw new Error('Kullanıcı giriş yapmamış')
      }

      const { data, error } = await supabase
        .from('stakes')
        .update({ status: 'cancelled' })
        .eq('id', stakeId)
        .eq('user_id', user.id) // Güvenlik için
        .select()
        .single()

      if (error) {
        throw new Error(`Stake iptal edilemedi: ${error.message}`)
      }

      return data
    },
    onSuccess: (data) => {
      // İlgili cache'leri güncelle
      queryClient.invalidateQueries({ 
        queryKey: protocolDetailKeys.stakes(data.protocol_id)
      })
      queryClient.invalidateQueries({ 
        queryKey: protocolDetailKeys.userStakes(data.protocol_id, user?.id || '') 
      })
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
      
      toast.success('Stake başarıyla iptal edildi!')
    },
    onError: (error) => {
      console.error('Stake iptal etme hatası:', error)
      toast.error(error.message || 'Stake iptal edilemedi')
    },
  })
}

// Protokol yorumlarını getiren hook
export function useProtocolComments(protocolId: string) {
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: protocolDetailKeys.comments(protocolId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          users (
            id,
            name,
            email
          )
        `)
        .eq('protocol_id', protocolId)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch comments: ${error.message}`)
      }

      return data || []
    },
    enabled: !!protocolId,
    staleTime: 1 * 60 * 1000, // 1 dakika
  })

  return {
    comments: data || [],
    isLoading,
    error,
  }
}

// Yorum ekleme hook'u
export function useAddComment() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      protocolId,
      content,
    }: {
      protocolId: string
      content: string
    }) => {
      if (!user) {
        throw new Error('Kullanıcı giriş yapmamış')
      }

      if (!content.trim()) {
        throw new Error('Yorum içeriği boş olamaz')
      }

      const { data, error } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          protocol_id: protocolId,
          content: content.trim(),
        })
        .select(`
          *,
          users (
            id,
            name,
            email
          )
        `)
        .single()

      if (error) {
        throw new Error(`Yorum eklenemedi: ${error.message}`)
      }

      return data
    },
    onSuccess: (_, variables) => {
      // Cache'i güncelle
      queryClient.invalidateQueries({ 
        queryKey: protocolDetailKeys.comments(variables.protocolId) 
      })
      
      toast.success('Yorum başarıyla eklendi!')
    },
    onError: (error) => {
      console.error('Yorum ekleme hatası:', error)
      toast.error(error.message || 'Yorum eklenemedi')
    },
  })
}

// Protokol ödüllerini getiren hook
export function useProtocolRewards(protocolId: string) {
  const { user } = useAuth()
  
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: protocolDetailKeys.rewards(protocolId),
    queryFn: async () => {
      if (!user) {
        return []
      }

      const { data, error } = await supabase
        .from('rewards')
        .select(`
          *,
          stakes (
            protocol_id,
            amount
          )
        `)
        .eq('user_id', user.id)
        .eq('stakes.protocol_id', protocolId)
        .order('reward_date', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch rewards: ${error.message}`)
      }

      return data || []
    },
    enabled: !!protocolId && !!user,
    staleTime: 2 * 60 * 1000, // 2 dakika
  })

  return {
    rewards: data || [],
    isLoading,
    error,
  }
}

// Ödül talep etme hook'u
export function useClaimReward() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (rewardId: string) => {
      if (!user) {
        throw new Error('Kullanıcı giriş yapmamış')
      }

      const { data, error } = await supabase
        .from('rewards')
        .update({ 
          claimed: true,
          claim_date: new Date().toISOString(),
        })
        .eq('id', rewardId)
        .eq('user_id', user.id) // Güvenlik için
        .select()
        .single()

      if (error) {
        throw new Error(`Ödül talep edilemedi: ${error.message}`)
      }

      return data
    },
    onSuccess: () => {
      // İlgili cache'leri güncelle
      queryClient.invalidateQueries({ queryKey: protocolDetailKeys.rewards('') })
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
      
      toast.success('Ödül başarıyla talep edildi!')
    },
    onError: (error) => {
      console.error('Ödül talep etme hatası:', error)
      toast.error(error.message || 'Ödül talep edilemedi')
    },
  })
}

// Protokol istatistiklerini getiren hook
export function useProtocolStats(protocolId: string) {
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['protocol-stats', protocolId],
    queryFn: async () => {
      const [stakesResult, rewardsResult] = await Promise.all([
        supabase
          .from('stakes')
          .select('amount, status, user_id')
          .eq('protocol_id', protocolId),
        supabase
          .from('rewards')
          .select('amount')
          .eq('stakes.protocol_id', protocolId)
      ])

      const stakes = stakesResult.data || []
      const rewards = rewardsResult.data || []

      const totalStaked = stakes.reduce((sum, stake) => sum + stake.amount, 0)
      const activeStakes = stakes.filter(stake => stake.status === 'active').length
      const totalRewards = rewards.reduce((sum, reward) => sum + reward.amount, 0)
      const totalStakers = new Set(stakes.map(stake => stake.user_id)).size

      return {
        totalStaked,
        activeStakes,
        totalRewards,
        totalStakers,
        stakesCount: stakes.length,
      }
    },
    enabled: !!protocolId,
    staleTime: 3 * 60 * 1000, // 3 dakika
  })

  return {
    stats: data,
    isLoading,
    error,
  }
}