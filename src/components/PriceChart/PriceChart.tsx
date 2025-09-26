import './PriceChart.css'

const PriceChart: React.FC = () => {
  // Fotoğraftaki veri noktalarını bire bir taklit eden veriler
  const dataPoints = [
    { x: 0, y: 2400, time: '13:15' },
    { x: 20, y: 2350, time: '13:15' },
    { x: 40, y: 2300, time: '13:15' },
    { x: 60, y: 2250, time: '13:15' },
    { x: 80, y: 2200, time: '13:15' },
    { x: 100, y: 2150, time: '13:15' },
    { x: 120, y: 2100, time: '13:30' },
    { x: 140, y: 2050, time: '13:30' },
    { x: 160, y: 2000, time: '13:30' },
    { x: 180, y: 1950, time: '13:30' },
    { x: 200, y: 1900, time: '13:45' },
    { x: 220, y: 1850, time: '13:45' },
    { x: 240, y: 1800, time: '13:45' },
    { x: 260, y: 1750, time: '14:00' },
    { x: 280, y: 1700, time: '14:00' },
    { x: 300, y: 1650, time: '14:00' },
    { x: 320, y: 1600, time: '14:15' },
    { x: 340, y: 1550, time: '14:15' },
    { x: 360, y: 1500, time: '14:15' },
    { x: 380, y: 1450, time: '14:30' },
    { x: 400, y: 1400, time: '14:30' },
    { x: 420, y: 1350, time: '14:30' },
    { x: 440, y: 1300, time: '14:45' },
    { x: 460, y: 1250, time: '14:45' },
    { x: 480, y: 1200, time: '14:45' },
    { x: 500, y: 1150, time: '15:00' },
    { x: 520, y: 1100, time: '15:00' },
    { x: 540, y: 1050, time: '15:00' },
    { x: 560, y: 1000, time: '15:15' },
    { x: 580, y: 1050, time: '15:15' },
    { x: 600, y: 1100, time: '15:15' },
    { x: 620, y: 1150, time: '15:30' },
    { x: 640, y: 1200, time: '15:30' },
    { x: 660, y: 1250, time: '15:30' },
    { x: 680, y: 1300, time: '15:45' },
    { x: 700, y: 1350, time: '15:45' },
    { x: 720, y: 1400, time: '15:45' },
    { x: 740, y: 1450, time: '16:00' },
    { x: 760, y: 1500, time: '16:00' },
    { x: 780, y: 1550, time: '16:00' },
    { x: 800, y: 1600, time: '16:15' },
    { x: 820, y: 1650, time: '16:15' },
    { x: 840, y: 1700, time: '16:15' },
    { x: 860, y: 1750, time: '16:15' },
    { x: 880, y: 1800, time: '16:15' },
    { x: 900, y: 1850, time: '16:15' },
    { x: 920, y: 1900, time: '16:15' },
    { x: 940, y: 1950, time: '16:15' },
    { x: 960, y: 2000, time: '16:15' },
    { x: 980, y: 2050, time: '16:15' },
    { x: 1000, y: 2100, time: '16:15' },
    { x: 1020, y: 2150, time: '16:15' },
    { x: 1040, y: 2200, time: '16:15' },
    { x: 1060, y: 2250, time: '16:15' },
    { x: 1080, y: 2300, time: '16:15' },
    { x: 1100, y: 2350, time: '16:15' },
    { x: 1120, y: 2400, time: '16:15' },
    { x: 1140, y: 2450, time: '16:15' },
    { x: 1160, y: 2500, time: '16:15' },
    { x: 1180, y: 2550, time: '16:15' },
    { x: 1200, y: 2600, time: '16:15' },
    { x: 1220, y: 2650, time: '16:15' },
    { x: 1240, y: 2700, time: '16:15' },
    { x: 1260, y: 2750, time: '16:15' },
    { x: 1280, y: 2800, time: '16:15' },
    { x: 1300, y: 2850, time: '16:15' },
    { x: 1320, y: 2900, time: '16:15' },
    { x: 1340, y: 2950, time: '16:15' },
    { x: 1360, y: 3000, time: '16:15' },
    { x: 1380, y: 3050, time: '16:15' },
    { x: 1400, y: 3100, time: '16:15' },
    { x: 1420, y: 3150, time: '16:15' },
    { x: 1440, y: 3200, time: '16:15' },
    { x: 1460, y: 3250, time: '16:15' },
    { x: 1480, y: 3300, time: '16:15' },
    { x: 1500, y: 3350, time: '16:15' },
    { x: 1520, y: 3400, time: '16:15' },
    { x: 1540, y: 3450, time: '16:15' },
    { x: 1560, y: 3500, time: '16:15' },
    { x: 1580, y: 3550, time: '16:15' },
    { x: 1600, y: 3600, time: '16:15' },
    { x: 1620, y: 3650, time: '16:15' },
    { x: 1640, y: 3700, time: '16:15' },
    { x: 1660, y: 3750, time: '16:15' },
    { x: 1680, y: 3800, time: '16:15' },
    { x: 1700, y: 3850, time: '16:15' },
    { x: 1720, y: 3900, time: '16:15' },
    { x: 1740, y: 3950, time: '16:15' },
    { x: 1760, y: 4000, time: '16:15' },
    { x: 1780, y: 4050, time: '16:15' },
    { x: 1800, y: 4100, time: '16:15' },
    { x: 1820, y: 4150, time: '16:15' },
    { x: 1840, y: 4200, time: '16:15' },
    { x: 1860, y: 4250, time: '16:15' },
    { x: 1880, y: 4300, time: '16:15' },
    { x: 1900, y: 4350, time: '16:15' },
    { x: 1920, y: 4400, time: '16:15' },
    { x: 1940, y: 4450, time: '16:15' },
    { x: 1960, y: 4500, time: '16:15' },
    { x: 1980, y: 4550, time: '16:15' },
    { x: 2000, y: 4600, time: '16:15' },
    { x: 2020, y: 4650, time: '16:15' },
    { x: 2040, y: 4700, time: '16:15' },
    { x: 2060, y: 4750, time: '16:15' },
    { x: 2080, y: 4800, time: '16:15' },
  ]

  const threshold = 3000 // 3k eşik değeri
  const svgWidth = 1000
  const svgHeight = 400
  const padding = 60

  const yToSvg = (value: number) => {
    const minY = 1000
    const maxY = 5000
    return svgHeight - padding - ((value - minY) / (maxY - minY)) * (svgHeight - 2 * padding)
  }

  const xToSvg = (value: number) => {
    const minX = 0
    const maxX = 2080
    return padding + ((value - minX) / (maxX - minX)) * (svgWidth - 2 * padding)
  }

  // Çizgi path'ini oluştur
  const createPath = (points: typeof dataPoints) => {
    return points.map((point, index) => {
      const command = index === 0 ? 'M' : 'L'
      return `${command} ${xToSvg(point.x)} ${yToSvg(point.y)}`
    }).join(' ')
  }

  // Eşik çizgisinin Y koordinatı
  const thresholdY = yToSvg(threshold)

  const timeLabels = ['13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30', '15:45', '16:00', '16:15']

  return (
    <div className="price-chart-container">
      {/* Grafik başlığı */}
      <div className="chart-header">
        <div className="chart-title-section">
          <h2 className="chart-title">1,178 ONT</h2>
          <span className="chart-subtitle">$90,273</span>
        </div>
        
        {/* Zaman aralığı butonları */}
        <div className="time-range-buttons">
          <button className="time-btn">1H</button>
          <button className="time-btn">3H</button>
          <button className="time-btn active">5H</button>
          <button className="time-btn">1M</button>
          <button className="time-btn">1W</button>
        </div>
      </div>

      {/* Ana fiyat grafiği*/}
      <div className="main-chart" style={{ 
        height: '400px', 
        backgroundColor: '#0a0a0a', 
        borderRadius: '8px',
        padding: '20px'
      }}>
        <svg width={svgWidth} height={svgHeight} style={{ width: '100%', height: '100%' }}>
          {/* Gradient tanımları */}
          <defs>
            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4f8ff7" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#4f8ff7" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
            
            {/* Maskeler */}
            <mask id="blueMask">
              <rect x="0" y="0" width={svgWidth} height={thresholdY} fill="white" />
            </mask>
            <mask id="orangeMask">
              <rect x="0" y={thresholdY} width={svgWidth} height={svgHeight - thresholdY} fill="white" />
            </mask>
          </defs>

          {/* Grid çizgileri */}
          {[1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000].map((value) => (
            <line
              key={value}
              x1={padding}
              y1={yToSvg(value)}
              x2={svgWidth - padding}
              y2={yToSvg(value)}
              stroke="#333333"
              strokeWidth="0.5"
            />
          ))}

          {/* Dikey grid çizgileri */}
          {timeLabels.map((time, index) => {
            const x = padding + (index * (svgWidth - 2 * padding)) / (timeLabels.length - 1)
            return (
              <line
                key={time}
                x1={x}
                y1={padding}
                x2={x}
                y2={svgHeight - padding}
                stroke="#333333"
                strokeWidth="0.5"
              />
            )
          })}

          {/* Eşik çizgisi (3k) */}
          <line
            x1={padding}
            y1={thresholdY}
            x2={svgWidth - padding}
            y2={thresholdY}
            stroke="white"
            strokeWidth="1"
            strokeDasharray="4,4"
          />

          {/* Ana çizgi - mavi kısım (3k üstü) */}
          <path
            d={createPath(dataPoints)}
            fill="none"
            stroke="#4f8ff7"
            strokeWidth="2"
            mask="url(#blueMask)"
          />

          {/* Ana çizgi - turuncu kısım (3k altı) */}
          <path
            d={createPath(dataPoints)}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            mask="url(#orangeMask)"
          />

          {/* Y ekseni etiketleri */}
          {[1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000].map((value) => (
            <text
              key={value}
              x={svgWidth - padding + 15}
              y={yToSvg(value) + 5}
              fill="#888888"
              fontSize="12"
              textAnchor="start"
            >
              {(value / 1000).toFixed(1)}K
            </text>
          ))}

          {/* X ekseni zaman etiketleri - alt kısımda */}
          {timeLabels.map((time, index) => {
            const x = padding + (index * (svgWidth - 2 * padding)) / (timeLabels.length - 1)
            return (
              <text
                key={time}
                x={x}
                y={svgHeight - padding + 20}
                fill="#888888"
                fontSize="11"
                textAnchor="middle"
              >
                {time}
              </text>
            )
          })}
        </svg>
      </div>

      {/* Grafik istatistikleri */}
      <div className="chart-stats">
        <div className="stat-item">
          <span className="stat-label">24h Change</span>
          <span className="stat-value positive">+4.2%</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">24h Volume</span>
          <span className="stat-value">$2.4M</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Market Cap</span>
          <span className="stat-value">$890M</span>
        </div>
      </div>
    </div>
  )
}

export default PriceChart