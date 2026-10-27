-- ==============================================================================
-- Intizomly — Admin Dashboard Upgrade Migration
-- Ushbu faylni Supabase Dashboard -> SQL Editor bo'limida ishga tushiring
-- ==============================================================================

-- 1. PROFILES: Akkaunt holati (status) va bloklash maydonlarini qo'shish
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' NOT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banned_reason TEXT;

-- Status ustuniga indeks
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- 2. AUDIT LOGS: Admin harakatlari tarixi jadvali
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  admin_name TEXT DEFAULT 'Admin',
  action TEXT NOT NULL,         -- 'user_created', 'user_updated', 'user_blocked', 'user_unblocked', 'user_deleted', 'role_changed', 'announcement_created', 'announcement_deleted'
  target_type TEXT NOT NULL,    -- 'user', 'announcement', 'system'
  target_id TEXT,
  target_name TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON public.audit_logs(admin_id);

-- 3. ANNOUNCEMENTS: Tizim e'lonlari va bildirishnomalari jadvali
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target TEXT DEFAULT 'all' NOT NULL,       -- 'all', 'premium', 'user', yoki specific user_id
  status TEXT DEFAULT 'active' NOT NULL,    -- 'active', 'draft', 'archived'
  priority TEXT DEFAULT 'normal' NOT NULL,  -- 'normal', 'urgent', 'banner'
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_announcements_status ON public.announcements(status);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON public.announcements(created_at DESC);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- 4.1 AUDIT LOGS RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.audit_logs;
CREATE POLICY "Admins can insert audit logs"
  ON public.audit_logs
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

-- Audit loglarni tahrirlash yoki o'chirishga HECH KIMGA (shu jumladan oddiy adminlarga ham) ruxsat berilmaydi!
-- Loglar faqat append-only bo'lib, o'chirilmaydi.

-- 4.2 ANNOUNCEMENTS RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view relevant announcements" ON public.announcements;
CREATE POLICY "Authenticated users can view relevant announcements"
  ON public.announcements
  FOR SELECT
  TO authenticated
  USING (
    status = 'active' OR public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Admins can insert announcements" ON public.announcements;
CREATE POLICY "Admins can insert announcements"
  ON public.announcements
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update announcements" ON public.announcements;
CREATE POLICY "Admins can update announcements"
  ON public.announcements
  FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete announcements" ON public.announcements;
CREATE POLICY "Admins can delete announcements"
  ON public.announcements
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- 4.3 PROFILES STATUS PROTECTION TRIGGER
-- Oddiy foydalanuvchilar o'z statusini 'blocked' dan 'active' ga o'zgartira olmaydi
CREATE OR REPLACE FUNCTION public.protect_profile_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (NEW.status <> OLD.status OR NEW.banned_at IS DISTINCT FROM OLD.banned_at) AND NOT public.is_admin(auth.uid()) THEN
    NEW.status := OLD.status;
    NEW.banned_at := OLD.banned_at;
    NEW.banned_reason := OLD.banned_reason;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_status ON public.profiles;
CREATE TRIGGER trg_protect_profile_status
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_status();
