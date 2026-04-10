-- =====================================================
-- MIGRATION: Pending Subscriptions (Guest Checkout)
-- =====================================================
-- Permite usuários pagarem ANTES de criar conta
-- Subscription fica "pending" até completar registro
-- =====================================================

-- 1. Criar tabela pending_subscriptions
CREATE TABLE IF NOT EXISTS pending_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  plan_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending_registration',
  payment_gateway TEXT NOT NULL,
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'BRL',
  metadata JSONB,
  expires_at TIMESTAMP NOT NULL,
  claimed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CHECK (status IN ('pending_registration', 'claimed', 'expired')),
  CHECK (payment_gateway IN ('stripe', 'mercadopago'))
);

-- 2. Índices para performance
CREATE INDEX idx_pending_subscriptions_session_id 
  ON pending_subscriptions(session_id);

CREATE INDEX idx_pending_subscriptions_email 
  ON pending_subscriptions(email);

CREATE INDEX idx_pending_subscriptions_status 
  ON pending_subscriptions(status);

-- 3. Função para converter pending → subscription real
CREATE OR REPLACE FUNCTION claim_pending_subscription(
  pending_id UUID,
  user_id UUID
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription_id UUID;
  v_pending pending_subscriptions%ROWTYPE;
BEGIN
  -- Buscar pending subscription
  SELECT * INTO v_pending
  FROM pending_subscriptions
  WHERE id = pending_id
    AND status = 'pending_registration'
    AND expires_at > NOW();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pending subscription not found or expired';
  END IF;
  
  -- Criar subscription real
  INSERT INTO subscriptions (
    user_id,
    plan_type,
    status,
    payment_gateway,
    external_subscription_id,
    amount,
    currency,
    metadata
  ) VALUES (
    user_id,
    v_pending.plan_type,
    'active',
    v_pending.payment_gateway,
    v_pending.session_id,
    v_pending.amount,
    v_pending.currency,
    v_pending.metadata
  )
  RETURNING id INTO v_subscription_id;
  
  -- Marcar pending como claimed
  UPDATE pending_subscriptions
  SET status = 'claimed',
      claimed_at = NOW()
  WHERE id = pending_id;
  
  RAISE NOTICE 'Pending subscription % claimed by user %', pending_id, user_id;
  
  RETURN v_subscription_id;
END;
$$;

-- 4. Função para expirar pending subscriptions antigas
CREATE OR REPLACE FUNCTION expire_pending_subscriptions()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_expired_count INTEGER;
BEGIN
  UPDATE pending_subscriptions
  SET status = 'expired'
  WHERE status = 'pending_registration'
    AND expires_at < NOW();
  
  GET DIAGNOSTICS v_expired_count = ROW_COUNT;
  
  RAISE NOTICE 'Expired % pending subscriptions', v_expired_count;
  
  RETURN v_expired_count;
END;
$$;

-- 5. Grant permissions
GRANT SELECT, INSERT ON pending_subscriptions TO authenticated;
GRANT EXECUTE ON FUNCTION claim_pending_subscription TO authenticated;
GRANT EXECUTE ON FUNCTION claim_pending_subscription TO service_role;
GRANT EXECUTE ON FUNCTION expire_pending_subscriptions TO service_role;

-- 6. Comentários
COMMENT ON TABLE pending_subscriptions IS 'Temporary subscriptions created before user registration (guest checkout)';
COMMENT ON FUNCTION claim_pending_subscription IS 'Converts pending subscription to active subscription when user completes registration';
COMMENT ON FUNCTION expire_pending_subscriptions IS 'Expires pending subscriptions older than 24h';

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================
-- SELECT * FROM pending_subscriptions;
-- SELECT claim_pending_subscription('pending-id', 'user-id');
-- =====================================================
