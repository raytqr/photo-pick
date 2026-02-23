-- =============================================
-- AFFILIATE PROGRAM MIGRATION
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. AFFILIATES TABLE
CREATE TABLE IF NOT EXISTS affiliates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT NOT NULL,
    commission_type TEXT NOT NULL DEFAULT 'percentage' CHECK (commission_type IN ('percentage', 'fixed')),
    commission_value NUMERIC NOT NULL DEFAULT 10,
    total_earned NUMERIC NOT NULL DEFAULT 0,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. AFFILIATE CODES TABLE
CREATE TABLE IF NOT EXISTS affiliate_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    discount_percentage NUMERIC NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    times_used INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. AFFILIATE TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS affiliate_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
    affiliate_code_id UUID NOT NULL REFERENCES affiliate_codes(id) ON DELETE CASCADE,
    payment_id UUID,
    order_id TEXT NOT NULL,
    user_id UUID,
    tier TEXT,
    billing_cycle TEXT,
    payment_amount NUMERIC NOT NULL DEFAULT 0,
    discount_given NUMERIC NOT NULL DEFAULT 0,
    commission_amount NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ADD affiliate_code_id TO PAYMENTS TABLE
ALTER TABLE payments ADD COLUMN IF NOT EXISTS affiliate_code_id UUID;

-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_affiliate_codes_affiliate_id ON affiliate_codes(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_codes_code ON affiliate_codes(code);
CREATE INDEX IF NOT EXISTS idx_affiliate_transactions_affiliate_id ON affiliate_transactions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_transactions_status ON affiliate_transactions(status);

-- 6. RLS POLICIES
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_transactions ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (used by server actions)
CREATE POLICY "Service role full access on affiliates"
    ON affiliates FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role full access on affiliate_codes"
    ON affiliate_codes FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role full access on affiliate_transactions"
    ON affiliate_transactions FOR ALL
    USING (true)
    WITH CHECK (true);

-- Public can read active affiliate codes (for checkout validation)
CREATE POLICY "Public read active affiliate codes"
    ON affiliate_codes FOR SELECT
    USING (is_active = true);

-- 7. UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION update_affiliates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_affiliates_updated_at
    BEFORE UPDATE ON affiliates
    FOR EACH ROW
    EXECUTE FUNCTION update_affiliates_updated_at();
