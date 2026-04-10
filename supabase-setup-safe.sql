-- ============================================
-- EVENTCAPTURE - CRIAÇÃO SIMPLES (SEM LIMPEZA)
-- Execute este SQL - versão simplificada
-- ============================================

-- Criar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CRIAR TABELAS
-- ============================================

-- TABELA: profiles
CREATE TABLE IF NOT EXISTS profiles (
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
CREATE TABLE IF NOT EXISTS events (
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
CREATE TABLE IF NOT EXISTS media (
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
CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  metric_type TEXT NOT NULL,
  metadata JSONB,
  device_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CRIAR ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_media_event_id ON media(event_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_id ON analytics(event_id);

-- ============================================
-- HABILITAR ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES - PROFILES
-- ============================================

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile') THEN
    CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins can view all profiles') THEN
    CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
  END IF;
END $$;

-- ============================================
-- POLICIES - EVENTS
-- ============================================

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Users can view own events') THEN
    CREATE POLICY "Users can view own events" ON events FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Users can create events') THEN
    CREATE POLICY "Users can create events" ON events FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Users can update own events') THEN
    CREATE POLICY "Users can update own events" ON events FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Users can delete own events') THEN
    CREATE POLICY "Users can delete own events" ON events FOR DELETE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Admins can view all events') THEN
    CREATE POLICY "Admins can view all events" ON events FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
  END IF;
END $$;

-- ============================================
-- POLICIES - MEDIA
-- ============================================

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'media' AND policyname = 'Anyone can view media from active events') THEN
    CREATE POLICY "Anyone can view media from active events" ON media FOR SELECT USING (EXISTS (SELECT 1 FROM events WHERE events.id = media.event_id AND events.is_active = true));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'media' AND policyname = 'Authenticated users can upload media') THEN
    CREATE POLICY "Authenticated users can upload media" ON media FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'media' AND policyname = 'Event owners can delete media') THEN
    CREATE POLICY "Event owners can delete media" ON media FOR DELETE USING (EXISTS (SELECT 1 FROM events WHERE events.id = media.event_id AND events.user_id = auth.uid()));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'media' AND policyname = 'Event owners can update media') THEN
    CREATE POLICY "Event owners can update media" ON media FOR UPDATE USING (EXISTS (SELECT 1 FROM events WHERE events.id = media.event_id AND events.user_id = auth.uid()));
  END IF;
END $$;

-- ============================================
-- POLICIES - ANALYTICS
-- ============================================

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'analytics' AND policyname = 'Anyone can insert analytics') THEN
    CREATE POLICY "Anyone can insert analytics" ON analytics FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'analytics' AND policyname = 'Event owners can view analytics') THEN
    CREATE POLICY "Event owners can view analytics" ON analytics FOR SELECT USING (EXISTS (SELECT 1 FROM events WHERE events.id = analytics.event_id AND events.user_id = auth.uid()));
  END IF;
END $$;

-- ============================================
-- STORAGE BUCKET
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('media-bucket', 'media-bucket', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/webm', 'video/mp4'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES
-- ============================================

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public can view media files') THEN
    CREATE POLICY "Public can view media files" ON storage.objects FOR SELECT USING (bucket_id = 'media-bucket');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated users can upload media files') THEN
    CREATE POLICY "Authenticated users can upload media files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media-bucket' AND (auth.role() = 'authenticated' OR auth.role() = 'anon'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can delete own media files') THEN
    CREATE POLICY "Users can delete own media files" ON storage.objects FOR DELETE USING (bucket_id = 'media-bucket' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;

-- ============================================
-- FUNÇÕES
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
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ✅ VERIFICAÇÃO FINAL
-- ============================================

SELECT 
  'SUCCESS! Tables created:' as message,
  COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'events', 'media', 'analytics');
