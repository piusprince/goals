-- Create check_ins table for progress tracking
-- Phase 2: Progress Tracking

CREATE TABLE IF NOT EXISTS public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  value INTEGER NOT NULL DEFAULT 1 CHECK (value > 0),
  note TEXT CHECK (note IS NULL OR char_length(note) <= 500),
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add comment for documentation
COMMENT ON TABLE public.check_ins IS 'User check-ins for goal progress tracking';
COMMENT ON COLUMN public.check_ins.value IS 'Progress value (defaults to 1 for habits)';
COMMENT ON COLUMN public.check_ins.note IS 'Optional note/journal entry (max 500 chars)';
COMMENT ON COLUMN public.check_ins.checked_at IS 'Timestamp when check-in was recorded';

-- Create indexes for efficient queries
CREATE INDEX idx_check_ins_goal_id ON public.check_ins(goal_id);
CREATE INDEX idx_check_ins_goal_checked_at ON public.check_ins(goal_id, checked_at DESC);
CREATE INDEX idx_check_ins_user_checked_at ON public.check_ins(user_id, checked_at DESC);

-- Enable Row Level Security
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
