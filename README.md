# xaise-core-V4
Özerk Kripto Karar Motoru MVP

# 📊 Market Flow Dashboard

Modern ve interaktif kripto para piyasa analiz dashboard'u. Gerçek zamanlı fiyat grafikleri, staking fırsatları ve piyasa istatistikleri ile kapsamlı bir DeFi deneyimi sunar.

![Dashboard Preview](https://img.shields.io/badge/Status-Active-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Özellikler

### 📈 Gelişmiş Fiyat Grafikleri
- **SVG Tabanlı Grafikler**: Yüksek performanslı, özelleştirilebilir SVG grafikleri
- **Dinamik Renk Geçişleri**: Eşik değerlerine göre otomatik renk değişimi (3K altı turuncu, üstü mavi)
- **Interaktif Zaman Aralıkları**: 1H, 3H, 5H, 1M, 1W seçenekleri
- **Gerçek Zamanlı Veriler**: Canlı piyasa verileri entegrasyonu

### 💰 Staking Platformu
- **Çoklu Kripto Desteği**: Bitcoin, Ethereum, Polkadot ve daha fazlası
- **Yüksek APY Oranları**: %15.48'e kadar getiri fırsatları
- **Minimum Stake Limitleri**: Esnek yatırım seçenekleri
- **Otomatik Hesaplama**: Getiri ve faiz hesaplamaları

### 📊 Piyasa İstatistikleri
- **24 Saatlik Değişim**: Anlık fiyat değişimleri
- **Hacim Analizi**: Günlük işlem hacimleri
- **Piyasa Değeri**: Toplam piyasa kapitalizasyonu
- **Trend Analizi**: Yükseliş/düşüş trendleri

## 🛠️ Teknoloji Stack'i

### Frontend Framework
- **React 18.2.0** - Modern UI geliştirme
- **TypeScript 5.0.2** - Tip güvenli JavaScript
- **Vite 4.4.5** - Hızlı geliştirme ortamı

### Styling & UI
- **Tailwind CSS 3.3.3** - Utility-first CSS framework
- **Custom CSS** - Özel stil dosyaları
- **Lucide React 0.263.1** - Modern ikon kütüphanesi

### Grafik & Görselleştirme
- **Recharts 2.8.0** - React grafik kütüphanesi
- **SVG Graphics** - Özel SVG grafik implementasyonu
- **CSS Animations** - Smooth geçiş efektleri

### Geliştirme Araçları
- **ESLint** - Kod kalitesi kontrolü
- **PostCSS** - CSS işleme
- **Autoprefixer** - CSS uyumluluk

## 🚀 Kurulum

### Gereksinimler
- Node.js 16.0.0 veya üzeri
- npm veya yarn paket yöneticisi

### Adım Adım Kurulum

1. **Projeyi klonlayın**
```bash
git clone https://github.com/xaise-project/market-flow-dashboard.git
cd market-flow-dashboard
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
# veya
yarn install
```

3. **Geliştirme sunucusunu başlatın**
```bash
npm run dev
# veya
yarn dev
```

4. **Tarayıcıda açın**
```
http://localhost:5173
```

## 📁 Proje Yapısı

```
src/
├── components/
│   ├── Header/              # Üst navigasyon bileşeni
│   ├── Sidebar/             # Sol menü bileşeni
│   ├── MainContent/         # Ana içerik alanı
│   ├── PriceChart/          # Fiyat grafik bileşeni
│   │   ├── PriceChart.tsx   # Ana grafik komponenti
│   │   └── PriceChart.css   # Grafik stilleri
│   ├── StakingOfferings/    # Staking teklifleri
│   │   ├── StakingOfferings.tsx
│   │   ├── StakingCard.tsx
│   │   └── *.css
│   └── StakePanel/          # Stake paneli
│       ├── StakePanel.tsx
│       ├── InterestStats.tsx
│       └── *.css
├── App.tsx                  # Ana uygulama bileşeni
├── main.tsx                 # Uygulama giriş noktası
└── index.css               # Global stiller
```

## 🎨 Tasarım Özellikleri

### Renk Paleti
- **Arka Plan**: `#0a0a0a` (Koyu siyah)
- **Container**: `#252730` (Koyu gri)
- **Accent**: `#4f8ff7` (Mavi)
- **Warning**: `#f59e0b` (Turuncu)
- **Success**: `#22c55e` (Yeşil)
- **Error**: `#ef4444` (Kırmızı)

### Responsive Tasarım
- **Desktop**: 1200px ve üzeri
- **Tablet**: 768px - 1199px
- **Mobile**: 480px - 767px

## 📊 Grafik Özellikleri

### SVG Grafik Sistemi
- **Dinamik Veri Noktaları**: 100+ veri noktası desteği
- **Eşik Tabanlı Renklendirme**: 3000 değeri eşik noktası
- **Grid Sistemi**: X ve Y ekseni grid çizgileri
- **Zaman Etiketleri**: 13:15 - 16:15 arası zaman aralığı
- **Değer Etiketleri**: 1K - 5K arası değer aralığı

## 🔧 Geliştirme Komutları

```bash
# Geliştirme sunucusu
npm run dev

# Production build
npm run build

# Kod kalitesi kontrolü
npm run lint

# Preview build
npm run preview
```

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📞 İletişim

- **Proje Sahibi**: Xaise Project
- **GitHub**: [@xaise-project](https://github.com/xaise-project)
- **Website**: [xaise.io](https://xaise.io)

## 🙏 Teşekkürler

- React ekibine modern framework için
- Tailwind CSS ekibine utility-first CSS için
- Recharts ekibine grafik kütüphanesi için
- Lucide ekibine güzel ikonlar için

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!
