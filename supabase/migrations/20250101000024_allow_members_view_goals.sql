-- Migration: Allow goal members to view shared goals
-- This fixes the issue where accepted invitees can't view the goal they joined

-- First, drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can read own goals" ON public.goals;

-- Create a new policy that allows viewing owned goals AND shared goals the user is a member of
CREATE POLICY "Users can view own and shared goals"
ON public.goals
FOR SELECT
TO authenticated
USING (
  -- User owns the goal
  owner_id = auth.uid()
  OR
  -- User is a member of the goal (for shared goals)
  EXISTS (
    SELECT 1 FROM goal_members 
    WHERE goal_members.goal_id = goals.id 
    AND goal_members.user_id = auth.uid()
  )
);

-- Add comment
COMMENT ON POLICY "Users can view own and shared goals" ON public.goals IS 
'Allows users to view goals they own or are members of (for shared goals)';
