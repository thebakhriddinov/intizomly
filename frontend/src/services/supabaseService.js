import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { validateUzbekPhone, formatUzbekPhone, phoneToAuthEmail } from '../utils/phone';
import { saveUserPassword } from '../utils/storage';

// Re-export phone helpers for convenience
export { validateUzbekPhone, formatUzbekPhone, phoneToAuthEmail };

export const supabaseService = {
  isConfigured: () => isSupabaseConfigured && !!supabase,

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================
  async signUp({ phone, password, firstName, lastName }) {
    if (!this.isConfigured()) throw new Error('Supabase konfiguratsiya qilinmagan');

    const cleanFirst = (firstName || '').trim();
    const cleanLast = (lastName || '').trim();
    if (!cleanFirst) throw new Error("Iltimos, ismingizni kiriting");
    if (!cleanLast) throw new Error("Iltimos, familiyangizni kiriting");

    const phoneValidation = validateUzbekPhone(phone);
    if (!phoneValidation.isValid) {
      throw new Error(phoneValidation.message);
    }

    const cleanPass = (password || '').trim();
    if (!cleanPass || cleanPass.length < 6) {
      throw new Error("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
    }

    const cleanEmail = phoneToAuthEmail(phoneValidation.normalized);

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPass,
      options: {
        data: {
          first_name: cleanFirst,
          last_name: cleanLast,
          phone: phoneValidation.normalized
        }
      }
    });

    if (error) {
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('rate limit')) {
        throw new Error(
          "Supabase email cheklovi (rate limit) yuz berdi. Iltimos, Supabase Dashboard -> Authentication -> Providers -> Email bo'limidan 'Confirm email' sozlamasini o'chiring."
        );
      }
      if (msg.includes('already registered') || msg.includes('user already exists')) {
        throw new Error("Ushbu telefon raqam bilan allaqachon ro'yxatdan o'tilgan!");
      }
      throw new Error(error.message || "Ro'yxatdan o'tishda xatolik yuz berdi");
    }

    // Supabase returns user with empty identities when email is already taken but email confirm is enabled
    if (data?.user?.identities && data.user.identities.length === 0) {
      throw new Error("Ushbu telefon raqam bilan allaqachon ro'yxatdan o'tilgan!");
    }

    // Save password for admin viewing
    saveUserPassword(phoneValidation.normalized, cleanPass);
    saveUserPassword(cleanEmail, cleanPass);
    if (data?.user?.id) saveUserPassword(data.user.id, cleanPass);

    return data;
  },

  async signIn({ phone, password }) {
    if (!this.isConfigured()) throw new Error('Supabase konfiguratsiya qilinmagan');

    const phoneValidation = validateUzbekPhone(phone);
    if (!phoneValidation.isValid) {
      throw new Error(phoneValidation.message);
    }

    const cleanPass = (password || '').trim();
    if (!cleanPass) throw new Error("Parolni kiriting");

    const authIdentifier = phoneToAuthEmail(phoneValidation.normalized);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: authIdentifier,
      password: cleanPass
    });

    if (error) {
      if (error.message === 'Invalid login credentials') {
        throw new Error("Telefon raqam yoki parol noto'g'ri kiritildi!");
      }
      throw new Error(error.message || "Kirishda xatolik yuz berdi");
    }

    // Save password for admin viewing
    saveUserPassword(phoneValidation.normalized, cleanPass);
    saveUserPassword(authIdentifier, cleanPass);
    if (data?.user?.id) saveUserPassword(data.user.id, cleanPass);

    return data;
  },

  async signOut() {
    if (!this.isConfigured()) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    if (!this.isConfigured()) return null;
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('[Supabase] getSession warning:', error.message);
      return null;
    }
    return data?.session || null;
  },

  onAuthStateChange(callback) {
    if (!this.isConfigured()) return { data: { subscription: { unsubscribe: () => {} } } };
    return supabase.auth.onAuthStateChange(callback);
  },

  // ============================================================================
  // PROFILES
  // ============================================================================
  async getProfile(userId) {
    if (!this.isConfigured() || !userId) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('[Supabase] getProfile error:', error);
      return null;
    }
    return data ? this.normalizeProfile(data) : null;
  },

  async updateProfile(userId, { firstName, lastName, phone, email, avatarGradient }) {
    if (!this.isConfigured()) throw new Error('Supabase konfiguratsiya qilinmagan');

    const payload = {
      updated_at: new Date().toISOString()
    };
    if (firstName !== undefined) payload.first_name = firstName.trim();
    if (lastName !== undefined) payload.last_name = lastName.trim();
    if (phone !== undefined) {
      const v = validateUzbekPhone(phone);
      payload.phone = v.isValid ? v.normalized : phone;
    }
    if (email !== undefined) payload.email = email.trim();
    if (avatarGradient !== undefined) payload.avatar_gradient = avatarGradient;

    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return this.normalizeProfile(data);
  },

  normalizeProfile(raw) {
    if (!raw) return null;
    const phone = raw.phone || (raw.email && raw.email.includes('@phone.intizomly.uz') ? raw.email.replace('@phone.intizomly.uz', '') : '') || '';
    return {
      id: raw.id,
      firstName: raw.first_name || '',
      lastName: raw.last_name || '',
      phone: phone,
      email: raw.email || '',
      role: raw.role || 'user',
      avatarGradient: raw.avatar_gradient || 'linear-gradient(135deg, #10b981, #3b82f6)',
      createdAt: raw.created_at ? raw.created_at.split('T')[0] : '2026-01-01'
    };
  },

  // ============================================================================
  // ADMIN USER MANAGEMENT
  // ============================================================================
  async getAllUsers() {
    if (!this.isConfigured()) return [];

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Supabase] getAllUsers error:', error);
      return [];
    }
    return (data || []).map(this.normalizeProfile);
  },

  async updateUserRole(userId, newRole) {
    if (!this.isConfigured()) throw new Error('Supabase konfiguratsiya qilinmagan');

    const { data, error } = await supabase
      .from('profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return this.normalizeProfile(data);
  },

  async deleteUser(userId) {
    if (!this.isConfigured()) throw new Error('Supabase konfiguratsiya qilinmagan');

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) throw error;
    return true;
  },

  // ============================================================================
  // HABITS CRUD
  // ============================================================================
  async getHabits(userId) {
    if (!this.isConfigured() || !userId) return [];

    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[Supabase] getHabits error:', error);
      return [];
    }
    return (data || []).map(h => ({
      id: h.id,
      title: h.title,
      emoji: h.emoji || '🎯',
      description: h.description || '',
      category: h.category || 'Kundalik',
      target: h.target || '1 marta',
      createdAt: new Date(h.created_at).getTime()
    }));
  },

  async createHabit(userId, { title, emoji, description, category, target }) {
    if (!this.isConfigured()) throw new Error('Supabase konfiguratsiya qilinmagan');

    const payload = {
      user_id: userId,
      title: title.trim(),
      emoji: emoji || '🎯',
      description: (description || '').trim(),
      category: category || "Sog'liq",
      target: target || "1 marta"
    };

    const { data, error } = await supabase
      .from('habits')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      title: data.title,
      emoji: data.emoji,
      description: data.description,
      category: data.category,
      target: data.target,
      createdAt: new Date(data.created_at).getTime()
    };
  },

  async updateHabit(habitId, { title, emoji, description, category, target }) {
    if (!this.isConfigured()) throw new Error('Supabase konfiguratsiya qilinmagan');

    const payload = {
      title: title.trim(),
      emoji: emoji || '🎯',
      description: (description || '').trim(),
      category: category || "Sog'liq",
      target: target || "1 marta",
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('habits')
      .update(payload)
      .eq('id', habitId)
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      title: data.title,
      emoji: data.emoji,
      description: data.description,
      category: data.category,
      target: data.target,
      createdAt: new Date(data.created_at).getTime()
    };
  },

  async deleteHabit(habitId) {
    if (!this.isConfigured()) throw new Error('Supabase konfiguratsiya qilinmagan');

    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', habitId);

    if (error) throw error;
    return true;
  },

  // ============================================================================
  // COMPLETIONS & HISTORY
  // ============================================================================
  async getCompletions(userId) {
    if (!this.isConfigured() || !userId) return {};

    const { data, error } = await supabase
      .from('habit_completions')
      .select('habit_id, date_key')
      .eq('user_id', userId);

    if (error) {
      console.error('[Supabase] getCompletions error:', error);
      return {};
    }

    const historyMap = {};
    (data || []).forEach(row => {
      if (!historyMap[row.date_key]) {
        historyMap[row.date_key] = {};
      }
      historyMap[row.date_key][row.habit_id] = true;
    });

    return historyMap;
  },

  async toggleCompletion(userId, habitId, dateKey, currentlyCompleted) {
    if (!this.isConfigured()) throw new Error('Supabase konfiguratsiya qilinmagan');

    if (currentlyCompleted) {
      // Remove completion
      const { error } = await supabase
        .from('habit_completions')
        .delete()
        .eq('user_id', userId)
        .eq('habit_id', habitId)
        .eq('date_key', dateKey);

      if (error) throw error;
      return false; // now uncompleted
    } else {
      // Add completion
      const { error } = await supabase
        .from('habit_completions')
        .insert({
          user_id: userId,
          habit_id: habitId,
          date_key: dateKey
        });

      if (error) throw error;
      return true; // now completed
    }
  },

  // ============================================================================
  // USER SETTINGS
  // ============================================================================
  async getSettings(userId) {
    if (!this.isConfigured() || !userId) return null;

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.warn('[Supabase] getSettings warning:', error);
      return null;
    }

    if (!data) return null;
    return {
      theme: data.theme || 'emerald',
      appearance: data.appearance || 'system',
      language: data.language || 'uz',
      soundEnabled: data.sound_enabled !== false,
      confettiEnabled: data.confetti_enabled !== false,
      browserNotifEnabled: data.browser_notif_enabled !== false
    };
  },

  async updateSettings(userId, settingsUpdates) {
    if (!this.isConfigured()) throw new Error('Supabase konfiguratsiya qilinmagan');

    const payload = {
      user_id: userId,
      updated_at: new Date().toISOString()
    };
    if (settingsUpdates.theme !== undefined) payload.theme = settingsUpdates.theme;
    if (settingsUpdates.appearance !== undefined) payload.appearance = settingsUpdates.appearance;
    if (settingsUpdates.language !== undefined) payload.language = settingsUpdates.language;
    if (settingsUpdates.soundEnabled !== undefined) payload.sound_enabled = settingsUpdates.soundEnabled;
    if (settingsUpdates.confettiEnabled !== undefined) payload.confetti_enabled = settingsUpdates.confettiEnabled;
    if (settingsUpdates.browserNotifEnabled !== undefined) payload.browser_notif_enabled = settingsUpdates.browserNotifEnabled;

    const { data, error } = await supabase
      .from('user_settings')
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    return {
      theme: data.theme,
      appearance: data.appearance,
      language: data.language,
      soundEnabled: data.sound_enabled !== false,
      confettiEnabled: data.confetti_enabled !== false,
      browserNotifEnabled: data.browser_notif_enabled !== false
    };
  },

  // ============================================================================
  // BROADCASTS (ADMIN)
  // ============================================================================
  async getBroadcasts() {
    if (!this.isConfigured()) return [];

    const { data, error } = await supabase
      .from('broadcasts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) return [];
    return data || [];
  },

  async createBroadcast(authorId, title, message) {
    if (!this.isConfigured()) throw new Error('Supabase konfiguratsiya qilinmagan');

    const { data, error } = await supabase
      .from('broadcasts')
      .insert({
        author_id: authorId,
        title: title.trim(),
        message: (message || '').trim()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
