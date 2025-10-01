import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { protocolKeys } from './useProtocols'
import type { Database } from '../types/Database.types'
import toast from 'react-hot-toast'

type Protocol = Database['public']['Tables']['protocols']['Row']

interface UseProtocolsRealtimeOptions {
  enabled?: boolean
  onProtocolUpdate?: (protocol: Protocol) => void
  onProtocolInsert?: (protocol: Protocol) => void
  onProtocolDelete?: (protocolId: string) => void
}

export function useProtocolsRealtime(options: UseProtocolsRealtimeOptions = {}) {
  const {
    enabled = true,
    onProtocolUpdate,
    onProtocolInsert,
    onProtocolDelete
  } = options

  const queryClient = useQueryClient()
  const subscriptionRef = useRef<any>(null)

  useEffect(() => {
    if (!enabled) return

    // Protocols tablosundaki değişiklikleri dinle
    const subscription = supabase
      .channel('protocols-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'protocols'
        },
        (payload) => {
          console.log('Protocol realtime update:', payload)

          switch (payload.eventType) {
            case 'INSERT': {
              const newProtocol = payload.new as Protocol
              
              // Cache'i güncelle - yeni protokol ekle
              queryClient.setQueryData(protocolKeys.all, (oldData: any) => {
                if (!oldData) return oldData
                return {
                  ...oldData,
                  data: [...(oldData.data || []), newProtocol]
                }
              })

              // Callback çağır
              onProtocolInsert?.(newProtocol)
              
              toast.success(`Yeni protokol eklendi: ${newProtocol.name}`)
              break
            }

            case 'UPDATE': {
              const updatedProtocol = payload.new as Protocol
              const oldProtocol = payload.old as Protocol
              
              // Cache'deki protokolü güncelle
              queryClient.setQueryData(protocolKeys.all, (oldData: any) => {
                if (!oldData?.data) return oldData
                
                return {
                  ...oldData,
                  data: oldData.data.map((protocol: Protocol) =>
                    protocol.id === updatedProtocol.id ? updatedProtocol : protocol
                  )
                }
              })

              // Spesifik protokol cache'ini güncelle
              queryClient.setQueryData(
                protocolKeys.detail(updatedProtocol.id),
                updatedProtocol
              )

              // Callback çağır
              onProtocolUpdate?.(updatedProtocol)

              // APY değişikliği varsa bildirim göster
              if (oldProtocol.apy !== updatedProtocol.apy) {
                const change = updatedProtocol.apy > oldProtocol.apy ? 'arttı' : 'azaldı'
                toast.success(
                  `${updatedProtocol.name} APY'si ${change}: ${updatedProtocol.apy}%`,
                  { duration: 4000 }
                )
              }
              break
            }

            case 'DELETE': {
              const deletedProtocol = payload.old as Protocol
              
              // Cache'den protokolü kaldır
              queryClient.setQueryData(protocolKeys.all, (oldData: any) => {
                if (!oldData?.data) return oldData
                
                return {
                  ...oldData,
                  data: oldData.data.filter((protocol: Protocol) => 
                    protocol.id !== deletedProtocol.id
                  )
                }
              })

              // Spesifik protokol cache'ini temizle
              queryClient.removeQueries({
                queryKey: protocolKeys.detail(deletedProtocol.id)
              })

              // Callback çağır
              onProtocolDelete?.(deletedProtocol.id)
              
              toast.error(`Protokol kaldırıldı: ${deletedProtocol.name}`)
              break
            }
          }

          // İlgili query'leri yeniden fetch et
          queryClient.invalidateQueries({
            queryKey: protocolKeys.all
          })
        }
      )
      .subscribe()

    subscriptionRef.current = subscription

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current)
        subscriptionRef.current = null
      }
    }
  }, [enabled, queryClient, onProtocolUpdate, onProtocolInsert, onProtocolDelete])

  // Subscription durumunu kontrol etme fonksiyonu
  const getSubscriptionStatus = () => {
    return subscriptionRef.current?.state || 'closed'
  }

  // Manuel olarak subscription'ı yeniden başlatma
  const reconnect = () => {
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current)
    }
    
    // Yeniden subscription oluştur
    const subscription = supabase
      .channel('protocols-changes-reconnect')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'protocols'
      }, (payload) => {
        console.log('Protocol realtime reconnect update:', payload)
        // Aynı logic'i tekrar uygula
      })
      .subscribe()

    subscriptionRef.current = subscription
  }

  return {
    isConnected: getSubscriptionStatus() === 'subscribed',
    reconnect,
    getSubscriptionStatus
  }
}