import { StrictMode } from 'react' // StrictMode'u import et
import ReactDOM from 'react-dom/client' // ReactDOM client'ını import et
import { QueryClient, QueryClientProvider } from '@tanstack/react-query' // React Query import et
import { Toaster } from 'react-hot-toast' // Toast notification import et
import App from './App' // Ana App bileşenini import et
import './index.css' // Global CSS dosyasını import et
import './custom.css';

// React Query client'ını oluştur
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 dakika
      gcTime: 10 * 60 * 1000, // 10 dakika (renamed from cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
})
// Root elementini seç ve React uygulamasını render et
ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App /> {/* Ana App bileşenini render et */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </QueryClientProvider>
  </StrictMode>,
)