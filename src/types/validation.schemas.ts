// Validation Schemas
// Day 4 - Medium Priority Task: Type Safety Improvements
// Centralized validation schema definitions using Zod

import { z } from 'zod'

// Base Schemas
export const IdSchema = z.string().uuid('Geçersiz ID formatı')
export const EmailSchema = z.string().email('Geçersiz e-posta formatı')
export const UrlSchema = z.string().url('Geçersiz URL formatı')
export const DateSchema = z.string().datetime('Geçersiz tarih formatı')

// Pagination Schema
export const PaginationSchema = z.object({
  page: z.number().int().min(1, 'Sayfa numarası 1\'den küçük olamaz').default(1),
  limit: z.number().int().min(1, 'Limit 1\'den küçük olamaz').max(100, 'Limit 100\'den büyük olamaz').default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// User Schemas
export const UserSignUpSchema = z.object({
  email: EmailSchema,
  password: z.string()
    .min(8, 'Şifre en az 8 karakter olmalı')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Şifre en az bir küçük harf, bir büyük harf ve bir rakam içermeli'),
  name: z.string()
    .min(2, 'İsim en az 2 karakter olmalı')
    .max(50, 'İsim en fazla 50 karakter olabilir')
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, 'İsim sadece harf ve boşluk içerebilir')
})

export const UserSignInSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Şifre gerekli')
})

export const UserUpdateSchema = z.object({
  name: z.string()
    .min(2, 'İsim en az 2 karakter olmalı')
    .max(50, 'İsim en fazla 50 karakter olabilir')
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, 'İsim sadece harf ve boşluk içerebilir')
    .optional(),
  avatar_url: UrlSchema.optional()
})

export const PasswordResetSchema = z.object({
  email: EmailSchema
})

export const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Mevcut şifre gerekli'),
  newPassword: z.string()
    .min(8, 'Yeni şifre en az 8 karakter olmalı')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Yeni şifre en az bir küçük harf, bir büyük harf ve bir rakam içermeli')
})

// Protocol Schemas
export const ProtocolCreateSchema = z.object({
  name: z.string()
    .min(2, 'Protokol adı en az 2 karakter olmalı')
    .max(100, 'Protokol adı en fazla 100 karakter olabilir'),
  description: z.string()
    .min(10, 'Açıklama en az 10 karakter olmalı')
    .max(1000, 'Açıklama en fazla 1000 karakter olabilir'),
  category: z.string()
    .min(2, 'Kategori en az 2 karakter olmalı')
    .max(50, 'Kategori en fazla 50 karakter olabilir'),
  apy: z.number()
    .min(0, 'APY negatif olamaz')
    .max(1000, 'APY %1000\'den fazla olamaz'),
  tvl: z.number()
    .min(0, 'TVL negatif olamaz'),
  min_stake: z.number()
    .min(0, 'Minimum stake negatif olamaz'),
  max_stake: z.number()
    .min(0, 'Maksimum stake negatif olamaz'),
  lock_period: z.number()
    .int('Kilit süresi tam sayı olmalı')
    .min(1, 'Kilit süresi en az 1 gün olmalı')
    .max(3650, 'Kilit süresi en fazla 10 yıl olabilir'),
  risk_level: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: 'Risk seviyesi low, medium veya high olmalı' })
  }),
  website_url: UrlSchema.optional(),
  logo_url: UrlSchema.optional(),
  is_active: z.boolean().default(true)
})

export const ProtocolUpdateSchema = ProtocolCreateSchema.partial()

export const ProtocolSearchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  minApy: z.number().min(0).optional(),
  maxApy: z.number().min(0).optional(),
  minTvl: z.number().min(0).optional(),
  maxTvl: z.number().min(0).optional(),
  minStake: z.number().min(0).optional(),
  maxStake: z.number().min(0).optional(),
  riskLevel: z.enum(['low', 'medium', 'high']).optional(),
  isActive: z.boolean().optional()
}).merge(PaginationSchema)

// Comment Schemas
export const CommentCreateSchema = z.object({
  protocol_id: IdSchema,
  content: z.string()
    .min(1, 'Yorum içeriği boş olamaz')
    .max(1000, 'Yorum en fazla 1000 karakter olabilir'),
  rating: z.number()
    .int('Değerlendirme tam sayı olmalı')
    .min(1, 'Değerlendirme en az 1 olmalı')
    .max(5, 'Değerlendirme en fazla 5 olabilir')
    .optional()
})

export const CommentUpdateSchema = z.object({
  content: z.string()
    .min(1, 'Yorum içeriği boş olamaz')
    .max(1000, 'Yorum en fazla 1000 karakter olabilir')
    .optional(),
  rating: z.number()
    .int('Değerlendirme tam sayı olmalı')
    .min(1, 'Değerlendirme en az 1 olmalı')
    .max(5, 'Değerlendirme en fazla 5 olabilir')
    .optional()
})

export const CommentSearchSchema = z.object({
  protocol_id: IdSchema.optional(),
  user_id: IdSchema.optional(),
  minRating: z.number().int().min(1).max(5).optional(),
  maxRating: z.number().int().min(1).max(5).optional(),
  hasRating: z.boolean().optional()
}).merge(PaginationSchema)

// Stake Schemas
export const StakeCreateSchema = z.object({
  protocol_id: IdSchema,
  amount: z.number()
    .positive('Stake miktarı pozitif olmalı')
    .multipleOf(0.01, 'Stake miktarı en fazla 2 ondalık basamak içerebilir')
})

export const StakeUpdateSchema = z.object({
  amount: z.number()
    .positive('Stake miktarı pozitif olmalı')
    .multipleOf(0.01, 'Stake miktarı en fazla 2 ondalık basamak içerebilir')
    .optional()
})

export const StakeSearchSchema = z.object({
  protocol_id: IdSchema.optional(),
  user_id: IdSchema.optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  status: z.enum(['active', 'completed', 'cancelled']).optional(),
  startDate: DateSchema.optional(),
  endDate: DateSchema.optional()
}).merge(PaginationSchema)

// Reward Schemas
export const RewardCreateSchema = z.object({
  protocol_id: IdSchema,
  user_id: IdSchema,
  amount: z.number()
    .positive('Ödül miktarı pozitif olmalı')
    .multipleOf(0.01, 'Ödül miktarı en fazla 2 ondalık basamak içerebilir'),
  reward_type: z.enum(['staking', 'referral', 'bonus', 'airdrop'], {
    errorMap: () => ({ message: 'Ödül türü staking, referral, bonus veya airdrop olmalı' })
  })
})

export const RewardSearchSchema = z.object({
  protocol_id: IdSchema.optional(),
  user_id: IdSchema.optional(),
  reward_type: z.enum(['staking', 'referral', 'bonus', 'airdrop']).optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  startDate: DateSchema.optional(),
  endDate: DateSchema.optional(),
  isClaimed: z.boolean().optional()
}).merge(PaginationSchema)

// Favorite Schemas
export const FavoriteCreateSchema = z.object({
  protocol_id: IdSchema
})

export const FavoriteSearchSchema = z.object({
  user_id: IdSchema.optional(),
  category: z.string().optional()
}).merge(PaginationSchema)

// File Upload Schemas
export const FileUploadSchema = z.object({
  file: z.instanceof(File, { message: 'Geçerli bir dosya seçin' }),
  maxSize: z.number().default(5 * 1024 * 1024), // 5MB
  allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/webp'])
}).refine(
  (data: { file: File; maxSize: number; allowedTypes: string[] }) => data.file.size <= data.maxSize,
  {
    message: 'Dosya boyutu çok büyük',
    path: ['file']
  }
).refine(
  (data: { file: File; maxSize: number; allowedTypes: string[] }) => data.allowedTypes.includes(data.file.type),
  {
    message: 'Desteklenmeyen dosya türü',
    path: ['file']
  }
)

// Analytics Schemas
export const AnalyticsQuerySchema = z.object({
  startDate: DateSchema,
  endDate: DateSchema,
  granularity: z.enum(['hour', 'day', 'week', 'month']).default('day'),
  metrics: z.array(z.string()).min(1, 'En az bir metrik seçin'),
  filters: z.record(z.any()).optional()
}).refine(
  (data: { startDate: string; endDate: string }) => new Date(data.startDate) < new Date(data.endDate),
  {
    message: 'Başlangıç tarihi bitiş tarihinden önce olmalı',
    path: ['startDate']
  }
)

// Bulk Operation Schemas
export const BulkDeleteSchema = z.object({
  ids: z.array(IdSchema).min(1, 'En az bir ID gerekli').max(100, 'En fazla 100 kayıt silinebilir')
})

export const BulkUpdateSchema = z.object({
  ids: z.array(IdSchema).min(1, 'En az bir ID gerekli').max(100, 'En fazla 100 kayıt güncellenebilir'),
  data: z.record(z.any()).refine(data => Object.keys(data).length >= 1, 'Güncellenecek veri gerekli')
})

// API Key Schemas
export const ApiKeyCreateSchema = z.object({
  name: z.string()
    .min(2, 'API key adı en az 2 karakter olmalı')
    .max(50, 'API key adı en fazla 50 karakter olabilir'),
  permissions: z.array(z.string()).min(1, 'En az bir yetki gerekli'),
  expiresAt: DateSchema.optional()
})

// Webhook Schemas
export const WebhookCreateSchema = z.object({
  url: UrlSchema,
  events: z.array(z.string()).min(1, 'En az bir event gerekli'),
  secret: z.string().min(16, 'Secret en az 16 karakter olmalı').optional(),
  isActive: z.boolean().default(true)
})

// Type Inference
export type UserSignUpInput = z.infer<typeof UserSignUpSchema>
export type UserSignInInput = z.infer<typeof UserSignInSchema>
export type UserUpdateInput = z.infer<typeof UserUpdateSchema>
export type PasswordResetInput = z.infer<typeof PasswordResetSchema>
export type PasswordChangeInput = z.infer<typeof PasswordChangeSchema>

export type ProtocolCreateInput = z.infer<typeof ProtocolCreateSchema>
export type ProtocolUpdateInput = z.infer<typeof ProtocolUpdateSchema>
export type ProtocolSearchInput = z.infer<typeof ProtocolSearchSchema>

export type CommentCreateInput = z.infer<typeof CommentCreateSchema>
export type CommentUpdateInput = z.infer<typeof CommentUpdateSchema>
export type CommentSearchInput = z.infer<typeof CommentSearchSchema>

export type StakeCreateInput = z.infer<typeof StakeCreateSchema>
export type StakeUpdateInput = z.infer<typeof StakeUpdateSchema>
export type StakeSearchInput = z.infer<typeof StakeSearchSchema>

export type RewardCreateInput = z.infer<typeof RewardCreateSchema>
export type RewardSearchInput = z.infer<typeof RewardSearchSchema>

export type FavoriteCreateInput = z.infer<typeof FavoriteCreateSchema>
export type FavoriteSearchInput = z.infer<typeof FavoriteSearchSchema>

export type FileUploadInput = z.infer<typeof FileUploadSchema>
export type AnalyticsQueryInput = z.infer<typeof AnalyticsQuerySchema>
export type BulkDeleteInput = z.infer<typeof BulkDeleteSchema>
export type BulkUpdateInput = z.infer<typeof BulkUpdateSchema>
export type ApiKeyCreateInput = z.infer<typeof ApiKeyCreateSchema>
export type WebhookCreateInput = z.infer<typeof WebhookCreateSchema>
export type PaginationInput = z.infer<typeof PaginationSchema>

// Validation Utilities
export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: z.ZodError
} {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error }
    }
    throw error
  }
}

export function validateSchemaAsync<T>(schema: z.ZodSchema<T>, data: unknown): Promise<{
  success: boolean
  data?: T
  errors?: z.ZodError
}> {
  return new Promise((resolve) => {
    try {
      const result = schema.parse(data)
      resolve({ success: true, data: result })
    } catch (error) {
      if (error instanceof z.ZodError) {
        resolve({ success: false, errors: error })
      } else {
        throw error
      }
    }
  })
}

export function getValidationErrors(error: z.ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {}
  
  error.errors.forEach((err) => {
    const path = err.path.join('.')
    if (!errors[path]) {
      errors[path] = []
    }
    errors[path].push(err.message)
  })
  
  return errors
}

export function formatValidationError(error: z.ZodError): string {
  return error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
}

// Schema Middleware for Express
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (req: any, res: any, next: any) => {
    const validation = validateSchema(schema, req.body)
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: getValidationErrors(validation.errors!)
      })
    }
    
    req.validatedData = validation.data
    next()
  }
}