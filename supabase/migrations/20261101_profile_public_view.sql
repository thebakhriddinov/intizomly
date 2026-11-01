-- ==============================================================================
-- Intizomly — Public Profiles & Social Graph Migration
-- Ushbu SQL buyruqlarini Supabase Dashboard -> SQL Editor bo'limida ishga tushiring
-- ==============================================================================

-- 1. PROFILES: Qo'shimcha ijtimoiy maydonlarni qo'shish
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS socials JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS followers JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS following JSONB DEFAULT '[]'::jsonb;

-- 2. Foydalanuvchilar bir-birining ommaviy profillarini ko'ra olishi uchun RLS SELECT ruxsati
DROP POLICY IF EXISTS "Public profiles are viewable by all authenticated users" ON public.profiles;
CREATE POLICY "Public profiles are viewable by all authenticated users"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- 3. Foydalanuvchilar faqat o'z profilini tahrirlashi mumkin
DROP POLICY IF EXISTS "Users can update own profile or admin can update" ON public.profiles;
CREATE POLICY "Users can update own profile or admin can update"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = id OR public.is_admin(auth.uid()));

