-- =============================================
-- FG PORTFOLIO TABLES
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Main Portfolio Table
CREATE TABLE IF NOT EXISTS fg_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  slug VARCHAR(50) UNIQUE NOT NULL,
  photographer_name TEXT NOT NULL,
  tagline TEXT,
  
  -- Hero Section (URL only - no storage)
  hero_title TEXT DEFAULT 'CAPTURING MOMENTS',
  hero_subtitle TEXT DEFAULT 'Photography',
  hero_image_url TEXT,
  
  -- About Section (URL only)
  about_title TEXT DEFAULT 'ABOUT ME',
  about_body TEXT,
  about_image_url TEXT,
  
  -- Contact Info
  whatsapp_number TEXT,
  instagram_handle TEXT,
  email TEXT,
  contact_method TEXT DEFAULT 'whatsapp',
  contact_button_text TEXT DEFAULT 'Book Now',
  
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Section Order & Visibility
CREATE TABLE IF NOT EXISTS fg_portfolio_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES fg_portfolios(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  custom_title TEXT,
  UNIQUE(portfolio_id, section_key)
);

-- 3. Portfolio Gallery Items (URL only)
CREATE TABLE IF NOT EXISTS fg_portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES fg_portfolios(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Other',
  image_url TEXT NOT NULL,
  gdrive_link TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Pricing Packages
CREATE TABLE IF NOT EXISTS fg_portfolio_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES fg_portfolios(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subtitle TEXT,
  price TEXT NOT NULL,
  original_price TEXT,
  features TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'General',
  is_recommended BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- RLS POLICIES
-- =============================================

ALTER TABLE fg_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE fg_portfolio_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE fg_portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE fg_portfolio_pricing ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can manage own portfolio" ON fg_portfolios;
DROP POLICY IF EXISTS "Public can view published portfolios" ON fg_portfolios;
DROP POLICY IF EXISTS "Users can manage own sections" ON fg_portfolio_sections;
DROP POLICY IF EXISTS "Public can view sections" ON fg_portfolio_sections;
DROP POLICY IF EXISTS "Users can manage own items" ON fg_portfolio_items;
DROP POLICY IF EXISTS "Public can view items" ON fg_portfolio_items;
DROP POLICY IF EXISTS "Users can manage own pricing" ON fg_portfolio_pricing;
DROP POLICY IF EXISTS "Public can view pricing" ON fg_portfolio_pricing;

-- fg_portfolios policies
CREATE POLICY "Users can manage own portfolio" ON fg_portfolios
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public can view published portfolios" ON fg_portfolios
  FOR SELECT USING (is_published = TRUE);

-- fg_portfolio_sections policies
CREATE POLICY "Users can manage own sections" ON fg_portfolio_sections
  FOR ALL USING (
    portfolio_id IN (SELECT id FROM fg_portfolios WHERE user_id = auth.uid())
  );

CREATE POLICY "Public can view sections" ON fg_portfolio_sections
  FOR SELECT USING (
    portfolio_id IN (SELECT id FROM fg_portfolios WHERE is_published = TRUE)
  );

-- fg_portfolio_items policies
CREATE POLICY "Users can manage own items" ON fg_portfolio_items
  FOR ALL USING (
    portfolio_id IN (SELECT id FROM fg_portfolios WHERE user_id = auth.uid())
  );

CREATE POLICY "Public can view items" ON fg_portfolio_items
  FOR SELECT USING (
    portfolio_id IN (SELECT id FROM fg_portfolios WHERE is_published = TRUE)
  );

-- fg_portfolio_pricing policies
CREATE POLICY "Users can manage own pricing" ON fg_portfolio_pricing
  FOR ALL USING (
    portfolio_id IN (SELECT id FROM fg_portfolios WHERE user_id = auth.uid())
  );

CREATE POLICY "Public can view pricing" ON fg_portfolio_pricing
  FOR SELECT USING (
    portfolio_id IN (SELECT id FROM fg_portfolios WHERE is_published = TRUE)
  );

-- =============================================
-- AUTO-CREATE DEFAULT SECTIONS
-- =============================================

CREATE OR REPLACE FUNCTION create_default_sections()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO fg_portfolio_sections (portfolio_id, section_key, display_order, is_visible)
  VALUES
    (NEW.id, 'hero', 1, TRUE),
    (NEW.id, 'about', 2, TRUE),
    (NEW.id, 'portfolio', 3, TRUE),
    (NEW.id, 'pricing', 4, TRUE),
    (NEW.id, 'contact', 5, TRUE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_portfolio_created ON fg_portfolios;
CREATE TRIGGER on_portfolio_created
  AFTER INSERT ON fg_portfolios
  FOR EACH ROW EXECUTE FUNCTION create_default_sections();

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_fg_portfolios_slug ON fg_portfolios(slug);
CREATE INDEX IF NOT EXISTS idx_fg_portfolios_user_id ON fg_portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_fg_portfolio_items_portfolio_id ON fg_portfolio_items(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_fg_portfolio_pricing_portfolio_id ON fg_portfolio_pricing(portfolio_id);
