-- Activity Logs Table (Final Simple Version)

-- 1. Create Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, 
    action VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'success',
    metadata JSONB DEFAULT '{}',
    error_message TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);

-- 3. RLS Policies
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Drop policies safely
DROP POLICY IF EXISTS "Service role can insert logs" ON activity_logs;
DROP POLICY IF EXISTS "Service role can view logs" ON activity_logs;
DROP POLICY IF EXISTS "Admin can view all logs" ON activity_logs;

-- Re-create
CREATE POLICY "Service role can insert logs" ON activity_logs
    FOR INSERT 
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can view logs" ON activity_logs
    FOR SELECT
    USING (auth.role() = 'service_role');

-- 4. Auto-Delete Cron Job
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- IMPORTANT: Just schedule it.
-- pg_cron will automatically update the job if it already exists with this name.
-- No need to delete or unschedule manually.
SELECT cron.schedule(
    'cleanup_old_activity_logs', -- Job Name (Unique ID)
    '0 3 * * *',                 -- Schedule (3 AM Activity)
    $$DELETE FROM public.activity_logs WHERE created_at < now() - INTERVAL '4 days'$$
);

COMMENT ON TABLE activity_logs IS 'Server action logs. Automatically deleted after 4 days via pg_cron.';
