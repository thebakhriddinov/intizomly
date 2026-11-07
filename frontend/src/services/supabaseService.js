import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { validateUzbekPhone, formatUzbekPhone, phoneToAuthEmail } from '../utils/phone';
import { saveUserPassword, normalizeSchedule } from '../utils/storage';

// Re-export phone helpers for convenience
export { validateUzbekPhone, formatUzbekPhone, phoneToAuthEmail };

/**
 * Normalizes a profile object from either Supabase database format (snake_case)
 * or application state format (camelCase) into a consistent schema.
 */
export function normalizeProfile(raw) {
  if (!raw) return null;

  const rawPhone = raw.phone || (raw.email && raw.email.includes('@phone.intizomly.uz') ? raw.email.replace('@phone.intizomly.uz', '') : '') || '';
  const firstName = (raw.first_name || raw.firstName || '').trim();
  const lastName = (raw.last_name || raw.lastName || '').trim();
  const phone = rawPhone ? (formatUzbekPhone(rawPhone) || rawPhone) : '';

  // Name resolution: prefer real full name, fallback to formatted phone, then clean title
  let name = `${firstName} ${lastName}`.trim();
  if (!name && phone) {
    name = phone;
  }
  if (!name && raw.name && raw.name !== 'Foydalanuvchi') {
    name = raw.name;
  }
  if (!name) {
    name = 'Foydalanuvchi';
  }

  const avatarUrl = raw.avatar_url || raw.avatarUrl || (raw.avatar_gradient && (raw.avatar_gradient.startsWith('data:image') || raw.avatar_gradient.startsWith('http')) ? raw.avatar_gradient : '') || '';
  const avatarGradient = raw.avatar_gradient || raw.avatarGradient || 'linear-gradient(135deg, #10b981, #06b6d4)';

  let socialLinks = [];
  if (Array.isArray(raw.social_links)) socialLinks = raw.social_links;
  else if (Array.isArray(raw.socialLinks)) socialLinks = raw.socialLinks;
  else if (Array.isArray(raw.socials)) socialLinks = raw.socials;

  return {
    id: raw.id,
    name,
    firstName,
    lastName,
    phone,
    email: raw.email || '',
    password: raw.password || '',
    role: raw.role || 'user',
    avatarGradient,
    avatarUrl,
    bio: raw.bio || '',
    socialLinks,
    streak: Number(raw.streak) || 0,
    points: Number(raw.points) || (Number(raw.streak) || 0) * 50,
    createdAt: raw.created_at ? raw.created_at.split('T')[0] : '2026-01-01'
  };
}

export const supabaseService = {
  isConfigured() {
    return Boolean(isSupabaseConfigured && supabase);
  },

  normalizeProfile(raw) {
    return normalizeProfile(raw);
  },

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================
  async signUp({ phone, email, password, firstName, lastName }) {
    if (!this.isConfigured()) throw new Error('Supabase konfiguratsiya qilinmagan');

    const cleanFirst = (firstName || '').trim();
    const cleanLast = (lastName || '').trim();
    if (!cleanFirst) throw new Error("Iltimos, ismingizni kiriting");
    if (!cleanLast) throw new Error("Iltimos, familiyangizni kiriting");

    const cleanPass = (password || '').trim();
    if (!cleanPass || cleanPass.length < 6) {
      throw new Error("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
    }

    let authEmail = '';
    let normalizedPhone = '';

    if (phone) {
      const phoneValidation = validateUzbekPhone(phone);
      if (!phoneValidation.isValid) {
        throw new Error(phoneValidation.message);
      }
      normalizedPhone = phoneValidation.normalized;
      authEmail = phoneToAuthEmail(normalizedPhone);
    } else if (email) {
      authEmail = email.trim();
    } else {
      throw new Error("Telefon raqami yoki elektron pochta kiritilishi shart");
    }

    const { data, error } = await supabase.auth.signUp({
      email: authEmail,
      password: cleanPass,
      options: {
        data: {
          first_name: cleanFirst,
          last_name: cleanLast,
          phone: normalizedPhone,
          password: cleanPass
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
        throw new Error("Ushbu telefon raqam yoki akkaunt allaqachon ro'yxatdan o'tgan!");
      }
      throw new Error(error.message || "Ro'yxatdan o'tishda xatolik yuz berdi");
    }

    // Supabase returns user with empty identities when email is already taken but email confirm is enabled
    if (data?.user?.identities && data.user.identities.length === 0) {
      throw new Error("Ushbu telefon raqam bilan allaqachon ro'yxatdan o'tilgan!");
    }

    // Save password locally for admin recovery/reference
    if (normalizedPhone) saveUserPassword(normalizedPhone, cleanPass);
    if (authEmail) saveUserPassword(authEmail, cleanPass);
    if (data?.user?.id) saveUserPassword(data.user.id, cleanPass);

    // Save password in Supabase public.profiles for Admin panel display
    if (data?.user?.id) {
      try {
        await supabase
          .from('profiles')
          .update({ password: cleanPass })
          .eq('id', data.user.id);
      } catch (pwErr) {
        console.warn('[Supabase] Profile password write notice on signUp:', pwErr?.message);
      }

      // Auto-join new user to default No Sugar Challenge in Supabase
      try {
        await supabase
          .from('challenge_participants')
          .upsert(
            { challenge_id: 'ch_no_sugar', user_id: data.user.id, joined_at: new Date().toISOString() },
            { onConflict: 'challenge_id,user_id', ignoreDuplicates: true }
          );
      } catch (cpErr) {
        // quiet fallback if table not yet created
      }
    }

    return data;
  },

  async signIn({ phone, email, password }) {
    if (!this.isConfigured()) throw new Error('Supabase konfiguratsiya qilinmagan');

    const cleanPass = (password || '').trim();
    if (!cleanPass) throw new Error("Parolni kiriting");

    let authIdentifier = '';
    let normalizedPhone = '';

    if (phone) {
      const phoneValidation = validateUzbekPhone(phone);
      if (!phoneValidation.isValid) {
        throw new Error(phoneValidation.message);
      }
      normalizedPhone = phoneValidation.normalized;
      authIdentifier = phoneToAuthEmail(normalizedPhone);
    } else if (email) {
      authIdentifier = email.trim();
    } else {
      throw new Error("Telefon raqam yoki email kiritilmagan");
    }

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

    if (normalizedPhone) saveUserPassword(normalizedPhone, cleanPass);
    if (authIdentifier) saveUserPassword(authIdentifier, cleanPass);
    if (data?.user?.id) {
      saveUserPassword(data.user.id, cleanPass);
      // Auto-sync real password into Supabase profiles on login
      try {
        await supabase
          .from('profiles')
          .update({ password: cleanPass })
          .eq('id', data.user.id);
      } catch (pwErr) {
        // silent sync
      }
    }

    return data;
  },

  async signOut() {
    if (!this.isConfigured()) return;
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (e) {
      console.warn('[Supabase] SignOut error:', e?.message);
    }
  },

  async getSession() {
    if (!this.isConfigured()) return null;
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.warn('[Supabase] getSession warning:', error.message);
        return null;
      }
      return data?.session || null;
    } catch (e) {
      console.warn('[Supabase] getSession exception:', e?.message);
      return null;
    }
  },

  onAuthStateChange(callback) {
    if (!this.isConfigured()) {
      return { data: { subscription: { unsubscribe: () => { } } } };
    }
    return supabase.auth.onAuthStateChange(callback);
  },

  // ============================================================================
  // PROFILES
  // ============================================================================
  async getProfile(userId) {
    if (!this.isConfigured() || !userId) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[Supabase] getProfile error:', error);
        return null;
      }
      return data ? normalizeProfile(data) : null;
    } catch (e) {
      console.error('[Supabase] getProfile exception:', e);
      return null;
    }
  },

  async updateProfile(userId, updates = {}) {
    if (!this.isConfigured()) throw new Error('Supabase konfiguratsiya qilinmagan');
    if (!userId) throw new Error('Foydalanuvchi IDsi talab qilinadi');

    const {
      firstName,
      lastName,
      phone,
      email,
      password,
      avatarGradient,
      avatarUrl,
      bio,
      socialLinks,
      socials
    } = updates;

    const payload = {
      updated_at: new Date().toISOString()
    };

    if (firstName !== undefined) payload.first_name = String(firstName).trim();
    if (lastName !== undefined) payload.last_name = String(lastName).trim();
    if (phone !== undefined) {
      const v = validateUzbekPhone(phone);
      payload.phone = v.isValid ? v.normalized : phone;
    }
    if (email !== undefined) payload.email = String(email).trim();
    if (password !== undefined && String(password).trim()) {
      payload.password = String(password).trim();
      saveUserPassword(userId, String(password).trim());
    }
    if (avatarGradient !== undefined) payload.avatar_gradient = avatarGradient;
    if (avatarUrl !== undefined) {
      payload.avatar_url = avatarUrl;
      if (!payload.avatar_gradient) payload.avatar_gradient = avatarUrl;
    }
    if (bio !== undefined) payload.bio = String(bio).trim();

    const linksToSave = Array.isArray(socialLinks) ? socialLinks : (Array.isArray(socials) ? socials : null);
    if (linksToSave !== null) {
      payload.social_links = linksToSave;
    }

    try {
      // 1. Try updating with full payload
      const { data, error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return normalizeProfile(data);
    } catch (err) {
      console.warn('[Supabase] Extended profile update notice, falling back to core schema:', err?.message);

      // 2. Fallback to core columns that always exist in standard profiles table
      const fallbackPayload = {
        updated_at: new Date().toISOString()
      };
      if (firstName !== undefined) fallbackPayload.first_name = String(firstName).trim();
      if (lastName !== undefined) fallbackPayload.last_name = String(lastName).trim();
      if (phone !== undefined) {
        const v = validateUzbekPhone(phone);
        fallbackPayload.phone = v.isValid ? v.normalized : phone;
      }
      if (email !== undefined) fallbackPayload.email = String(email).trim();
      if (password !== undefined && String(password).trim()) fallbackPayload.password = String(password).trim();
      if (avatarUrl) fallbackPayload.avatar_gradient = avatarUrl;
      else if (avatarGradient !== undefined) fallbackPayload.avatar_gradient = avatarGradient;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .update(fallbackPayload)
          .eq('id', userId)
          .select()
          .single();

        if (error) throw error;
        return normalizeProfile({ ...data, bio: bio || '', avatar_url: avatarUrl || '', social_links: linksToSave || [], password: password || data?.password || '' });
      } catch (fallbackErr) {
        console.error('[Supabase] Core profile update error:', fallbackErr);
        // Return optimistic normalized profile so UI does not freeze
        return normalizeProfile({
          id: userId,
          first_name: firstName,
          last_name: lastName,
          phone,
          email,
          password,
          avatar_gradient: avatarGradient || avatarUrl,
          avatar_url: avatarUrl,
          bio,
          social_links: linksToSave
        });
      }
    }
  },

  // ============================================================================
  // ADMIN USER MANAGEMENT
  // ============================================================================
  async getAllUsers() {
    if (!this.isConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Supabase] getAllUsers error:', error);
        return [];
      }
      return (data || []).map(p => normalizeProfile(p));
    } catch (e) {
      console.error('[Supabase] getAllUsers exception:', e);
      return [];
    }
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
    return normalizeProfile(data);
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

    try {
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
        time: h.time || '',
        schedule: normalizeSchedule(h.schedule),
        createdAt: h.created_at ? new Date(h.created_at).getTime() : Date.now()
      }));
    } catch (e) {
      console.error('[Supabase] getHabits exception:', e);
      return [];
    }
  },

  async createHabit(userId, { title, emoji, description, category, target, time, schedule }) {
    if (!this.isConfigured()) throw new Error('Supabase konfiguratsiya qilinmagan');

    const normalizedSchedule = normalizeSchedule(schedule);
    const payload = {
      user_id: userId,
      title: (title || '').trim(),
      emoji: emoji || '🎯',
      description: (description || '').trim(),
      category: category || "Sog'liq",
      target: target || "1 marta",
      time: (time || '').trim(),
      schedule: normalizedSchedule
    };

    try {
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
        time: data.time || time || '',
        schedule: normalizeSchedule(data.schedule || normalizedSchedule),
        createdAt: data.created_at ? new Date(data.created_at).getTime() : Date.now()
      };
    } catch (err) {
      // Fallback without schedule and/or time columns if not yet migrated on remote db
      const fallbackPayload = { ...payload };
      delete fallbackPayload.schedule;
      try {
        const { data, error } = await supabase
          .from('habits')
          .insert(fallbackPayload)
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
          time: data.time || time || '',
          schedule: normalizedSchedule,
          createdAt: data.created_at ? new Date(data.created_at).getTime() : Date.now()
        };
      } catch (err2) {
        delete fallbackPayload.time;
        const { data, error } = await supabase
          .from('habits')
          .insert(fallbackPayload)
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
          time: time || '',
          schedule: normalizedSchedule,
          createdAt: data.created_at ? new Date(data.created_at).getTime() : Date.now()
        };
      }
    }
  },

  async updateHabit(habitId, { title, emoji, description, category, target, time, schedule }) {
    if (!this.isConfigured()) throw new Error('Supabase konfiguratsiya qilinmagan');

    const normalizedSchedule = normalizeSchedule(schedule);
    const payload = {
      title: (title || '').trim(),
      emoji: emoji || '🎯',
      description: (description || '').trim(),
      category: category || "Sog'liq",
      target: target || "1 marta",
      time: (time || '').trim(),
      schedule: normalizedSchedule,
      updated_at: new Date().toISOString()
    };

    try {
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
        time: data.time || time || '',
        schedule: normalizeSchedule(data.schedule || normalizedSchedule),
        createdAt: data.created_at ? new Date(data.created_at).getTime() : Date.now()
      };
    } catch (err) {
      const fallbackPayload = { ...payload };
      delete fallbackPayload.schedule;
      try {
        const { data, error } = await supabase
          .from('habits')
          .update(fallbackPayload)
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
          time: data.time || time || '',
          schedule: normalizedSchedule,
          createdAt: data.created_at ? new Date(data.created_at).getTime() : Date.now()
        };
      } catch (err2) {
        delete fallbackPayload.time;
        const { data, error } = await supabase
          .from('habits')
          .update(fallbackPayload)
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
          time: time || '',
          schedule: normalizedSchedule,
          createdAt: data.created_at ? new Date(data.created_at).getTime() : Date.now()
        };
      }
    }
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

    try {
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
    } catch (e) {
      console.error('[Supabase] getCompletions exception:', e);
      return {};
    }
  },

  async toggleCompletion(userId, habitId, dateKey, currentlyCompleted) {
    if (!this.isConfigured()) throw new Error('Supabase konfiguratsiya qilinmagan');

    if (currentlyCompleted) {
      const { error } = await supabase
        .from('habit_completions')
        .delete()
        .eq('user_id', userId)
        .eq('habit_id', habitId)
        .eq('date_key', dateKey);

      if (error) throw error;
      return false; // uncompleted
    } else {
      // Upsert/insert completion safely
      const { error } = await supabase
        .from('habit_completions')
        .upsert(
          {
            user_id: userId,
            habit_id: habitId,
            date_key: dateKey
          },
          { onConflict: 'user_id,habit_id,date_key', ignoreDuplicates: true }
        );

      if (error) {
        // Fallback to simple insert if onConflict is unsupported
        const insRes = await supabase
          .from('habit_completions')
          .insert({
            user_id: userId,
            habit_id: habitId,
            date_key: dateKey
          });
        if (insRes.error && !insRes.error.message?.includes('duplicate')) {
          throw insRes.error;
        }
      }
      return true; // completed
    }
  },

  // ============================================================================
  // USER SETTINGS
  // ============================================================================
  async getSettings(userId) {
    if (!this.isConfigured() || !userId) return null;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.warn('[Supabase] getSettings warning:', error?.message);
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
    } catch (e) {
      console.warn('[Supabase] getSettings exception:', e?.message);
      return null;
    }
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

    try {
      const { data, error } = await supabase
        .from('broadcasts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  },

  async createBroadcast(authorId, title, message) {
    if (!this.isConfigured()) throw new Error('Supabase konfiguratsiya qilinmagan');

    const { data, error } = await supabase
      .from('broadcasts')
      .insert({
        author_id: authorId,
        title: (title || '').trim(),
        message: (message || '').trim()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ============================================================================
  // CHALLENGES & PARTICIPANTS (REAL SUPABASE SYNC)
  // ============================================================================
  async getChallengeParticipants(challengeId = null) {
    if (!this.isConfigured()) return [];
    try {
      let query = supabase
        .from('challenge_participants')
        .select('*')
        .order('joined_at', { ascending: false });

      if (challengeId) {
        query = query.eq('challenge_id', challengeId);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('[Supabase] getChallengeParticipants notice:', error.message);
        return [];
      }
      return data || [];
    } catch (e) {
      console.warn('[Supabase] getChallengeParticipants exception:', e?.message);
      return [];
    }
  },

  async joinChallenge(userId, challengeId) {
    if (!this.isConfigured()) throw new Error('Supabase konfiguratsiya qilinmagan');
    if (!userId || !challengeId) throw new Error("Foydalanuvchi yoki guruh IDsi ko'rsatilmagan");

    const payload = {
      challenge_id: challengeId,
      user_id: userId,
      joined_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('challenge_participants')
        .upsert(payload, { onConflict: 'challenge_id,user_id', ignoreDuplicates: true })
        .select();

      if (error) {
        const insRes = await supabase
          .from('challenge_participants')
          .insert(payload);
        if (insRes.error && !insRes.error.message?.includes('duplicate')) {
          throw insRes.error;
        }
      }
      return true;
    } catch (err) {
      console.warn('[Supabase] joinChallenge error:', err?.message);
      throw err;
    }
  },

  async leaveChallenge(userId, challengeId) {
    if (!this.isConfigured()) throw new Error('Supabase konfiguratsiya qilinmagan');
    if (!userId || !challengeId) return false;

    try {
      const { error } = await supabase
        .from('challenge_participants')
        .delete()
        .eq('challenge_id', challengeId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('[Supabase] leaveChallenge error:', err?.message);
      throw err;
    }
  },

  async getUserChallenges(userId) {
    if (!this.isConfigured() || !userId) return [];
    try {
      const { data, error } = await supabase
        .from('challenge_participants')
        .select('challenge_id')
        .eq('user_id', userId);

      if (error) return [];
      return (data || []).map(row => row.challenge_id);
    } catch {
      return [];
    }
  }
};
