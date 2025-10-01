import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { protocolKeys } from './useProtocols'
import type { Database } from '../types/Database.types'

type Protocol = Database['public']['Tables']['protocols']['Row']

interface CacheSyncOptions {
  enableOptimisticUpdates?: boolean
  enableBatchUpdates?: boolean
  debounceMs?: number
}

export function useProtocolsCacheSync(options: CacheSyncOptions = {}) {
  const {
    enableOptimisticUpdates = true,
    enableBatchUpdates = true
  } = options

  const queryClient = useQueryClient()

  // Optimistic update for protocol changes
  const optimisticUpdateProtocol = useCallback(
    (protocolId: string, updates: Partial<Protocol>) => {
      if (!enableOptimisticUpdates) return

      // Update all protocols list
      queryClient.setQueryData(protocolKeys.all, (oldData: any) => {
        if (!oldData?.data) return oldData
        
        return {
          ...oldData,
          data: oldData.data.map((protocol: Protocol) =>
            protocol.id === protocolId 
              ? { ...protocol, ...updates }
              : protocol
          )
        }
      })

      // Update specific protocol cache
      queryClient.setQueryData(
        protocolKeys.detail(protocolId),
        (oldData: Protocol | undefined) => {
          if (!oldData) return oldData
          return { ...oldData, ...updates }
        }
      )

      // Update search results if they exist
      queryClient.setQueriesData(
        { queryKey: ['protocols', 'search'] },
        (oldData: any) => {
          if (!oldData) return oldData
          
          return oldData.map((protocol: Protocol) =>
            protocol.id === protocolId 
              ? { ...protocol, ...updates }
              : protocol
          )
        }
      )

      // Update top protocols if they exist
      queryClient.setQueriesData(
        { queryKey: protocolKeys.top(10) },
        (oldData: any) => {
          if (!oldData) return oldData
          
          return oldData.map((protocol: Protocol) =>
            protocol.id === protocolId 
              ? { ...protocol, ...updates }
              : protocol
          )
        }
      )
    },
    [queryClient, enableOptimisticUpdates]
  )

  // Batch update multiple protocols
  const batchUpdateProtocols = useCallback(
    (updates: Array<{ id: string; data: Partial<Protocol> }>) => {
      if (!enableBatchUpdates) return

      // Create a map for faster lookups
      const updatesMap = new Map(updates.map(update => [update.id, update.data]))

      // Update all protocols list
      queryClient.setQueryData(protocolKeys.all, (oldData: any) => {
        if (!oldData?.data) return oldData
        
        return {
          ...oldData,
          data: oldData.data.map((protocol: Protocol) => {
            const update = updatesMap.get(protocol.id)
            return update ? { ...protocol, ...update } : protocol
          })
        }
      })

      // Update individual protocol caches
      updates.forEach(({ id, data }) => {
        queryClient.setQueryData(
          protocolKeys.detail(id),
          (oldData: Protocol | undefined) => {
            if (!oldData) return oldData
            return { ...oldData, ...data }
          }
        )
      })
    },
    [queryClient, enableBatchUpdates]
  )

  // Invalidate related queries after real updates
  const invalidateProtocolQueries = useCallback(
    (protocolId?: string) => {
      if (protocolId) {
        // Invalidate specific protocol queries
        queryClient.invalidateQueries({
          queryKey: protocolKeys.detail(protocolId)
        })
      }
      
      // Invalidate all protocol-related queries
      queryClient.invalidateQueries({
        queryKey: protocolKeys.all
      })
      
      queryClient.invalidateQueries({
        queryKey: ['protocols', 'search']
      })
      
      queryClient.invalidateQueries({
        queryKey: protocolKeys.top(10)
      })
    },
    [queryClient]
  )

  // Sync cache with server data
  const syncWithServer = useCallback(
    async (protocolId?: string) => {
      try {
        if (protocolId) {
          // Refetch specific protocol
          await queryClient.refetchQueries({
            queryKey: protocolKeys.detail(protocolId)
          })
        } else {
          // Refetch all protocols
          await queryClient.refetchQueries({
            queryKey: protocolKeys.all
          })
        }
      } catch (error) {
        console.error('Cache sync error:', error)
      }
    },
    [queryClient]
  )

  // Remove protocol from cache
  const removeProtocolFromCache = useCallback(
    (protocolId: string) => {
      // Remove from all protocols list
      queryClient.setQueryData(protocolKeys.all, (oldData: any) => {
        if (!oldData?.data) return oldData
        
        return {
          ...oldData,
          data: oldData.data.filter((protocol: Protocol) => 
            protocol.id !== protocolId
          )
        }
      })

      // Remove specific protocol cache
      queryClient.removeQueries({
        queryKey: protocolKeys.detail(protocolId)
      })

      // Remove from search results
      queryClient.setQueriesData(
        { queryKey: ['protocols', 'search'] },
        (oldData: any) => {
          if (!oldData) return oldData
          return oldData.filter((protocol: Protocol) => 
            protocol.id !== protocolId
          )
        }
      )
    },
    [queryClient]
  )

  // Add new protocol to cache
  const addProtocolToCache = useCallback(
    (newProtocol: Protocol) => {
      // Add to all protocols list
      queryClient.setQueryData(protocolKeys.all, (oldData: any) => {
        if (!oldData) return { data: [newProtocol] }
        
        return {
          ...oldData,
          data: [newProtocol, ...(oldData.data || [])]
        }
      })

      // Set specific protocol cache
      queryClient.setQueryData(
        protocolKeys.detail(newProtocol.id),
        newProtocol
      )
    },
    [queryClient]
  )

  // Get cache statistics
  const getCacheStats = useCallback(() => {
    const allProtocolsCache = queryClient.getQueryData(protocolKeys.all)
    const cacheKeys = queryClient.getQueryCache().getAll()
    
    const protocolCaches = cacheKeys.filter(query => 
      query.queryKey[0] === 'protocols'
    )

    return {
      totalProtocolCaches: protocolCaches.length,
      allProtocolsCount: (allProtocolsCache as any)?.data?.length || 0,
      cacheSize: protocolCaches.reduce((size, query) => {
        return size + JSON.stringify(query.state.data).length
      }, 0)
    }
  }, [queryClient])

  return {
    optimisticUpdateProtocol,
    batchUpdateProtocols,
    invalidateProtocolQueries,
    syncWithServer,
    removeProtocolFromCache,
    addProtocolToCache,
    getCacheStats
  }
}