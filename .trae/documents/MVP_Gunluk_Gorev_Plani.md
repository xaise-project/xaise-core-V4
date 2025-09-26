# StakeHub MVP - Günlük Görev Planı

## 📊 Proje Özeti

* **Ekip**: 2 geliştirici
* **Süre**: 14 gün
* **Günlük Çalışma**: 2 saat/kişi
* **Toplam Süre**: 56 saat
* **Hedef**: Çalışan MVP demo

## 👥 Rol Dağılımı

### Geliştirici A (Frontend Lead)
* React bileşenleri ve modern dark theme UI
* Dashboard ve staking offerings implementasyonu
* Responsive tasarım (desktop-first)
* Stake management ve rewards tracking sayfaları

### Geliştirici B (Backend/Integration Lead)
* Supabase kurulumu ve konfigürasyonu
* Veritabanı tasarımı (users, protocols, comments, favorites)
* Authentication sistemi
* CRUD işlemleri ve API entegrasyonu

---

# 📅 GÜNLÜK GÖREV PLANI

## 🗓️ GÜN 1 - Proje Kurulumu (Başlangıç)

### 🎯 Günlük Hedef
Proje temellerini atmak ve geliştirme ortamını hazırlamak

### Geliştirici A Görevleri (2 saat)

#### ⚡ Yüksek Öncelik
- [ ] **React + Vite projesi kurulumu** *(45 dk)*
  - Vite ile React projesi oluştur
  - TypeScript konfigürasyonu
  - Temel package.json ayarları
  - İlk çalıştırma testi

- [ ] **TailwindCSS konfigürasyonu** *(30 dk)*
  - TailwindCSS kurulumu
  - tailwind.config.js ayarları
  - Dark theme renk paletini tanımla
  - Temel CSS dosyalarını oluştur

#### 🔶 Orta Öncelik
- [ ] **Temel klasör yapısı oluşturma** *(30 dk)*
  - src/components klasörü
  - src/pages klasörü
  - src/hooks klasörü
  - src/utils klasörü
  - src/types klasörü

- [ ] **Git repository kurulumu** *(15 dk)*
  - Git init ve ilk commit
  - .gitignore dosyası
  - README.md oluştur

### Geliştirici B Görevleri (2 saat)

#### ⚡ Yüksek Öncelik
- [ ] **Supabase projesi oluşturma** *(30 dk)*
  - Supabase hesabı ve proje oluştur
  - API keys'leri al
  - Proje ayarlarını yapılandır

- [ ] **Veritabanı tablolarını oluşturma** *(60 dk)*
  - users tablosu (id, email, created_at)
  - protocols tablosu (id, name, apy, min_stake, description)
  - comments tablosu (id, user_id, protocol_id, content)
  - favorites tablosu (id, user_id, protocol_id)

#### 🔶 Orta Öncelik
- [ ] **Authentication ayarları** *(20 dk)*
  - Email/password authentication aktif et
  - RLS (Row Level Security) politikaları

- [ ] **Başlangıç verilerini ekleme** *(10 dk)*
  - 5 örnek protokol verisi
  - Test için örnek kullanıcı

### 📋 Günlük Başarı Kriterleri
- [ ] Proje çalışır durumda
- [ ] TailwindCSS aktif
- [ ] Supabase bağlantısı kuruldu
- [ ] Temel tablolar oluşturuldu

---

## 🗓️ GÜN 2 - Proje Kurulumu (Tamamlama)

### 🎯 Günlük Hedef
Proje kurulumunu tamamlamak ve temel bağlantıları kurmak

### Geliştirici A Görevleri (2 saat)

#### ⚡ Yüksek Öncelik
- [ ] **Supabase client kurulumu** *(30 dk)*
  - @supabase/supabase-js kurulumu
  - Environment variables ayarları
  - Supabase client konfigürasyonu

- [ ] **React Router kurulumu** *(30 dk)*
  - react-router-dom kurulumu
  - Temel route yapısı
  - App.tsx'de router konfigürasyonu

#### 🔶 Orta Öncelik
- [ ] **Temel layout bileşeni** *(45 dk)*
  - Layout.tsx bileşeni
  - Header placeholder
  - Main content area
  - Dark theme temel stilleri

- [ ] **Development ortamı testi** *(15 dk)*
  - Hot reload testi
  - Build testi
  - Supabase bağlantı testi

### Geliştirici B Görevleri (2 saat)

#### ⚡ Yüksek Öncelik
- [ ] **Database schema finalizasyonu** *(45 dk)*
  - Tablo ilişkilerini kontrol et
  - Foreign key constraints
  - Index'leri ekle
  - RLS politikalarını test et

- [ ] **Supabase types oluşturma** *(30 dk)*
  - TypeScript type definitions
  - Database.types.ts dosyası
  - Supabase CLI kurulumu

#### 🔶 Orta Öncelik
- [ ] **Temel API fonksiyonları** *(30 dk)*
  - getProtocols fonksiyonu
  - getUserProfile fonksiyonu
  - Temel error handling

- [ ] **Test verilerini genişletme** *(15 dk)*
  - 10 protokol verisi ekle
  - Gerçekçi APY değerleri
  - Protokol açıklamaları

### 📋 Günlük Başarı Kriterleri
- [ ] Frontend-backend bağlantısı çalışıyor
- [ ] Routing aktif
- [ ] Database'den veri çekiliyor
- [ ] TypeScript types tanımlı

---

## 🗓️ GÜN 3 - Temel Bileşenler (UI Foundation)

### 🎯 Günlük Hedef
Temel UI bileşenlerini oluşturmak ve design system'i kurmak

### Geliştirici A Görevleri (2 saat)

#### ⚡ Yüksek Öncelik
- [ ] **Header/Navigation bileşeni** *(60 dk)*
  - Logo alanı
  - Navigation menüsü (Home, Explore, Wallet)
  - User profile dropdown placeholder
  - Dark theme styling
  - Responsive design

- [ ] **Button bileşeni** *(30 dk)*
  - Primary, secondary, outline variants
  - Size variations (sm, md, lg)
  - Loading state
  - Disabled state

#### 🔶 Orta Öncelik
- [ ] **Input bileşeni** *(20 dk)*
  - Text input
  - Error state styling
  - Label ve placeholder

- [ ] **Loading bileşeni** *(10 dk)*
  - Spinner component
  - Skeleton loader

### Geliştirici B Görevleri (2 saat)

#### ⚡ Yüksek Öncelik
- [ ] **Authentication hook'ları** *(60 dk)*
  - useAuth hook
  - useUser hook
  - Login/logout fonksiyonları
  - Session management

- [ ] **Database query hooks** *(45 dk)*
  - useProtocols hook
  - useProtocol hook (single)
  - React Query kurulumu
  - Cache management

#### 🔶 Orta Öncelik
- [ ] **Error handling sistemi** *(15 dk)*
  - Global error handler
  - Toast notification sistemi

### 📋 Günlük Başarı Kriterleri
- [ ] Header navigation çalışıyor
- [ ] Temel bileşenler kullanılabilir
- [ ] Auth hooks hazır
- [ ] Data fetching çalışıyor

---

## 🗓️ GÜN 4 - Temel Bileşenler (Tamamlama)

### 🎯 Günlük Hedef
UI bileşen kütüphanesini tamamlamak ve API servislerini kurmak

### Geliştirici A Görevleri (2 saat)

#### ⚡ Yüksek Öncelik
- [ ] **Card bileşeni** *(45 dk)*
  - Protocol card layout
  - Hover effects
  - Badge component (APY)
  - Action buttons area

- [ ] **Modal bileşeni** *(30 dk)*
  - Base modal component
  - Overlay ve backdrop
  - Close functionality
  - Responsive behavior

#### 🔶 Orta Öncelik
- [ ] **Form bileşenleri** *(30 dk)*
  - Select dropdown
  - Checkbox
  - Form validation helpers

- [ ] **Error boundary** *(15 dk)*
  - React error boundary
  - Fallback UI

### Geliştirici B Görevleri (2 saat)

#### ⚡ Yüksek Öncelik
- [ ] **API servis katmanı** *(60 dk)*
  - protocols.service.ts
  - auth.service.ts
  - comments.service.ts
  - favorites.service.ts

- [ ] **Database query optimizasyonu** *(30 dk)*
  - Query performance analizi
  - Index optimizasyonu
  - Pagination hazırlığı

#### 🔶 Orta Öncelik
- [ ] **Type safety improvements** *(20 dk)*
  - API response types
  - Error types
  - Validation schemas

- [ ] **Development tools** *(10 dk)*
  - Database seeding script
  - Development data reset

### 📋 Günlük Başarı Kriterleri
- [ ] Tüm temel bileşenler hazır
- [ ] API servisleri çalışıyor
- [ ] Type safety sağlandı
- [ ] Error handling aktif

---

## 🗓️ GÜN 5 - Dashboard (Ana Sayfa)

### 🎯 Günlük Hedef
Ana dashboard sayfasını oluşturmak ve protokol listesini göstermek

### Geliştirici A Görevleri (2 saat)

#### ⚡ Yüksek Öncelik
- [ ] **Sol navigasyon menüsü** *(60 dk)*
  - Sidebar component
  - Menu items (Home, Pair Explore, Live New Pairs, Token, Wallet Info)
  - Active state styling
  - Collapse/expand functionality

- [ ] **Dashboard layout** *(45 dk)*
  - Grid system
  - Responsive breakpoints
  - Content area layout
  - Header integration

#### 🔶 Orta Öncelik
- [ ] **Protocol grid** *(15 dk)*
  - Grid container
  - Responsive columns
  - Loading state

### Geliştirici B Görevleri (2 saat)

#### ⚡ Yüksek Öncelik
- [ ] **Protokol verilerini Supabase'den çekme** *(60 dk)*
  - getProtocols API endpoint
  - Real-time subscriptions
  - Data transformation
  - Error handling

- [ ] **APY ve minimum stake verilerini yönetme** *(45 dk)*
  - APY calculation logic
  - Minimum stake validation
  - Data formatting utilities

#### 🔶 Orta Öncelik
- [ ] **Performance optimizasyonu** *(15 dk)*
  - Query caching
  - Memoization

### 📋 Günlük Başarı Kriterleri
- [ ] Dashboard layout tamamlandı
- [ ] Sidebar navigation çalışıyor
- [ ] Protokol verileri görüntüleniyor
- [ ] Responsive tasarım aktif

---

## 🗓️ GÜN 6 - Staking Offerings (Protokol Kartları)

### 🎯 Günlük Hedef
Protokol kartlarını tasarlamak ve staking özelliklerini göstermek

### Geliştirici A Görevleri (2 saat)

#### ⚡ Yüksek Öncelik
- [ ] **Staking offerings protokol kartları** *(75 dk)*
  - Protocol card design (Cardano, Ontology, Solana, Polkadot, XRP)
  - Protocol logo/icon area
  - APY display
  - Minimum stake amount
  - Risk level indicator

- [ ] **APY badges ve "Stake Now" butonları** *(30 dk)*
  - APY badge styling
  - Stake Now button
  - Hover animations
  - Click handlers

#### 🔶 Orta Öncelik
- [ ] **Card interactions** *(15 dk)*
  - Hover effects
  - Click to detail

### Geliştirici B Görevleri (2 saat)

#### ⚡ Yüksek Öncelik
- [ ] **Protokol filtreleme ve sıralama** *(60 dk)*
  - Filter by APY range
  - Filter by risk level
  - Sort by APY, name, minimum stake
  - Filter state management

- [ ] **Gerçek zamanlı veri güncellemeleri** *(45 dk)*
  - Supabase real-time subscriptions
  - APY updates
  - Protocol status changes

#### 🔶 Orta Öncelik
- [ ] **Search functionality** *(15 dk)*
  - Protocol name search
  - Debounced search

### 📋 Günlük Başarı Kriterleri
- [ ] Protokol kartları görüntüleniyor
- [ ] APY ve stake bilgileri doğru
- [ ] Filtreleme çalışıyor
- [ ] Real-time updates aktif

---

## 🗓️ GÜN 7 - Dark Theme ve UI Polish

### 🎯 Günlük Hedef
Modern dark theme'i tamamlamak ve UI'ı cilalayarak 1. haftayı bitirmek

### Geliştirici A Görevleri (2 saat)

#### ⚡ Yüksek Öncelik
- [ ] **Modern dark theme implementasyonu** *(90 dk)*
  - Dark theme color palette finalization
  - All components dark theme support
  - Theme toggle functionality
  - Consistent styling across app

- [ ] **UI/UX iyileştirmeleri** *(30 dk)*
  - Spacing consistency
  - Typography improvements
  - Icon integration
  - Micro-animations

### Geliştirici B Görevleri (2 saat)

#### ⚡ Yüksek Öncelik
- [ ] **Performance optimizasyonu** *(60 dk)*
  - Query optimization
  - Component memoization
  - Bundle size analysis
  - Loading performance

- [ ] **1. Hafta integration testing** *(45 dk)*
  - End-to-end testing
  - API integration tests
  - Error scenarios testing

#### 🔶 Orta Öncelik
- [ ] **Documentation** *(15 dk)*
  - API documentation
  - Component documentation

### 📋 Günlük Başarı Kriterleri
- [ ] Dark theme tamamen çalışıyor
- [ ] UI tutarlı ve profesyonel
- [ ] Performance kabul edilebilir
- [ ] 1. hafta hedefleri tamamlandı

---

## 🗓️ GÜN 8 - Stake Management (Token Seçimi)

### 🎯 Günlük Hedef
Stake management sistemini kurmaya başlamak ve token seçimi özelliğini eklemek

### Geliştirici A Görevleri (2 saat)

#### ⚡ Yüksek Öncelik
- [ ] **Token seçimi dropdown bileşeni** *(75 dk)*
  - Multi-select dropdown
  - Token search functionality
  - Token icons/logos
  - Selected tokens display
  - Validation rules

- [ ] **Stake amount girişi ve validasyon** *(30 dk)*
  - Number input component
  - Min/max validation
  - Real-time validation feedback
  - Error messages

#### 🔶 Orta Öncelik
- [ ] **Stake preview** *(15 dk)*
  - Estimated rewards calculation
  - Preview card

### Geliştirici B Görevleri (2 saat)

#### ⚡ Yüksek Öncelik
- [ ] **Stake işlemleri API'si** *(90 dk)*
  - createStake endpoint
  - updateStake endpoint
  - getStakes endpoint
  - Stake validation logic
  - Database schema for stakes

#### 🔶 Orta Öncelik
- [ ] **Stake calculation engine** *(30 dk)*
  - APY calculation
  - Compound interest logic
  - Fee calculations

### 📋 Günlük Başarı Kriterleri
- [ ] Token seçimi çalışıyor
- [ ] Stake amount validation aktif
- [ ] Stake API endpoints hazır
- [ ] Calculation engine çalışıyor

---

## 🗓️ GÜN 9 - Staking Activation Form

### 🎯 Günlük Hedef
Staking activation formunu tamamlamak ve lock-up süreleri eklemek

### Geliştirici A Görevleri (2 saat)

#### ⚡ Yüksek Öncelik
- [ ] **Staking activation formu** *(90 dk)*
  - Lock-up period selection
  - Terms and conditions checkbox
  - Confirmation modal
  - Form submission handling
  - Success/error states

- [ ] **Lock-up süreleri UI** *(30 dk)*
  - Duration selector (30d, 90d, 180d, 365d)
  - APY multiplier display
  - Risk warning messages

### Geliştirici B Görevleri (2 saat)

#### ⚡ Yüksek Öncelik
- [ ] **Rewards tracking CRUD işlemleri** *(75 dk)*
  - Rewards table schema
  - createReward, updateReward, deleteReward
  - getRewardsByUser endpoint
  - Reward calculation cron job logic

- [ ] **Interest statistics veri yönetimi** *(45 dk)*
  - Daily/weekly/monthly stats
  - Portfolio performance tracking
  - Historical data storage

### 📋 Günlük Başarı Kriterleri
- [ ] Staking form tamamlandı
- [ ] Lock-up periods çalışıyor
- [ ] Rewards tracking aktif
- [ ] Statistics hesaplanıyor

---

## 🗓️ GÜN 10 - Rewards Tracking

### 🎯 Günlük Hedef
Rewards tracking sistemini tamamlamak ve claim özelliğini eklemek

### Geliştirici A Görevleri (2 saat)

#### ⚡ Yüksek Öncelik
- [ ] **Rewards listesi ve claim butonları** *(90 dk)*
  - Rewards list component
  - Pending/available rewards
  - Claim button functionality
  - Claim confirmation modal
  - Transaction history

- [ ] **Portfolio dashboard** *(30 dk)*
  - Total staked amount
  - Total rewards earned
  - Active stakes overview

### Geliştirici B Görevleri (2 saat)

#### ⚡ Yüksek Öncelik
- [ ] **Yorum ve favoriler sistemi** *(75 dk)*
  - Comments CRUD operations
  - Favorites add/remove
  - User comments display
  - Comment moderation

- [ ] **Notification sistemi** *(45 dk)*
  - Reward notifications
  - Stake expiry warnings
  - System announcements

### 📋 Günlük Başarı Kriterleri
- [ ] Rewards claim çalışıyor
- [ ] Portfolio dashboard aktif
- [ ] Comments sistemi hazır
- [ ] Notifications çalışıyor

---

## 🗓️ GÜN 11 - Authentication (Frontend)

### 🎯 Günlük Hedef
Kullanıcı authentication sisteminin frontend kısmını tamamlamak

### Geliştirici A Görevleri (2 saat)

#### ⚡ Yüksek Öncelik
- [ ] **Login/Register sayfası tasarımı** *(75 dk)*
  - Login form design
  - Register form design
  - Form switching (login/register)
  - Social login buttons (placeholder)
  - Forgot password link

- [ ] **Form validasyonu** *(30 dk)*
  - Email validation
  - Password strength validation
  - Real-time validation feedback
  - Error message display

#### 🔶 Orta Öncelik
- [ ] **User profile bileşeni** *(15 dk)*
  - Profile dropdown
  - User avatar
  - Profile settings link

### Geliştirici B Görevleri (2 saat)

#### ⚡ Yüksek Öncelik
- [ ] **Supabase Auth entegrasyonu** *(90 dk)*
  - signUp function
  - signIn function
  - signOut function
  - Password reset
  - Email confirmation

#### 🔶 Orta Öncelik
- [ ] **Session yönetimi** *(30 dk)*
  - Session persistence
  - Auto-refresh tokens
  - Session timeout handling

### 📋 Günlük Başarı Kriterleri
- [ ] Login/Register sayfaları çalışıyor
- [ ] Form validation aktif
- [ ] Supabase auth entegrasyonu tamamlandı
- [ ] Session management çalışıyor

---

## 🗓️ GÜN 12 - Authentication (Backend & Routes)

### 🎯 Günlük Hedef
Authentication sistemini tamamlamak ve protected routes eklemek

### Geliştirici A Görevleri (2 saat)

#### ⚡ Yüksek Öncelik
- [ ] **Protected routes** *(60 dk)*
  - ProtectedRoute component
  - Route guards
  - Redirect logic
  - Loading states during auth check

- [ ] **User profile sayfası** *(45 dk)*
  - Profile information display
  - Edit profile form
  - Password change form
  - Account settings

#### 🔶 Orta Öncelik
- [ ] **Auth state management** *(15 dk)*
  - Global auth context
  - Auth state persistence

### Geliştirici B Görevleri (2 saat)

#### ⚡ Yüksek Öncelik
- [ ] **User context provider** *(60 dk)*
  - AuthContext setup
  - User state management
  - Auth state synchronization
  - Context optimization

- [ ] **Logout functionality** *(30 dk)*
  - Logout function
  - Clear user data
  - Redirect to login
  - Session cleanup

#### 🔶 Orta Öncelik
- [ ] **Auth middleware** *(30 dk)*
  - API request authentication
  - Token refresh logic
  - Error handling

### 📋 Günlük Başarı Kriterleri
- [ ] Protected routes çalışıyor
- [ ] User profile sayfası aktif
- [ ] Auth context tamamlandı
- [ ] Logout functionality çalışıyor

---

## 🗓️ GÜN 13 - Testing ve Optimizasyon

### 🎯 Günlük Hedef
Uygulamayı test etmek, hataları düzeltmek ve performansı optimize etmek

### Geliştirici A Görevleri (2 saat)

#### ⚡ Yüksek Öncelik
- [ ] **UI/UX son kontroller** *(60 dk)*
  - Tüm sayfaları gözden geçir
  - UI consistency kontrolü
  - User flow testing
  - Accessibility improvements

- [ ] **Mobile responsive test** *(45 dk)*
  - Mobile breakpoints test
  - Touch interactions
  - Mobile navigation
  - Performance on mobile

#### 🔶 Orta Öncelik
- [ ] **Cross-browser test** *(15 dk)*
  - Chrome, Firefox, Safari test
  - CSS compatibility

### Geliştirici B Görevleri (2 saat)

#### ⚡ Yüksek Öncelik
- [ ] **Performance optimizasyonu** *(75 dk)*
  - Bundle size optimization
  - Image optimization
  - Query optimization
  - Lazy loading implementation

- [ ] **Bug fixes ve stability** *(45 dk)*
  - Error handling improvements
  - Edge case testing
  - Data validation
  - Memory leak checks

### 📋 Günlük Başarı Kriterleri
- [ ] Tüm major bugs düzeltildi
- [ ] Mobile responsive çalışıyor
- [ ] Performance kabul edilebilir
- [ ] Cross-browser uyumlu

---

## 🗓️ GÜN 14 - Deployment ve Final Testing

### 🎯 Günlük Hedef
Uygulamayı production'a deploy etmek ve final testleri yapmak

### Geliştirici A Görevleri (2 saat)

#### ⚡ Yüksek Öncelik
- [ ] **Production build hazırlığı** *(45 dk)*
  - Build optimization
  - Environment variables check
  - Asset optimization
  - Build error fixes

- [ ] **Final UI polish** *(60 dk)*
  - Loading states polish
  - Error messages improvement
  - Success feedback
  - Final styling touches

#### 🔶 Orta Öncelik
- [ ] **Demo hazırlığı** *(15 dk)*
  - Demo scenario preparation
  - Test data verification

### Geliştirici B Görevleri (2 saat)

#### ⚡ Yüksek Öncelik
- [ ] **Vercel deployment** *(60 dk)*
  - Vercel project setup
  - Build configuration
  - Domain setup
  - SSL certificate

- [ ] **Production database setup** *(45 dk)*
  - Production Supabase setup
  - Data migration
  - Production environment variables
  - Database backup

#### 🔶 Orta Öncelik
- [ ] **Final testing** *(15 dk)*
  - Production environment test
  - End-to-end testing
  - Performance monitoring

### 📋 Günlük Başarı Kriterleri
- [ ] Uygulama production'da çalışıyor
- [ ] Tüm özellikler aktif
- [ ] Performance hedefleri karşılandı
- [ ] Demo hazır

---

## 🎯 Genel Başarı Kriterleri

### Must-Have Features ✅
- [ ] Protokol listesi görüntüleme
- [ ] Temel filtreleme (APY, risk)
- [ ] Protokol detay sayfası
- [ ] Kullanıcı kayıt/giriş
- [ ] Yorum yapma

### Technical Requirements ✅
- [ ] Mobile responsive
- [ ] Dark theme
- [ ] 3 saniye sayfa yükleme
- [ ] Authentication çalışıyor
- [ ] Database CRUD işlemleri
- [ ] Production deployment

### Demo Requirements ✅
- [ ] 5+ protokol verisi
- [ ] Test kullanıcıları
- [ ] Örnek yorumlar
- [ ] Stable deployment
- [ ] 2 dakikalık demo senaryosu

---

## 📝 Günlük Takip Şablonu

```markdown
## Gün X - [Tarih]

### ✅ Tamamlanan Görevler
**Geliştirici A:**
- [ ] Görev 1
- [ ] Görev 2

**Geliştirici B:**
- [ ] Görev 1
- [ ] Görev 2

### 🔄 Devam Eden Görevler
- Görev açıklaması

### ❌ Karşılaşılan Sorunlar
- Sorun açıklaması ve çözüm

### ⏰ Yarın Planı
- Öncelikli görevler

### 📊 Günlük Metrikler
- Tamamlanan görev sayısı: X/Y
- Harcanan süre: X saat
- Kalan süre: X saat

### 🚨 Risk Durumu
- 🟢 Yeşil / 🟡 Sarı / 🔴 Kırmızı
- Risk açıklaması
```

---

**🎯 Hatırlatma**: Her gün sonunda 15 dakika sync meeting yapın ve bir sonraki günün önceliklerini belirleyin. "Done is better than perfect" prensibiyle hareket edin!