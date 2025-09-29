// API Response Types
// Day 4 - Medium Priority Task: Type Safety Improvements
// Centralized API response type definitions

import type { Database } from './Database.types'

// Database table types
type Protocol = Database['public']['Tables']['protocols']['Row']
type User = Database['public']['Tables']['users']['Row']
type Comment = Database['public']['Tables']['comments']['Row']
type Stake = Database['public']['Tables']['stakes']['Row']
type Reward = Database['public']['Tables']['rewards']['Row']
type Favorite = Database['public']['Tables']['favorites']['Row']

// Base API Response Structure
export interface BaseApiResponse {
  success: boolean
  timestamp?: string
  requestId?: string
}

export interface ApiResponse<T = any> extends BaseApiResponse {
  data: T | null
  error: string | null
}

export interface ApiError extends BaseApiResponse {
  success: false
  error: string
  errorCode?: string
  details?: Record<string, any>
}

export interface ApiSuccess<T> extends BaseApiResponse {
  success: true
  data: T
  error: null
}

// Pagination Types
export interface PaginationMeta {
  currentPage: number
  totalPages: number
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  limit: number
  offset: number
}

export interface PaginatedApiResponse<T> extends BaseApiResponse {
  data: T[]
  meta: PaginationMeta
  error: string | null
}

// Protocol API Responses
export interface ProtocolResponse extends ApiResponse<Protocol> {}
export interface ProtocolsResponse extends ApiResponse<Protocol[]> {}
export interface PaginatedProtocolsResponse extends PaginatedApiResponse<Protocol> {}

export interface ProtocolCategoriesResponse extends ApiResponse<string[]> {}

export interface ProtocolStatsResponse extends ApiResponse<{
  totalProtocols: number
  avgApy: number
  totalTvl: number
  categoriesCount: number
  categories: string[]
}> {}

// User API Responses
export interface UserResponse extends ApiResponse<User> {}
export interface UsersResponse extends ApiResponse<User[]> {}

export interface UserProfileResponse extends ApiResponse<{
  id: string
  name: string
  email: string
  avatar_url?: string
  created_at: string
  updated_at: string
}> {}

export interface UserStatsResponse extends ApiResponse<{
  totalStakes: number
  totalStaked: number
  totalRewards: number
  activeStakes: number
  completedStakes: number
  favoriteProtocols: number
}> {}

// Authentication API Responses
export interface AuthResponse extends ApiResponse<{
  user: User
  session: any
  access_token: string
  refresh_token: string
}> {}

export interface SignInResponse extends AuthResponse {}
export interface SignUpResponse extends AuthResponse {}

export interface PasswordResetResponse extends ApiResponse<{
  message: string
}> {}

// Comment API Responses
export interface CommentResponse extends ApiResponse<Comment> {}
export interface CommentsResponse extends ApiResponse<Comment[]> {}
export interface PaginatedCommentsResponse extends PaginatedApiResponse<Comment> {}

export interface CommentWithUser extends Comment {
  users: {
    id: string
    name: string
    avatar_url?: string
  }
}

export interface CommentsWithUsersResponse extends ApiResponse<CommentWithUser[]> {}

// Stake API Responses
export interface StakeResponse extends ApiResponse<Stake> {}
export interface StakesResponse extends ApiResponse<Stake[]> {}
export interface PaginatedStakesResponse extends PaginatedApiResponse<Stake> {}

export interface StakeWithProtocol extends Stake {
  protocols: {
    id: string
    name: string
    category: string
    apy: number
  }
}

export interface StakesWithProtocolsResponse extends ApiResponse<StakeWithProtocol[]> {}

// Reward API Responses
export interface RewardResponse extends ApiResponse<Reward> {}
export interface RewardsResponse extends ApiResponse<Reward[]> {}
export interface PaginatedRewardsResponse extends PaginatedApiResponse<Reward> {}

// Favorite API Responses
export interface FavoriteResponse extends ApiResponse<Favorite> {}
export interface FavoritesResponse extends ApiResponse<Favorite[]> {}

export interface FavoriteProtocolsResponse extends ApiResponse<Protocol[]> {}

export interface FavoriteToggleResponse extends ApiResponse<{
  protocolId: string
  isFavorite: boolean
}> {}

export interface FavoriteStatsResponse extends ApiResponse<{
  totalFavorites: number
  recentFavorites: Protocol[]
  topCategories: string[]
}> {}

// Search and Filter Types
export interface SearchFilters {
  query?: string
  category?: string
  minApy?: number
  maxApy?: number
  minTvl?: number
  maxTvl?: number
  riskLevel?: 'low' | 'medium' | 'high'
  sortBy?: 'apy' | 'tvl' | 'created_at' | 'name'
  sortOrder?: 'asc' | 'desc'
}

export interface ProtocolSearchFilters extends SearchFilters {
  minStake?: number
  maxStake?: number
}

export interface SearchResponse<T> extends PaginatedApiResponse<T> {
  filters: SearchFilters
  searchQuery?: string
}

// Bulk Operations
export interface BulkOperationResponse<T> extends ApiResponse<{
  successful: T[]
  failed: Array<{
    item: T
    error: string
  }>
  totalProcessed: number
  successCount: number
  failureCount: number
}> {}

// File Upload Types
export interface FileUploadResponse extends ApiResponse<{
  url: string
  filename: string
  size: number
  contentType: string
  uploadedAt: string
}> {}

// Analytics Types
export interface AnalyticsResponse extends ApiResponse<{
  metrics: Record<string, number>
  timeRange: {
    start: string
    end: string
  }
  granularity: 'hour' | 'day' | 'week' | 'month'
}> {}

// Health Check Types
export interface HealthCheckResponse extends ApiResponse<{
  status: 'healthy' | 'degraded' | 'unhealthy'
  services: Record<string, {
    status: 'up' | 'down'
    responseTime?: number
    lastCheck: string
  }>
  uptime: number
  version: string
}> {}

// Type Guards
export function isApiError(response: any): response is ApiError {
  return response && response.success === false && typeof response.error === 'string'
}

export function isApiSuccess<T>(response: any): response is ApiSuccess<T> {
  return response && response.success === true && response.data !== null
}

export function isPaginatedResponse<T>(response: any): response is PaginatedApiResponse<T> {
  return response && Array.isArray(response.data) && response.meta && typeof response.meta.totalCount === 'number'
}

// Response Builders
export function createApiResponse<T>(
  data: T | null,
  error: string | null = null,
  success: boolean = error === null
): ApiResponse<T> {
  return {
    success,
    data,
    error,
    timestamp: new Date().toISOString()
  }
}

export function createApiError(
  error: string,
  errorCode?: string,
  details?: Record<string, any>
): ApiError {
  return {
    success: false,
    error,
    errorCode,
    details,
    timestamp: new Date().toISOString()
  }
}

export function createApiSuccess<T>(data: T): ApiSuccess<T> {
  return {
    success: true,
    data,
    error: null,
    timestamp: new Date().toISOString()
  }
}

export function createPaginatedResponse<T>(
  data: T[],
  meta: PaginationMeta,
  error: string | null = null
): PaginatedApiResponse<T> {
  return {
    success: error === null,
    data,
    meta,
    error,
    timestamp: new Date().toISOString()
  }
}