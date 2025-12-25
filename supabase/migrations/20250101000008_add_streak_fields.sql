-- Add streak tracking fields to goals table
-- Phase 2: Progress Tracking

ALTER TABLE public.goals
ADD COLUMN IF NOT EXISTS current_streak INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_check_in_date DATE;

-- Add comments for documentation
COMMENT ON COLUMN public.goals.current_streak IS 'Current consecutive days streak for habit goals';
COMMENT ON COLUMN public.goals.longest_streak IS 'Longest streak ever achieved for habit goals';
COMMENT ON COLUMN public.goals.last_check_in_date IS 'Date of last check-in for streak calculation';
