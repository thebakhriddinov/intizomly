-- ==============================================================================
-- INTIZOMLY — Foydalanuvchilar parollarini saqlash va Admin panelda ko'rsatish
-- Ushbu SQL skriptni Supabase Dashboard -> SQL Editor bo'limida ishga tushiring
-- ==============================================================================

-- 1. PROFILES jadvaliga password ustunini qo'shish
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password TEXT;

-- 2. Yangi ro'yxatdan o'tgan foydalanuvchining parolini avtomatik profiles ga yozish triggeri
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
  new_password TEXT;
BEGIN
  new_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', 'Foydalanuvchi');
  new_last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
  new_phone := COALESCE(NEW.raw_user_meta_data->>'phone', split_part(NEW.email, '@', 1));
  new_password := COALESCE(NEW.raw_user_meta_data->>'password', '');

  -- 1. Create or update profile with real password
  INSERT INTO public.profiles (id, first_name, last_name, phone, email, role, password)
  VALUES (
    NEW.id,
    new_first_name,
    new_last_name,
    new_phone,
    NEW.email,
    'user',
    new_password
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    password = CASE
      WHEN EXCLUDED.password IS NOT NULL AND EXCLUDED.password <> '' THEN EXCLUDED.password
      ELSE public.profiles.password
    END,
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

-- Triggerni qayta o'rnatish
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. RLS xavfsizligini ta'minlash: Admin barcha profillarni (va parollarni) ko'ra oladi,
-- oddiy foydalanuvchilar esa faqat o'zinikini ko'radi/tahrirlaydi
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

