import React from 'react' // React kütüphanesini import et
import StakingCard from './StakingCard' // StakingCard bileşenini import et
import './StakingOfferings.css' // StakingOfferings CSS dosyasını import et

// Staking verileri interface'i
interface StakingData {
  id: string // Benzersiz kimlik
  name: string // Kripto para adı
  symbol: string // Kripto para sembolü
  apy: string // Yıllık getiri oranı
  interest: string // Faiz oranı
  minStake: string // Minimum stake miktarı
  minStakeAmount: string // Minimum stake tutarı
  color: string // Kart rengi
  logo: string // Logo URL'i
}

const StakingOfferings: React.FC = () => {
  // Staking teklifleri verisi
  const stakingData: StakingData[] = [
    {
      id: '1',
      name: 'Cardano', // Cardano kripto parası
      symbol: 'ADA',
      apy: '8.66%', // Yıllık getiri oranı
      interest: '30.45%', // Faiz oranı
      minStake: '100 ADA', // Minimum stake miktarı
      minStakeAmount: 'Minimum Stake', // Minimum stake etiketi
      color: '#0033ad', // Cardano mavi rengi
      logo: 'https://cryptologos.cc/logos/cardano-ada-logo.png' // Cardano logosu
    },
    {
      id: '2',
      name: 'Ontology', // Ontology kripto parası
      symbol: 'ONT',
      apy: 'APY', // APY etiketi
      interest: 'OKT', // Token türü
      minStake: '100 ONT', // Minimum stake miktarı
      minStakeAmount: 'Min Stake', // Minimum stake etiketi
      color: '#00d4aa', // Ontology yeşil rengi
      logo: 'https://cryptologos.cc/logos/ontology-ont-logo.png' // Ontology logosu
    },
    {
      id: '3',
      name: 'Salona', // Salona kripto parası
      symbol: 'SOL',
      apy: 'APY', // APY etiketi
      interest: 'SOL', // Token türü
      minStake: '8 SOL', // Minimum stake miktarı
      minStakeAmount: 'Min Stake', // Minimum stake etiketi
      color: '#9945ff', // Solana mor rengi
      logo: 'https://cryptologos.cc/logos/solana-sol-logo.png' // Solana logosu
    },
    {
      id: '4',
      name: 'Polkadot', // Polkadot kripto parası
      symbol: 'DOT',
      apy: 'APY', // APY etiketi
      interest: 'DOT', // Token türü
      minStake: '5 DOT', // Minimum stake miktarı
      minStakeAmount: 'Min Stake', // Minimum stake etiketi
      color: '#e6007a', // Polkadot pembe rengi
      logo: 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png' // Polkadot logosu
    },
    {
      id: '5',
      name: 'XRP', // XRP kripto parası
      symbol: 'XRP',
      apy: 'APY', // APY etiketi
      interest: 'XRP', // Token türü
      minStake: '10 XRP', // Minimum stake miktarı
      minStakeAmount: 'Min Stake', // Minimum stake etiketi
      color: '#23292f', // XRP koyu rengi
      logo: 'https://cryptologos.cc/logos/xrp-xrp-logo.png' // XRP logosu
    }
  ]

  return (
    <div className="staking-offerings-container"> {/* Ana container */}
      <div className="staking-grid"> {/* Grid layout container */}
        {stakingData.map((stake) => ( // Her staking verisi için kart oluştur
          <StakingCard 
            key={stake.id} // Benzersiz key
            data={stake} // Staking verisi
          />
        ))}
      </div>
    </div>
  )
}

export default StakingOfferings