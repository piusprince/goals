-- Migration: Ensure all auth users have a profile in public.users
-- This fixes potential issues with invite lookups

-- Insert missing user profiles for any existing auth users
INSERT INTO public.users (id, display_name, avatar_url, created_at)
SELECT 
  au.id,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    split_part(au.email, '@', 1)
  ),
  au.raw_user_meta_data->>'avatar_url',
  COALESCE(au.created_at, NOW())
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
);

-- Update the get_invite_by_token function to use LEFT JOIN to be more resilient
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
    COALESCE(u.display_name, 'Unknown User') as inviter_name,
    i.role,
    i.expires_at,
    (i.expires_at < NOW()) as is_expired,
    (i.accepted_at IS NOT NULL) as is_accepted
  FROM invites i
  JOIN goals g ON g.id = i.goal_id
  LEFT JOIN users u ON u.id = i.inviter_id
  WHERE i.token = invite_token;
END;
$$;

-- Ensure permissions are granted
GRANT EXECUTE ON FUNCTION get_invite_by_token(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_invite_by_token(TEXT) TO authenticated;
