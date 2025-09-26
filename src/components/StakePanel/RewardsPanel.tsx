import React from 'react' // React kütüphanesini import et
import { TrendingUp, Clock } from 'lucide-react' // Gerekli ikonları import et
import './RewardsPanel.css' // RewardsPanel CSS dosyasını import et

const RewardsPanel: React.FC = () => {
  return (
    <div className="rewards-panel-container"> {/* Ana rewards panel container */}
      {/* Başlık */}
      <div className="rewards-header">
        <h3 className="rewards-title">Rewards</h3> {/* Başlık metni */}
        <button className="view-all-button">View all rewards</button> {/* Tümünü gör butonu */}
      </div>

      {/* Rewards listesi */}
      <div className="rewards-list">
        {/* İlk reward öğesi */}
        <div className="reward-item">
          <div className="reward-icon-container"> {/* İkon container */}
            <div className="reward-icon trending"> {/* Trending ikonu */}
              <TrendingUp className="icon" /> {/* TrendingUp ikonu */}
            </div>
          </div>
          <div className="reward-details"> {/* Reward detayları */}
            <div className="reward-amount">240.780 SOL</div> {/* Reward miktarı */}
            <div className="reward-description">Staking</div> {/* Reward açıklaması */}
          </div>
          <div className="reward-time"> {/* Reward zamanı */}
            <Clock className="time-icon" /> {/* Saat ikonu */}
            <span className="time-text">5 mins ago</span> {/* Zaman metni */}
          </div>
        </div>

        {/* İkinci reward öğesi */}
        <div className="reward-item">
          <div className="reward-icon-container"> {/* İkon container */}
            <div className="reward-icon usdc"> {/* USDC ikonu */}
              <div className="usdc-circle">U</div> {/* USDC dairesi */}
            </div>
          </div>
          <div className="reward-details"> {/* Reward detayları */}
            <div className="reward-amount">5,000.78 USDC</div> {/* Reward miktarı */}
            <div className="reward-description">Staking</div> {/* Reward açıklaması */}
          </div>
          <div className="reward-time"> {/* Reward zamanı */}
            <Clock className="time-icon" /> {/* Saat ikonu */}
            <span className="time-text">2 hour ago</span> {/* Zaman metni */}
          </div>
        </div>

        {/* Üçüncü reward öğesi */}
        <div className="reward-item">
          <div className="reward-icon-container"> {/* İkon container */}
            <div className="reward-icon trending"> {/* Trending ikonu */}
              <TrendingUp className="icon" /> {/* TrendingUp ikonu */}
            </div>
          </div>
          <div className="reward-details"> {/* Reward detayları */}
            <div className="reward-amount">Stake again</div> {/* Tekrar stake et */}
            <div className="reward-description">Claim reward</div> {/* Reward talep et */}
          </div>
          <div className="reward-time"> {/* Reward zamanı */}
            <Clock className="time-icon" /> {/* Saat ikonu */}
            <span className="time-text">Claim reward</span> {/* Reward talep et metni */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RewardsPanel