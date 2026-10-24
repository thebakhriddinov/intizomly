/**
 * Intizomly — Data Storage & State Engine
 * Handles Multi-User Authentication (Oddiy, Premium, Admin),
 * LocalStorage persistence, streak calculations, admin user management, and multi-language settings.
 */

export const STORAGE_KEYS = {
  USERS: 'intizomly_users_v2',
  CURRENT_USER: 'intizomly_current_user_v2',
  HABITS: 'intizomly_habits_v2',
  HISTORY: 'intizomly_history_v2',
  NOTIFICATIONS: 'intizomly_notifs_v2',
  SETTINGS: 'intizomly_settings_v2'
};

export const DEFAULT_USERS = [
  {
    id: 'usr_admin',
    firstName: "Mustafo",
    lastName: "Bakhriddinov",
    phone: "70 126 5759",
    email: "998701265759@phone.intizomly.uz",
    password: "bratan",
    role: "admin", // 'admin', 'premium', 'user'
    avatarGradient: "linear-gradient(135deg, #10b981, #06b6d4)",
    createdAt: "2026-01-15"
  },
  {
    id: 'usr_premium',
    firstName: "Malika",
    lastName: "Karimova",
    email: "premium@intizomly.uz",
    password: "premium123",
    role: "premium",
    avatarGradient: "linear-gradient(135deg, #f59e0b, #ef4444)",
    createdAt: "2026-02-10"
  },
  {
    id: 'usr_free',
    firstName: "Alisher",
    lastName: "Qodirov",
    email: "oddiy@intizomly.uz",
    password: "user123",
    role: "user",
    avatarGradient: "linear-gradient(135deg, #6366f1, #a855f7)",
    createdAt: "2026-03-01"
  }
];

export const DEFAULT_HABITS = [
  {
    id: 'habit_sugar',
    title: "Shakar iste'mol qilmaslik",
    emoji: '🚫🍬',
    description: "Kun davomida qo'shimcha shakar, shirinliklar va shakarli ichimliklardan butunlay voz kechish",
    category: "Sog'liq",
    target: "Kun bo'yi toza",
    createdAt: Date.now() - 86400000 * 7
  },
  {
    id: 'habit_reading',
    title: "Kitob o'qish (20 bet)",
    emoji: '📖',
    description: "Shaxsiy rivojlanish, intellekt yoki badiiy adabiyotdan kamida 20 bet mutolaa qilish",
    category: "O'qish",
    target: "20 bet",
    createdAt: Date.now() - 86400000 * 7
  },
  {
    id: 'habit_water',
    title: "Kamida 2 litr toza suv ichish",
    emoji: '💧',
    description: "Har 1.5 - 2 soatda 1 stakan toza suv ichib, ichki organizmni tetik saqlash",
    category: "Sog'liq",
    target: "2 litr",
    createdAt: Date.now() - 86400000 * 7
  },
  {
    id: 'habit_workout',
    title: "30 daqiqa jismoniy mashq",
    emoji: '🏃‍♂️',
    description: "Ertalabki yugurish, turnik yoki kuchaytirilgan gimnastika mashqlari",
    category: "Sport",
    target: "30 daqiqa",
    createdAt: Date.now() - 86400000 * 7
  },
  {
    id: 'habit_early_wake',
    title: "Ertalab 06:30 da uyg'onish",
    emoji: '⏰',
    description: "Kunning barakali qismini qo'ldan boy bermaslik va rejalarni unumli boshlash",
    category: "Tartib",
    target: "06:30 da",
    createdAt: Date.now() - 86400000 * 7
  }
];

export const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif_sugar',
    title: "Shakar nazorati",
    message: "Bugun shakar iste'mol qildingizmi? Salomatligingiz va qaddingiz o'z qo'lingizda! 🚫🍬",
    time: "20:00",
    category: "Sog'liq",
    enabled: true
  },
  {
    id: 'notif_reading',
    title: "Kitob mutolaasi",
    message: "Bugun 20 bet kitob o'qidingizmi? Yangi bilim bilan kuningizni yakunlang! 📖",
    time: "21:30",
    category: "O'qish",
    enabled: true
  },
  {
    id: 'notif_water',
    title: "Suv ichish eslatmasi",
    message: "Tanangiz toliqmasligi va quvvatingiz so'nmasligi uchun 1 stakan suv iching! 💧",
    time: "14:00",
    category: "Sog'liq",
    enabled: true
  },
  {
    id: 'notif_recap',
    title: "Kunlik intizom sarhisobi",
    message: "Bugungi barcha vazifalarni bajardingizmi? Intizomly-da belgilab qo'ying! ✅",
    time: "22:15",
    category: "Tartib",
    enabled: true
  }
];

export const DEFAULT_SETTINGS = {
  theme: "emerald",
  appearance: "system",
  language: "uz", // 'uz', 'ru', 'en'
  soundEnabled: true,
  confettiEnabled: true,
  browserNotifEnabled: true
};

class StorageManager {
  constructor() {
    this.users = this.load(STORAGE_KEYS.USERS, null);
    this.currentUser = this.load(STORAGE_KEYS.CURRENT_USER, null);
    this.habits = this.load(STORAGE_KEYS.HABITS, null);
    this.history = this.load(STORAGE_KEYS.HISTORY, null);
    this.notifications = this.load(STORAGE_KEYS.NOTIFICATIONS, null);
    this.settings = this.load(STORAGE_KEYS.SETTINGS, null);

    this.initDefaults();
  }

  load(key, fallback) {
    if (typeof window === 'undefined') return fallback;
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.error(`Error loading ${key}:`, e);
      return fallback;
    }
  }

  save(key, data) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Error saving ${key}:`, e);
    }
  }

  initDefaults() {
    // 1. Users initialization
    if (!this.users || !Array.isArray(this.users) || this.users.length === 0) {
      this.users = JSON.parse(JSON.stringify(DEFAULT_USERS));
      this.save(STORAGE_KEYS.USERS, this.users);
    } else {
      // Auto-sync admin credentials to Mustafo Bakhriddinov (70 126 5759 / bratan)
      const adminUser = this.users.find(u => u.role === 'admin' || u.id === 'usr_admin');
      if (adminUser) {
        adminUser.phone = "70 126 5759";
        adminUser.email = "998701265759@phone.intizomly.uz";
        adminUser.password = "bratan";
        adminUser.firstName = "Mustafo";
        adminUser.lastName = "Bakhriddinov";
        this.save(STORAGE_KEYS.USERS, this.users);
      }
    }

    // 2. Current User session
    if (!this.currentUser) {
      this.currentUser = this.users.find(u => u.role === 'user') || this.users[0];
      this.save(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    } else if (this.currentUser.role === 'admin' || this.currentUser.id === 'usr_admin') {
      this.currentUser.phone = "70 126 5759";
      this.currentUser.email = "998701265759@phone.intizomly.uz";
      this.currentUser.password = "bratan";
      this.currentUser.firstName = "Mustafo";
      this.currentUser.lastName = "Bakhriddinov";
      this.save(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    }

    // 3. Habits
    if (!this.habits || !Array.isArray(this.habits) || this.habits.length === 0) {
      this.habits = JSON.parse(JSON.stringify(DEFAULT_HABITS));
      this.save(STORAGE_KEYS.HABITS, this.habits);
    }

    // 4. History (ensure at least 70 days for the heatmap)
    if (!this.history || typeof this.history !== 'object' || Object.keys(this.history).length < 10) {
      this.history = this.history || {};
      const today = new Date();
      for (let i = 1; i <= 70; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = this.formatDateKey(d);
        if (!this.history[dateStr]) {
          this.history[dateStr] = {};
          const dayOfWeek = d.getDay();
          const activityLevel = (i % 7 === 0 || i % 11 === 0) ? 0 : ((i * 7 + dayOfWeek) % 5) + 1;
          this.habits.forEach((h, idx) => {
            if (idx < activityLevel) {
              this.history[dateStr][h.id] = true;
            }
          });
        }
      }
      this.save(STORAGE_KEYS.HISTORY, this.history);
    }

    // 5. Notifications
    if (!this.notifications || !Array.isArray(this.notifications)) {
      this.notifications = JSON.parse(JSON.stringify(DEFAULT_NOTIFICATIONS));
      this.save(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    }

    // 6. Settings
    if (!this.settings) {
      this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
      this.save(STORAGE_KEYS.SETTINGS, this.settings);
    } else if (!this.settings.language) {
      this.settings.language = "uz";
      this.save(STORAGE_KEYS.SETTINGS, this.settings);
    }
  }

  formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // ==================== AUTH & USERS ====================
  getUsers() {
    return this.users;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  login(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    const user = this.users.find(u => u.email.toLowerCase() === cleanEmail && u.password === cleanPass);
    if (user) {
      this.currentUser = user;
      this.save(STORAGE_KEYS.CURRENT_USER, user);
      return { success: true, user };
    }
    return { success: false, message: "Email yoki parol noto'g'ri kiritildi!" };
  }

  loginById(userId) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      this.currentUser = user;
      this.save(STORAGE_KEYS.CURRENT_USER, user);
      return { success: true, user };
    }
    return { success: false, message: "Foydalanuvchi topilmadi!" };
  }

  logout() {
    const freeUser = this.users.find(u => u.role === 'user') || this.users[0];
    this.currentUser = freeUser;
    this.save(STORAGE_KEYS.CURRENT_USER, freeUser);
    return freeUser;
  }

  register({ firstName, lastName, email, password }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (this.users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: "Bu email bilan ro'yxatdan o'tilgan!" };
    }

    const newUser = {
      id: 'usr_' + Date.now(),
      firstName: (firstName || '').trim(),
      lastName: (lastName || '').trim(),
      email: cleanEmail,
      password: (password || '').trim(),
      role: 'user',
      avatarGradient: 'linear-gradient(135deg, #10b981, #3b82f6)',
      createdAt: new Date().toISOString().split('T')[0]
    };

    this.users.push(newUser);
    this.save(STORAGE_KEYS.USERS, this.users);

    this.currentUser = newUser;
    this.save(STORAGE_KEYS.CURRENT_USER, newUser);

    return { success: true, user: newUser };
  }

  updateProfile({ firstName, lastName, email, password }) {
    if (!this.currentUser) return { success: false };

    this.currentUser.firstName = firstName.trim();
    this.currentUser.lastName = lastName.trim();
    if (email) this.currentUser.email = email.trim().toLowerCase();
    if (password && password.trim()) this.currentUser.password = password.trim();

    const idx = this.users.findIndex(u => u.id === this.currentUser.id);
    if (idx !== -1) {
      this.users[idx] = { ...this.currentUser };
      this.save(STORAGE_KEYS.USERS, this.users);
    }
    this.save(STORAGE_KEYS.CURRENT_USER, this.currentUser);

    return { success: true, user: this.currentUser };
  }

  // Admin user operations
  adminToggleUserRole(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user || user.role === 'admin') return null;

    user.role = user.role === 'premium' ? 'user' : 'premium';
    this.save(STORAGE_KEYS.USERS, this.users);

    if (this.currentUser && this.currentUser.id === userId) {
      this.currentUser = user;
      this.save(STORAGE_KEYS.CURRENT_USER, user);
    }
    return user;
  }

  adminDeleteUser(userId) {
    const idx = this.users.findIndex(u => u.id === userId);
    if (idx !== -1 && this.users[idx].role !== 'admin') {
      this.users.splice(idx, 1);
      this.save(STORAGE_KEYS.USERS, this.users);
      return true;
    }
    return false;
  }

  adminAddUser({ firstName, lastName, email, password, role }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (this.users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: "Bu email allaqachon mavjud!" };
    }

    const newUser = {
      id: 'usr_' + Date.now(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: cleanEmail,
      password: password.trim(),
      role: role || 'user',
      avatarGradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
      createdAt: new Date().toISOString().split('T')[0]
    };

    this.users.push(newUser);
    this.save(STORAGE_KEYS.USERS, this.users);
    return { success: true, user: newUser };
  }

  getAdminStats() {
    const totalUsers = this.users.length;
    const premiumUsers = this.users.filter(u => u.role === 'premium').length;
    const freeUsers = this.users.filter(u => u.role === 'user').length;
    const totalDone = this.getTotalCompletions();

    return { totalUsers, premiumUsers, freeUsers, totalDone };
  }

  // ==================== HABITS ====================
  getHabits() {
    return this.habits;
  }

  getHabitById(id) {
    return this.habits.find(h => h.id === id);
  }

  addHabit({ title, emoji, description, category, target }) {
    const newHabit = {
      id: 'habit_' + Date.now(),
      title: title.trim(),
      emoji: emoji || '🎯',
      description: (description || '').trim(),
      category: category || "Kundalik",
      target: target || "1 marta",
      createdAt: Date.now()
    };

    this.habits.push(newHabit);
    this.save(STORAGE_KEYS.HABITS, this.habits);
    return newHabit;
  }

  updateHabit(id, { title, emoji, description, category, target }) {
    const h = this.habits.find(item => item.id === id);
    if (!h) return null;

    h.title = title.trim();
    if (emoji) h.emoji = emoji;
    h.description = (description || '').trim();
    if (category) h.category = category;
    if (target) h.target = target;

    this.save(STORAGE_KEYS.HABITS, this.habits);
    return h;
  }

  deleteHabit(id) {
    const idx = this.habits.findIndex(h => h.id === id);
    if (idx !== -1) {
      this.habits.splice(idx, 1);
      this.save(STORAGE_KEYS.HABITS, this.habits);

      // Clean up history
      Object.keys(this.history).forEach(dateKey => {
        if (this.history[dateKey][id]) {
          delete this.history[dateKey][id];
        }
      });
      this.save(STORAGE_KEYS.HISTORY, this.history);
      return true;
    }
    return false;
  }

  // ==================== HISTORY & STREAKS ====================
  getHistory() {
    return this.history;
  }

  isHabitCompleted(dateKey, habitId) {
    return !!(this.history[dateKey] && this.history[dateKey][habitId]);
  }

  toggleHabit(dateKey, habitId) {
    if (!this.history[dateKey]) {
      this.history[dateKey] = {};
    }

    const current = !!this.history[dateKey][habitId];
    if (current) {
      delete this.history[dateKey][habitId];
    } else {
      this.history[dateKey][habitId] = true;
    }

    this.save(STORAGE_KEYS.HISTORY, this.history);
    return !current;
  }

  getDayStats(dateKey) {
    const total = this.habits.length;
    const completed = this.habits.filter(h => this.isHabitCompleted(dateKey, h.id)).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }

  getGlobalStreak() {
    let streak = 0;
    const cur = new Date();

    const todayKey = this.formatDateKey(cur);
    const todayStats = this.getDayStats(todayKey);
    const isTodayDone = todayStats.total > 0 && todayStats.completed === todayStats.total;

    if (isTodayDone) streak++;

    while (true) {
      cur.setDate(cur.getDate() - 1);
      const dateKey = this.formatDateKey(cur);
      const stats = this.getDayStats(dateKey);
      if (stats.total > 0 && stats.completed === stats.total) {
        streak++;
      } else {
        break;
      }
      if (streak > 365) break;
    }

    return streak;
  }

  getBestStreak() {
    let best = 0;
    let current = 0;
    const dates = Object.keys(this.history).sort();

    dates.forEach(dateKey => {
      const stats = this.getDayStats(dateKey);
      if (stats.total > 0 && stats.completed === stats.total) {
        current++;
        if (current > best) best = current;
      } else {
        current = 0;
      }
    });

    const curGlobal = this.getGlobalStreak();
    return Math.max(best, curGlobal, 7);
  }

  getTotalCompletions() {
    let total = 0;
    Object.values(this.history).forEach(dayHabits => {
      total += Object.keys(dayHabits).length;
    });
    return total;
  }

  getHabitStreak(habitId) {
    let streak = 0;
    const cur = new Date();

    const todayKey = this.formatDateKey(cur);
    if (this.isHabitCompleted(todayKey, habitId)) {
      streak++;
    }

    while (true) {
      cur.setDate(cur.getDate() - 1);
      const dateKey = this.formatDateKey(cur);
      if (this.isHabitCompleted(dateKey, habitId)) {
        streak++;
      } else {
        break;
      }
      if (streak > 365) break;
    }

    return streak;
  }

  // ==================== SETTINGS & THEMES ====================
  getSettings() {
    return this.settings || DEFAULT_SETTINGS;
  }

  saveSettings(updates) {
    this.settings = { ...this.getSettings(), ...updates };
    this.save(STORAGE_KEYS.SETTINGS, this.settings);
    return this.settings;
  }
}

export const storage = new StorageManager();
