import { StrictMode } from 'react' // StrictMode'u import et
import ReactDOM from 'react-dom/client' // ReactDOM client'ını import et
import App from './App' // Ana App bileşenini import et
import './index.css' // Global CSS dosyasını import et

// Root elementini seç ve React uygulamasını render et
ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App /> {/* Ana App bileşenini render et */}
  </StrictMode>,
)