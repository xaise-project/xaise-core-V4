import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { getCurrentUserProfile, getUserProfile } from '../lib/api'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'


// Query keys
export const userKeys = {
  all: ['users'] as const,
  profile: (userId: string) => [...userKeys.all, 'profile', userId] as const,
  currentProfile: () => [...userKeys.all, 'current-profile'] as const,
}

// Kullanıcı profili güncelleme için tip
interface UpdateProfileData {
  name?: string
  email?: string
  avatar_url?: string
  bio?: string
}

// Mevcut kullanıcının profilini getiren hook
export function useCurrentUser() {
  const { user, loading: authLoading } = useAuth()
  
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: userKeys.currentProfile(),
    queryFn: getCurrentUserProfile,
    enabled: !!user && !authLoading, // Sadece kullanıcı giriş yaptıysa çalıştır
    staleTime: 5 * 60 * 1000, // 5 dakika
    retry: 1,
  })

  return {
    user,
    profile: profile?.data,
    isLoading: authLoading || isLoading,
    error,
    refetch,
    isAuthenticated: !!user,
  }
}

// Belirli bir kullanıcının profilini getiren hook
export function useUser(userId: string) {
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: userKeys.profile(userId),
    queryFn: () => getUserProfile(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 dakika
    retry: 1,
  })

  return {
    profile: profile?.data,
    isLoading,
    error,
    refetch,
  }
}

// Kullanıcı profili güncelleme hook'u
export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      if (!user) {
        throw new Error('Kullanıcı giriş yapmamış')
      }

      // Supabase auth user metadata'sını güncelle
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          name: data.name,
          avatar_url: data.avatar_url,
        },
      })

      if (authError) {
        throw authError
      }

      // Eğer users tablosu varsa onu da güncelle
      const { error: profileError } = await supabase
        .from('users')
        .update({
          name: data.name,
          avatar_url: data.avatar_url,
          bio: data.bio,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (profileError) {
        console.warn('Profil tablosu güncellenemedi:', profileError)
        // Bu hata kritik değil, auth metadata güncellenmiş olabilir
      }

      return data
    },
    onSuccess: () => {
      // Cache'i güncelle
      queryClient.invalidateQueries({ queryKey: userKeys.currentProfile() })
      if (user) {
        queryClient.invalidateQueries({ queryKey: userKeys.profile(user.id) })
      }
      
      toast.success('Profil başarıyla güncellendi!')
    },
    onError: (error) => {
      console.error('Profil güncelleme hatası:', error)
      toast.error('Profil güncellenirken bir hata oluştu')
    },
  })
}

// Şifre değiştirme hook'u
export function useChangePassword() {
  return useMutation({
    mutationFn: async (newPassword: string) => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        throw error
      }
    },
    onSuccess: () => {
      toast.success('Şifre başarıyla değiştirildi!')
    },
    onError: (error) => {
      console.error('Şifre değiştirme hatası:', error)
      toast.error('Şifre değiştirilirken bir hata oluştu')
    },
  })
}

// Avatar yükleme hook'u
export function useUploadAvatar() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) {
        throw new Error('Kullanıcı giriş yapmamış')
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Dosyayı Supabase Storage'a yükle
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Public URL'i al
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const avatarUrl = data.publicUrl

      // Kullanıcı profilini güncelle
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl },
      })

      if (updateError) {
        throw updateError
      }

      return avatarUrl
    },
    onSuccess: () => {
      // Cache'i güncelle
      queryClient.invalidateQueries({ queryKey: userKeys.currentProfile() })
      if (user) {
        queryClient.invalidateQueries({ queryKey: userKeys.profile(user.id) })
      }
      
      toast.success('Avatar başarıyla yüklendi!')
    },
    onError: (error) => {
      console.error('Avatar yükleme hatası:', error)
      toast.error('Avatar yüklenirken bir hata oluştu')
    },
  })
}

// Kullanıcı istatistiklerini getiren hook
export function useUserStats(userId?: string) {
  const { user } = useAuth()
  const targetUserId = userId || user?.id

  return useQuery({
    queryKey: ['user-stats', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return null

      // Kullanıcının stake'lerini, ödüllerini vs. getir
      const [stakesResult, rewardsResult, favoritesResult] = await Promise.all([
        supabase
          .from('stakes')
          .select('*')
          .eq('user_id', targetUserId),
        supabase
          .from('rewards')
          .select('*')
          .eq('user_id', targetUserId),
        supabase
          .from('favorites')
          .select('*')
          .eq('user_id', targetUserId),
      ])

      const totalStaked = stakesResult.data?.reduce((sum, stake) => sum + stake.amount, 0) || 0
      const totalRewards = rewardsResult.data?.reduce((sum, reward) => sum + reward.amount, 0) || 0
      const activeStakes = stakesResult.data?.filter(stake => stake.status === 'active').length || 0
      const favoriteCount = favoritesResult.data?.length || 0

      return {
        totalStaked,
        totalRewards,
        activeStakes,
        favoriteCount,
        stakes: stakesResult.data || [],
        rewards: rewardsResult.data || [],
      }
    },
    enabled: !!targetUserId,
    staleTime: 2 * 60 * 1000, // 2 dakika
  })
}