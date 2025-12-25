-- Create goal_type enum
CREATE TYPE goal_type AS ENUM ('one-time', 'target', 'habit');

-- Create goals table
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) > 0 AND char_length(title) <= 200),
  description TEXT CHECK (description IS NULL OR char_length(description) <= 1000),
  type goal_type NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('health', 'finance', 'learning', 'personal', 'career', 'other')),
  target_value INTEGER CHECK (target_value IS NULL OR target_value > 0),
  current_value INTEGER NOT NULL DEFAULT 0 CHECK (current_value >= 0),
  year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2100),
  is_shared BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Add comment for documentation
COMMENT ON TABLE public.goals IS 'User goals and resolutions with progress tracking';

-- Create indexes for efficient queries
CREATE INDEX idx_goals_owner_id ON public.goals(owner_id);
CREATE INDEX idx_goals_owner_year_archived ON public.goals(owner_id, year, is_archived);

-- Enable Row Level Security
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
