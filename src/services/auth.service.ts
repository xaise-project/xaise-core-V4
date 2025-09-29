import { supabase } from '../lib/supabase'
import type { User, Session, AuthError } from '@supabase/supabase-js'

export interface AuthResponse {
  user: User | null
  session: Session | null
  error: AuthError | null
}

export interface SignUpData {
  email: string
  password: string
  name?: string
}

export interface SignInData {
  email: string
  password: string
}

export interface ResetPasswordData {
  email: string
  redirectTo?: string
}

export interface UpdateUserData {
  email?: string
  password?: string
  data?: {
    name?: string
    [key: string]: any
  }
}

/**
 * Authentication Service
 * Merkezi authentication işlemleri için servis katmanı
 */
export class AuthService {
  /**
   * Kullanıcı girişi
   */
  static async signIn({ email, password }: SignInData): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      return {
        user: data.user,
        session: data.session,
        error,
      }
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error as AuthError,
      }
    }
  }

  /**
   * Kullanıcı kaydı
   */
  static async signUp({ email, password, name }: SignUpData): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || '',
          },
        },
      })

      return {
        user: data.user,
        session: data.session,
        error,
      }
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error as AuthError,
      }
    }
  }

  /**
   * Kullanıcı çıkışı
   */
  static async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  /**
   * Şifre sıfırlama
   */
  static async resetPassword({ email, redirectTo }: ResetPasswordData): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo || `${window.location.origin}/reset-password`,
      })
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  /**
   * Kullanıcı bilgilerini güncelleme
   */
  static async updateUser(userData: UpdateUserData): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.updateUser(userData)
      return {
        user: data.user,
        session: null, // updateUser doesn't return session
        error,
      }
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error as AuthError,
      }
    }
  }

  /**
   * Mevcut kullanıcıyı getir
   */
  static async getCurrentUser(): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      return { user, error }
    } catch (error) {
      return { user: null, error: error as AuthError }
    }
  }

  /**
   * Mevcut session'ı getir
   */
  static async getCurrentSession(): Promise<{ session: Session | null; error: AuthError | null }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      return { session, error }
    } catch (error) {
      return { session: null, error: error as AuthError }
    }
  }

  /**
   * Auth state değişikliklerini dinle
   */
  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }

  /**
   * Email doğrulama durumunu kontrol et
   */
  static async resendConfirmation(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      })
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  /**
   * Şifre değiştirme (giriş yapmış kullanıcı için)
   */
  static async changePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }
}

export default AuthService