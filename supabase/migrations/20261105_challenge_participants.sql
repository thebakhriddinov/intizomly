-- ==============================================================================
-- INTIZOMLY — CHALLENGE ISHTIROKCHILARI JADVALI (REAL SUPABASE SYNC)
-- Ushbu SQL skriptni Supabase Dashboard -> SQL Editor bo'limida ishga tushiring
-- ==============================================================================

-- 1. CHALLENGE PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS public.challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_challenge UNIQUE (challenge_id, user_id)
);

-- Tezkor qidiruv indekslari
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge ON public.challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user ON public.challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_joined_at ON public.challenge_participants(joined_at DESC);

-- 2. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

-- Har qanday foydalanuvchi qaysi challengega kimlar qo'shilganini ko'ra oladi
DROP POLICY IF EXISTS "Challenge participants are viewable by everyone" ON public.challenge_participants;
CREATE POLICY "Challenge participants are viewable by everyone"
  ON public.challenge_participants
  FOR SELECT
  USING (true);

-- Foydalanuvchi faqat o'zi uchun guruhga qo'shila oladi (yoki admin)
DROP POLICY IF EXISTS "Users can join challenges" ON public.challenge_participants;
CREATE POLICY "Users can join challenges"
  ON public.challenge_participants
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Foydalanuvchi faqat o'zini guruhdan chiqara oladi (yoki admin)
DROP POLICY IF EXISTS "Users can leave challenges" ON public.challenge_participants;
CREATE POLICY "Users can leave challenges"
  ON public.challenge_participants
  FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 3. DEFAULT SEED: Yangi foydalanuvchini avtomatik No Sugar challengega qo'shish
-- Mavjud barcha profillarni No Sugar ga boshlang'ich a'zo sifatida qo'shish
INSERT INTO public.challenge_participants (challenge_id, user_id)
SELECT 'ch_no_sugar', id FROM public.profiles
ON CONFLICT (challenge_id, user_id) DO NOTHING;

-- Trigger: yangi foydalanuvchi ro'yxatdan o'tganda avtomatik No Sugar challengega qo'shilsin
CREATE OR REPLACE FUNCTION public.handle_new_user_challenge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.challenge_participants (challenge_id, user_id)
  VALUES ('ch_no_sugar', NEW.id)
  ON CONFLICT (challenge_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_challenge_join ON auth.users;
CREATE TRIGGER on_auth_user_challenge_join
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_challenge();

