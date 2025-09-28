// Hook'ları dışa aktaran ana index dosyası

// Authentication hooks
export { useAuth, useRequireAuth } from './useAuth'

// User management hooks
export {
  useCurrentUser,
  useUser,
  useUpdateProfile,
  useChangePassword,
  useUploadAvatar,
  useUserStats,
} from './useUser'

// Protocol list hooks
export {
  useProtocols,
  useProtocolsByCategory,
  useTopProtocols,
  useProtocolCategories,
  useSearchProtocols,
  useFavoriteProtocol,
  useFavoriteProtocols,
  useProtocolStats as useProtocolsStats,
} from './useProtocols'

// Single protocol hooks
export {
  useProtocol,
  useProtocolStakes,
  useUserProtocolStakes,
  useCreateStake,
  useCancelStake,
  useProtocolComments,
  useAddComment,
  useProtocolRewards,
  useClaimReward,
  useProtocolStats,
} from './useProtocol'

// Hook query keys (cache management için)
export { protocolKeys } from './useProtocols'
export { protocolDetailKeys } from './useProtocol'

// Type exports
export type { AuthState } from './useAuth'

// Utility hooks
export const useHookStatus = () => {
  return {
    version: '1.0.0',
    hooks: {
      authentication: ['useAuth', 'useRequireAuth'],
      user: ['useCurrentUser', 'useUser', 'useUpdateProfile', 'useChangePassword', 'useUploadAvatar', 'useUserStats'],
      protocols: ['useProtocols', 'useProtocolsByCategory', 'useTopProtocols', 'useProtocolCategories', 'useSearchProtocols'],
      protocol: ['useProtocol', 'useProtocolStakes', 'useUserProtocolStakes', 'useCreateStake', 'useCancelStake'],
      comments: ['useProtocolComments', 'useAddComment'],
      rewards: ['useProtocolRewards', 'useClaimReward'],
      favorites: ['useFavoriteProtocol', 'useFavoriteProtocols'],
      stats: ['useProtocolStats', 'useUserStats'],
    },
    status: 'ready',
  }
}