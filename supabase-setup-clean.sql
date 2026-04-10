-- ============================================
-- EVENTCAPTURE - LIMPEZA E RECRIAÇÃO COMPLETA
-- Execute este SQL para LIMPAR e RECRIAR tudo
-- ============================================

-- ============================================
-- 1. DELETAR POLICIES ANTIGAS (se existirem)
-- ============================================

-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Events
DROP POLICY IF EXISTS "Users can view own events" ON events;
DROP POLICY IF EXISTS "Users can create events" ON events;
DROP POLICY IF EXISTS "Users can update own events" ON events;
DROP POLICY IF EXISTS "Users can delete own events" ON events;
DROP POLICY IF EXISTS "Admins can view all events" ON events;

-- Media
DROP POLICY IF EXISTS "Anyone can view media from active events" ON media;
DROP POLICY IF EXISTS "Authenticated users can upload media" ON media;
DROP POLICY IF EXISTS "Event owners can delete media" ON media;
DROP POLICY IF EXISTS "Event owners can update media" ON media;

-- Analytics
DROP POLICY IF EXISTS "Anyone can insert analytics" ON analytics;
DROP POLICY IF EXISTS "Event owners can view analytics" ON analytics;

-- Storage
DROP POLICY IF EXISTS "Public can view media files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload media files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own media files" ON storage.objects;

-- ============================================
-- 2. DELETAR TRIGGERS ANTIGOS
-- ============================================

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ============================================
-- 3. DELETAR FUNÇÕES ANTIGAS
-- ============================================

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ============================================
-- 4. DELETAR TABELAS ANTIGAS (CASCADE)
-- ============================================

DROP TABLE IF EXISTS analytics CASCADE;
DROP TABLE IF EXISTS media CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================
-- 5. CRIAR EXTENSÕES NECESSÁRIAS
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 6. CRIAR TABELAS DO ZERO
-- ============================================

-- TABELA: profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  plan TEXT DEFAULT 'free',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: events
CREATE TABLE events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  event_type TEXT DEFAULT 'wedding',
  event_date DATE,
  description TEXT,
  couple_name_1 TEXT,
  couple_name_2 TEXT,
  theme_color TEXT DEFAULT 'olive',
  custom_message TEXT,
  logo_url TEXT,
  max_photos INTEGER DEFAULT 300,
  max_videos INTEGER DEFAULT 50,
  max_video_duration INTEGER DEFAULT 15,
  photo_sequence_count INTEGER DEFAULT 3,
  countdown_seconds INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  requires_password BOOLEAN DEFAULT false,
  password_hash TEXT,
  plan TEXT DEFAULT 'free',
  payment_status TEXT DEFAULT 'pending',
  payment_id TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE
);

-- TABELA: media
CREATE TABLE media (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  media_type TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  moderation_status TEXT DEFAULT 'approved',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: analytics
CREATE TABLE analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  metric_type TEXT NOT NULL,
  metadata JSONB,
  device_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. CRIAR ÍNDICES
-- ============================================

CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_media_event_id ON media(event_id);
CREATE INDEX idx_analytics_event_id ON analytics(event_id);

-- ============================================
-- 8. HABILITAR ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 9. CRIAR POLICIES - PROFILES
-- ============================================

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 10. CRIAR POLICIES - EVENTS
-- ============================================

CREATE POLICY "Users can view own events"
  ON events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create events"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events"
  ON events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events"
  ON events FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all events"
  ON events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 11. CRIAR POLICIES - MEDIA
-- ============================================

CREATE POLICY "Anyone can view media from active events"
  ON media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = media.event_id
      AND events.is_active = true
    )
  );

CREATE POLICY "Authenticated users can upload media"
  ON media FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Event owners can delete media"
  ON media FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = media.event_id
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Event owners can update media"
  ON media FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = media.event_id
      AND events.user_id = auth.uid()
    )
  );

-- ============================================
-- 12. CRIAR POLICIES - ANALYTICS
-- ============================================

CREATE POLICY "Anyone can insert analytics"
  ON analytics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Event owners can view analytics"
  ON analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = analytics.event_id
      AND events.user_id = auth.uid()
    )
  );

-- ============================================
-- 13. STORAGE BUCKET (se não existir)
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media-bucket',
  'media-bucket',
  true,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/webm', 'video/mp4']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 14. STORAGE POLICIES
-- ============================================

CREATE POLICY "Public can view media files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media-bucket');

CREATE POLICY "Authenticated users can upload media files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'media-bucket'
    AND (auth.role() = 'authenticated' OR auth.role() = 'anon')
  );

CREATE POLICY "Users can delete own media files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'media-bucket' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- 15. FUNÇÕES
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 16. TRIGGERS
-- ============================================

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ✅ SETUP COMPLETO!
-- ============================================

-- Verificar se tudo foi criado corretamente
SELECT 
  'Tables Created' as status,
  COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'events', 'media', 'analytics');
