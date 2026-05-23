-- Migração de tema de cores - VERSÃO CORRIGIDA
-- Execute este script no SQL Editor do Supabase

-- PASSO 1: Adicionar coluna se não existir (sem constraint ainda)
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT 'purple';

-- PASSO 2: Atualizar valores antigos para novos
UPDATE events 
SET theme_color = CASE 
    WHEN theme_color = 'olive' THEN 'green'
    WHEN theme_color = 'rose' THEN 'pink'
    WHEN theme_color = 'ocean' THEN 'blue'
    WHEN theme_color IS NULL THEN 'purple'
    ELSE theme_color
END
WHERE theme_color NOT IN ('purple', 'blue', 'pink', 'green', 'orange', 'red') 
   OR theme_color IS NULL;

-- PASSO 3: Remover constraint antiga se existir
ALTER TABLE events 
DROP CONSTRAINT IF EXISTS valid_theme_color;

-- PASSO 4: Adicionar nova constraint
ALTER TABLE events 
ADD CONSTRAINT valid_theme_color 
CHECK (theme_color IN ('purple', 'blue', 'pink', 'green', 'orange', 'red'));

-- PASSO 5: Definir valor padrão
ALTER TABLE events 
ALTER COLUMN theme_color SET DEFAULT 'purple';

-- Comentário descritivo
COMMENT ON COLUMN events.theme_color IS 'Tema de cores do evento: purple, blue, pink, green, orange, red';
