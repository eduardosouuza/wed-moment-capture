-- Política RLS para permitir ADMINS editarem e deletarem eventos de qualquer usuário

-- 1. Política de UPDATE para admins
DROP POLICY IF EXISTS "Admins podem atualizar qualquer evento" ON events;

CREATE POLICY "Admins podem atualizar qualquer evento"
ON events
FOR UPDATE
USING (
  -- Usuário é admin (role = 'admin') OU é dono do evento
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
  OR user_id = auth.uid()
);

-- 2. Política de DELETE para admins
DROP POLICY IF EXISTS "Admins podem deletar qualquer evento" ON events;

CREATE POLICY "Admins podem deletar qualquer evento"
ON events
FOR DELETE
USING (
  -- Usuário é admin (role = 'admin') OU é dono do evento
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
  OR user_id = auth.uid()
);
