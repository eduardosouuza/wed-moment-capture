-- =====================================================
-- MIGRATION: Remover Sistema de Trial
-- =====================================================
-- Remove completamente o sistema de trial do banco
-- Eventos agora exigem subscription paga ANTES da criação
-- =====================================================

-- 1. Remover triggers de trial
DROP TRIGGER IF EXISTS activate_trial_on_event_creation ON events;

-- 2. Remover funções de trial
DROP FUNCTION IF EXISTS activate_trial() CASCADE;
DROP FUNCTION IF EXISTS convert_trial_to_paid(UUID, UUID) CASCADE;

-- 3. Remover campos de trial da tabela events
ALTER TABLE events 
  DROP COLUMN IF EXISTS is_trial CASCADE,
  DROP COLUMN IF EXISTS trial_started_at CASCADE,
  DROP COLUMN IF EXISTS trial_expires_at CASCADE,
  DROP COLUMN IF EXISTS photo_limit CASCADE,
  DROP COLUMN IF EXISTS photo_count CASCADE;

-- 4. Adicionar constraint para subscription_id obrigatório
-- (Remover eventos sem subscription primeiro, se necessário)
DELETE FROM events WHERE subscription_id IS NULL;

ALTER TABLE events 
  ALTER COLUMN subscription_id SET NOT NULL;

-- 5. Adicionar foreign key constraint
ALTER TABLE events
  DROP CONSTRAINT IF EXISTS events_subscription_fk;

ALTER TABLE events
  ADD CONSTRAINT events_subscription_fk 
  FOREIGN KEY (subscription_id) 
  REFERENCES subscriptions(id) 
  ON DELETE CASCADE;

-- 6. Adicionar índice para performance
CREATE INDEX IF NOT EXISTS idx_events_subscription_id 
  ON events(subscription_id);

-- 7. Comentário explicativo
COMMENT ON TABLE events IS 'Events table - requires active subscription before creation (no trial system)';
COMMENT ON COLUMN events.subscription_id IS 'Required - event must be linked to an active paid subscription';

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================
-- Após executar, verificar:
-- 1. SELECT * FROM events LIMIT 1; 
--    (não deve ter campos is_trial, trial_*, photo_limit, photo_count)
-- 2. Todos os eventos devem ter subscription_id
-- =====================================================
