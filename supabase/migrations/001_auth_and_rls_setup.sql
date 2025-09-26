-- Authentication ve RLS ayarları
-- Email/password authentication zaten Supabase'de varsayılan olarak aktif

-- RLS (Row Level Security) politikalarını aktif et
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

-- Users tablosu için RLS politikaları
-- Kullanıcılar sadece kendi profillerini görebilir ve güncelleyebilir
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Protocols tablosu için RLS politikaları
-- Herkes protokolleri görebilir (public read)
CREATE POLICY "Anyone can view protocols" ON protocols
  FOR SELECT USING (true);

-- Comments tablosu için RLS politikaları
-- Herkes yorumları görebilir
CREATE POLICY "Anyone can view comments" ON comments
  FOR SELECT USING (true);

-- Kullanıcılar sadece kendi yorumlarını ekleyebilir
CREATE POLICY "Users can insert own comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Kullanıcılar sadece kendi yorumlarını güncelleyebilir
CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Kullanıcılar sadece kendi yorumlarını silebilir
CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- Favorites tablosu için RLS politikaları
-- Kullanıcılar sadece kendi favorilerini görebilir
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

-- Kullanıcılar sadece kendi favorilerini ekleyebilir
CREATE POLICY "Users can insert own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Kullanıcılar sadece kendi favorilerini silebilir
CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Stakes tablosu için RLS politikaları
-- Kullanıcılar sadece kendi stake'lerini görebilir
CREATE POLICY "Users can view own stakes" ON stakes
  FOR SELECT USING (auth.uid() = user_id);

-- Kullanıcılar sadece kendi stake'lerini ekleyebilir
CREATE POLICY "Users can insert own stakes" ON stakes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Kullanıcılar sadece kendi stake'lerini güncelleyebilir
CREATE POLICY "Users can update own stakes" ON stakes
  FOR UPDATE USING (auth.uid() = user_id);

-- Rewards tablosu için RLS politikaları
-- Kullanıcılar sadece kendi ödüllerini görebilir
CREATE POLICY "Users can view own rewards" ON rewards
  FOR SELECT USING (auth.uid() = user_id);

-- Kullanıcılar sadece kendi ödüllerini güncelleyebilir (claim için)
CREATE POLICY "Users can update own rewards" ON rewards
  FOR UPDATE USING (auth.uid() = user_id);

-- Temel izinleri ver
GRANT SELECT ON protocols TO anon;
GRANT SELECT ON comments TO anon;
GRANT ALL PRIVILEGES ON users TO authenticated;
GRANT ALL PRIVILEGES ON comments TO authenticated;
GRANT ALL PRIVILEGES ON favorites TO authenticated;
GRANT ALL PRIVILEGES ON stakes TO authenticated;
GRANT ALL PRIVILEGES ON rewards TO authenticated;
GRANT ALL PRIVILEGES ON protocols TO authenticated;