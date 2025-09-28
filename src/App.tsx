import Sidebar from './components/Sidebar/Sidebar' // Sidebar bileşenini import et
import MainContent from './components/MainContent/MainContent' // Ana içerik bileşenini import et
import { useAuth } from './hooks/useAuth' // Authentication hook'unu import et
import './App.css' // App CSS dosyasını import et

function App() {
  const { loading } = useAuth() // Authentication durumunu kontrol et

  // Loading durumunda spinner göster
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-dark-bg"> {/* Ana container - flex layout, minimum ekran yükseklik, koyu arka plan */}
      <Sidebar /> {/* Sol sidebar bileşeni */}
      <MainContent /> {/* Ana içerik alanı */}
    </div>
  )
}

export default App