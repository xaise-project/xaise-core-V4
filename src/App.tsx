import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar/Sidebar' // Sidebar bileşenini import et
import MainContent from './components/MainContent/MainContent' // Ana içerik bileşenini import et
import Home from './pages/Home' // Home sayfasını import et
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
    <Router>
      <Routes>
        {/* Home sayfası: sidebar olmadan tam ekran */}
        <Route path="/" element={<Home />} />

        {/* Diğer sayfalar: mevcut sidebar + içerik layout */}
        <Route
          path="/dashboard"
          element={
            <div className="flex min-h-screen">
              <Sidebar />
              <MainContent />
            </div>
          }
        />
        <Route
          path="/staking"
          element={
            <div className="flex min-h-screen">
              <Sidebar />
              <MainContent />
            </div>
          }
        />
        <Route
          path="/portfolio"
          element={
            <div className="flex min-h-screen">
              <Sidebar />
              <MainContent />
            </div>
          }
        />
        <Route
          path="/settings"
          element={
            <div className="flex min-h-screen">
              <Sidebar />
              <MainContent />
            </div>
          }
        />
      </Routes>
    </Router>
  )
}

export default App