import React, { useState, useMemo, useCallback, memo } from 'react'
import StakingCard from './StakingCard'
import { FilterPanel } from './FilterPanel/FilterPanel'
import { useProtocols } from '../../hooks/useProtocols'
import { useProtocolsRealtime } from '../../hooks/useProtocolsRealtime'
// import { useProtocolsCacheSync } from '../../hooks/useProtocolsCacheSync'
import { AlertCircle } from 'lucide-react'
import { StakingCardSkeleton, FilterPanelSkeleton } from '../ui/SkeletonLoader'
import type { Protocol } from '../../types/Database.types'
import './StakingOfferings.css'

// Staking verileri interface'i
interface StakingData {
  id: string
  name: string
  symbol: string
  apy: string
  interest: string
  minStake: string
  minStakeAmount: string
  color: string
  logo: string
}

// Memoized StakingCard component
const MemoizedStakingCard = memo(StakingCard)

import ErrorBoundary from '../ErrorBoundary/ErrorBoundary'

const StakingOfferings: React.FC = () => {
  const [filterParams, setFilterParams] = useState<any>({})
  
  // Protokol verilerini çek
  const {
    protocols,
    isLoading,
    error
  } = useProtocols()

  // Real-time subscriptions
  const { isConnected, reconnect } = useProtocolsRealtime({
    enabled: true,
    onProtocolUpdate: (protocol: Protocol) => {
      console.log('Protocol updated:', protocol.name)
    }
  })

  // Cache synchronization
  // const { syncWithServer } = useProtocolsCacheSync()

  // Filter değişikliklerini handle et - MEMOIZED
  const handleFiltersChange = useCallback((newFilters: any) => {
    console.log('Filter değişikliği algılandı:', newFilters)
    setFilterParams(newFilters)
  }, [])

  // Risk seviyesine göre renk belirle - MEMOIZED
  const getRiskColor = useCallback((riskLevel: string): string => {
    switch (riskLevel) {
      case 'low': return '#10b981'
      case 'medium': return '#f59e0b'
      case 'high': return '#ef4444'
      default: return '#6b7280'
    }
  }, [])

  // Varsayılan logo URL'i oluştur - MEMOIZED
  const getDefaultLogo = useCallback((name: string): string => {
    return `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`${name} cryptocurrency logo, clean, modern, circular`)}&image_size=square`
  }, [])

  // Protokol verilerini StakingData formatına dönüştür - MEMOIZED
  const convertProtocolsToStakingData = useCallback((protocols: Protocol[]): StakingData[] => {
    if (!protocols) return []
    
    return protocols.map((protocol: Protocol) => {
      try {
        return {
          id: protocol.id,
          name: protocol.name,
          symbol: protocol.name.substring(0, 3).toUpperCase(),
          apy: `${protocol.apy}%`,
          interest: `${protocol.apy}%`,
          minStake: `${protocol.min_stake} ETH`,
          minStakeAmount: 'Min Stake',
          color: getRiskColor(protocol.risk_level || 'medium'),
          logo: getDefaultLogo(protocol.name)
        }
      } catch (error) {
        console.error('Error converting protocol to staking data:', error, protocol)
        // Return a safe fallback object
        return {
          id: protocol.id || 'unknown',
          name: protocol.name || 'Unknown Protocol',
          symbol: 'UNK',
          apy: '0%',
          interest: '0%',
          minStake: '0 ETH',
          minStakeAmount: 'Min Stake',
          color: '#6b7280',
          logo: getDefaultLogo('Unknown')
        }
      }
    }).filter(Boolean) // Remove any null/undefined entries
  }, [getRiskColor, getDefaultLogo])

  // Filtrelenmiş protokolleri al - MEMOIZED
  const filteredProtocols = useMemo(() => {
    if (!protocols) return []
    
    console.log('Filtreleme başlıyor:', { 
      totalProtocols: protocols.length, 
      filterParams 
    })
    
    let filtered = [...protocols]

    // APY range filter
    if (filterParams.minApy !== undefined && filterParams.minApy > 0) {
      const beforeCount = filtered.length
      filtered = filtered.filter(p => p.apy >= filterParams.minApy)
      console.log(`APY min filter (${filterParams.minApy}): ${beforeCount} -> ${filtered.length}`)
    }
    if (filterParams.maxApy !== undefined && filterParams.maxApy < 100) {
      const beforeCount = filtered.length
      filtered = filtered.filter(p => p.apy <= filterParams.maxApy)
      console.log(`APY max filter (${filterParams.maxApy}): ${beforeCount} -> ${filtered.length}`)
    }

    // Risk level filter
    if (filterParams.riskLevel) {
      const beforeCount = filtered.length
      filtered = filtered.filter(p => p.risk_level === filterParams.riskLevel)
      console.log(`Risk level filter (${filterParams.riskLevel}): ${beforeCount} -> ${filtered.length}`)
    }

    // Search filter
    if (filterParams.search) {
      const beforeCount = filtered.length
      const searchTerm = filterParams.search.toLowerCase()
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.description?.toLowerCase().includes(searchTerm)
      )
      console.log(`Search filter (${filterParams.search}): ${beforeCount} -> ${filtered.length}`)
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (filterParams.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'min_stake':
          aValue = a.min_stake
          bValue = b.min_stake
          break
        case 'tvl':
          aValue = a.tvl || 0
          bValue = b.tvl || 0
          break
        case 'apy':
        default:
          aValue = a.apy
          bValue = b.apy
          break
      }

      if (filterParams.sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1
      }
      return aValue > bValue ? 1 : -1
    })

    console.log('Filtreleme tamamlandı:', { 
      finalCount: filtered.length,
      sortBy: filterParams.sortBy,
      sortOrder: filterParams.sortOrder
    })

    return filtered
  }, [protocols, filterParams])

  // StakingData'ya dönüştür - MEMOIZED
  const stakingData = useMemo(() => 
    convertProtocolsToStakingData(filteredProtocols), 
    [filteredProtocols, convertProtocolsToStakingData]
  )

  // Loading state
  if (isLoading) {
    return (
      <div className="staking-offerings-container">
        <FilterPanelSkeleton />
        <div className="staking-grid">
          {Array.from({ length: 6 }, (_, index) => (
            <StakingCardSkeleton key={index} />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <ErrorBoundary fallback={
        <div className="staking-offerings-container">
          <div className="error-container">
            <AlertCircle className="error-icon" size={48} />
            <h3 className="error-title">Protokoller Yüklenemedi</h3>
            <p className="error-message">
              Staking protokolleri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
            </p>
            <p className="error-message" style={{ marginTop: '8px', fontSize: '12px', opacity: 0.7 }}>
              Hata detayı: {error}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="retry-button"
              style={{ 
                marginTop: '16px', 
                padding: '8px 16px', 
                backgroundColor: '#3b82f6', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer' 
              }}
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      }>
        <div className="staking-offerings-container">
          <div className="error-container">
            <AlertCircle className="error-icon" size={48} />
            <h3 className="error-title">Protokoller Yüklenemedi</h3>
            <p className="error-message">
              Staking protokolleri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
            </p>
            <p className="error-message" style={{ marginTop: '8px', fontSize: '12px', opacity: 0.7 }}>
              Hata detayı: {error}
            </p>
          </div>
        </div>
      </ErrorBoundary>
    )
  }

  return (
    <div className="staking-offerings-container space-y-6">
      {/* Filter Panel */}
      <FilterPanel onFiltersChange={handleFiltersChange} />
      
      {/* Real-time Connection Status */}
      {!isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-yellow-800 text-sm">
            Gerçek zamanlı bağlantı kesildi
          </span>
          <button
            onClick={reconnect}
            className="text-yellow-800 hover:text-yellow-900 text-sm underline"
          >
            Yeniden Bağlan
          </button>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <span className="text-gray-600">
          {stakingData.length} protokol bulundu
        </span>
        {isConnected && (
          <span className="text-green-600 text-sm flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Canlı veriler
          </span>
        )}
      </div>

      {/* Staking Grid */}
      {stakingData.length > 0 ? (
        <div className="staking-grid">
          {stakingData.map((stake) => (
            <MemoizedStakingCard 
              key={stake.id}
              data={stake}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <span className="text-gray-500">Filtrelere uygun protokol bulunamadı</span>
        </div>
      )}
    </div>
  )
}

// Export memoized component
export default memo(StakingOfferings)