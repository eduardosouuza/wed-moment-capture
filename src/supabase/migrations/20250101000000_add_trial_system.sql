-- Add trial system fields to events table
ALTER TABLE events 
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS is_trial BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS photo_limit INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS photo_count INTEGER DEFAULT 0;

-- Create index for faster trial queries
CREATE INDEX IF NOT EXISTS idx_events_trial_expires ON events(trial_expires_at) 
  WHERE is_trial = true;

-- Add comment
COMMENT ON COLUMN events.trial_started_at IS 'When the trial period started';
COMMENT ON COLUMN events.trial_expires_at IS 'When the trial period expires (30 minutes after start)';
COMMENT ON COLUMN events.is_trial IS 'Whether this event is on trial (unpaid)';
COMMENT ON COLUMN events.photo_limit IS 'Maximum photos allowed (5 for trial, unlimited for paid)';
COMMENT ON COLUMN events.photo_count IS 'Current number of photos uploaded';
