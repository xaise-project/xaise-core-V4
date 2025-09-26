import React from 'react' // React kütüphanesini import et
import { TrendingUp, TrendingDown } from 'lucide-react' // Gerekli ikonları import et
import './InterestStats.css' // InterestStats CSS dosyasını import et

const InterestStats: React.FC = () => {
  return (
    <div className="interest-stats-container"> {/* Ana interest stats container */}
      {/* Başlık */}
      <div className="stats-header">
        <h3 className="stats-title">Interests Statistics</h3> {/* Başlık metni */}
        <div className="time-filter"> {/* Zaman filtresi */}
          <button className="filter-button">D</button> {/* Günlük filtre */}
          <button className="filter-button">W</button> {/* Haftalık filtre */}
          <button className="filter-button active">M</button> {/* Aylık filtre (aktif) */}
          <button className="filter-button">Y</button> {/* Yıllık filtre */}
        </div>
      </div>

      {/* İstatistik kartları */}
      <div className="stats-cards">
        {/* APY kartı */}
        <div className="stat-card">
          <div className="stat-header"> {/* Stat başlığı */}
            <span className="stat-label">APY • May</span> {/* Stat etiketi */}
            <div className="stat-trend positive"> {/* Pozitif trend */}
              <TrendingUp className="trend-icon" /> {/* Yukarı trend ikonu */}
              <span className="trend-text">PRESENT</span> {/* Trend metni */}
            </div>
          </div>
          <div className="stat-value">15.48% of $4785</div> {/* Stat değeri */}
        </div>

        {/* Previous kartı */}
        <div className="stat-card">
          <div className="stat-header"> {/* Stat başlığı */}
            <span className="stat-label">• PREVIOUS</span> {/* Stat etiketi */}
            <div className="stat-trend negative"> {/* Negatif trend */}
              <TrendingDown className="trend-icon" /> {/* Aşağı trend ikonu */}
              <span className="trend-text">$3326</span> {/* Trend metni */}
            </div>
          </div>
          <div className="stat-value">20%</div> {/* Stat değeri */}
        </div>
      </div>

      {/* Grafik alanı */}
      <div className="chart-container">
        <div className="chart-placeholder"> {/* Grafik placeholder */}
          {/* Basit çizgi grafik simülasyonu */}
          <svg className="chart-svg" viewBox="0 0 300 120">
            {/* Grid çizgileri */}
            <defs>
              <pattern id="grid" width="30" height="24" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 24" fill="none" stroke="#3a3b47" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Ana çizgi */}
            <polyline
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              points="0,80 30,70 60,85 90,60 120,75 150,50 180,65 210,45 240,60 270,40 300,35"
            />
            
            {/* Nokta işaretleri */}
            <circle cx="90" cy="60" r="3" fill="#f59e0b" />
            <circle cx="150" cy="50" r="3" fill="#f59e0b" />
            <circle cx="210" cy="45" r="3" fill="#f59e0b" />
            <circle cx="270" cy="40" r="3" fill="#f59e0b" />
          </svg>
        </div>
        
        {/* Ay etiketleri */}
        <div className="chart-labels">
          <span className="chart-label">Jan</span> {/* Ocak */}
          <span className="chart-label">Feb</span> {/* Şubat */}
          <span className="chart-label">Mar</span> {/* Mart */}
          <span className="chart-label">Apr</span> {/* Nisan */}
          <span className="chart-label">May</span> {/* Mayıs */}
        </div>
      </div>
    </div>
  )
}

export default InterestStats