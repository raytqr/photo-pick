-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    order_id TEXT NOT NULL UNIQUE,
    tier TEXT NOT NULL,
    billing_cycle TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    base_price NUMERIC NOT NULL,
    fee_amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, settlement, expire, cancel, deny
    qr_url TEXT,
    midtrans_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments" 
    ON public.payments 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all payments" 
    ON public.payments 
    USING (auth.role() = 'service_role');
