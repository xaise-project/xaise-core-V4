import React, { useState } from 'react' // React ve useState hook'unu import et
import StakeToken from './StakeToken' // StakeToken bileşenini import et
import StakingActivation from './StakingActivation' // StakingActivation bileşenini import et
import RewardsPanel from './RewardsPanel' // RewardsPanel bileşenini import et
import InterestStats from './InterestStats' // InterestStats bileşenini import et
import './StakePanel.css' // StakePanel CSS dosyasını import et

const StakePanel: React.FC = () => {
  const [selectedToken, setSelectedToken] = useState('SOL') // Seçili token state'i

  return (
    <div className="stake-panel-container"> {/* Ana stake panel container */}
      {/* StakeToken bileşeni */}
      <StakeToken 
        selectedToken={selectedToken} 
        onTokenChange={setSelectedToken} 
      />
      
      {/* StakingActivation bileşeni */}
      <StakingActivation />
      
      {/* RewardsPanel bileşeni */}
      <RewardsPanel />
      
      {/* InterestStats bileşeni */}
      <InterestStats />
    </div>
  )
}

export default StakePanel