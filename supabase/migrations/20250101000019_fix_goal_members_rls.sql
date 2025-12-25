-- Migration: Fix infinite recursion in goal_members RLS policy
-- The previous SELECT policy caused recursion by checking goal_members within itself

-- Drop the problematic policy
DROP POLICY IF EXISTS "Members can view goal members" ON goal_members;

-- Create a fixed policy that avoids self-referential recursion
-- Instead of checking goal_members, we check:
-- 1. User is the goal owner (from goals table)
-- 2. User is viewing their own membership row
-- 3. User's row already exists in goal_members (via a simpler check)

CREATE POLICY "Members can view goal members v2"
ON goal_members FOR SELECT
USING (
  -- User is viewing their own membership
  goal_members.user_id = auth.uid()
  OR
  -- User is the goal owner
  EXISTS (
    SELECT 1 FROM goals 
    WHERE goals.id = goal_members.goal_id 
    AND goals.owner_id = auth.uid()
  )
  OR
  -- User is a member of this goal (using a security definer function to avoid recursion)
  goal_members.goal_id IN (
    SELECT gm.goal_id FROM goal_members gm WHERE gm.user_id = auth.uid()
  )
);

-- Actually, the above still has recursion. Let's use a security definer function instead.

-- First, drop the policy we just created
DROP POLICY IF EXISTS "Members can view goal members v2" ON goal_members;

-- Create a security definer function to check membership without RLS
CREATE OR REPLACE FUNCTION is_goal_member(p_goal_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM goal_members 
    WHERE goal_id = p_goal_id AND user_id = p_user_id
  )
  OR
  EXISTS (
    SELECT 1 FROM goals 
    WHERE id = p_goal_id AND owner_id = p_user_id
  );
$$;

-- Now create the policy using the function
CREATE POLICY "Members can view goal members v3"
ON goal_members FOR SELECT
USING (
  -- User owns this goal or is a member
  is_goal_member(goal_members.goal_id, auth.uid())
);

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_goal_member(UUID, UUID) TO authenticated;
