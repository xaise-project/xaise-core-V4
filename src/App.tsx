import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar/Sidebar'
import MainContent from './components/MainContent/MainContent'
import './App.css'

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-dark-bg">
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
  )
}

export default App