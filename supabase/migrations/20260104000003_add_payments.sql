-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  plan_type TEXT NOT NULL CHECK (plan_type IN ('basico', 'standard', 'premium')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'canceled', 'expired')) DEFAULT 'pending',
  payment_gateway TEXT NOT NULL DEFAULT 'mercadopago',
  external_subscription_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'BRL',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  UNIQUE(event_id)
);

-- Payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  external_payment_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'refunded')) DEFAULT 'pending',
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
);

-- Add subscription_id to events
ALTER TABLE events ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_event_id ON subscriptions(event_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_subscription_id ON payment_transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_external_id ON payment_transactions(external_payment_id);

-- Function to convert trial to paid
CREATE OR REPLACE FUNCTION convert_trial_to_paid(
  event_id_param UUID,
  subscription_id_param UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE events
  SET 
    is_trial = false,
    trial_expires_at = NULL,
    photo_limit = NULL,
    photo_count = NULL,
    subscription_id = subscription_id_param
  WHERE id = event_id_param;
END;
$$;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON payment_transactions TO authenticated;
GRANT EXECUTE ON FUNCTION convert_trial_to_paid TO authenticated;
