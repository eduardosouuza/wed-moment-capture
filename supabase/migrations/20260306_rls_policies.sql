-- ======================================
-- RLS Policies para Segurança do Lume
-- ======================================

-- ===================
-- 1. TABELA: events
-- ===================
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Remover policies antigas (se existirem) para evitar conflitos
DROP POLICY IF EXISTS "Users can view own events" ON events;
DROP POLICY IF EXISTS "Anyone can view active events" ON events;
DROP POLICY IF EXISTS "Users can insert own events" ON events;
DROP POLICY IF EXISTS "Users can update own events" ON events;
DROP POLICY IF EXISTS "Users can delete own events" ON events;
DROP POLICY IF EXISTS "Admin can manage all events" ON events;

-- Dono vê seus eventos
CREATE POLICY "Users can view own events" ON events 
  FOR SELECT USING (auth.uid() = user_id);

-- Convidados podem ver eventos ativos (necessário para a cabine/QR Code)
CREATE POLICY "Anyone can view active events" ON events 
  FOR SELECT USING (is_active = true);

-- Somente o dono pode criar, editar, deletar
CREATE POLICY "Users can insert own events" ON events 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events" ON events 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events" ON events 
  FOR DELETE USING (auth.uid() = user_id);

-- Admin pode gerenciar todos os eventos
CREATE POLICY "Admin can manage all events" ON events 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ===================
-- 2. TABELA: profiles
-- ===================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can manage all profiles" ON profiles;

-- Usuário vê só seu perfil
CREATE POLICY "Users can view own profile" ON profiles 
  FOR SELECT USING (auth.uid() = id);

-- Usuário pode editar seu próprio perfil
CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Admin pode ver e gerenciar todos
CREATE POLICY "Admin can manage all profiles" ON profiles 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ===================
-- 3. TABELA: media
-- ===================
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view media" ON media;
DROP POLICY IF EXISTS "Anyone can insert media" ON media;
DROP POLICY IF EXISTS "Event owner can delete media" ON media;
DROP POLICY IF EXISTS "Admin can manage all media" ON media;

-- Qualquer pessoa pode ver (galeria pública do evento)
CREATE POLICY "Anyone can view media" ON media 
  FOR SELECT USING (true);

-- Convidados podem fazer upload apenas em eventos ativos
CREATE POLICY "Anyone can insert media" ON media
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM events WHERE id = media.event_id AND is_active = true)
  );

-- Dono do evento pode deletar mídias
CREATE POLICY "Event owner can delete media" ON media 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM events WHERE id = media.event_id AND user_id = auth.uid())
  );

-- Admin pode gerenciar todas as mídias
CREATE POLICY "Admin can manage all media" ON media 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ===================
-- 4. TABELA: subscriptions
-- ===================
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Admin can manage all subscriptions" ON subscriptions;

-- Usuário vê suas próprias assinaturas
CREATE POLICY "Users can view own subscriptions" ON subscriptions 
  FOR SELECT USING (auth.uid() = user_id);

-- Admin pode ver todas
CREATE POLICY "Admin can manage all subscriptions" ON subscriptions 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
