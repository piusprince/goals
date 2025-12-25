-- Migration: RLS policies for goal_members table
-- Phase 4: Shared Goals

-- Policy: Members can view other members of goals they belong to
CREATE POLICY "Members can view goal members"
ON goal_members FOR SELECT
USING (
  -- User is a member of this goal
  EXISTS (
    SELECT 1 FROM goal_members gm 
    WHERE gm.goal_id = goal_members.goal_id 
    AND gm.user_id = auth.uid()
  )
  OR
  -- User is the goal owner (even if no goal_members entry yet)
  EXISTS (
    SELECT 1 FROM goals 
    WHERE goals.id = goal_members.goal_id 
    AND goals.owner_id = auth.uid()
  )
);

-- Policy: Members can be added via invite acceptance or by owner
CREATE POLICY "Members can be inserted"
ON goal_members FOR INSERT
WITH CHECK (
  -- Owner can add members directly
  EXISTS (
    SELECT 1 FROM goals 
    WHERE goals.id = goal_members.goal_id 
    AND goals.owner_id = auth.uid()
  )
  OR
  -- User is accepting their own invite
  (
    goal_members.user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM invites 
      WHERE invites.goal_id = goal_members.goal_id 
      AND LOWER(invites.email) = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
      AND invites.accepted_at IS NULL
      AND invites.expires_at > NOW()
    )
  )
);

-- Policy: Owners can update member roles
CREATE POLICY "Owners can update member roles"
ON goal_members FOR UPDATE
USING (
  -- Current user is the goal owner
  EXISTS (
    SELECT 1 FROM goals 
    WHERE goals.id = goal_members.goal_id 
    AND goals.owner_id = auth.uid()
  )
)
WITH CHECK (
  -- Cannot change owner's role to something else
  goal_members.role != 'owner' OR goal_members.user_id = auth.uid()
);

-- Policy: Owners can remove members, members can remove themselves
CREATE POLICY "Members can be deleted by owner or self"
ON goal_members FOR DELETE
USING (
  -- User is removing themselves (but not if they're the owner)
  (
    goal_members.user_id = auth.uid() 
    AND goal_members.role != 'owner'
  )
  OR
  -- Owner can remove non-owner members
  (
    EXISTS (
      SELECT 1 FROM goals 
      WHERE goals.id = goal_members.goal_id 
      AND goals.owner_id = auth.uid()
    )
    AND goal_members.role != 'owner'
  )
);
