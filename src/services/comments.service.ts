import { supabase } from '../lib/supabase'
import type { Database } from '../types/Database.types'

// Types - removed unused types
type Comment = Database['public']['Tables']['comments']['Row']
export interface CommentWithUser extends Comment {
  users: {
    id: string
    name: string | null
    email: string
  } | null
}

export interface CreateCommentData {
  protocol_id: string
  content: string
  user_id: string
}

export interface UpdateCommentData {
  content: string
}

export interface CommentsResponse {
  data: CommentWithUser[] | null
  error: string | null
}

export interface CommentResponse {
  data: CommentWithUser | null
  error: string | null
}

/**
 * Comments Service
 * Yorum işlemleri için merkezi servis katmanı
 */
export class CommentsService {
  /**
   * Protokol yorumlarını getir
   */
  static async getProtocolComments(protocolId: string): Promise<CommentsResponse> {
    try {
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
        return {
          data: null,
          error: `Yorumlar getirilemedi: ${error.message}`,
        }
      }

      return {
        data: data as CommentWithUser[],
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: `Yorumlar getirilemedi: ${error}`,
      }
    }
  }

  /**
   * Kullanıcının yorumlarını getir
   */
  static async getUserComments(userId: string): Promise<CommentsResponse> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          users (
            id,
            name,
            email
          ),
          protocols (
            id,
            name,
            logo_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        return {
          data: null,
          error: `Kullanıcı yorumları getirilemedi: ${error.message}`,
        }
      }

      return {
        data: data as CommentWithUser[],
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: `Kullanıcı yorumları getirilemedi: ${error}`,
      }
    }
  }

  /**
   * Yeni yorum ekle
   */
  static async createComment(commentData: CreateCommentData): Promise<CommentResponse> {
    try {
      if (!commentData.content.trim()) {
        return {
          data: null,
          error: 'Yorum içeriği boş olamaz',
        }
      }

      const { data, error } = await supabase
        .from('comments')
        .insert({
          user_id: commentData.user_id,
          protocol_id: commentData.protocol_id,
          content: commentData.content.trim(),
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
        return {
          data: null,
          error: `Yorum eklenemedi: ${error.message}`,
        }
      }

      return {
        data: data as CommentWithUser,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: `Yorum eklenemedi: ${error}`,
      }
    }
  }

  /**
   * Yorumu güncelle
   */
  static async updateComment(
    commentId: string,
    userId: string,
    updateData: UpdateCommentData
  ): Promise<CommentResponse> {
    try {
      if (!updateData.content.trim()) {
        return {
          data: null,
          error: 'Yorum içeriği boş olamaz',
        }
      }

      const { data, error } = await supabase
        .from('comments')
        .update({
          content: updateData.content.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', commentId)
        .eq('user_id', userId) // Güvenlik için sadece kendi yorumunu güncelleyebilir
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
        return {
          data: null,
          error: `Yorum güncellenemedi: ${error.message}`,
        }
      }

      return {
        data: data as CommentWithUser,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: `Yorum güncellenemedi: ${error}`,
      }
    }
  }

  /**
   * Yorumu sil
   */
  static async deleteComment(commentId: string, userId: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId) // Güvenlik için sadece kendi yorumunu silebilir

      if (error) {
        return {
          error: `Yorum silinemedi: ${error.message}`,
        }
      }

      return {
        error: null,
      }
    } catch (error) {
      return {
        error: `Yorum silinemedi: ${error}`,
      }
    }
  }

  /**
   * Belirli bir yorumu getir
   */
  static async getComment(commentId: string): Promise<CommentResponse> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          users (
            id,
            name,
            email
          ),
          protocols (
            id,
            name,
            logo_url
          )
        `)
        .eq('id', commentId)
        .single()

      if (error) {
        return {
          data: null,
          error: `Yorum getirilemedi: ${error.message}`,
        }
      }

      return {
        data: data as CommentWithUser,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: `Yorum getirilemedi: ${error}`,
      }
    }
  }

  /**
   * Yorum sayısını getir
   */
  static async getCommentsCount(protocolId: string): Promise<{ count: number; error: string | null }> {
    try {
      const { count, error } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('protocol_id', protocolId)

      if (error) {
        return {
          count: 0,
          error: `Yorum sayısı getirilemedi: ${error.message}`,
        }
      }

      return {
        count: count || 0,
        error: null,
      }
    } catch (error) {
      return {
        count: 0,
        error: `Yorum sayısı getirilemedi: ${error}`,
      }
    }
  }

  /**
   * Son yorumları getir (genel feed için)
   */
  static async getRecentComments(limit: number = 10): Promise<CommentsResponse> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          users (
            id,
            name,
            email
          ),
          protocols (
            id,
            name,
            logo_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        return {
          data: null,
          error: `Son yorumlar getirilemedi: ${error.message}`,
        }
      }

      return {
        data: data as CommentWithUser[],
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: `Son yorumlar getirilemedi: ${error}`,
      }
    }
  }
}

export default CommentsService