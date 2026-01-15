-- Add Event Password Protection
-- This allows photographers to optionally set a password for their events

ALTER TABLE events ADD COLUMN IF NOT EXISTS password VARCHAR(100);

COMMENT ON COLUMN events.password IS 'Optional password to protect event access';
