import React, { useState } from 'react'
import Header from '../Header/Header' // Header bileşenini import et
import StakingOfferings from '../StakingOfferings/StakingOfferings' // Staking teklifleri bileşenini import et
import PriceChart from '../PriceChart/PriceChart' // Fiyat grafiği bileşenini import et
import StakePanel from '../StakePanel/StakePanel' // Stake paneli bileşenini import et
import './MainContent.css' // MainContent CSS dosyasını import et
import type { Protocol } from '../../types/Database.types'

const MainContent: React.FC = () => {
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null)
  return (
    <div className="main-content-container"> {/* Ana içerik container */}
      <Header /> {/* Üst header bileşeni */}
      
      <div className="content-grid"> {/* İçerik grid layout */}
        {/* Sol kolon */}
        <div className="left-column">
          <StakingOfferings onSelectProtocol={setSelectedProtocol} /> {/* Staking teklifleri bileşeni */}
          <PriceChart /> {/* Fiyat grafiği bileşeni */}
        </div>
        
        {/* Sağ kolon */}
        <div className="right-column">
          <StakePanel selectedProtocol={selectedProtocol} /> {/* Stake paneli bileşeni */}
        </div>
      </div>
    </div>
  )
}

export default MainContent