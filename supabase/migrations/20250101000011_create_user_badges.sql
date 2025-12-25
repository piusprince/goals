-- Create user_badges junction table
-- Phase 3: Reminders & Insights

CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: user can only earn each badge once
  CONSTRAINT unique_user_badge UNIQUE (user_id, badge_id)
);

-- Add comments for documentation
COMMENT ON TABLE public.user_badges IS 'Junction table tracking badges earned by users';
COMMENT ON COLUMN public.user_badges.goal_id IS 'Optional reference to goal that triggered badge (for streak/goal badges)';
COMMENT ON COLUMN public.user_badges.earned_at IS 'Timestamp when the badge was earned';

-- Create indexes for efficient queries
CREATE INDEX idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON public.user_badges(badge_id);
CREATE INDEX idx_user_badges_earned_at ON public.user_badges(earned_at DESC);

-- Enable Row Level Security
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own badges
CREATE POLICY "Users can view their own badges"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- No update policy - badges are earned once and cannot be modified

CREATE POLICY "Users can delete their own badges"
  ON public.user_badges FOR DELETE
  USING (auth.uid() = user_id);
