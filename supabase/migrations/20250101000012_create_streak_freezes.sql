-- Create streak_freezes table
-- Phase 3: Reminders & Insights

CREATE TABLE IF NOT EXISTS public.streak_freezes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  available INTEGER NOT NULL DEFAULT 0 CHECK (available >= 0 AND available <= 3),
  active_until DATE,
  last_earned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Each goal can only have one streak_freeze record per user
  CONSTRAINT unique_user_goal_streak_freeze UNIQUE (user_id, goal_id)
);

-- Add comments for documentation
COMMENT ON TABLE public.streak_freezes IS 'Tracks streak freeze availability and usage for goals';
COMMENT ON COLUMN public.streak_freezes.available IS 'Number of streak freezes available (max 3)';
COMMENT ON COLUMN public.streak_freezes.active_until IS 'Date until which the current freeze is active';
COMMENT ON COLUMN public.streak_freezes.last_earned_at IS 'Last time a streak freeze was earned from a 7-day streak';

-- Create indexes for efficient queries
CREATE INDEX idx_streak_freezes_user_id ON public.streak_freezes(user_id);
CREATE INDEX idx_streak_freezes_goal_id ON public.streak_freezes(goal_id);
CREATE INDEX idx_streak_freezes_active ON public.streak_freezes(active_until)
  WHERE active_until IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.streak_freezes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own streak freezes
CREATE POLICY "Users can view their own streak freezes"
  ON public.streak_freezes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streak freezes"
  ON public.streak_freezes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streak freezes"
  ON public.streak_freezes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own streak freezes"
  ON public.streak_freezes FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_streak_freezes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER streak_freezes_updated_at
  BEFORE UPDATE ON public.streak_freezes
  FOR EACH ROW
  EXECUTE FUNCTION update_streak_freezes_updated_at();
