import React from 'react' // React kütüphanesini import et
import { Search, Bell, Command } from 'lucide-react' // Lucide ikonlarını import et
import './Header.css' // Header CSS dosyasını import et

const Header: React.FC = () => {
  return (
    <header className="header-container"> {/* Ana header container */}
      {/* Sol taraf - Başlık */}
      <div className="header-left">
        <h1 className="page-title">Staking Offerings</h1> {/* Sayfa başlığı */}
        <button className="learn-more-btn"> {/* Daha fazla öğren butonu */}
          Learn More
          <div className="learn-more-icon">?</div> {/* Soru işareti ikonu */}
        </button>
      </div>

      {/* Sağ taraf - Arama ve kullanıcı kontrolleri */}
      <div className="header-right">
        {/* Arama alanı */}
        <div className="search-container">
          <Search className="search-icon" /> {/* Arama ikonu */}
          <input 
            type="text" 
            placeholder="Search" 
            className="search-input" 
          />
          <div className="search-shortcut"> {/* Klavye kısayolu */}
            <Command className="shortcut-icon" />
            <span>Space</span>
          </div>
        </div>

        {/* Bildirim ikonu */}
        <button className="notification-btn">
          <Bell className="notification-icon" /> {/* Bildirim ikonu */}
        </button>
      </div>
    </header>
  )
}

export default Header