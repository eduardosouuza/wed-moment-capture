-- Fase 3: colunas da Fase 1, 2 e 3
-- Rode este script no Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Todas as cláusulas usam IF NOT EXISTS — seguro rodar mais de uma vez

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS custom_message      text,
  ADD COLUMN IF NOT EXISTS requires_password   boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS password_hash       text,
  ADD COLUMN IF NOT EXISTS moderation_enabled  boolean DEFAULT false;
