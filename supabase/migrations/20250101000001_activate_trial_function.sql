-- Function to activate trial on event
CREATE OR REPLACE FUNCTION activate_trial_on_event(event_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE events
  SET 
    is_trial = true,
    trial_started_at = NOW(),
    trial_expires_at = NOW() + INTERVAL '30 minutes',
    photo_limit = 5,
    photo_count = 0
  WHERE id = event_id_param;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION activate_trial_on_event TO authenticated;
GRANT EXECUTE ON FUNCTION activate_trial_on_event TO anon;
