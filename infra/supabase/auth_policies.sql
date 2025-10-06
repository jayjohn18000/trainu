-- Row Level Security (RLS) Policies for TrainU
-- This file defines security policies for authenticated users

-- Enable RLS on all tables
ALTER TABLE public.users_ext ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- USERS_EXT POLICIES
-- ============================================================

-- Users can read their own record
CREATE POLICY "Users can view own user_ext record"
  ON public.users_ext
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own record
CREATE POLICY "Users can update own user_ext record"
  ON public.users_ext
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- TRAINERS POLICIES
-- ============================================================

-- Anyone can view public trainer profiles (for directory)
CREATE POLICY "Anyone can view public trainer profiles"
  ON public.trainers
  FOR SELECT
  USING (visibility = 'public');

-- Trainers can view their own profile
CREATE POLICY "Trainers can view own profile"
  ON public.trainers
  FOR SELECT
  USING (auth.uid() = user_id);

-- Trainers can update their own profile
CREATE POLICY "Trainers can update own profile"
  ON public.trainers
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Trainers can insert their own profile
CREATE POLICY "Trainers can create own profile"
  ON public.trainers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- CLIENTS POLICIES
-- ============================================================

-- Clients can view their own profile
CREATE POLICY "Clients can view own profile"
  ON public.clients
  FOR SELECT
  USING (auth.uid() = user_id);

-- Clients can update their own profile
CREATE POLICY "Clients can update own profile"
  ON public.clients
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Clients can insert their own profile
CREATE POLICY "Clients can create own profile"
  ON public.clients
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trainers can view profiles of their clients
CREATE POLICY "Trainers can view their clients"
  ON public.clients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trainers t
      WHERE t.user_id = auth.uid()
    )
  );

-- ============================================================
-- GOALS POLICIES
-- ============================================================

-- Users can view their own goals
CREATE POLICY "Users can view own goals"
  ON public.goals
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own goals
CREATE POLICY "Users can create own goals"
  ON public.goals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own goals
CREATE POLICY "Users can update own goals"
  ON public.goals
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own goals
CREATE POLICY "Users can delete own goals"
  ON public.goals
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trainers can view goals of their clients
CREATE POLICY "Trainers can view client goals"
  ON public.goals
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      INNER JOIN public.trainers t ON c.user_id = goals.user_id
      WHERE t.user_id = auth.uid()
    )
  );

-- ============================================================
-- GOAL_ENTRIES POLICIES
-- ============================================================

-- Users can view their own goal entries
CREATE POLICY "Users can view own goal entries"
  ON public.goal_entries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.goals g
      WHERE g.id = goal_entries.goal_id
      AND g.user_id = auth.uid()
    )
  );

-- Users can create entries for their own goals
CREATE POLICY "Users can create own goal entries"
  ON public.goal_entries
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.goals g
      WHERE g.id = goal_entries.goal_id
      AND g.user_id = auth.uid()
    )
  );

-- Users can update their own goal entries
CREATE POLICY "Users can update own goal entries"
  ON public.goal_entries
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.goals g
      WHERE g.id = goal_entries.goal_id
      AND g.user_id = auth.uid()
    )
  );

-- Users can delete their own goal entries
CREATE POLICY "Users can delete own goal entries"
  ON public.goal_entries
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.goals g
      WHERE g.id = goal_entries.goal_id
      AND g.user_id = auth.uid()
    )
  );

-- Trainers can view goal entries of their clients
CREATE POLICY "Trainers can view client goal entries"
  ON public.goal_entries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.goals g
      INNER JOIN public.clients c ON g.user_id = c.user_id
      INNER JOIN public.trainers t ON t.user_id = auth.uid()
      WHERE g.id = goal_entries.goal_id
    )
  );

-- ============================================================
-- FILES POLICIES
-- ============================================================

-- Users can view their own files
CREATE POLICY "Users can view own files"
  ON public.files
  FOR SELECT
  USING (auth.uid() = owner_user_id);

-- Users can upload their own files
CREATE POLICY "Users can create own files"
  ON public.files
  FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);

-- Users can update their own file metadata
CREATE POLICY "Users can update own files"
  ON public.files
  FOR UPDATE
  USING (auth.uid() = owner_user_id);

-- Users can delete their own files
CREATE POLICY "Users can delete own files"
  ON public.files
  FOR DELETE
  USING (auth.uid() = owner_user_id);

-- Trainers can view files of their clients
CREATE POLICY "Trainers can view client files"
  ON public.files
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      INNER JOIN public.trainers t ON t.user_id = auth.uid()
      WHERE c.user_id = files.owner_user_id
    )
  );

-- ============================================================
-- APPOINTMENTS POLICIES
-- ============================================================

-- Clients can view their own appointments
CREATE POLICY "Clients can view own appointments"
  ON public.appointments
  FOR SELECT
  USING (auth.uid() = client_user_id);

-- Trainers can view their appointments
CREATE POLICY "Trainers can view own appointments"
  ON public.appointments
  FOR SELECT
  USING (auth.uid() = trainer_user_id);

-- ============================================================
-- STORAGE POLICIES (for Supabase Storage buckets)
-- ============================================================

-- Note: These should be configured in Supabase Storage UI or via SQL
-- Example for a 'files' bucket:

-- Allow authenticated users to upload files
-- CREATE POLICY "Authenticated users can upload files"
--   ON storage.objects
--   FOR INSERT
--   WITH CHECK (bucket_id = 'files' AND auth.role() = 'authenticated');

-- Allow users to read their own files
-- CREATE POLICY "Users can read own files"
--   ON storage.objects
--   FOR SELECT
--   USING (bucket_id = 'files' AND auth.uid() = owner);

-- Allow users to delete their own files
-- CREATE POLICY "Users can delete own files"
--   ON storage.objects
--   FOR DELETE
--   USING (bucket_id = 'files' AND auth.uid() = owner);

-- ============================================================
-- HELPER FUNCTION: Check if user is a trainer
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_trainer()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users_ext
    WHERE user_id = auth.uid()
    AND role = 'trainer'
  );
$$;

-- ============================================================
-- HELPER FUNCTION: Check if user is admin
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users_ext
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
$$;

-- ============================================================
-- NOTES
-- ============================================================

-- 1. These policies assume the user is authenticated via Supabase Auth
-- 2. The auth.uid() function returns the user's ID from the JWT token
-- 3. For GHL sync operations, use the service role key which bypasses RLS
-- 4. Additional policies may be needed for messages, insights, and events tables
-- 5. Remember to test policies thoroughly in development before applying to production
-- 6. To temporarily disable RLS for testing: ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;

