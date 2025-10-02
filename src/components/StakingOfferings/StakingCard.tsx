import React from 'react'
import './StakingCard.css'
import type { Protocol } from '../../types/Database.types'

interface LegacyCardData {
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

interface StakingCardProps {
  data?: LegacyCardData
  protocol?: Protocol
  onSelect?: (protocol: Protocol) => void
}

const StakingCard: React.FC<StakingCardProps> = ({ data, protocol, onSelect }) => {
  const displayName = protocol?.name || data?.name || 'Protocol'
  const displaySymbol = (data?.symbol) || (protocol ? displayName.slice(0, 3).toUpperCase() : '')
  const apyValue = protocol ? `${(protocol.apy ?? 0).toFixed(2)}%` : data?.interest || ''
  const apyLabel = protocol ? 'APY' : data?.apy || 'APY'
  const minStakeLabel = 'Minimum Stake'
  const minStakeValue = protocol ? String(protocol.min_stake ?? '-') : data?.minStake || '-'
  const risk = protocol?.risk_level

  const handleClick = () => {
    if (protocol && onSelect) onSelect(protocol)
  }

  return (
    <div className="staking-card" onClick={handleClick}>
      <div className="card-header">
        <div className="crypto-info">
          <div 
            className="crypto-logo" 
            style={{ backgroundColor: data?.color || '#1f2937' }}
          >
            {data?.logo ? (
              <img 
                src={data.logo}
                alt={`${displayName} logo`}
                className="logo-image"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  target.parentElement!.textContent = displaySymbol.charAt(0)
                }}
              />
            ) : (
              <span>{displaySymbol.charAt(0)}</span>
            )}
          </div>
          <div className="crypto-details">
            <h3 className="crypto-name">{displayName}</h3>
          </div>
        </div>
        
        <div className="apy-badge">
          <span className="apy-label">{apyLabel}</span>
          <span className="apy-value">{apyValue}</span>
        </div>
      </div>

      <div className="card-content">
        <div className="annual-yield">
          <span className="yield-label">Annual percentage yield</span>
          <span className="yield-value">{apyValue}</span>
        </div>

        <div className="min-stake-info">
          <span className="min-stake-label">{minStakeLabel}</span>
          <span className="min-stake-value">{minStakeValue}</span>
        </div>
      </div>

      {risk && (
        <div className={`risk-badge risk-${risk}`}>
          {risk === 'low' && 'Low Risk'}
          {risk === 'medium' && 'Medium Risk'}
          {risk === 'high' && 'High Risk'}
        </div>
      )}

      <button className="stake-now-btn">
        Stake Now
      </button>
    </div>
  )
}

export default StakingCard