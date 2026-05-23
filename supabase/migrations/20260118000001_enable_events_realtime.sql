-- Enable realtime for events table
-- This allows frontend to receive updates when webhooks modify events

-- Enable realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE events;

-- Add comment explaining realtime usage
COMMENT ON TABLE events IS 'Events table with realtime enabled for instant UI updates when webhooks process payments';
