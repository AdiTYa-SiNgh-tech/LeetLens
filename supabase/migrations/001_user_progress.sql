-- ==============================================================================
-- LeetLens Migration: 001_user_progress.sql
-- Run this migration in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ryxfacjgtxfybntnfjqi/sql
-- ==============================================================================

-- 1. Create the user_solved_problems table
CREATE TABLE IF NOT EXISTS public.user_solved_problems (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, problem_id)
);

-- 2. Performance index for querying a user's solved list
CREATE INDEX IF NOT EXISTS idx_user_solved_problems_user_id
  ON public.user_solved_problems (user_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.user_solved_problems ENABLE ROW LEVEL SECURITY;

-- 4. Secure RLS Policies strictly enforcing ownership via auth.uid()

-- Allow authenticated users to view only their own solved problems
CREATE POLICY "Users can select own solved problems"
  ON public.user_solved_problems
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow authenticated users to insert only their own solved problems
CREATE POLICY "Users can insert own solved problems"
  ON public.user_solved_problems
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete only their own solved problems
CREATE POLICY "Users can delete own solved problems"
  ON public.user_solved_problems
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. Explicitly grant permissions only to authenticated users
GRANT SELECT, INSERT, DELETE ON public.user_solved_problems TO authenticated;

-- Ensure anonymous / unauthenticated users cannot read or write
REVOKE ALL ON public.user_solved_problems FROM anon;
