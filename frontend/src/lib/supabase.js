import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are properly set and not dummy placeholders
const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return (
    (trimmed.startsWith('https://') || trimmed.startsWith('http://')) &&
    !trimmed.includes('your-project-id') &&
    !trimmed.includes('example.com')
  );
};

const isValidKey = (key) => {
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();
  return (
    trimmed.length > 20 &&
    !trimmed.includes('your-anon-publishable-key')
  );
};

export const isSupabaseConfigured = isValidUrl(supabaseUrl) && isValidKey(supabaseAnonKey);

let client = null;

if (isSupabaseConfigured) {
  try {
    client = createClient(supabaseUrl.trim(), supabaseAnonKey.trim(), {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  } catch (err) {
    console.error('[Supabase] Client initialization error:', err);
    client = null;
  }
} else {
  // Graceful development notice in browser console
  console.info(
    '%c[Supabase] Integratsiya tayyor! Haqiqiy ma\'lumotlar bazasiga ulanish uchun frontend/.env.local faylida VITE_SUPABASE_URL va VITE_SUPABASE_ANON_KEY qiymatlarini belgilang. Hozirda ilova demo/offline rejimida xatosiz ishlamoqda.',
    'color: #10b981; font-weight: bold; font-size: 12px;'
  );
}

export const supabase = client;

export function getSupabaseConfigStatus() {
  return {
    isConfigured: isSupabaseConfigured,
    hasUrl: !!supabaseUrl && isValidUrl(supabaseUrl),
    hasKey: !!supabaseAnonKey && isValidKey(supabaseAnonKey),
    missingVariables: [
      !isValidUrl(supabaseUrl) ? 'VITE_SUPABASE_URL' : null,
      !isValidKey(supabaseAnonKey) ? 'VITE_SUPABASE_ANON_KEY' : null
    ].filter(Boolean)
  };
}
