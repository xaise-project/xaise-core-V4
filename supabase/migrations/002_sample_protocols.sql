-- 5 örnek protokol verisi ekleme

INSERT INTO protocols (name, description, apy, tvl, risk_level, min_stake, website_url) VALUES
('Ethereum Staking', 'Ethereum 2.0 staking protokolü. Güvenli ve stabil getiri sağlar.', 4.5, 50000000000, 'low', 32, 'https://ethereum.org/staking'),
('Compound Finance', 'Merkezi olmayan borç verme protokolü. Yüksek likidite ve esnek koşullar.', 8.2, 12000000000, 'medium', 0.01, 'https://compound.finance'),
('Aave Protocol', 'Gelişmiş DeFi borç verme platformu. Flash loan özelliği ile öne çıkar.', 6.8, 15000000000, 'medium', 0.1, 'https://aave.com'),
('Yearn Finance', 'Otomatik yield farming stratejileri. Yüksek getiri potansiyeli.', 12.5, 3000000000, 'high', 1, 'https://yearn.finance'),
('Lido Staking', 'Liquid staking çözümü. ETH stake ederken likiditeyi korur.', 5.1, 25000000000, 'low', 0.01, 'https://lido.fi');

-- Protokol verilerinin başarıyla eklendiğini kontrol et
SELECT COUNT(*) as protocol_count FROM protocols;