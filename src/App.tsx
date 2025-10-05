import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar/Sidebar' // Sidebar bileşenini import et
import MainContent from './components/MainContent/MainContent' // Ana içerik bileşenini import et
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary' // Error boundary bileşenini import et
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
    <ErrorBoundary>
      <Router>
        <div className="flex min-h-screen">
          <Sidebar />
          <Routes>
            <Route path="/" element={<MainContent />} />
            <Route path="/dashboard" element={<MainContent />} />
            <Route path="/staking" element={<MainContent />} />
            <Route path="/portfolio" element={<MainContent />} />
            <Route path="/settings" element={<MainContent />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App