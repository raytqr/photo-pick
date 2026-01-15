-- Add Subscription Stacking Columns
-- This migration adds support for subscription stacking (queue system)
-- When user upgrades to a higher tier, their current subscription is "stacked"
-- and will resume after the higher tier expires

-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS stacked_tier VARCHAR(50),
ADD COLUMN IF NOT EXISTS stacked_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS stacked_events_remaining INTEGER,
ADD COLUMN IF NOT EXISTS stacked_monthly_credits INTEGER;

-- Add comment for documentation
COMMENT ON COLUMN profiles.stacked_tier IS 'The tier that is paused/stacked waiting to resume after current subscription expires';
COMMENT ON COLUMN profiles.stacked_expires_at IS 'When the stacked subscription was supposed to expire';
COMMENT ON COLUMN profiles.stacked_events_remaining IS 'Events remaining for the stacked subscription';
COMMENT ON COLUMN profiles.stacked_monthly_credits IS 'Monthly credits for the stacked subscription';
