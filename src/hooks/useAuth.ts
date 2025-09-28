import { useState, useEffect } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  initialized: boolean
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, name?: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
}

export function useAuth(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    initialized: false,
  })

  useEffect(() => {
    // Session'ı başlat
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session alma hatası:', error)
          toast.error('Oturum bilgileri alınamadı')
        }

        setState({
          user: session?.user ?? null,
          session,
          loading: false,
          initialized: true,
        })
      } catch (error) {
        console.error('Auth başlatma hatası:', error)
        setState(prev => ({ ...prev, loading: false, initialized: true }))
      }
    }

    initializeAuth()

    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state değişti:', event, session?.user?.email)
        
        setState({
          user: session?.user ?? null,
          session,
          loading: false,
          initialized: true,
        })

        // Event'lere göre toast mesajları
        if (event === 'SIGNED_IN') {
          toast.success('Başarıyla giriş yapıldı!')
        } else if (event === 'SIGNED_OUT') {
          toast.success('Çıkış yapıldı')
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token yenilendi')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message || 'Giriş yapılamadı')
        return { error }
      }

      return { error: null }
    } catch (error) {
      const authError = error as AuthError
      toast.error('Beklenmeyen bir hata oluştu')
      return { error: authError }
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || '',
          },
        },
      })

      if (error) {
        toast.error(error.message || 'Kayıt oluşturulamadı')
        return { error }
      }

      toast.success('Kayıt başarılı! E-posta adresinizi kontrol edin.')
      return { error: null }
    } catch (error) {
      const authError = error as AuthError
      toast.error('Beklenmeyen bir hata oluştu')
      return { error: authError }
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const signOut = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        toast.error('Çıkış yapılamadı')
        console.error('Çıkış hatası:', error)
      }
    } catch (error) {
      console.error('Çıkış hatası:', error)
      toast.error('Beklenmeyen bir hata oluştu')
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        toast.error(error.message || 'Şifre sıfırlama e-postası gönderilemedi')
        return { error }
      }

      toast.success('Şifre sıfırlama e-postası gönderildi!')
      return { error: null }
    } catch (error) {
      const authError = error as AuthError
      toast.error('Beklenmeyen bir hata oluştu')
      return { error: authError }
    }
  }

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }
}

// Kullanıcının giriş yapıp yapmadığını kontrol eden yardımcı hook
export function useRequireAuth() {
  const { user, loading, initialized } = useAuth()
  
  useEffect(() => {
    if (initialized && !loading && !user) {
      toast.error('Bu sayfaya erişmek için giriş yapmalısınız')
      // Router kullanıyorsanız buraya yönlendirme ekleyebilirsiniz
      // navigate('/login')
    }
  }, [user, loading, initialized])
  
  return { user, loading, initialized, isAuthenticated: !!user }
}