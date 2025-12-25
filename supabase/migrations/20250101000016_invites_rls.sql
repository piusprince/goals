-- Migration: RLS policies for invites table
-- Phase 4: Shared Goals

-- Policy: Goal owners and inviters can view invites
CREATE POLICY "Owners can view invites"
ON invites FOR SELECT
USING (
  -- User is the inviter
  inviter_id = auth.uid()
  OR
  -- User is the goal owner
  EXISTS (
    SELECT 1 FROM goals 
    WHERE goals.id = invites.goal_id 
    AND goals.owner_id = auth.uid()
  )
  OR
  -- User is the invitee (checking by email)
  LOWER(email) = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
);

-- Policy: Only goal owners can create invites
CREATE POLICY "Owners can create invites"
ON invites FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM goals 
    WHERE goals.id = invites.goal_id 
    AND goals.owner_id = auth.uid()
    AND goals.is_shared = TRUE
  )
);

-- Policy: Invites can be updated (for marking as accepted)
CREATE POLICY "Invites can be accepted"
ON invites FOR UPDATE
USING (
  -- The invitee is accepting their own invite
  LOWER(email) = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
  OR
  -- Owner can update invite status
  EXISTS (
    SELECT 1 FROM goals 
    WHERE goals.id = invites.goal_id 
    AND goals.owner_id = auth.uid()
  )
)
WITH CHECK (
  -- Same conditions for the check
  LOWER(email) = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
  OR
  EXISTS (
    SELECT 1 FROM goals 
    WHERE goals.id = invites.goal_id 
    AND goals.owner_id = auth.uid()
  )
);

-- Policy: Owners can revoke (delete) invites
CREATE POLICY "Owners can revoke invites"
ON invites FOR DELETE
USING (
  inviter_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM goals 
    WHERE goals.id = invites.goal_id 
    AND goals.owner_id = auth.uid()
  )
);

-- Create a public function to get invite by token (for unauthenticated access)
-- This allows fetching invite details before login
CREATE OR REPLACE FUNCTION get_invite_by_token(invite_token TEXT)
RETURNS TABLE (
  id UUID,
  goal_id UUID,
  goal_title TEXT,
  goal_description TEXT,
  inviter_name TEXT,
  role TEXT,
  expires_at TIMESTAMPTZ,
  is_expired BOOLEAN,
  is_accepted BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.goal_id,
    g.title as goal_title,
    g.description as goal_description,
    u.display_name as inviter_name,
    i.role,
    i.expires_at,
    (i.expires_at < NOW()) as is_expired,
    (i.accepted_at IS NOT NULL) as is_accepted
  FROM invites i
  JOIN goals g ON g.id = i.goal_id
  JOIN users u ON u.id = i.inviter_id
  WHERE i.token = invite_token;
END;
$$;

-- Grant execute permission to public (for pre-auth access)
GRANT EXECUTE ON FUNCTION get_invite_by_token(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_invite_by_token(TEXT) TO authenticated;
