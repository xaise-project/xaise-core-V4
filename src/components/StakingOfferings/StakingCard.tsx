import React from 'react' // React kütüphanesini import et
import './StakingCard.css' // StakingCard CSS dosyasını import et

// StakingCard props interface'i
interface StakingCardProps {
  data: {
    id: string // Benzersiz kimlik
    name: string // Kripto para adı
    symbol: string // Kripto para sembolü
    apy: string // Yıllık getiri oranı
    interest: string // Faiz oranı
    minStake: string // Minimum stake miktarı
    minStakeAmount: string // Minimum stake etiketi
    color: string // Kart rengi
    logo: string // Logo URL'i
  }
}

const StakingCard: React.FC<StakingCardProps> = ({ data }) => {
  return (
    <div className="staking-card"> {/* Ana kart container */}
      {/* Kart başlığı */}
      <div className="card-header">
        <div className="crypto-info"> {/* Kripto para bilgileri */}
          <div 
            className="crypto-logo" 
            style={{ backgroundColor: data.color }} // Dinamik arka plan rengi
          >
            <img 
              src={data.logo} 
              alt={`${data.name} logo`} 
              className="logo-image"
              onError={(e) => { // Resim yüklenemezse fallback
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                target.parentElement!.textContent = data.symbol.charAt(0) // İlk harfi göster
              }}
            />
          </div>
          <div className="crypto-details"> {/* Kripto para detayları */}
            <h3 className="crypto-name">{data.name}</h3> {/* Kripto para adı */}
            <span className="crypto-symbol">{data.symbol}</span> {/* Kripto para sembolü */}
          </div>
        </div>
        
        {/* APY badge */}
        <div className="apy-badge">
          <span className="apy-label">{data.apy}</span> {/* APY etiketi */}
          <span className="apy-value">{data.interest}</span> {/* APY değeri */}
        </div>
      </div>

      {/* Kart içeriği */}
      <div className="card-content">
        {/* Yıllık getiri bilgisi */}
        <div className="annual-yield">
          <span className="yield-label">Annual percentage yield</span> {/* Yıllık getiri etiketi */}
          <span className="yield-value">
            {data.name === 'Cardano' ? '30.45%' : '12.65%'} {/* Dinamik getiri değeri */}
          </span>
        </div>

        {/* Minimum stake bilgisi */}
        <div className="min-stake-info">
          <span className="min-stake-label">{data.minStakeAmount}</span> {/* Minimum stake etiketi */}
          <span className="min-stake-value">{data.minStake}</span> {/* Minimum stake değeri */}
        </div>
      </div>

      {/* Stake Now butonu */}
      <button className="stake-now-btn">
        Stake Now {/* Şimdi stake et butonu */}
      </button>
    </div>
  )
}

export default StakingCard