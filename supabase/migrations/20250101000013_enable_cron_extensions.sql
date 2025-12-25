-- Enable pg_cron extension for scheduled jobs
-- Note: This must be enabled in the Supabase Dashboard Extensions page
-- or by the database owner

-- Enable pg_net extension for HTTP requests from cron jobs
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create a table to log scheduled notifications (optional, for debugging)
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    function_name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    notification_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'sent',
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies for notification_logs
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Only allow service role to insert logs
CREATE POLICY "Service role can insert notification logs"
    ON notification_logs
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Users can view their own notification logs
CREATE POLICY "Users can view own notification logs"
    ON notification_logs
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at DESC);

COMMENT ON TABLE notification_logs IS 'Logs of scheduled notifications sent by Edge Functions';
