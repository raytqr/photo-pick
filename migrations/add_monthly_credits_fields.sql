-- Migration: Add monthly credits fields to profiles table
-- Run this migration to enable monthly credit reset functionality

-- Add field to store how many credits user gets each month
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS monthly_credits int DEFAULT 0;

-- Add field to track when credits were last reset
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_credit_reset_at timestamptz;

-- Add field to store user's billing day (1-28 to be safe across all months)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS billing_day int DEFAULT 1;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.monthly_credits IS 'Number of event credits user receives each month';
COMMENT ON COLUMN public.profiles.last_credit_reset_at IS 'Timestamp of when credits were last reset';
COMMENT ON COLUMN public.profiles.billing_day IS 'Day of month when credits reset (1-28)';
