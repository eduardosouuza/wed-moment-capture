-- ============================================
-- EVENTCAPTURE - SCHEMA DO BANCO DE DADOS
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. CRIAR EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. TABELAS
-- ============================================

-- TABELA: profiles (estende auth.users do Supabase)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user', -- 'user' ou 'admin'
  plan TEXT DEFAULT 'free', -- 'free', 'basic', 'premium'
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: events
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Informações básicas
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  event_type TEXT DEFAULT 'wedding', -- 'wedding', 'birthday', 'corporate', 'party'
  event_date DATE,
  description TEXT,
  
  -- Personalização
  couple_name_1 TEXT,
  couple_name_2 TEXT,
  theme_color TEXT DEFAULT 'olive', -- 'olive', 'rose', 'ocean'
  custom_message TEXT,
  logo_url TEXT,
  
  -- Configurações
  max_photos INTEGER DEFAULT 300,
  max_videos INTEGER DEFAULT 50,
  max_video_duration INTEGER DEFAULT 15, -- segundos
  photo_sequence_count INTEGER DEFAULT 3, -- quantas fotos na sequência
  countdown_seconds INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  requires_password BOOLEAN DEFAULT false,
  password_hash TEXT,
  
  -- Plano e pagamento
  plan TEXT DEFAULT 'free', -- 'free', 'basic', 'premium'
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'failed'
  payment_id TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE
);

-- TABELA: media (fotos e vídeos)
CREATE TABLE IF NOT EXISTS media (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  
  file_path TEXT NOT NULL,
  file_size INTEGER, -- bytes
  media_type TEXT NOT NULL, -- 'photo' ou 'video'
  
  -- Engajamento
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  
  -- Moderação
  is_approved BOOLEAN DEFAULT true,
  moderation_status TEXT DEFAULT 'approved', -- 'pending', 'approved', 'rejected'
  
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: analytics (métricas do evento)
CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  
  metric_type TEXT NOT NULL, -- 'photo_capture', 'video_capture', 'view', 'download', 'share'
  metadata JSONB,
  device_info JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_media_event_id ON media(event_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_id ON analytics(event_id);

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- POLICIES: profiles
-- Usuários podem ver apenas seu próprio perfil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins podem ver todos os perfis
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- POLICIES: events
-- Usuários podem ver seus próprios eventos
CREATE POLICY "Users can view own events"
  ON events FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem criar eventos
CREATE POLICY "Users can create events"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus próprios eventos
CREATE POLICY "Users can update own events"
  ON events FOR UPDATE
  USING (auth.uid() = user_id);

-- Usuários podem deletar seus próprios eventos
CREATE POLICY "Users can delete own events"
  ON events FOR DELETE
  USING (auth.uid() = user_id);

-- Admins podem ver todos os eventos
CREATE POLICY "Admins can view all events"
  ON events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- POLICIES: media
-- Qualquer pessoa pode ver mídias de eventos ativos
CREATE POLICY "Anyone can view media from active events"
  ON media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = media.event_id
      AND events.is_active = true
    )
  );

-- Usuários autenticados podem fazer upload
CREATE POLICY "Authenticated users can upload media"
  ON media FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Donos do evento podem deletar mídias
CREATE POLICY "Event owners can delete media"
  ON media FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = media.event_id
      AND events.user_id = auth.uid()
    )
  );

-- Donos do evento podem atualizar mídias (featured, moderação)
CREATE POLICY "Event owners can update media"
  ON media FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = media.event_id
      AND events.user_id = auth.uid()
    )
  );

-- POLICIES: analytics
-- Convidados podem inserir analytics (anônimo)
CREATE POLICY "Anyone can insert analytics"
  ON analytics FOR INSERT
  WITH CHECK (true);

-- Donos do evento podem ver analytics
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
-- 5. STORAGE BUCKETS
-- ============================================

-- Criar bucket para mídia (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media-bucket',
  'media-bucket',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/webm', 'video/mp4']
)
ON CONFLICT (id) DO NOTHING;

-- STORAGE POLICIES
-- Qualquer um pode visualizar arquivos
CREATE POLICY "Public can view media files"
ON storage.objects FOR SELECT
USING (bucket_id = 'media-bucket');

-- Usuários autenticados podem fazer upload
CREATE POLICY "Authenticated users can upload media files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media-bucket'
  AND (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

-- Donos podem deletar seus arquivos
CREATE POLICY "Users can delete own media files"
ON storage.objects FOR DELETE
USING (bucket_id = 'media-bucket' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- 6. FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para events
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para criar perfil automaticamente após signup
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

-- Trigger para criar perfil após signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 7. CRIAR USUÁRIO ADMIN INICIAL (VOCÊ)
-- ============================================

-- Execute este comando APÓS criar sua conta no Supabase Auth
-- Substitua 'seu-email@exemplo.com' pelo seu email real

-- UPDATE profiles
-- SET role = 'admin'
-- WHERE email = 'seu-email@exemplo.com';

-- ============================================
-- ✅ SETUP COMPLETO!
-- ============================================

-- Para verificar se tudo foi criado:
SELECT 
  'Tables' as type,
  COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'events', 'media', 'analytics')

UNION ALL

SELECT 
  'Policies' as type,
  COUNT(*) as count
FROM pg_policies
WHERE schemaname = 'public';
