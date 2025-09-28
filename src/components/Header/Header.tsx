import React from 'react' // React kütüphanesini import et
import { Search, Bell, Command } from 'lucide-react' // Lucide ikonlarını import et

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between p-6 bg-gray-900 border-b border-gray-800"> {/* Ana header container */}
      {/* Sol taraf - Başlık */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Staking Offerings</h1> {/* Sayfa başlığı */}
        <button className="flex items-center gap-2 px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"> {/* Daha fazla öğren butonu */}
          Learn More
          <div className="flex items-center justify-center w-5 h-5 text-xs bg-gray-700 rounded-full">?</div> {/* Soru işareti ikonu */}
        </button>
      </div>

      {/* Sağ taraf - Arama ve kullanıcı kontrolleri */}
      <div className="flex items-center gap-4">
        {/* Arama alanı */}
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-gray-400" /> {/* Arama ikonu */}
          <input 
            type="text" 
            placeholder="Search" 
            className="pl-10 pr-20 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 w-80" 
          />
          <div className="absolute right-3 flex items-center gap-1 text-xs text-gray-400"> {/* Klavye kısayolu */}
            <Command className="w-3 h-3" />
            <span>Space</span>
          </div>
        </div>

        {/* Bildirim ikonu */}
        <button className="p-2 text-gray-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" /> {/* Bildirim ikonu */}
        </button>
      </div>
    </header>
  )
}

export default Header