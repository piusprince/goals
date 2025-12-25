-- Migration: Enable Realtime for sharing tables
-- Phase 4: Shared Goals

-- Enable realtime for check_ins table
-- This allows collaborators to see updates when others check in
ALTER PUBLICATION supabase_realtime ADD TABLE check_ins;

-- Enable realtime for goal_members table
-- This allows members to see when new collaborators join/leave
ALTER PUBLICATION supabase_realtime ADD TABLE goal_members;

-- Note: Realtime subscriptions will respect RLS policies
-- So users will only receive updates for goals they have access to
