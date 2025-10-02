import React from 'react'
import StakingCard from './StakingCard'
import './StakingOfferings.css'
import { useTopProtocols } from '../../hooks/useProtocols'
import type { Protocol } from '../../types/Database.types'

interface StakingOfferingsProps {
  onSelectProtocol?: (protocol: Protocol) => void
}

const StakingOfferings: React.FC<StakingOfferingsProps> = ({ onSelectProtocol }) => {
  const { protocols, isLoading } = useTopProtocols(5)

  return (
    <div className="staking-offerings-container">
      <div className="staking-grid">
        {isLoading && (
          <div style={{ color: '#9ca3af' }}>Loading protocols...</div>
        )}
        {!isLoading && protocols.map((protocol: any) => (
          <StakingCard 
            key={protocol.id}
            protocol={protocol as Protocol}
            onSelect={onSelectProtocol}
          />
        ))}
      </div>
    </div>
  )
}

export default StakingOfferings