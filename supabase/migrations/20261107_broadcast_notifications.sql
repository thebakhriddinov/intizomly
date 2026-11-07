-- ==============================================================================
-- 20261107_broadcast_notifications.sql
-- INTIZOMLY ADMIN BROADCAST, RETENTION DURATION & READ RECEIPTS SYSTEM
-- Supabase Dashboard -> SQL Editor bo'limiga nusxalab olib "Run" tugmasini bosing!
-- ==============================================================================

-- 1. Ensure columns exist on broadcasts table
ALTER TABLE public.broadcasts ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';
ALTER TABLE public.broadcasts ADD COLUMN IF NOT EXISTS target TEXT DEFAULT 'all';
ALTER TABLE public.broadcasts ADD COLUMN IF NOT EXISTS duration_days INT DEFAULT 7;
ALTER TABLE public.broadcasts ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- 2. Index for fast notification fetching
CREATE INDEX IF NOT EXISTS idx_broadcasts_created_at ON public.broadcasts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_broadcasts_expires_at ON public.broadcasts(expires_at);

-- 3. Row Level Security policies for broadcasts (Barcha foydalanuvchilar o'qishi va o'chirish sinxronlashuvi)
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view broadcasts" ON public.broadcasts;
DROP POLICY IF EXISTS "Everyone authenticated can view broadcasts" ON public.broadcasts;
CREATE POLICY "Everyone can view broadcasts"
  ON public.broadcasts
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can insert broadcasts" ON public.broadcasts;
DROP POLICY IF EXISTS "Only admins can insert broadcasts" ON public.broadcasts;
CREATE POLICY "Admins can insert broadcasts"
  ON public.broadcasts
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update broadcasts" ON public.broadcasts;
CREATE POLICY "Admins can update broadcasts"
  ON public.broadcasts
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can delete broadcasts" ON public.broadcasts;
CREATE POLICY "Admins can delete broadcasts"
  ON public.broadcasts
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- 4. BROADCAST READ RECEIPTS (Kimlar o'qiganini qayd etish jadvali)
CREATE TABLE IF NOT EXISTS public.broadcast_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id UUID REFERENCES public.broadcasts(id) ON DELETE CASCADE,
  user_id TEXT,
  user_name TEXT DEFAULT '',
  user_phone TEXT DEFAULT '',
  read_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(broadcast_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_broadcast_reads_broadcast_id ON public.broadcast_reads(broadcast_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_reads_user_id ON public.broadcast_reads(user_id);

ALTER TABLE public.broadcast_reads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view broadcast_reads" ON public.broadcast_reads;
CREATE POLICY "Everyone can view broadcast_reads"
  ON public.broadcast_reads
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone can insert broadcast_reads" ON public.broadcast_reads;
CREATE POLICY "Anyone can insert broadcast_reads"
  ON public.broadcast_reads
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 5. REALTIME SYNCHRONIZATION (Real vaqtda o'chirish va bildirishnomalar yuborish)
-- Replica identity FULL qilib qo'yilsa, DELETE vaqtida butun row IDsi boshqa qurilmalarga uzatiladi
ALTER TABLE public.broadcasts REPLICA IDENTITY FULL;

DO $$
BEGIN
  -- broadcasts jadvalini realtime publication ga qo'shish
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'broadcasts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.broadcasts;
  END IF;

  -- broadcast_reads jadvalini realtime publication ga qo'shish
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'broadcast_reads'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.broadcast_reads;
  END IF;
END $$;
