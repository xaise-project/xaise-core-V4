import React, { useMemo, useState } from 'react'
import { Lock, Calendar, ChevronDown } from 'lucide-react' // Gerekli ikonları import et
import './StakingActivation.css' // StakingActivation CSS dosyasını import et

interface StakingActivationProps {
  minStake: number | null
  tokenSymbol: string
}

const StakingActivation: React.FC<StakingActivationProps> = ({ minStake, tokenSymbol }) => {
  const [selectedAsset, setSelectedAsset] = useState('Locked')
  const [lockPeriod, setLockPeriod] = useState('6 Month')
  const [stakeAmount, setStakeAmount] = useState('')
  const numericAmount = useMemo(() => parseFloat(stakeAmount || '0'), [stakeAmount])
  const isBelowMin = useMemo(() => (minStake != null && !isNaN(numericAmount) ? numericAmount < minStake : false), [numericAmount, minStake])

  return (
    <div className="staking-activation-container"> {/* Ana staking activation container */}
      {/* Başlık */}
      <div className="activation-header">
        <h3 className="activation-title">Staking Activation</h3> {/* Başlık metni */}
        <div className="status-badge locked"> {/* Durum badge'i */}
          <Lock className="status-icon" /> {/* Kilit ikonu */}
          <span className="status-text">Locked</span> {/* Durum metni */}
        </div>
      </div>

      {/* Form alanları */}
      <div className="activation-form">
        {/* Asset seçimi */}
        <div className="form-group">
          <label className="form-label">Select Asset</label> {/* Form etiketi */}
          <div className="select-container"> {/* Select container */}
            <div className="select-wrapper"> {/* Select wrapper */}
              <Lock className="select-icon" /> {/* Kilit ikonu */}
              <select 
                value={selectedAsset} 
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="form-select"
              >
                <option value="Locked">Locked</option> {/* Seçenek */}
                <option value="Flexible">Flexible</option> {/* Seçenek */}
              </select>
              <ChevronDown className="dropdown-arrow" /> {/* Dropdown oku */}
            </div>
          </div>
        </div>

        {/* Kilit periyodu */}
        <div className="form-group">
          <label className="form-label">Lock-Up Periods</label> {/* Form etiketi */}
          <div className="select-container"> {/* Select container */}
            <div className="select-wrapper"> {/* Select wrapper */}
              <Calendar className="select-icon" /> {/* Takvim ikonu */}
              <select 
                value={lockPeriod} 
                onChange={(e) => setLockPeriod(e.target.value)}
                className="form-select"
              >
                <option value="1 Month">1 Month</option> {/* Seçenek */}
                <option value="3 Month">3 Month</option> {/* Seçenek */}
                <option value="6 Month">6 Month</option> {/* Seçenek */}
                <option value="12 Month">12 Month</option> {/* Seçenek */}
              </select>
              <ChevronDown className="dropdown-arrow" /> {/* Dropdown oku */}
            </div>
          </div>
        </div>

        {/* Stake miktarı */}
        <div className="form-group">
          <label className="form-label">Amount to stake</label> {/* Form etiketi */}
          <div className="amount-container"> {/* Miktar container */}
            <input 
              type="number"
              inputMode="decimal"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              className="amount-input"
              placeholder="Enter amount"
              min={minStake ?? undefined}
            />
            <div className="currency-badge"> {/* Para birimi badge'i */}
              <span className="currency-text">{tokenSymbol}</span>
            </div>
          </div>
          {isBelowMin && (
            <div className="validation-hint" style={{ color: '#ef4444', marginTop: 6 }}>
              Minimum stake is {minStake} {tokenSymbol}
            </div>
          )}
        </div>
      </div>

      {/* Özet bilgileri */}
      <div className="summary-section">
        <h4 className="summary-title">Summary</h4> {/* Özet başlığı */}
        
        <div className="summary-item"> {/* Özet öğesi */}
          <span className="summary-label">Stake Date</span> {/* Özet etiketi */}
          <span className="summary-value">2024-02-15 05:42</span> {/* Özet değeri */}
        </div>
        
        <div className="summary-item"> {/* Özet öğesi */}
          <span className="summary-label">Interest Period</span> {/* Özet etiketi */}
          <span className="summary-value">{lockPeriod}</span> {/* Özet değeri */}
        </div>
        
        <div className="summary-item"> {/* Özet öğesi */}
          <span className="summary-label">Stake End Date</span> {/* Özet etiketi */}
          <span className="summary-value">2024-08-15 05:42</span> {/* Özet değeri */}
        </div>
      </div>
    </div>
  )
}

export default StakingActivation