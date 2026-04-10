-- Trigger to auto-activate trial when event is created
CREATE OR REPLACE FUNCTION auto_activate_trial()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Set trial fields on new events
  NEW.is_trial := true;
  NEW.trial_started_at := NOW();
  NEW.trial_expires_at := NOW() + INTERVAL '30 minutes';
  NEW.photo_limit := 5;
  NEW.photo_count := 0;
  
  RETURN NEW;
END;
$$;

-- Create trigger that runs BEFORE INSERT
DROP TRIGGER IF EXISTS trigger_auto_activate_trial ON events;
CREATE TRIGGER trigger_auto_activate_trial
  BEFORE INSERT ON events
  FOR EACH ROW
  EXECUTE FUNCTION auto_activate_trial();
