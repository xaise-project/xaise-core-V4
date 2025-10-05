-- User Statistics Schema
-- Geliştirici B - Gün 9 Orta Öncelik Görevleri
-- Daily/weekly/monthly performance tracking için statistics tabloları

-- User Statistics tablosu - günlük/haftalık/aylık performans verileri
CREATE TABLE IF NOT EXISTS user_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Zaman aralığı bilgileri
    period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Portfolio değerleri
    total_staked_amount DECIMAL(20,8) DEFAULT 0,
    total_rewards_earned DECIMAL(20,8) DEFAULT 0,
    total_rewards_claimed DECIMAL(20,8) DEFAULT 0,
    total_rewards_unclaimed DECIMAL(20,8) DEFAULT 0,
    
    -- Performans metrikleri
    portfolio_value DECIMAL(20,8) DEFAULT 0,
    portfolio_growth_percentage DECIMAL(8,4) DEFAULT 0,
    average_apy DECIMAL(8,4) DEFAULT 0,
    best_performing_protocol_id UUID REFERENCES protocols(id),
    worst_performing_protocol_id UUID REFERENCES protocols(id),
    
    -- Aktivite metrikleri
    active_stakes_count INTEGER DEFAULT 0,
    completed_stakes_count INTEGER DEFAULT 0,
    new_stakes_count INTEGER DEFAULT 0,
    total_protocols_used INTEGER DEFAULT 0,
    
    -- Risk metrikleri
    risk_score DECIMAL(5,2) DEFAULT 0,
    diversification_score DECIMAL(5,2) DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio Snapshots tablosu - günlük portfolio durumu
CREATE TABLE IF NOT EXISTS portfolio_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Snapshot bilgileri
    snapshot_date DATE NOT NULL,
    snapshot_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Portfolio değerleri
    total_portfolio_value DECIMAL(20,8) NOT NULL DEFAULT 0,
    total_staked_amount DECIMAL(20,8) NOT NULL DEFAULT 0,
    total_available_rewards DECIMAL(20,8) NOT NULL DEFAULT 0,
    total_claimed_rewards DECIMAL(20,8) NOT NULL DEFAULT 0,
    
    -- Günlük değişimler
    daily_change_amount DECIMAL(20,8) DEFAULT 0,
    daily_change_percentage DECIMAL(8,4) DEFAULT 0,
    daily_rewards_earned DECIMAL(20,8) DEFAULT 0,
    
    -- Protokol dağılımı (JSON formatında)
    protocol_distribution JSONB DEFAULT '{}',
    
    -- Risk metrikleri
    portfolio_risk_level VARCHAR(20) DEFAULT 'medium' CHECK (portfolio_risk_level IN ('low', 'medium', 'high')),
    diversification_index DECIMAL(5,2) DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Protocol Performance tablosu - protokol bazında performans
CREATE TABLE IF NOT EXISTS protocol_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_id UUID NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Zaman aralığı
    period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Performans metrikleri
    total_staked DECIMAL(20,8) DEFAULT 0,
    total_rewards DECIMAL(20,8) DEFAULT 0,
    actual_apy DECIMAL(8,4) DEFAULT 0,
    expected_apy DECIMAL(8,4) DEFAULT 0,
    performance_ratio DECIMAL(8,4) DEFAULT 0, -- actual/expected
    
    -- Aktivite metrikleri
    stakes_count INTEGER DEFAULT 0,
    average_stake_duration INTEGER DEFAULT 0, -- days
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_statistics_user_period ON user_statistics(user_id, period_type, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_user_statistics_period_start ON user_statistics(period_start DESC);
CREATE INDEX IF NOT EXISTS idx_user_statistics_user_id ON user_statistics(user_id);

CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_user_date ON portfolio_snapshots(user_id, snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_date ON portfolio_snapshots(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_user_id ON portfolio_snapshots(user_id);

CREATE INDEX IF NOT EXISTS idx_protocol_performance_user_protocol ON protocol_performance(user_id, protocol_id, period_type);
CREATE INDEX IF NOT EXISTS idx_protocol_performance_period ON protocol_performance(period_start DESC);
CREATE INDEX IF NOT EXISTS idx_protocol_performance_user_id ON protocol_performance(user_id);

-- Composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_user_statistics_lookup ON user_statistics(user_id, period_type, period_start DESC, period_end DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_lookup ON portfolio_snapshots(user_id, snapshot_date DESC, total_portfolio_value DESC);

-- Updated_at trigger for user_statistics
CREATE OR REPLACE FUNCTION update_user_statistics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_statistics_updated_at
    BEFORE UPDATE ON user_statistics
    FOR EACH ROW
    EXECUTE FUNCTION update_user_statistics_updated_at();

-- Updated_at trigger for protocol_performance
CREATE OR REPLACE FUNCTION update_protocol_performance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_protocol_performance_updated_at
    BEFORE UPDATE ON protocol_performance
    FOR EACH ROW
    EXECUTE FUNCTION update_protocol_performance_updated_at();

-- RLS Policies
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_performance ENABLE ROW LEVEL SECURITY;

-- User Statistics RLS
CREATE POLICY "Users can view their own statistics" ON user_statistics
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own statistics" ON user_statistics
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own statistics" ON user_statistics
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Portfolio Snapshots RLS
CREATE POLICY "Users can view their own snapshots" ON portfolio_snapshots
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own snapshots" ON portfolio_snapshots
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Protocol Performance RLS
CREATE POLICY "Users can view their own protocol performance" ON protocol_performance
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own protocol performance" ON protocol_performance
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own protocol performance" ON protocol_performance
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON user_statistics TO authenticated;
GRANT SELECT, INSERT ON portfolio_snapshots TO authenticated;
GRANT SELECT, INSERT, UPDATE ON protocol_performance TO authenticated;

-- Grant permissions to anon users (read-only for public stats if needed)
GRANT SELECT ON user_statistics TO anon;
GRANT SELECT ON portfolio_snapshots TO anon;
GRANT SELECT ON protocol_performance TO anon;

-- Performans için ANALYZE
ANALYZE user_statistics;
ANALYZE portfolio_snapshots;
ANALYZE protocol_performance;

-- Comments
COMMENT ON TABLE user_statistics IS 'User portfolio performance statistics by time period';
COMMENT ON TABLE portfolio_snapshots IS 'Daily portfolio value snapshots for historical tracking';
COMMENT ON TABLE protocol_performance IS 'Protocol-specific performance metrics by user and time period';

COMMENT ON COLUMN user_statistics.period_type IS 'Time period type: daily, weekly, monthly';
COMMENT ON COLUMN user_statistics.portfolio_growth_percentage IS 'Portfolio growth percentage for the period';
COMMENT ON COLUMN user_statistics.diversification_score IS 'Portfolio diversification score (0-100)';
COMMENT ON COLUMN user_statistics.risk_score IS 'Overall portfolio risk score (0-100)';

COMMENT ON COLUMN portfolio_snapshots.protocol_distribution IS 'JSON object with protocol allocation percentages';
COMMENT ON COLUMN portfolio_snapshots.diversification_index IS 'Diversification index (0-100)';

COMMENT ON COLUMN protocol_performance.performance_ratio IS 'Actual APY / Expected APY ratio';
COMMENT ON COLUMN protocol_performance.average_stake_duration IS 'Average stake duration in days';