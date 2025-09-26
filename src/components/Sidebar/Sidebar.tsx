import React from 'react' // React kütüphanesini import et
import { Home, Search, Users, Coins, Settings, User, Wallet } from 'lucide-react' // Lucide ikonlarını import et
import './Sidebar.css' // Sidebar CSS dosyasını import et

const Sidebar: React.FC = () => {
  return (
    <div className="sidebar-container"> {/* Ana sidebar container */}
      {/* Logo ve başlık alanı */}
      <div className="sidebar-header">
        <div className="logo-container"> {/* Logo container */}
          <div className="logo-icon">DX</div> {/* Logo ikonu */}
          <span className="logo-text">DexBoard</span> {/* Logo metni */}
        </div>
      </div>

      {/* Navigasyon menüsü */}
      <nav className="sidebar-nav">
        <ul className="nav-list"> {/* Navigasyon listesi */}
          <li className="nav-item active"> {/* Aktif navigasyon öğesi */}
            <Home className="nav-icon" /> {/* Ana sayfa ikonu */}
            <span className="nav-text">Home</span> {/* Navigasyon metni */}
          </li>
          <li className="nav-item"> {/* Navigasyon öğesi */}
            <Search className="nav-icon" /> {/* Arama ikonu */}
            <span className="nav-text">Pair Explore</span> {/* Navigasyon metni */}
          </li>
          <li className="nav-item"> {/* Navigasyon öğesi */}
            <Users className="nav-icon" /> {/* Kullanıcılar ikonu */}
            <span className="nav-text">Live New Pairs</span> {/* Navigasyon metni */}
          </li>
          <li className="nav-item"> {/* Navigasyon öğesi */}
            <Coins className="nav-icon" /> {/* Token ikonu */}
            <span className="nav-text">Token</span> {/* Navigasyon metni */}
          </li>
          <li className="nav-item"> {/* Navigasyon öğesi */}
            <Settings className="nav-icon" /> {/* Ayarlar ikonu */}
            <span className="nav-text">Token Creator</span> {/* Navigasyon metni */}
          </li>
          <li className="nav-item"> {/* Navigasyon öğesi */}
            <Wallet className="nav-icon" /> {/* Cüzdan ikonu */}
            <span className="nav-text">Wallet Info</span> {/* Navigasyon metni */}
          </li>
          <li className="nav-item"> {/* Navigasyon öğesi */}
            <User className="nav-icon" /> {/* Kullanıcı ikonu */}
            <span className="nav-text">User Area</span> {/* Navigasyon metni */}
          </li>
        </ul>
      </nav>

      {/* Kullanıcı profil alanı */}
      <div className="user-profile">
        <div className="profile-avatar"> {/* Profil avatarı */}
          <img 
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" 
            alt="Nathan Collins" 
            className="avatar-image" 
          />
        </div>
        <div className="profile-info"> {/* Profil bilgileri */}
          <span className="profile-name">Nathan Collins</span> {/* Kullanıcı adı */}
          <span className="profile-handle">@nathan.collins</span> {/* Kullanıcı handle */}
        </div>
      </div>
    </div>
  )
}

export default Sidebar