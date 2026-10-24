/**
 * Intizomly — Data Storage & State Engine
 * Handles Multi-User Authentication (Oddiy, Premium, Admin),
 * LocalStorage persistence, streak calculations, admin user management, and backup.
 */

const STORAGE_KEYS = {
  USERS: 'intizomly_users_v2',
  CURRENT_USER: 'intizomly_current_user_v2',
  HABITS: 'intizomly_habits_v2',
  HISTORY: 'intizomly_history_v2',
  NOTIFICATIONS: 'intizomly_notifs_v2',
  SETTINGS: 'intizomly_settings_v2'
};

const DEFAULT_USERS = [
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
    role: "user", // Oddiy user
    avatarGradient: "linear-gradient(135deg, #6366f1, #a855f7)",
    createdAt: "2026-03-01"
  }
];

const DEFAULT_HABITS = [
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

const DEFAULT_NOTIFICATIONS = [
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

const DEFAULT_SETTINGS = {
  theme: "emerald",
  appearance: "system",
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
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.error(`Error loading ${key}:`, e);
      return fallback;
    }
  }

  save(key, data) {
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
      // By default start with Alisher Qodirov (Oddiy user)
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
    let shouldSeedHistory = false;
    if (!this.habits || !Array.isArray(this.habits) || this.habits.length === 0) {
      this.habits = JSON.parse(JSON.stringify(DEFAULT_HABITS));
      this.save(STORAGE_KEYS.HABITS, this.habits);
      shouldSeedHistory = true;
    }

    // 4. History
    if (!this.history || typeof this.history !== 'object') {
      this.history = {};
      shouldSeedHistory = true;
    }

    if (!this.history || typeof this.history !== 'object' || Object.keys(this.history).length < 10) {
      this.history = this.history || {};
      const today = new Date();
      // Generate activity for past 70 days with varied intensity like GitHub
      for (let i = 1; i <= 70; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = this.formatDateKey(d);
        if (!this.history[dateStr]) {
          this.history[dateStr] = {};
          // Probability of completing habits
          const dayOfWeek = d.getDay();
          const activityLevel = (i % 7 === 0 || i % 11 === 0) ? 0 : ((i * 7 + dayOfWeek) % 5) + 1; // 0 to 5 habits
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

  setCurrentUser(user) {
    this.currentUser = user;
    this.save(STORAGE_KEYS.CURRENT_USER, this.currentUser);
  }

  login(email, password) {
    const cleanEmail = email.trim().toLowerCase();
    const user = this.users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);
    if (user) {
      this.setCurrentUser(user);
      return { success: true, user };
    }
    return { success: false, message: "Email yoki parol noto'g'ri kiritildi!" };
  }

  quickLoginRole(role) {
    const user = this.users.find(u => u.role === role);
    if (user) {
      this.setCurrentUser(user);
      return user;
    }
    return null;
  }

  register(userData) {
    const cleanEmail = userData.email.trim().toLowerCase();
    const exists = this.users.some(u => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      return { success: false, message: "Ushbu email bilan allaqachon ro'yxatdan o'tilgan!" };
    }

    const newUser = {
      id: 'usr_' + Date.now(),
      firstName: userData.firstName.trim(),
      lastName: userData.lastName.trim(),
      email: cleanEmail,
      password: userData.password,
      role: 'user', // newly registered user is always Oddiy user
      avatarGradient: "linear-gradient(135deg, #6366f1, #a855f7)",
      createdAt: new Date().toISOString().slice(0, 10)
    };

    this.users.push(newUser);
    this.save(STORAGE_KEYS.USERS, this.users);
    this.setCurrentUser(newUser);
    return { success: true, user: newUser };
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  updateProfile(profileData) {
    if (!this.currentUser) return null;
    this.currentUser.firstName = profileData.firstName.trim();
    this.currentUser.lastName = profileData.lastName.trim();
    this.currentUser.email = profileData.email.trim();
    if (profileData.password) {
      this.currentUser.password = profileData.password;
    }
    if (profileData.avatarGradient) {
      this.currentUser.avatarGradient = profileData.avatarGradient;
    }

    // Sync in users array
    const idx = this.users.findIndex(u => u.id === this.currentUser.id);
    if (idx !== -1) {
      this.users[idx] = { ...this.currentUser };
      this.save(STORAGE_KEYS.USERS, this.users);
    }
    this.save(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    return this.currentUser;
  }

  // ==================== ADMIN PANEL MANAGEMENT ====================
  toggleUserPremium(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user || user.role === 'admin') return null;

    user.role = user.role === 'premium' ? 'user' : 'premium';
    this.save(STORAGE_KEYS.USERS, this.users);

    // If current logged in user is this user, sync
    if (this.currentUser && this.currentUser.id === userId) {
      this.currentUser.role = user.role;
      this.save(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    }
    return user;
  }

  deleteUser(userId) {
    if (this.currentUser && this.currentUser.id === userId) {
      return { success: false, message: "O'z hisobingizni o'chira olmaysiz!" };
    }
    this.users = this.users.filter(u => u.id !== userId);
    this.save(STORAGE_KEYS.USERS, this.users);
    return { success: true };
  }

  adminAddUser(userData) {
    const cleanEmail = userData.email.trim().toLowerCase();
    if (this.users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: "Bu email allaqachon mavjud!" };
    }

    const newUser = {
      id: 'usr_' + Date.now(),
      firstName: userData.firstName.trim(),
      lastName: userData.lastName.trim(),
      email: cleanEmail,
      password: userData.password || 'parol123',
      role: userData.role || 'user',
      avatarGradient: userData.role === 'premium' 
        ? "linear-gradient(135deg, #f59e0b, #ef4444)" 
        : "linear-gradient(135deg, #6366f1, #a855f7)",
      createdAt: new Date().toISOString().slice(0, 10)
    };

    this.users.push(newUser);
    this.save(STORAGE_KEYS.USERS, this.users);
    return { success: true, user: newUser };
  }

  getAdminStats() {
    const totalUsers = this.users.length;
    const premiumUsers = this.users.filter(u => u.role === 'premium').length;
    const freeUsers = this.users.filter(u => u.role === 'user').length;
    const adminUsers = this.users.filter(u => u.role === 'admin').length;
    const totalHabits = this.habits.length;
    const totalDone = this.getTotalCompletions();

    return {
      totalUsers,
      premiumUsers,
      freeUsers,
      adminUsers,
      totalHabits,
      totalDone
    };
  }

  // ==================== THEME RESTRICTIONS ====================
  /**
   * Premium check: Oddiy user can only use default themes (violet, light).
   * Premium and Admin can use ALL themes (emerald, oled, cyber, gold, etc.).
   */
  canUseTheme(theme) {
    const freeThemes = ['violet', 'light'];
    if (freeThemes.includes(theme)) return true;
    if (!this.currentUser) return false;
    return this.currentUser.role === 'premium' || this.currentUser.role === 'admin';
  }

  // ==================== HABITS MANAGEMENT ====================
  getHabits() {
    return this.habits;
  }

  getHabitById(id) {
    return this.habits.find(h => h.id === id);
  }

  addHabit(habitData) {
    const newHabit = {
      id: 'habit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      title: habitData.title.trim(),
      emoji: habitData.emoji || '🎯',
      description: habitData.description ? habitData.description.trim() : '',
      category: habitData.category || "Kundalik",
      target: habitData.target ? habitData.target.trim() : "1 marta",
      createdAt: Date.now()
    };
    this.habits.push(newHabit);
    this.save(STORAGE_KEYS.HABITS, this.habits);
    return newHabit;
  }

  updateHabit(id, habitData) {
    const idx = this.habits.findIndex(h => h.id === id);
    if (idx !== -1) {
      this.habits[idx] = {
        ...this.habits[idx],
        title: habitData.title.trim(),
        emoji: habitData.emoji || this.habits[idx].emoji,
        description: habitData.description !== undefined ? habitData.description.trim() : this.habits[idx].description,
        category: habitData.category || this.habits[idx].category,
        target: habitData.target ? habitData.target.trim() : this.habits[idx].target
      };
      this.save(STORAGE_KEYS.HABITS, this.habits);
      return this.habits[idx];
    }
    return null;
  }

  deleteHabit(id) {
    this.habits = this.habits.filter(h => h.id !== id);
    this.save(STORAGE_KEYS.HABITS, this.habits);

    Object.keys(this.history).forEach(date => {
      if (this.history[date] && this.history[date][id] !== undefined) {
        delete this.history[date][id];
      }
    });
    this.save(STORAGE_KEYS.HISTORY, this.history);
  }

  // ==================== COMPLETION & STREAKS ====================
  isHabitCompleted(dateKey, habitId) {
    return !!(this.history[dateKey] && this.history[dateKey][habitId]);
  }

  toggleHabit(dateKey, habitId) {
    if (!this.history[dateKey]) {
      this.history[dateKey] = {};
    }
    const current = !!this.history[dateKey][habitId];
    this.history[dateKey][habitId] = !current;
    this.save(STORAGE_KEYS.HISTORY, this.history);
    return !current;
  }

  getDayStats(dateKey) {
    const dayRecords = this.history[dateKey] || {};
    const total = this.habits.length;
    let completed = 0;
    this.habits.forEach(h => {
      if (dayRecords[h.id]) completed++;
    });
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  }

  getHabitStreak(habitId) {
    let streak = 0;
    const now = new Date();
    const todayKey = this.formatDateKey(now);

    let checkDate = new Date(now);
    const completedToday = this.isHabitCompleted(todayKey, habitId);

    if (completedToday) {
      streak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayKey = this.formatDateKey(checkDate);
      if (!this.isHabitCompleted(yesterdayKey, habitId)) {
        return 0;
      }
    }

    while (true) {
      const key = this.formatDateKey(checkDate);
      if (this.isHabitCompleted(key, habitId)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  getGlobalStreak() {
    let streak = 0;
    const now = new Date();
    const todayKey = this.formatDateKey(now);
    const todayStats = this.getDayStats(todayKey);

    let checkDate = new Date(now);

    if (todayStats.completed > 0 && todayStats.completed >= Math.ceil(todayStats.total * 0.5)) {
      streak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayKey = this.formatDateKey(checkDate);
      const yStats = this.getDayStats(yesterdayKey);
      if (yStats.completed === 0 || yStats.completed < Math.ceil(yStats.total * 0.5)) {
        return 0;
      }
    }

    while (true) {
      const key = this.formatDateKey(checkDate);
      const s = this.getDayStats(key);
      if (s.total > 0 && s.completed >= Math.ceil(s.total * 0.5)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  getTotalCompletions() {
    let total = 0;
    Object.keys(this.history).forEach(date => {
      const records = this.history[date] || {};
      Object.keys(records).forEach(hId => {
        if (records[hId]) total++;
      });
    });
    return total;
  }

  getBestStreak() {
    const current = this.getGlobalStreak();
    const dates = Object.keys(this.history).sort();
    let max = current;
    let temp = 0;

    dates.forEach(d => {
      const s = this.getDayStats(d);
      if (s.total > 0 && s.completed >= Math.ceil(s.total * 0.5)) {
        temp++;
        if (temp > max) max = temp;
      } else {
        temp = 0;
      }
    });

    return Math.max(max, current, 3);
  }

  // ==================== NOTIFICATIONS ====================
  getNotifications() {
    return this.notifications;
  }

  addNotification(notif) {
    const newNotif = {
      id: 'notif_' + Date.now(),
      title: notif.title.trim(),
      message: notif.message.trim(),
      time: notif.time || '20:00',
      category: notif.category || "Kundalik",
      enabled: notif.enabled !== undefined ? notif.enabled : true
    };
    this.notifications.push(newNotif);
    this.save(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    return newNotif;
  }

  toggleNotification(id) {
    const n = this.notifications.find(item => item.id === id);
    if (n) {
      n.enabled = !n.enabled;
      this.save(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
      return n.enabled;
    }
    return false;
  }

  deleteNotification(id) {
    this.notifications = this.notifications.filter(item => item.id !== id);
    this.save(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
  }

  // ==================== SETTINGS & BACKUP ====================
  getSettings() {
    return this.settings;
  }

  updateSettings(settingsData) {
    this.settings = {
      ...this.settings,
      ...settingsData
    };
    this.save(STORAGE_KEYS.SETTINGS, this.settings);
    return this.settings;
  }

  exportAllData() {
    const backup = {
      appName: 'Intizomly',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      users: this.users,
      currentUser: this.currentUser,
      habits: this.habits,
      history: this.history,
      notifications: this.notifications,
      settings: this.settings
    };
    return JSON.stringify(backup, null, 2);
  }

  importAllData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.users && Array.isArray(data.users)) {
        this.users = data.users;
        this.save(STORAGE_KEYS.USERS, this.users);
      }
      if (data.currentUser) {
        this.currentUser = data.currentUser;
        this.save(STORAGE_KEYS.CURRENT_USER, this.currentUser);
      }
      if (data.habits && Array.isArray(data.habits)) {
        this.habits = data.habits;
        this.save(STORAGE_KEYS.HABITS, this.habits);
      }
      if (data.history) {
        this.history = data.history;
        this.save(STORAGE_KEYS.HISTORY, this.history);
      }
      if (data.notifications && Array.isArray(data.notifications)) {
        this.notifications = data.notifications;
        this.save(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
      }
      if (data.settings) {
        this.settings = data.settings;
        this.save(STORAGE_KEYS.SETTINGS, this.settings);
      }
      return true;
    } catch (e) {
      console.error('Failed to import backup:', e);
      return false;
    }
  }

  resetAllData() {
    localStorage.clear();
    this.users = JSON.parse(JSON.stringify(DEFAULT_USERS));
    this.currentUser = this.users[2]; // Default Oddiy user
    this.habits = JSON.parse(JSON.stringify(DEFAULT_HABITS));
    this.history = {};
    this.notifications = JSON.parse(JSON.stringify(DEFAULT_NOTIFICATIONS));
    this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    this.initDefaults();
  }
}

window.appStorage = new StorageManager();
