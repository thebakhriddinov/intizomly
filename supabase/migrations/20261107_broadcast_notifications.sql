-- ==============================================================================
-- 20261107_broadcast_notifications.sql
-- INTIZOMLY ADMIN BROADCAST & SMS-NOTIFICATIONS SYSTEM UPGRADE
-- ==============================================================================

-- 1. Ensure columns exist on broadcasts table
ALTER TABLE public.broadcasts ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';
ALTER TABLE public.broadcasts ADD COLUMN IF NOT EXISTS target TEXT DEFAULT 'all';

-- 2. Index for fast notification fetching
CREATE INDEX IF NOT EXISTS idx_broadcasts_created_at ON public.broadcasts(created_at DESC);

-- 3. Row Level Security policies for broadcasts
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;

-- Everyone (both anon and authenticated) can read broadcasts
DROP POLICY IF EXISTS "Everyone can view broadcasts" ON public.broadcasts;
DROP POLICY IF EXISTS "Everyone authenticated can view broadcasts" ON public.broadcasts;
CREATE POLICY "Everyone can view broadcasts"
  ON public.broadcasts
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated users / admins to insert broadcasts
DROP POLICY IF EXISTS "Only admins can insert broadcasts" ON public.broadcasts;
CREATE POLICY "Only admins can insert broadcasts"
  ON public.broadcasts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow admins / authenticated to delete broadcasts
DROP POLICY IF EXISTS "Admins can delete broadcasts" ON public.broadcasts;
CREATE POLICY "Admins can delete broadcasts"
  ON public.broadcasts
  FOR DELETE
  TO authenticated
  USING (true);

