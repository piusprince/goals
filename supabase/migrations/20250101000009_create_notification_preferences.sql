-- Create notification_preferences table
-- Phase 3: Reminders & Insights

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  daily_reminders BOOLEAN NOT NULL DEFAULT true,
  reminder_time TIME NOT NULL DEFAULT '09:00',
  weekly_summary BOOLEAN NOT NULL DEFAULT true,
  achievement_alerts BOOLEAN NOT NULL DEFAULT true,
  streak_warnings BOOLEAN NOT NULL DEFAULT true,
  push_subscription JSONB,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE public.notification_preferences IS 'User notification preferences and push subscription data';
COMMENT ON COLUMN public.notification_preferences.reminder_time IS 'Time of day for daily check-in reminders (HH:MM format)';
COMMENT ON COLUMN public.notification_preferences.push_subscription IS 'Web Push subscription JSON from browser';
COMMENT ON COLUMN public.notification_preferences.timezone IS 'User timezone for scheduling notifications';

-- Create index for user lookup
CREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences(user_id);

-- Create index for reminder time queries (for Edge Functions)
CREATE INDEX idx_notification_preferences_reminder_time ON public.notification_preferences(reminder_time)
  WHERE daily_reminders = true;

-- Enable Row Level Security
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own preferences
CREATE POLICY "Users can view their own notification preferences"
  ON public.notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
  ON public.notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
  ON public.notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notification preferences"
  ON public.notification_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_updated_at();
