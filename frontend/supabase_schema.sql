-- ==============================================================================
-- Intizomly — Supabase Database Schema & Row Level Security (RLS)
-- Ushbu faylni Supabase Dashboard -> SQL Editor sahifasida ishga tushiring
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS & HELPERS
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('user', 'premium', 'admin');
  END IF;
END $$;

-- 3. PROFILES TABLE (auth.users bilan bog'langan profil jadvali - Telefon va Ism/Familiya)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL,
  email TEXT,
  role user_role DEFAULT 'user' NOT NULL,
  avatar_gradient TEXT DEFAULT 'linear-gradient(135deg, #10b981, #3b82f6)',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Agar jadval allaqachon mavjud bo'lsa, ustunlarni moslash va unique constraint qo'shish
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_profile_phone'
  ) THEN
    -- Takrorlangan bo'sh yozuvlar bo'lsa xatolik bo'lmasligi uchun
    UPDATE public.profiles SET phone = split_part(email, '@', 1) WHERE phone IS NULL;
    ALTER TABLE public.profiles ADD CONSTRAINT unique_profile_phone UNIQUE (phone);
  END IF;
END $$;

-- 4. USER SETTINGS TABLE (Foydalanuvchi sozlamalari, tema, til va h.k.)
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'emerald' NOT NULL,
  appearance TEXT DEFAULT 'system' NOT NULL,
  language TEXT DEFAULT 'uz' NOT NULL,
  sound_enabled BOOLEAN DEFAULT true NOT NULL,
  confetti_enabled BOOLEAN DEFAULT true NOT NULL,
  browser_notif_enabled BOOLEAN DEFAULT true NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. HABITS TABLE (Odatlar jadvali)
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  emoji TEXT DEFAULT '🎯' NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'Kundalik' NOT NULL,
  target TEXT DEFAULT '1 marta' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. HABIT COMPLETIONS TABLE (Kunlik bajarilgan odatlar tarixi)
CREATE TABLE IF NOT EXISTS public.habit_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  date_key TEXT NOT NULL, -- Format: YYYY-MM-DD
  completed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_habit_date UNIQUE (user_id, habit_id, date_key)
);

-- 7. BROADCASTS TABLE (Admin bildirishnomalari)
CREATE TABLE IF NOT EXISTS public.broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- INDEXES (Tezkor qidiruv va yuqori unumdorlik uchun)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS idx_completions_user_date ON public.habit_completions(user_id, date_key);
CREATE INDEX IF NOT EXISTS idx_completions_habit_id ON public.habit_completions(habit_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- ==============================================================================
-- SECURITY HELPER FUNCTIONS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = check_user_id AND role = 'admin'
  );
$$;

-- ==============================================================================
-- ROLE PROTECTION: Oddiy foydalanuvchilar o'z rolini o'zgartira olmaydi
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Agar rolni o'zgartirishga urinish bo'lsa va o'zgartiruvchi admin bo'lmasa, eski rol saqlanadi
  IF NEW.role <> OLD.role AND NOT public.is_admin(auth.uid()) THEN
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

-- ==============================================================================
-- AUTOMATIC PROFILE & DEFAULT HABITS TRIGGER ON USER SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_first_name TEXT;
  new_last_name TEXT;
  new_phone TEXT;
BEGIN
  new_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', 'Foydalanuvchi');
  new_last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
  new_phone := COALESCE(NEW.raw_user_meta_data->>'phone', split_part(NEW.email, '@', 1));

  -- 1. Create Profile with default 'user' role
  INSERT INTO public.profiles (id, first_name, last_name, phone, email, role)
  VALUES (
    NEW.id,
    new_first_name,
    new_last_name,
    new_phone,
    NEW.email,
    'user'
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    updated_at = timezone('utc'::text, now());

  -- 2. Create User Settings
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- 3. Create Default Starter Habits
  INSERT INTO public.habits (user_id, title, emoji, description, category, target)
  VALUES
    (NEW.id, 'Shakar iste''mol qilmaslik', '🚫🍬', 'Kun davomida qo''shimcha shakar va shirinliklardan butunlay voz kechish', 'Sog''liq', 'Kun bo''yi toza'),
    (NEW.id, 'Kitob o''qish (20 bet)', '📖', 'Shaxsiy rivojlanish yoki badiiy adabiyotdan kamida 20 bet mutolaa qilish', 'O''qish', '20 bet'),
    (NEW.id, 'Kamida 2 litr toza suv ichish', '💧', 'Har 1.5 - 2 soatda 1 stakan toza suv ichib, ichki organizmni tetik saqlash', 'Sog''liq', '2 litr'),
    (NEW.id, '30 daqiqa jismoniy mashq', '🏃‍♂️', 'Ertalabki yugurish, turnik yoki kuchaytirilgan gimnastika mashqlari', 'Sport', '30 daqiqa'),
    (NEW.id, 'Ertalab 06:30 da uyg''onish', '⏰', 'Kunning barakali qismini qo''ldan boy bermaslik va rejalarni unumli boshlash', 'Tartib', '06:30 da')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger to execute on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- 1. PROFILES RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by owner or admin" ON public.profiles;
CREATE POLICY "Profiles are viewable by owner or admin"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile or admin can update" ON public.profiles;
CREATE POLICY "Users can update own profile or admin can update"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles"
  ON public.profiles
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- 2. USER SETTINGS RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own settings" ON public.user_settings;
CREATE POLICY "Users can manage own settings"
  ON public.user_settings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. HABITS RLS
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own habits or admin can view all" ON public.habits;
CREATE POLICY "Users can view own habits or admin can view all"
  ON public.habits
  FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can create own habits" ON public.habits;
CREATE POLICY "Users can create own habits"
  ON public.habits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own habits" ON public.habits;
CREATE POLICY "Users can update own habits"
  ON public.habits
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own habits" ON public.habits;
CREATE POLICY "Users can delete own habits"
  ON public.habits
  FOR DELETE
  USING (auth.uid() = user_id);

-- 4. HABIT COMPLETIONS RLS
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own completions or admin can view all" ON public.habit_completions;
CREATE POLICY "Users can view own completions or admin can view all"
  ON public.habit_completions
  FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can insert own completions" ON public.habit_completions;
CREATE POLICY "Users can insert own completions"
  ON public.habit_completions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own completions" ON public.habit_completions;
CREATE POLICY "Users can delete own completions"
  ON public.habit_completions
  FOR DELETE
  USING (auth.uid() = user_id);

-- 5. BROADCASTS RLS
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone authenticated can view broadcasts" ON public.broadcasts;
CREATE POLICY "Everyone authenticated can view broadcasts"
  ON public.broadcasts
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Only admins can insert broadcasts" ON public.broadcasts;
CREATE POLICY "Only admins can insert broadcasts"
  ON public.broadcasts
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

-- ==============================================================================
-- 8. MUSTAFO BAKHRIDDINOV ADMIN AKKAUNTINI O'RNATISH (SERVER-SIDE SEED)
-- ==============================================================================
DO $$
DECLARE
  v_admin_first_name TEXT := 'Mustafo';
  v_admin_last_name  TEXT := 'Bakhriddinov';
  v_admin_phone      TEXT := '998701265759';
  v_admin_password   TEXT := 'bratan';
  v_admin_email      TEXT := '998701265759@phone.intizomly.uz';
  v_user_id UUID;
  v_encrypted_pass TEXT;
BEGIN
  v_encrypted_pass := crypt(v_admin_password, gen_salt('bf'));

  SELECT id INTO v_user_id FROM auth.users WHERE email = v_admin_email;

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated',
      v_admin_email, v_encrypted_pass, now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      json_build_object('first_name', v_admin_first_name, 'last_name', v_admin_last_name, 'phone', v_admin_phone)::jsonb,
      now(), now()
    );
  ELSE
    UPDATE auth.users SET
      encrypted_password = v_encrypted_pass,
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      raw_user_meta_data = json_build_object('first_name', v_admin_first_name, 'last_name', v_admin_last_name, 'phone', v_admin_phone)::jsonb,
      updated_at = now()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO public.profiles (id, first_name, last_name, phone, email, role)
  VALUES (v_user_id, v_admin_first_name, v_admin_last_name, v_admin_phone, v_admin_email, 'admin')
  ON CONFLICT (id) DO UPDATE SET
    first_name = v_admin_first_name,
    last_name = v_admin_last_name,
    phone = v_admin_phone,
    email = v_admin_email,
    role = 'admin',
    updated_at = now();

  INSERT INTO public.user_settings (user_id)
  VALUES (v_user_id)
  ON CONFLICT (user_id) DO NOTHING;
END $$;
