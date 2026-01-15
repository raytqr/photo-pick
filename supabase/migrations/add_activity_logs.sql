-- Activity Logs Table for Server Action Logging
-- Stores logs for debugging and analytics
-- Auto-cleanup after 7 days via cron job

CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'success',
    metadata JSONB DEFAULT '{}',
    error_message TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_status ON activity_logs(status);

-- RLS Policies
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Only admin can view all logs
CREATE POLICY "Admin can view all logs" ON activity_logs
    FOR SELECT USING (
        auth.jwt() ->> 'email' = current_setting('app.admin_email', true)
    );

-- Service role can insert logs (for server actions)
CREATE POLICY "Service role can insert logs" ON activity_logs
    FOR INSERT WITH CHECK (true);

-- Comment for documentation
COMMENT ON TABLE activity_logs IS 'Server action logs for debugging and analytics. Auto-cleanup after 7 days.';
