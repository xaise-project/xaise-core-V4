import React, { useState } from 'react'
import StakingCard from './StakingCard'
import { FilterPanel } from './FilterPanel/FilterPanel'
import { useProtocols } from '../../hooks/useProtocols'
import { useProtocolsRealtime } from '../../hooks/useProtocolsRealtime'
// import { useProtocolsCacheSync } from '../../hooks/useProtocolsCacheSync'
import { Loader2, AlertCircle } from 'lucide-react'
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
  riskLevel: 'low' | 'medium' | 'high'
  color: string
  logo: string
}

const StakingOfferings: React.FC = () => {
  const [filterParams, setFilterParams] = useState<any>({})
  const [currentPage, setCurrentPage] = useState<number>(1)
  
  // Protokol verilerini çek
  const { 
    protocols, 
    isLoading, 
    error, 
    refetch 
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

  // Filter değişikliklerini handle et
  const handleFiltersChange = React.useCallback((newFilters: any) => {
    console.log('Filter değişikliği algılandı:', newFilters)
    setFilterParams(newFilters)
    // Filtre değişince ilk sayfaya dön
    setCurrentPage(1)
  }, [])

  // Protokol verilerini StakingData formatına dönüştür
  const convertProtocolsToStakingData = (protocols: Protocol[]): StakingData[] => {
    if (!protocols) return []
    
    return protocols.map((protocol: Protocol) => ({
      id: protocol.id,
      name: protocol.name,
      symbol: protocol.name.substring(0, 3).toUpperCase(),
      apy: `${protocol.apy}%`,
      interest: `${protocol.apy}%`,
      minStake: `${protocol.min_stake} ETH`,
      minStakeAmount: 'Minimum Stake',
      riskLevel: (protocol.risk_level || 'medium') as 'low' | 'medium' | 'high',
      color: getRiskColor(protocol.risk_level || 'medium'),
      logo: getDefaultLogo(protocol.name)
    }))
  }

  // Risk seviyesine göre renk belirle
  const getRiskColor = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'low': return '#10b981'
      case 'medium': return '#f59e0b'
      case 'high': return '#ef4444'
      default: return '#6b7280'
    }
  }

  // Varsayılan logo URL'i oluştur
  const getDefaultLogo = (name: string): string => {
    return `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`${name} cryptocurrency logo, clean, modern, circular`)}&image_size=square`
  }

  // Filtrelenmiş protokolleri al
  const getFilteredProtocols = () => {
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

    // Category filter - protocols tablosunda category field yok, bu filtreyi kaldırıyoruz
    // if (filterParams.category) {
    //   filtered = filtered.filter(p => p.category === filterParams.category)
    // }

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
  }

  const filteredProtocols = getFilteredProtocols()
  const stakingData = convertProtocolsToStakingData(filteredProtocols)

  // Sayfalama
  const itemsPerPage = 6
  const totalPages = Math.max(1, Math.ceil(stakingData.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = stakingData.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  const goPrev = () => goToPage(currentPage - 1)
  const goNext = () => goToPage(currentPage + 1)

  // Loading state
  if (isLoading) {
    return (
      <div className="staking-offerings-container">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Protokoller yükleniyor...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="staking-offerings-container">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-8 w-8 text-red-600 mb-2" />
          <span className="text-red-600 mb-4">Protokoller yüklenirken hata oluştu</span>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
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
        <>
          <div className="staking-grid">
            {paginatedData.map((stake) => (
              <StakingCard 
                key={stake.id}
                data={stake}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-button"
                onClick={goPrev}
                disabled={currentPage === 1}
              >
                Önceki
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`page-number ${page === currentPage ? 'active' : ''}`}
                  onClick={() => goToPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                className="page-button"
                onClick={goNext}
                disabled={currentPage === totalPages}
              >
                Sonraki
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <span className="text-gray-500">Filtrelere uygun protokol bulunamadı</span>
        </div>
      )}
    </div>
  )
}

export default StakingOfferings