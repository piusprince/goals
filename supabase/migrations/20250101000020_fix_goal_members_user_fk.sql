-- Migration: Fix goal_members foreign key to reference public.users
-- This fixes the PostgREST relationship lookup for JOINs

-- Drop the existing foreign key constraint on user_id (references auth.users)
ALTER TABLE goal_members 
  DROP CONSTRAINT IF EXISTS goal_members_user_id_fkey;

-- Add new foreign key constraint referencing public.users instead
-- This enables PostgREST to resolve the relationship for JOINs like goal_members(users(display_name))
ALTER TABLE goal_members
  ADD CONSTRAINT goal_members_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.users(id) 
  ON DELETE CASCADE;

-- Also fix the invites table inviter_id if needed
ALTER TABLE invites 
  DROP CONSTRAINT IF EXISTS invites_inviter_id_fkey;

ALTER TABLE invites
  ADD CONSTRAINT invites_inviter_id_fkey 
  FOREIGN KEY (inviter_id) 
  REFERENCES public.users(id) 
  ON DELETE CASCADE;

-- Add comment explaining the relationship
COMMENT ON COLUMN goal_members.user_id IS 'References public.users for profile data access via PostgREST';
COMMENT ON COLUMN invites.inviter_id IS 'References public.users for profile data access via PostgREST';
