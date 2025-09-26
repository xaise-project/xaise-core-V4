import React from 'react' // React kütüphanesini import et
import { ChevronDown } from 'lucide-react' // ChevronDown ikonunu import et
import './StakeToken.css' // StakeToken CSS dosyasını import et

// StakeToken props interface'i
interface StakeTokenProps {
  selectedToken: string // Seçili token
  onTokenChange: (token: string) => void // Token değişim fonksiyonu
}

const StakeToken: React.FC<StakeTokenProps> = ({ selectedToken }) => {
  return (
    <div className="stake-token-container"> {/* Ana stake token container */}
      {/* Başlık */}
      <div className="stake-token-header">
        <h3 className="stake-token-title">Stake Token</h3> {/* Başlık metni */}
        <div className="polygon-badge"> {/* Polygon badge */}
          <span className="polygon-text">Polygon</span> {/* Polygon metni */}
        </div>
      </div>

      {/* Token seçimi */}
      <div className="token-selection">
        <label className="token-label">Choose a staking token</label> {/* Token seçim etiketi */}
        <div className="token-dropdown"> {/* Dropdown container */}
          <div className="selected-token"> {/* Seçili token gösterimi */}
            <div className="token-info"> {/* Token bilgileri */}
              <div className="token-icon"> {/* Token ikonu */}
                <div className="token-circle"></div> {/* Token dairesi */}
              </div>
              <div className="token-details"> {/* Token detayları */}
                <span className="token-name">{selectedToken}</span> {/* Token adı */}
                <span className="token-type">Liquid staking</span> {/* Token türü */}
              </div>
            </div>
            <ChevronDown className="dropdown-icon" /> {/* Dropdown ikonu */}
          </div>
        </div>
      </div>

      {/* Stake miktarı */}
      <div className="stake-amount-section">
        <label className="amount-label">Stake amount</label> {/* Miktar etiketi */}
        <div className="amount-input-container"> {/* Miktar input container */}
          <input 
            type="text" 
            value="0.00" 
            className="amount-input" 
            placeholder="0.00"
            readOnly
          />
          <div className="token-badge"> {/* Token badge */}
            <span className="badge-text">Sol</span> {/* Badge metni */}
          </div>
        </div>
      </div>

      {/* Stake butonu */}
      <button className="stake-button"> {/* Stake butonu */}
        Stake {/* Buton metni */}
      </button>

      {/* Bilgi metinleri */}
      <div className="stake-info">
        <div className="info-item"> {/* Bilgi öğesi */}
          <span className="info-label">Liquid staking</span> {/* Bilgi etiketi */}
        </div>
        <div className="info-item"> {/* Bilgi öğesi */}
          <span className="info-label">Booter lock</span> {/* Bilgi etiketi */}
        </div>
        <div className="info-item"> {/* Bilgi öğesi */}
          <span className="info-label">Auto stake</span> {/* Bilgi etiketi */}
        </div>
        <div className="info-item"> {/* Bilgi öğesi */}
          <span className="info-label">Timed rewards</span> {/* Bilgi etiketi */}
        </div>
      </div>
    </div>
  )
}

export default StakeToken