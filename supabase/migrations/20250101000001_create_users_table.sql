-- Create users table (extends Supabase Auth)
-- This table stores additional user profile information
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add comment for documentation
COMMENT ON TABLE public.users IS 'User profiles with additional information beyond auth.users';

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
