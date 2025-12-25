-- Create badges table with predefined badge data
-- Phase 3: Reminders & Insights

CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  criteria_type TEXT NOT NULL,
  criteria_value INTEGER NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE public.badges IS 'Achievement badges that users can earn';
COMMENT ON COLUMN public.badges.slug IS 'Unique identifier for badge (kebab-case)';
COMMENT ON COLUMN public.badges.criteria_type IS 'Type of criteria: streak_days, total_check_ins, goals_completed, etc.';
COMMENT ON COLUMN public.badges.criteria_value IS 'Numeric threshold to earn the badge';

-- Create index for criteria queries
CREATE INDEX idx_badges_criteria ON public.badges(criteria_type, criteria_value);

-- Enable Row Level Security
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies: All users can view badges (read-only for users)
CREATE POLICY "Anyone can view badges"
  ON public.badges FOR SELECT
  USING (true);

-- Insert predefined badges
INSERT INTO public.badges (slug, name, description, icon, criteria_type, criteria_value, sort_order) VALUES
  -- Streak-based badges
  ('first-step', 'First Step', 'Complete your first check-in', '🌱', 'total_check_ins', 1, 1),
  ('week-warrior', 'Week Warrior', 'Maintain a 7-day streak', '⚔️', 'streak_days', 7, 2),
  ('fortnight-fighter', 'Fortnight Fighter', 'Maintain a 14-day streak', '🛡️', 'streak_days', 14, 3),
  ('monthly-master', 'Monthly Master', 'Maintain a 30-day streak', '👑', 'streak_days', 30, 4),
  ('century-champion', 'Century Champion', 'Maintain a 100-day streak', '🏆', 'streak_days', 100, 5),
  
  -- Goal completion badges
  ('goal-getter', 'Goal Getter', 'Complete your first goal', '🎯', 'goals_completed', 1, 6),
  ('triple-threat', 'Triple Threat', 'Complete 3 goals', '🔥', 'goals_completed', 3, 7),
  ('achievement-hunter', 'Achievement Hunter', 'Complete 10 goals', '🏅', 'goals_completed', 10, 8),
  
  -- Check-in volume badges
  ('dedicated', 'Dedicated', 'Complete 50 total check-ins', '💪', 'total_check_ins', 50, 9),
  ('committed', 'Committed', 'Complete 100 total check-ins', '🌟', 'total_check_ins', 100, 10);
