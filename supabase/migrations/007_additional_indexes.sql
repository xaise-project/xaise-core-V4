-- Additional Database Indexes for Performance Optimization
-- Day 4 - High Priority Task: Index Optimization
-- Addresses missing indexes identified in query performance analysis

-- Protocol category and sorting indexes
CREATE INDEX IF NOT EXISTS idx_protocols_category ON protocols(category);
CREATE INDEX IF NOT EXISTS idx_protocols_category_apy ON protocols(category, apy DESC);
CREATE INDEX IF NOT EXISTS idx_protocols_category_tvl ON protocols(category, tvl DESC);
CREATE INDEX IF NOT EXISTS idx_protocols_apy ON protocols(apy DESC);
CREATE INDEX IF NOT EXISTS idx_protocols_risk_level ON protocols(risk_level);

-- Comments optimization
CREATE INDEX IF NOT EXISTS idx_comments_protocol_created ON comments(protocol_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_rating ON comments(rating DESC);
CREATE INDEX IF NOT EXISTS idx_comments_protocol_rating ON comments(protocol_id, rating DESC);

-- Favorites optimization
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_created ON favorites(user_id, created_at DESC);

-- Stakes advanced indexing
CREATE INDEX IF NOT EXISTS idx_stakes_end_date ON stakes(end_date);
CREATE INDEX IF NOT EXISTS idx_stakes_amount ON stakes(amount DESC);
CREATE INDEX IF NOT EXISTS idx_stakes_user_amount ON stakes(user_id, amount DESC);
CREATE INDEX IF NOT EXISTS idx_stakes_protocol_amount ON stakes(protocol_id, amount DESC);

-- Rewards optimization
CREATE INDEX IF NOT EXISTS idx_rewards_protocol_id ON rewards(protocol_id);
CREATE INDEX IF NOT EXISTS idx_rewards_reward_date ON rewards(reward_date DESC);
CREATE INDEX IF NOT EXISTS idx_rewards_amount ON rewards(amount DESC);

-- Composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_stakes_user_protocol_created ON stakes(user_id, protocol_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_user_protocol_created ON comments(user_id, protocol_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rewards_user_protocol_date ON rewards(user_id, protocol_id, reward_date DESC);

-- Partial indexes for performance
CREATE INDEX IF NOT EXISTS idx_stakes_completed ON stakes(user_id, end_date) WHERE status = 'completed';
CREATE INDEX IF NOT EXISTS idx_stakes_cancelled ON stakes(user_id, created_at DESC) WHERE status = 'cancelled';
CREATE INDEX IF NOT EXISTS idx_rewards_claimed ON rewards(user_id, reward_date DESC) WHERE claimed = true;
CREATE INDEX IF NOT EXISTS idx_high_apy_protocols ON protocols(apy DESC, tvl DESC) WHERE apy > 5.0;
CREATE INDEX IF NOT EXISTS idx_low_risk_protocols ON protocols(apy DESC) WHERE risk_level = 'low';

-- Search and filtering indexes
CREATE INDEX IF NOT EXISTS idx_protocols_name_search ON protocols USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_protocols_description_search ON protocols USING gin(to_tsvector('english', description));

-- Performance monitoring indexes
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(updated_at DESC) WHERE updated_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_protocols_popular ON protocols(tvl DESC, apy DESC) WHERE tvl > 1000000;

-- Update table statistics for query planner
ANALYZE protocols;
ANALYZE comments;
ANALYZE favorites;
ANALYZE stakes;
ANALYZE rewards;
ANALYZE users;

-- Create a view for protocol statistics (optional optimization)
CREATE OR REPLACE VIEW protocol_stats AS
SELECT 
    p.id,
    p.name,
    p.category,
    p.apy,
    p.tvl,
    p.risk_level,
    COUNT(DISTINCT s.id) as total_stakes,
    COUNT(DISTINCT f.id) as total_favorites,
    COUNT(DISTINCT c.id) as total_comments,
    AVG(c.rating) as avg_rating,
    SUM(s.amount) as total_staked_amount
FROM protocols p
LEFT JOIN stakes s ON p.id = s.protocol_id AND s.status = 'active'
LEFT JOIN favorites f ON p.id = f.protocol_id
LEFT JOIN comments c ON p.id = c.protocol_id
GROUP BY p.id, p.name, p.category, p.apy, p.tvl, p.risk_level;

-- Index for the view
CREATE INDEX IF NOT EXISTS idx_protocol_stats_category ON protocol_stats(category);
CREATE INDEX IF NOT EXISTS idx_protocol_stats_apy ON protocol_stats(apy DESC);
CREATE INDEX IF NOT EXISTS idx_protocol_stats_tvl ON protocol_stats(tvl DESC);
CREATE INDEX IF NOT EXISTS idx_protocol_stats_rating ON protocol_stats(avg_rating DESC);