-- Migration: Create sharing tables (goal_members and invites)
-- Phase 4: Shared Goals

-- Create goal_members table for tracking goal collaborators
CREATE TABLE IF NOT EXISTS goal_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'collaborator', 'viewer')),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure a user can only be a member once per goal
  UNIQUE(goal_id, user_id)
);

-- Create invites table for pending invitations
CREATE TABLE IF NOT EXISTS invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'collaborator' CHECK (role IN ('collaborator', 'viewer')),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add is_shared column to goals if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'goals' AND column_name = 'is_shared'
  ) THEN
    ALTER TABLE goals ADD COLUMN is_shared BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_goal_members_goal_id ON goal_members(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_members_user_id ON goal_members(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_members_role ON goal_members(role);

CREATE INDEX IF NOT EXISTS idx_invites_goal_id ON invites(goal_id);
CREATE INDEX IF NOT EXISTS idx_invites_token ON invites(token);
CREATE INDEX IF NOT EXISTS idx_invites_email ON invites(email);
CREATE INDEX IF NOT EXISTS idx_invites_expires_at ON invites(expires_at);

CREATE INDEX IF NOT EXISTS idx_goals_is_shared ON goals(is_shared) WHERE is_shared = TRUE;

-- Enable RLS on new tables
ALTER TABLE goal_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- Function to automatically create owner membership when a shared goal is created
CREATE OR REPLACE FUNCTION create_owner_membership()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create membership if goal is shared and no owner exists yet
  IF NEW.is_shared = TRUE THEN
    INSERT INTO goal_members (goal_id, user_id, role, accepted_at)
    VALUES (NEW.id, NEW.owner_id, 'owner', NOW())
    ON CONFLICT (goal_id, user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create owner membership on shared goal creation
DROP TRIGGER IF EXISTS on_shared_goal_created ON goals;
CREATE TRIGGER on_shared_goal_created
  AFTER INSERT OR UPDATE OF is_shared ON goals
  FOR EACH ROW
  WHEN (NEW.is_shared = TRUE)
  EXECUTE FUNCTION create_owner_membership();

-- Comment on tables
COMMENT ON TABLE goal_members IS 'Tracks members of shared goals with their roles';
COMMENT ON TABLE invites IS 'Stores pending invitations to shared goals';
COMMENT ON COLUMN goal_members.role IS 'owner: full control, collaborator: can check in, viewer: read only';
COMMENT ON COLUMN invites.token IS 'Unique token for invite URL';
