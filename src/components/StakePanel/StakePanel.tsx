import React, { useState } from 'react'
import StakeToken from './StakeToken' // StakeToken bileşenini import et
import StakingActivation from './StakingActivation' // StakingActivation bileşenini import et
import RewardsPanel from './RewardsPanel' // RewardsPanel bileşenini import et
import InterestStats from './InterestStats' // InterestStats bileşenini import et
import './StakePanel.css' // StakePanel CSS dosyasını import et
import type { Protocol } from '../../types/Database.types'

interface StakePanelProps {
  selectedProtocol: Protocol | null
}

const StakePanel: React.FC<StakePanelProps> = ({ selectedProtocol }) => {
  const [selectedToken, setSelectedToken] = useState('SOL') // Seçili token state'i

  return (
    <div className="stake-panel-container"> {/* Ana stake panel container */}
      {/* StakeToken bileşeni */}
      <StakeToken 
        selectedToken={selectedToken} 
        onTokenChange={setSelectedToken} 
      />
      
      {/* StakingActivation bileşeni */}
      <StakingActivation minStake={selectedProtocol?.min_stake ?? null} tokenSymbol={selectedToken} />
      
      {/* RewardsPanel bileşeni */}
      <RewardsPanel />
      
      {/* InterestStats bileşeni */}
      <InterestStats />
    </div>
  )
}

export default StakePanel