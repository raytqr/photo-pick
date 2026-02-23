-- ============================================
-- PRICING TIERS TABLE
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create the table
CREATE TABLE IF NOT EXISTS pricing_tiers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT,
  icon TEXT,
  gradient TEXT,
  display_order INT DEFAULT 0,
  is_popular BOOLEAN DEFAULT FALSE,
  -- Limits
  max_events INT,                 -- NULL = unlimited
  max_photos INT,                 -- NULL = unlimited
  -- Per-month pricing
  price_monthly INT NOT NULL,
  price_three_month INT NOT NULL,
  price_yearly INT NOT NULL,
  -- Total billing amounts
  total_monthly INT,
  total_three_month INT,
  total_yearly INT,
  -- Display
  original_monthly INT,
  features JSONB DEFAULT '[]'::jsonb,
  portfolio_feature TEXT,
  cta TEXT DEFAULT 'Get Started',
  -- Meta
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;

-- 3. Public read access (pricing is public info)
CREATE POLICY "Anyone can read active pricing"
  ON pricing_tiers FOR SELECT
  USING (is_active = true);

-- 4. Seed with current pricing data
INSERT INTO pricing_tiers (id, name, tagline, icon, gradient, display_order, is_popular, max_events, max_photos, price_monthly, price_three_month, price_yearly, total_monthly, total_three_month, total_yearly, original_monthly, features, portfolio_feature, cta) VALUES
(
  'starter', 'Starter', 'Perfect for beginners', 'Sparkles', 'from-gray-500 to-slate-500',
  1, false, 10, 300,
  40000, 35000, 30000,
  40000, 105000, 360000,
  50000,
  '["10 Events per month", "Up to 300 photos/event", "Google Drive Sync", "WhatsApp Integration", "Email Support"]'::jsonb,
  NULL, 'Get Started'
),
(
  'basic', 'Basic', 'For growing photographers', 'Crown', 'from-blue-500 to-cyan-500',
  2, false, 20, 500,
  70000, 60000, 50000,
  70000, 180000, 600000,
  89000,
  '["20 Events per month", "Up to 500 photos/event", "Everything in Starter", "Email Support"]'::jsonb,
  NULL, 'Get Started'
),
(
  'pro', 'Pro', 'Most popular choice', 'Zap', 'from-purple-500 to-pink-500',
  3, true, 50, NULL,
  150000, 120000, 100000,
  150000, 360000, 1200000,
  199000,
  '["50 Events per month", "Unlimited photos/event", "Everything in Basic", "WhatsApp Support"]'::jsonb,
  NULL, 'Go Pro'
),
(
  'unlimited', 'Unlimited', 'For studios & agencies', 'Rocket', 'from-orange-500 to-red-500',
  4, false, NULL, NULL,
  300000, 240000, 200000,
  300000, 720000, 2400000,
  399000,
  '["Unlimited Events", "Unlimited Photos", "Everything in Pro", "WhatsApp Support"]'::jsonb,
  'Portfolio Website Included', 'Contact Sales'
)
ON CONFLICT (id) DO NOTHING;

-- 5. Updated_at trigger
CREATE OR REPLACE FUNCTION update_pricing_tiers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pricing_tiers_updated_at
  BEFORE UPDATE ON pricing_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_pricing_tiers_updated_at();
