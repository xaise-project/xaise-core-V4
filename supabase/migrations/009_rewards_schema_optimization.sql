-- Rewards Schema Optimization
-- Geliştirici B - Gün 9 Yüksek Öncelik Görevleri
-- Rewards tablosuna eksik alanları ekle ve optimizasyon yap

-- Rewards tablosuna yeni alanlar ekle
ALTER TABLE rewards 
ADD COLUMN IF NOT EXISTS reward_type VARCHAR(50) DEFAULT 'staking' CHECK (reward_type IN ('staking', 'compound', 'bonus', 'referral', 'loyalty')),
ADD COLUMN IF NOT EXISTS protocol_id UUID REFERENCES protocols(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS calculation_method VARCHAR(50) DEFAULT 'daily' CHECK (calculation_method IN ('daily', 'weekly', 'monthly', 'compound')),
ADD COLUMN IF NOT EXISTS apy_at_calculation DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS compound_frequency VARCHAR(20) DEFAULT 'daily' CHECK (compound_frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
ADD COLUMN IF NOT EXISTS transaction_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Protocol_id alanını mevcut veriler için doldur
UPDATE rewards 
SET protocol_id = stakes.protocol_id 
FROM stakes 
WHERE rewards.stake_id = stakes.id 
AND rewards.protocol_id IS NULL;

-- Yeni indeksler ekle
CREATE INDEX IF NOT EXISTS idx_rewards_protocol_id ON rewards(protocol_id);
CREATE INDEX IF NOT EXISTS idx_rewards_type ON rewards(reward_type);
CREATE INDEX IF NOT EXISTS idx_rewards_calculation_method ON rewards(calculation_method);
CREATE INDEX IF NOT EXISTS idx_rewards_updated_at ON rewards(updated_at DESC);

-- Composite indeksler
CREATE INDEX IF NOT EXISTS idx_rewards_user_protocol_type ON rewards(user_id, protocol_id, reward_type);
CREATE INDEX IF NOT EXISTS idx_rewards_protocol_date_claimed ON rewards(protocol_id, reward_date DESC, claimed);
CREATE INDEX IF NOT EXISTS idx_rewards_user_type_date ON rewards(user_id, reward_type, reward_date DESC);

-- Partial indeksler (performance için)
CREATE INDEX IF NOT EXISTS idx_rewards_unclaimed_by_user ON rewards(user_id, reward_date DESC) WHERE claimed = false;
-- Note: Removed time-based partial index due to immutability requirements

-- Updated_at trigger fonksiyonu
CREATE OR REPLACE FUNCTION update_rewards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger oluştur
DROP TRIGGER IF EXISTS trigger_update_rewards_updated_at ON rewards;
CREATE TRIGGER trigger_update_rewards_updated_at
    BEFORE UPDATE ON rewards
    FOR EACH ROW
    EXECUTE FUNCTION update_rewards_updated_at();

-- RLS politikalarını güncelle
DROP POLICY IF EXISTS "Users can view their own rewards" ON rewards;
DROP POLICY IF EXISTS "Users can insert their own rewards" ON rewards;
DROP POLICY IF EXISTS "Users can update their own rewards" ON rewards;

-- Yeni RLS politikaları
CREATE POLICY "Users can view their own rewards" ON rewards
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own rewards" ON rewards
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own rewards" ON rewards
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- System/Admin can manage all rewards (cron job için)
-- Note: Service role bypass RLS by default, so this policy is for documentation

-- Performans için ANALYZE
ANALYZE rewards;

-- Yorum ekle
COMMENT ON COLUMN rewards.reward_type IS 'Reward türü: staking, compound, bonus, referral, loyalty';
COMMENT ON COLUMN rewards.protocol_id IS 'Reward ile ilişkili protokol ID (denormalized for performance)';
COMMENT ON COLUMN rewards.calculation_method IS 'Reward hesaplama yöntemi';
COMMENT ON COLUMN rewards.apy_at_calculation IS 'Hesaplama anındaki APY değeri';
COMMENT ON COLUMN rewards.compound_frequency IS 'Compound sıklığı';
COMMENT ON COLUMN rewards.transaction_hash IS 'Blockchain transaction hash (varsa)';
COMMENT ON COLUMN rewards.metadata IS 'Ek metadata bilgileri (JSON format)';