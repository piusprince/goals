-- Migration: Update RLS policies for check_ins to support shared goals
-- Phase 4: Shared Goals

-- Drop existing policies to replace with shared-aware versions
DROP POLICY IF EXISTS "Users can read own check-ins" ON public.check_ins;
DROP POLICY IF EXISTS "Users can insert own check-ins" ON public.check_ins;
DROP POLICY IF EXISTS "Users can delete own check-ins" ON public.check_ins;
DROP POLICY IF EXISTS "Users can update own check-ins" ON public.check_ins;

-- Policy: Members can view check-ins for goals they belong to
CREATE POLICY "Members can view check-ins"
ON public.check_ins FOR SELECT
TO authenticated
USING (
  -- User's own check-ins (personal goals)
  auth.uid() = user_id
  OR
  -- Check-ins for shared goals where user is a member
  EXISTS (
    SELECT 1 FROM goal_members 
    WHERE goal_members.goal_id = check_ins.goal_id 
    AND goal_members.user_id = auth.uid()
  )
  OR
  -- Check-ins for goals user owns
  EXISTS (
    SELECT 1 FROM goals 
    WHERE goals.id = check_ins.goal_id 
    AND goals.owner_id = auth.uid()
  )
);

-- Policy: Members with owner/collaborator role can insert check-ins
CREATE POLICY "Collaborators can insert check-ins"
ON public.check_ins FOR INSERT
TO authenticated
WITH CHECK (
  -- User is checking in for themselves
  auth.uid() = user_id
  AND
  (
    -- Personal goal (user is owner)
    EXISTS (
      SELECT 1 FROM goals 
      WHERE goals.id = check_ins.goal_id 
      AND goals.owner_id = auth.uid()
    )
    OR
    -- Shared goal where user is owner or collaborator
    EXISTS (
      SELECT 1 FROM goal_members 
      WHERE goal_members.goal_id = check_ins.goal_id 
      AND goal_members.user_id = auth.uid()
      AND goal_members.role IN ('owner', 'collaborator')
    )
  )
);

-- Policy: Users can update their own check-ins
CREATE POLICY "Users can update own check-ins"
ON public.check_ins FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own check-ins
CREATE POLICY "Users can delete own check-ins"
ON public.check_ins FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
