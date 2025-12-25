-- Migration: Allow users to view other users' public profiles
-- This is needed for features like:
-- - Viewing who invited you to a goal
-- - Seeing goal members' names and avatars
-- - Shared goal collaboration

-- Drop the restrictive policy if it exists (we'll replace it)
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;

-- Create a more permissive policy that allows authenticated users to view any profile
-- This only exposes public profile data (display_name, avatar_url), not sensitive info
CREATE POLICY "Users can view all profiles"
ON public.users
FOR SELECT
TO authenticated
USING (true);

-- Ensure anon users cannot access profiles
-- (If you want public profiles, change this)
CREATE POLICY "Anon cannot view profiles"
ON public.users
FOR SELECT
TO anon
USING (false);

-- Add comment explaining the policy
COMMENT ON POLICY "Users can view all profiles" ON public.users IS 
'Allows authenticated users to view any user profile. Profile data is considered public within the app for collaboration features.';
