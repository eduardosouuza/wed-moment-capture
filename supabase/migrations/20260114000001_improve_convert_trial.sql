-- Improved convert_trial_to_paid function with validation and error handling
-- This replaces the simple VOID function with one that returns status

CREATE OR REPLACE FUNCTION convert_trial_to_paid(
  event_id_param UUID,
  subscription_id_param UUID
) RETURNS TABLE (
  success BOOLEAN,
  rows_affected INTEGER,
  event_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rows_updated INTEGER;
  event_is_trial BOOLEAN;
  event_exists BOOLEAN;
BEGIN
  -- Check if event exists
  SELECT EXISTS(SELECT 1 FROM events WHERE id = event_id_param) INTO event_exists;
  
  IF NOT event_exists THEN
    RAISE EXCEPTION 'Event % not found', event_id_param;
  END IF;

  -- Check if event is in trial
  SELECT is_trial INTO event_is_trial
  FROM events
  WHERE id = event_id_param;

  IF event_is_trial = false THEN
    RAISE NOTICE 'Event % already converted to paid', event_id_param;
    RETURN QUERY SELECT true, 0, 'already_paid'::TEXT;
    RETURN;
  END IF;

  -- Update event to convert from trial to paid
  UPDATE events
  SET 
    is_trial = false,
    trial_started_at = NULL,
    trial_expires_at = NULL,
    photo_limit = NULL,
    photo_count = NULL,
    subscription_id = subscription_id_param
  WHERE id = event_id_param
    AND is_trial = true;  -- Extra safety check

  GET DIAGNOSTICS rows_updated = ROW_COUNT;

  IF rows_updated = 0 THEN
    RAISE EXCEPTION 'Failed to update event %. Event may have been updated by another process.', event_id_param;
  END IF;

  RAISE NOTICE 'Event % successfully converted to paid. Subscription: %', event_id_param, subscription_id_param;
  
  RETURN QUERY SELECT true, rows_updated, 'converted'::TEXT;
END;
$$;

-- Grant permissions to authenticated users and service role
GRANT EXECUTE ON FUNCTION convert_trial_to_paid TO authenticated;
GRANT EXECUTE ON FUNCTION convert_trial_to_paid TO service_role;

-- Add comment for documentation
COMMENT ON FUNCTION convert_trial_to_paid IS 'Converts an event from trial to paid status. Returns success status, rows affected, and event status.';
