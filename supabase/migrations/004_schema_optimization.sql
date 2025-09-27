-- Database Schema Optimization
-- Geliştirici B - Gün 2 Yüksek Öncelik Görevleri
-- Eksik index'ler ve performans optimizasyonları

-- Eksik index'leri ekle
-- Users tablosu için ek index'ler
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Comments tablosu için ek index'ler
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_protocol ON comments(user_id, protocol_id);

-- Favorites tablosu için ek index'ler
CREATE INDEX IF NOT EXISTS idx_favorites_protocol_id ON favorites(protocol_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at DESC);

-- Stakes tablosu için ek index'ler
CREATE INDEX IF NOT EXISTS idx_stakes_created_at ON stakes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stakes_start_date ON stakes(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_stakes_user_status ON stakes(user_id, status);
CREATE INDEX IF NOT EXISTS idx_stakes_protocol_status ON stakes(protocol_id, status);

-- Rewards tablosu için ek index'ler
CREATE INDEX IF NOT EXISTS idx_rewards_created_at ON rewards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rewards_user_claimed ON rewards(user_id, claimed);

-- Composite index'ler performans için
CREATE INDEX IF NOT EXISTS idx_stakes_user_protocol_status ON stakes(user_id, protocol_id, status);
CREATE INDEX IF NOT EXISTS idx_rewards_stake_claimed ON rewards(stake_id, claimed);

-- Protocols tablosu için ek index'ler
CREATE INDEX IF NOT EXISTS idx_protocols_tvl ON protocols(tvl DESC);
CREATE INDEX IF NOT EXISTS idx_protocols_min_stake ON protocols(min_stake);
CREATE INDEX IF NOT EXISTS idx_protocols_created_at ON protocols(created_at DESC);

-- Performans için partial index'ler
CREATE INDEX IF NOT EXISTS idx_stakes_active ON stakes(user_id, protocol_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_rewards_unclaimed ON rewards(user_id, reward_date DESC) WHERE claimed = false;

-- Foreign key constraint'lerin mevcut olduğunu doğrula
-- (Zaten mevcut ama kontrol için)
DO $$
BEGIN
    -- Comments tablosu foreign key'leri kontrol et
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'comments_user_id_fkey' 
        AND table_name = 'comments'
    ) THEN
        ALTER TABLE comments ADD CONSTRAINT comments_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'comments_protocol_id_fkey' 
        AND table_name = 'comments'
    ) THEN
        ALTER TABLE comments ADD CONSTRAINT comments_protocol_id_fkey 
        FOREIGN KEY (protocol_id) REFERENCES protocols(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Tablo istatistiklerini güncelle
ANALYZE users;
ANALYZE protocols;
ANALYZE comments;
ANALYZE favorites;
ANALYZE stakes;
ANALYZE rewards;