-- ==============================================================================
-- INTIZOMLY — ADMIN AKKAUNTINI XAVFSIZ YARATISH VA YANGILASH (SERVER-SIDE SETUP)
-- 
-- Qo'llanma:
-- Ushbu skriptni Supabase Dashboard -> SQL Editor bo'limida ishga tushiring.
-- Bu skript server-side auth.users va public.profiles jadvallarida xavfsiz bcrypt
-- hash bilan admin akkauntini sozlaydi. Frontend kodida hech qanday parol saqlanmaydi!
-- ==============================================================================

-- 1. Kerakli kriptografik extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  -- ============================================================================
  -- ADMIN SOZLAMALARI (Zarur bo'lsa parolni bu yerda o'zgartirishingiz mumkin)
  -- ============================================================================
  v_admin_first_name TEXT := 'Mustafo';
  v_admin_last_name  TEXT := 'Bakhriddinov';
  v_admin_phone      TEXT := '998701265759'; -- 70 126 5759
  v_admin_password   TEXT := 'admin123';     -- Admin paroli
  v_admin_email      TEXT := '998701265759@phone.intizomly.uz';
  
  v_user_id UUID;
  v_encrypted_pass TEXT;
BEGIN
  -- 1. Parolni bcrypt hash qilish
  v_encrypted_pass := crypt(v_admin_password, gen_salt('bf'));

  -- 2. auth.users ichida admin mavjudligini qidirish
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_admin_email;

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      v_admin_email,
      v_encrypted_pass,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      json_build_object(
        'first_name', v_admin_first_name,
        'last_name', v_admin_last_name,
        'phone', v_admin_phone
      )::jsonb,
      now(),
      now()
    );
    RAISE NOTICE 'Yangi admin foydalanuvchisi auth.users ga qo''shildi (ID: %)', v_user_id;
  ELSE
    -- Mavjud adminning parolini va tasdiqlanishini yangilash
    UPDATE auth.users SET
      encrypted_password = v_encrypted_pass,
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      raw_user_meta_data = json_build_object(
        'first_name', v_admin_first_name,
        'last_name', v_admin_last_name,
        'phone', v_admin_phone
      )::jsonb,
      updated_at = now()
    WHERE id = v_user_id;
    RAISE NOTICE 'Mavjud admin foydalanuvchisi yangilandi (ID: %)', v_user_id;
  END IF;

  -- 3. public.profiles ichida admin roliga ega profil yaratish / yangilash
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    phone,
    email,
    role
  ) VALUES (
    v_user_id,
    v_admin_first_name,
    v_admin_last_name,
    v_admin_phone,
    v_admin_email,
    'admin'
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = v_admin_first_name,
    last_name = v_admin_last_name,
    phone = v_admin_phone,
    email = v_admin_email,
    role = 'admin',
    updated_at = now();

  -- 4. Admin sozlamalarini yaratish
  INSERT INTO public.user_settings (user_id)
  VALUES (v_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  RAISE NOTICE 'Admin: % % (Tel: %) muvaffaqiyatli ADMIN sifatida sozlandi!', v_admin_first_name, v_admin_last_name, v_admin_phone;
END $$;
