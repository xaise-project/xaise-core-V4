-- Test için örnek kullanıcı oluşturma
-- Not: Gerçek kullanıcı kaydı Supabase Auth üzerinden yapılacak
-- Bu sadece users tablosuna örnek veri eklemek için

-- Örnek kullanıcı verisi (test amaçlı)
-- Gerçek uygulamada kullanıcılar auth.users tablosundan gelecek
INSERT INTO users (id, email, name) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'test@example.com', 'Test Kullanıcısı');

-- Kullanıcının başarıyla eklendiğini kontrol et
SELECT COUNT(*) as user_count FROM users;

-- Test kullanıcısı için örnek bir favori protokol ekle
INSERT INTO favorites (user_id, protocol_id) 
SELECT '550e8400-e29b-41d4-a716-446655440000', id 
FROM protocols 
WHERE name = 'Ethereum Staking' 
LIMIT 1;

-- Test kullanıcısı için örnek bir yorum ekle
INSERT INTO comments (user_id, protocol_id, content)
SELECT '550e8400-e29b-41d4-a716-446655440000', id, 'Bu protokol gerçekten güvenilir ve stabil getiri sağlıyor. Tavsiye ederim!'
FROM protocols 
WHERE name = 'Ethereum Staking' 
LIMIT 1;