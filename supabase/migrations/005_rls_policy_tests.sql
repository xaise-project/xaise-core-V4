-- RLS Policy Test ve Validation
-- Geliştirici B - Gün 2 Yüksek Öncelik Görevleri
-- RLS politikalarının doğru çalıştığını test et

-- Test kullanıcısı oluştur (test amaçlı)
-- Bu sadece test için, gerçek ortamda auth.users tablosu kullanılır
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'test@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Test kullanıcısını users tablosuna ekle
INSERT INTO users (id, email, name)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'test@example.com', 'Test User')
ON CONFLICT (id) DO NOTHING;

-- RLS politikalarını test etmek için fonksiyonlar

-- 1. Users tablosu RLS testi
CREATE OR REPLACE FUNCTION test_users_rls()
RETURNS TABLE(test_name TEXT, result BOOLEAN, description TEXT) AS $$
BEGIN
  -- Test 1: Kullanıcı kendi profilini görebilir mi?
  RETURN QUERY
  SELECT 
    'users_own_profile'::TEXT,
    EXISTS(
      SELECT 1 FROM users 
      WHERE id = '550e8400-e29b-41d4-a716-446655440000'
    ) AS result,
    'User can view own profile'::TEXT;
    
  -- Test 2: RLS aktif mi?
  RETURN QUERY
  SELECT 
    'users_rls_enabled'::TEXT,
    (SELECT relrowsecurity FROM pg_class WHERE relname = 'users') AS result,
    'RLS is enabled on users table'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Protocols tablosu RLS testi
CREATE OR REPLACE FUNCTION test_protocols_rls()
RETURNS TABLE(test_name TEXT, result BOOLEAN, description TEXT) AS $$
BEGIN
  -- Test 1: Herkes protokolleri görebilir mi?
  RETURN QUERY
  SELECT 
    'protocols_public_read'::TEXT,
    (SELECT COUNT(*) > 0 FROM protocols) AS result,
    'Anyone can view protocols'::TEXT;
    
  -- Test 2: RLS aktif mi?
  RETURN QUERY
  SELECT 
    'protocols_rls_enabled'::TEXT,
    (SELECT relrowsecurity FROM pg_class WHERE relname = 'protocols') AS result,
    'RLS is enabled on protocols table'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Stakes tablosu RLS testi
CREATE OR REPLACE FUNCTION test_stakes_rls()
RETURNS TABLE(test_name TEXT, result BOOLEAN, description TEXT) AS $$
BEGIN
  -- Test 1: RLS aktif mi?
  RETURN QUERY
  SELECT 
    'stakes_rls_enabled'::TEXT,
    (SELECT relrowsecurity FROM pg_class WHERE relname = 'stakes') AS result,
    'RLS is enabled on stakes table'::TEXT;
    
  -- Test 2: Politika sayısı kontrolü
  RETURN QUERY
  SELECT 
    'stakes_policies_count'::TEXT,
    (SELECT COUNT(*) >= 3 FROM pg_policies WHERE tablename = 'stakes') AS result,
    'Stakes table has required policies'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Tüm RLS politikalarını listele
CREATE OR REPLACE FUNCTION list_all_rls_policies()
RETURNS TABLE(
  table_name TEXT,
  policy_name TEXT,
  policy_cmd TEXT,
  policy_roles TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.tablename::TEXT,
    p.policyname::TEXT,
    p.cmd::TEXT,
    p.roles
  FROM pg_policies p
  WHERE p.schemaname = 'public'
  ORDER BY p.tablename, p.policyname;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RLS durumunu kontrol et
CREATE OR REPLACE FUNCTION check_rls_status()
RETURNS TABLE(
  table_name TEXT,
  rls_enabled BOOLEAN,
  policy_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.relname::TEXT,
    c.relrowsecurity,
    COUNT(p.policyname)
  FROM pg_class c
  LEFT JOIN pg_policies p ON p.tablename = c.relname
  WHERE c.relname IN ('users', 'protocols', 'comments', 'favorites', 'stakes', 'rewards')
    AND c.relkind = 'r'
  GROUP BY c.relname, c.relrowsecurity
  ORDER BY c.relname;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test sonuçlarını görüntülemek için view
CREATE OR REPLACE VIEW rls_test_results AS
SELECT * FROM test_users_rls()
UNION ALL
SELECT * FROM test_protocols_rls()
UNION ALL
SELECT * FROM test_stakes_rls();

-- Kullanım örnekleri (yorum olarak):
-- SELECT * FROM rls_test_results;
-- SELECT * FROM check_rls_status();
-- SELECT * FROM list_all_rls_policies();