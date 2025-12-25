-- Migration: Create RPC function for accepting invites
-- This bypasses RLS to allow any authenticated user to accept an invite by token

CREATE OR REPLACE FUNCTION accept_invite_by_token(invite_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invite RECORD;
  v_user_id UUID;
  v_existing_member RECORD;
  v_result JSON;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get invite by token
  SELECT * INTO v_invite
  FROM invites
  WHERE token = invite_token;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invite not found');
  END IF;

  -- Check if expired
  IF v_invite.expires_at < NOW() THEN
    RETURN json_build_object('success', false, 'error', 'This invitation has expired');
  END IF;

  -- Check if already accepted
  IF v_invite.accepted_at IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'This invitation has already been accepted');
  END IF;

  -- Check if user is already a member
  SELECT * INTO v_existing_member
  FROM goal_members
  WHERE goal_id = v_invite.goal_id AND user_id = v_user_id;

  IF FOUND THEN
    RETURN json_build_object('success', false, 'error', 'You are already a member of this goal', 'goalId', v_invite.goal_id);
  END IF;

  -- Create goal_member record
  INSERT INTO goal_members (goal_id, user_id, role, accepted_at)
  VALUES (v_invite.goal_id, v_user_id, v_invite.role, NOW());

  -- Mark invite as accepted
  UPDATE invites
  SET accepted_at = NOW()
  WHERE id = v_invite.id;

  RETURN json_build_object('success', true, 'goalId', v_invite.goal_id);

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION accept_invite_by_token(TEXT) TO authenticated;

-- Also create a function for declining invites
CREATE OR REPLACE FUNCTION decline_invite_by_token(invite_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invite RECORD;
  v_user_id UUID;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get invite by token
  SELECT * INTO v_invite
  FROM invites
  WHERE token = invite_token;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invite not found');
  END IF;

  -- Mark invite as declined
  UPDATE invites
  SET declined_at = NOW()
  WHERE id = v_invite.id;

  RETURN json_build_object('success', true);

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION decline_invite_by_token(TEXT) TO authenticated;
