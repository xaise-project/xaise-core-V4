import React from 'react' // React kütüphanesini import et
import Sidebar from './components/Sidebar/Sidebar' // Sidebar bileşenini import et
import MainContent from './components/MainContent/MainContent' // Ana içerik bileşenini import et
import './App.css' // App CSS dosyasını import et

function App() {
  return (
    <div className="flex min-h-screen bg-dark-bg"> {/* Ana container - flex layout, minimum ekran yükseklik, koyu arka plan */}
      <Sidebar /> {/* Sol sidebar bileşeni */}
      <MainContent /> {/* Ana içerik alanı */}
    </div>
  )
}

export default App