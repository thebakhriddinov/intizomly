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
  SETTINGS: 'intizomly_settings_v2',
  MOTIVATION_VIDEOS: 'intizomly_motivation_videos_v2',
  REMINDERS: 'intizomly_reminders_v2',
  NOTES: 'intizomly_notes_v2',
  CHALLENGES: 'intizomly_challenges_v2',
  PROFILE_EXTRAS: 'intizomly_profile_extras_v2'
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

export const DEFAULT_MOTIVATION_VIDEOS = [
  {
    id: 'vid_shelby_1',
    title: "Thomas Shelby — Qat'iy Intizom va Diqqat Qoidalari",
    author: "Thomas Shelby / Peaky Blinders",
    youtubeId: "5r3Cj9YhJtM",
    embedUrl: "https://www.youtube.com/embed/5r3Cj9YhJtM",
    quote: "Kuchsiz odam his-tuyg'ulariga bo'ysunadi. Kuchli odam esa his-tuyg'ularini intizomiga bo'ysundiradi.",
    likes: 342,
    addedBy: "Admin",
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 'vid_shelby_2',
    title: "Thomas Shelby — Sovuqqon Xotirjamlik va Yengilmas Iroda",
    author: "Thomas Shelby / Peaky Blinders",
    youtubeId: "fD3qZ8_U9lA",
    embedUrl: "https://www.youtube.com/embed/fD3qZ8_U9lA",
    quote: "Hech qachon dushmaningizga g'azabingizni ko'rsatmang. Shunchaki rejangizni jimgina bajaring.",
    likes: 489,
    addedBy: "Admin",
    createdAt: Date.now() - 86400000 * 5
  }
];

export const DEFAULT_REMINDERS = [
  {
    id: 'rem_1',
    title: "Ertalabki reja va 1 stakan iliq suv",
    time: "07:00",
    category: "Sog'liq",
    enabled: true,
    completed: false
  },
  {
    id: 'rem_2',
    title: "Diqqatni jamlab 20 bet kitob mutolaasi",
    time: "14:30",
    category: "O'qish",
    enabled: true,
    completed: false
  },
  {
    id: 'rem_3',
    title: "Kechki intizom xulosasi va ertangi kun rejasi",
    time: "21:30",
    category: "Tartib",
    enabled: true,
    completed: false
  }
];

export const DEFAULT_NOTES = [
  {
    id: 'note_1',
    title: "Mening 2026-yilgi intizom maqsadlarim",
    content: "1. Har kuni reja bo'yicha yashash.\n2. Shakar va ortiqcha vaqt o'g'rilaridan butunlay voz kechish.\n3. Har oyda kamida 2 ta kitobni tugatish.",
    category: "Maqsad",
    color: "emerald",
    updatedAt: new Date().toISOString().split('T')[0]
  },
  {
    id: 'note_2',
    title: "Thomas Shelby aytgan asosiy tamoyil",
    content: "Har qanday vaziyatda xotirjamlikni saqla. Intizom — hissiyotlar ustidan mutlaq g'alabadir.",
    category: "Fikr",
    color: "amber",
    updatedAt: new Date().toISOString().split('T')[0]
  }
];

export const DEFAULT_CHALLENGES = [
  {
    id: 'ch_no_sugar',
    title: "No Sugar Challenge (30 Kun)",
    emoji: "🚫🍬",
    description: "Ortiqcha shakar, gazli shirin ichimliklar va shirinliklardan butunlay xalos bo'lish ligasi.",
    participantsCount: 84,
    badgeName: "Shakar Qotili 🛡️",
    joined: false,
    leaderboard: [
      { rank: 1, name: "Mustafo Bakhriddinov", streak: 38, completionRate: 100, points: 1950, isCurrent: false, avatarGradient: "linear-gradient(135deg, #10b981, #06b6d4)" },
      { rank: 2, name: "Malika Karimova", streak: 29, completionRate: 96, points: 1450, isCurrent: false, avatarGradient: "linear-gradient(135deg, #f59e0b, #ef4444)" },
      { rank: 3, name: "Jasur Rahimov", streak: 24, completionRate: 92, points: 1200, isCurrent: false, avatarGradient: "linear-gradient(135deg, #3b82f6, #8b5cf6)" },
      { rank: 4, name: "Alisher Qodirov", streak: 19, completionRate: 88, points: 950, isCurrent: false, avatarGradient: "linear-gradient(135deg, #6366f1, #a855f7)" },
      { rank: 5, name: "Dilorom Yusupova", streak: 14, completionRate: 85, points: 700, isCurrent: false, avatarGradient: "linear-gradient(135deg, #ec4899, #f43f5e)" }
    ]
  },
  {
    id: 'ch_early_birds',
    title: "Early Birds 06:00 AM (Tonggi Baraka)",
    emoji: "⏰",
    description: "Har kuni tongda 06:00 dan kechikmasdan uyg'onib, kuningizni unumli boshlash musobaqasi.",
    participantsCount: 128,
    badgeName: "Tonggi Lochin 🦅",
    joined: false,
    leaderboard: [
      { rank: 1, name: "Sanjar Beknazarov", streak: 42, completionRate: 100, points: 2100, isCurrent: false, avatarGradient: "linear-gradient(135deg, #f59e0b, #b6f36b)" },
      { rank: 2, name: "Mustafo Bakhriddinov", streak: 35, completionRate: 98, points: 1750, isCurrent: false, avatarGradient: "linear-gradient(135deg, #10b981, #06b6d4)" },
      { rank: 3, name: "Nodira Saidova", streak: 31, completionRate: 94, points: 1550, isCurrent: false, avatarGradient: "linear-gradient(135deg, #8b5cf6, #ec4899)" }
    ]
  },
  {
    id: 'ch_water_master',
    title: "Hydro Master 2 Litr",
    emoji: "💧",
    description: "Tanani toza va tetik saqlash uchun har kuni kamida 2 litr toza suv ichish chempionati.",
    participantsCount: 195,
    badgeName: "Suv Manbai 🌊",
    joined: false,
    leaderboard: [
      { rank: 1, name: "Malika Karimova", streak: 45, completionRate: 100, points: 2250, isCurrent: false, avatarGradient: "linear-gradient(135deg, #06b6d4, #3b82f6)" },
      { rank: 2, name: "Azizbek Normatov", streak: 33, completionRate: 97, points: 1650, isCurrent: false, avatarGradient: "linear-gradient(135deg, #10b981, #b6f36b)" }
    ]
  },
  {
    id: 'ch_reading_club',
    title: "Kitobxonlar 20 Bet Marafoni",
    emoji: "📖",
    description: "Kuniga kamida 20 bet kitob mutolaa qilib, aql va zakovatni charxlash ligasi.",
    participantsCount: 76,
    badgeName: "Donolik Maskani 📚",
    joined: false,
    leaderboard: [
      { rank: 1, name: "Farrux Zokirov", streak: 51, completionRate: 100, points: 2550, isCurrent: false, avatarGradient: "linear-gradient(135deg, #6366f1, #3b82f6)" },
      { rank: 2, name: "Mustafo Bakhriddinov", streak: 27, completionRate: 95, points: 1350, isCurrent: false, avatarGradient: "linear-gradient(135deg, #10b981, #06b6d4)" }
    ]
  }
];

export const DEFAULT_PROFILE_EXTRAS = {
  avatarUrl: "",
  bio: "Intizom — bu o'z xohishlaringiz ustidan mutlaq g'alaba qozonishdir. Har kuni 1% yaxshiroq! 🚀",
  socialLinks: [
    { id: 'soc_tg', platform: 'telegram', username: 'thebakhriddinov', label: 'Telegram', icon: 'tg' },
    { id: 'soc_ig', platform: 'instagram', username: 'bakhriddinov_m', label: 'Instagram', icon: 'ig' },
    { id: 'soc_gh', platform: 'github', username: 'thebakhriddinov', label: 'GitHub', icon: 'gh' }
  ],
  followers: [
    { id: 'f_1', name: 'Malika Karimova', role: 'premium', streak: 29, avatarGradient: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
    { id: 'f_2', name: 'Alisher Qodirov', role: 'user', streak: 19, avatarGradient: 'linear-gradient(135deg, #6366f1, #a855f7)' },
    { id: 'f_3', name: 'Jasur Rahimov', role: 'user', streak: 24, avatarGradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }
  ],
  following: [
    { id: 'f_1', name: 'Malika Karimova', role: 'premium', streak: 29, avatarGradient: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
    { id: 'f_2', name: 'Alisher Qodirov', role: 'user', streak: 19, avatarGradient: 'linear-gradient(135deg, #6366f1, #a855f7)' }
  ],
  followRequests: [
    { id: 'req_1', name: 'Dilorom Yusupova', streak: 14, time: '2 soat oldin' }
  ]
};

export const BADGES_CONFIG = [
  {
    streakReq: 10,
    id: 'badge_10',
    title: "Boshlang'ich Temir Iroda",
    description: "10 kunlik to'xtovsiz intizomga erishildi",
    icon: "🥉",
    color: "#CD7F32",
    glow: "rgba(205, 127, 50, 0.45)",
    tag: "BRONZE MASTER"
  },
  {
    streakReq: 20,
    id: 'badge_20',
    title: "Kumush Matonat",
    description: "20 kunlik uzluksiz intizom zanjiri",
    icon: "🥈",
    color: "#E2E8F0",
    glow: "rgba(226, 232, 240, 0.45)",
    tag: "SILVER TITAN"
  },
  {
    streakReq: 50,
    id: 'badge_50',
    title: "Oltin Odatlar Sohibi",
    description: "50 kunlik yangi xarakter shakllandi",
    icon: "🥇",
    color: "#FBBF24",
    glow: "rgba(251, 191, 36, 0.5)",
    tag: "GOLDEN CHAMPION"
  },
  {
    streakReq: 70,
    id: 'badge_70',
    title: "Olmos Qat'iyat",
    description: "70 kunlik mutlaq intizom cho'qqisi",
    icon: "💎",
    color: "#06B6D4",
    glow: "rgba(6, 182, 212, 0.55)",
    tag: "DIAMOND PERSISTENCE"
  },
  {
    streakReq: 90,
    id: 'badge_90',
    title: "Qirollik Tartibi",
    description: "90 kun — o'z hayotini to'liq o'zgartirgan shaxs",
    icon: "👑",
    color: "#A855F7",
    glow: "rgba(168, 85, 247, 0.55)",
    tag: "ROYAL SOVEREIGN"
  },
  {
    streakReq: 100,
    id: 'badge_100',
    title: "Afsonaviy Yengilmas",
    description: "100 kunlik afsonaviy g'alaba va yengilmas iroda",
    icon: "🔥",
    color: "#B6F36B",
    glow: "rgba(182, 243, 107, 0.65)",
    tag: "IMMORTAL TITAN"
  }
];

class StorageManager {
  constructor() {
    this.users = this.load(STORAGE_KEYS.USERS, null);
    this.currentUser = this.load(STORAGE_KEYS.CURRENT_USER, null);
    this.habits = this.load(STORAGE_KEYS.HABITS, null);
    this.history = this.load(STORAGE_KEYS.HISTORY, null);
    this.notifications = this.load(STORAGE_KEYS.NOTIFICATIONS, null);
    this.settings = this.load(STORAGE_KEYS.SETTINGS, null);
    this.videos = this.load(STORAGE_KEYS.MOTIVATION_VIDEOS, null);
    this.reminders = this.load(STORAGE_KEYS.REMINDERS, null);
    this.notes = this.load(STORAGE_KEYS.NOTES, null);
    this.challenges = this.load(STORAGE_KEYS.CHALLENGES, null);
    this.profileExtras = this.load(STORAGE_KEYS.PROFILE_EXTRAS, null);

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

    // 7. Motivation Videos
    if (!this.videos || !Array.isArray(this.videos) || this.videos.length === 0) {
      this.videos = JSON.parse(JSON.stringify(DEFAULT_MOTIVATION_VIDEOS));
      this.save(STORAGE_KEYS.MOTIVATION_VIDEOS, this.videos);
    }

    // 8. Reminders
    if (!this.reminders || !Array.isArray(this.reminders)) {
      this.reminders = JSON.parse(JSON.stringify(DEFAULT_REMINDERS));
      this.save(STORAGE_KEYS.REMINDERS, this.reminders);
    }

    // 9. Notes
    if (!this.notes || !Array.isArray(this.notes)) {
      this.notes = JSON.parse(JSON.stringify(DEFAULT_NOTES));
      this.save(STORAGE_KEYS.NOTES, this.notes);
    }

    // 10. Challenges & Rankings
    if (!this.challenges || !Array.isArray(this.challenges)) {
      this.challenges = JSON.parse(JSON.stringify(DEFAULT_CHALLENGES));
      this.save(STORAGE_KEYS.CHALLENGES, this.challenges);
    }

    // 11. Profile Extras
    if (!this.profileExtras || typeof this.profileExtras !== 'object') {
      this.profileExtras = JSON.parse(JSON.stringify(DEFAULT_PROFILE_EXTRAS));
      this.save(STORAGE_KEYS.PROFILE_EXTRAS, this.profileExtras);
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

  // ==================== MOTIVATION VIDEOS ====================
  getMotivationVideos() {
    return this.videos || DEFAULT_MOTIVATION_VIDEOS;
  }

  addMotivationVideo({ title, youtubeUrl, quote, author }) {
    let yId = youtubeUrl.trim();
    if (yId.includes('v=')) {
      yId = yId.split('v=')[1].split('&')[0];
    } else if (yId.includes('youtu.be/')) {
      yId = yId.split('youtu.be/')[1].split('?')[0];
    } else if (yId.includes('embed/')) {
      yId = yId.split('embed/')[1].split('?')[0];
    }

    const newVideo = {
      id: 'vid_' + Date.now(),
      title: title.trim(),
      author: author?.trim() || "Thomas Shelby / Motivatsiya",
      youtubeId: yId,
      embedUrl: `https://www.youtube.com/embed/${yId}`,
      quote: quote?.trim() || "Intizom — bu o'z his-tuyg'ularing ustidan mutlaq g'alabadir.",
      likes: 120,
      addedBy: "Admin",
      createdAt: Date.now()
    };

    if (!Array.isArray(this.videos)) this.videos = [];
    this.videos.unshift(newVideo);
    this.save(STORAGE_KEYS.MOTIVATION_VIDEOS, this.videos);
    return newVideo;
  }

  deleteMotivationVideo(id) {
    if (!Array.isArray(this.videos)) return false;
    const idx = this.videos.findIndex(v => v.id === id);
    if (idx !== -1) {
      this.videos.splice(idx, 1);
      this.save(STORAGE_KEYS.MOTIVATION_VIDEOS, this.videos);
      return true;
    }
    return false;
  }

  likeMotivationVideo(id) {
    if (!Array.isArray(this.videos)) return 0;
    const v = this.videos.find(item => item.id === id);
    if (v) {
      v.likes = (v.likes || 0) + 1;
      this.save(STORAGE_KEYS.MOTIVATION_VIDEOS, this.videos);
      return v.likes;
    }
    return 0;
  }

  // ==================== REMINDERS ====================
  getReminders() {
    return this.reminders || DEFAULT_REMINDERS;
  }

  addReminder({ title, time, category }) {
    if (!Array.isArray(this.reminders)) this.reminders = [];
    const newRem = {
      id: 'rem_' + Date.now(),
      title: title.trim(),
      time: time || "09:00",
      category: category || "Tartib",
      enabled: true,
      completed: false
    };
    this.reminders.push(newRem);
    this.save(STORAGE_KEYS.REMINDERS, this.reminders);
    return newRem;
  }

  toggleReminder(id) {
    if (!Array.isArray(this.reminders)) return null;
    const r = this.reminders.find(item => item.id === id);
    if (r) {
      r.enabled = !r.enabled;
      this.save(STORAGE_KEYS.REMINDERS, this.reminders);
      return r;
    }
    return null;
  }

  toggleReminderCompleted(id) {
    if (!Array.isArray(this.reminders)) return null;
    const r = this.reminders.find(item => item.id === id);
    if (r) {
      r.completed = !r.completed;
      this.save(STORAGE_KEYS.REMINDERS, this.reminders);
      return r;
    }
    return null;
  }

  deleteReminder(id) {
    if (!Array.isArray(this.reminders)) return false;
    const idx = this.reminders.findIndex(item => item.id === id);
    if (idx !== -1) {
      this.reminders.splice(idx, 1);
      this.save(STORAGE_KEYS.REMINDERS, this.reminders);
      return true;
    }
    return false;
  }

  // ==================== NOTES ====================
  getNotes() {
    return this.notes || DEFAULT_NOTES;
  }

  addNote({ title, content, category, color }) {
    if (!Array.isArray(this.notes)) this.notes = [];
    const newNote = {
      id: 'note_' + Date.now(),
      title: title.trim(),
      content: content.trim(),
      category: category || "Shaxsiy",
      color: color || "emerald",
      updatedAt: new Date().toISOString().split('T')[0]
    };
    this.notes.unshift(newNote);
    this.save(STORAGE_KEYS.NOTES, this.notes);
    return newNote;
  }

  updateNote(id, { title, content, category, color }) {
    if (!Array.isArray(this.notes)) return null;
    const n = this.notes.find(item => item.id === id);
    if (n) {
      if (title !== undefined) n.title = title.trim();
      if (content !== undefined) n.content = content.trim();
      if (category !== undefined) n.category = category;
      if (color !== undefined) n.color = color;
      n.updatedAt = new Date().toISOString().split('T')[0];
      this.save(STORAGE_KEYS.NOTES, this.notes);
      return n;
    }
    return null;
  }

  deleteNote(id) {
    if (!Array.isArray(this.notes)) return false;
    const idx = this.notes.findIndex(item => item.id === id);
    if (idx !== -1) {
      this.notes.splice(idx, 1);
      this.save(STORAGE_KEYS.NOTES, this.notes);
      return true;
    }
    return false;
  }

  // ==================== CHALLENGES & RANKINGS ====================
  getChallenges() {
    return this.challenges || DEFAULT_CHALLENGES;
  }

  joinChallenge(id, currentUser) {
    if (!Array.isArray(this.challenges)) this.challenges = [];
    const ch = this.challenges.find(item => item.id === id);
    if (!ch) return null;
    ch.joined = true;
    ch.participantsCount = (ch.participantsCount || 0) + 1;

    const currentName = currentUser
      ? `${currentUser.firstName || 'Men'} ${currentUser.lastName || ''}`.trim()
      : 'Siz (Foydalanuvchi)';
    const exists = ch.leaderboard?.some(row => row.isCurrent || row.name === currentName);
    if (!exists) {
      const curStreak = this.getGlobalStreak() || 12;
      if (!Array.isArray(ch.leaderboard)) ch.leaderboard = [];
      ch.leaderboard.push({
        rank: ch.leaderboard.length + 1,
        name: currentName,
        streak: curStreak,
        completionRate: 95,
        points: curStreak * 50,
        isCurrent: true,
        avatarGradient: currentUser?.avatarGradient || "linear-gradient(135deg, #10b981, #b6f36b)"
      });
      ch.leaderboard.sort((a, b) => b.points - a.points);
      ch.leaderboard.forEach((item, index) => { item.rank = index + 1; });
    }

    this.save(STORAGE_KEYS.CHALLENGES, this.challenges);
    return ch;
  }

  leaveChallenge(id) {
    if (!Array.isArray(this.challenges)) return null;
    const ch = this.challenges.find(item => item.id === id);
    if (!ch) return null;
    ch.joined = false;
    ch.participantsCount = Math.max(1, (ch.participantsCount || 1) - 1);
    ch.leaderboard = (ch.leaderboard || []).filter(row => !row.isCurrent);
    ch.leaderboard.forEach((item, index) => { item.rank = index + 1; });

    this.save(STORAGE_KEYS.CHALLENGES, this.challenges);
    return ch;
  }

  // ==================== PROFILE EXTRAS & SOCIALS ====================
  getProfileExtras() {
    return this.profileExtras || DEFAULT_PROFILE_EXTRAS;
  }

  updateProfileExtras(updates) {
    this.profileExtras = { ...this.getProfileExtras(), ...updates };
    this.save(STORAGE_KEYS.PROFILE_EXTRAS, this.profileExtras);
    return this.profileExtras;
  }

  addSocialLink({ platform, username }) {
    const extras = this.getProfileExtras();
    const cleanUser = username.replace(/^@/, '').trim();
    const newLink = {
      id: 'soc_' + Date.now(),
      platform,
      username: cleanUser,
      label: platform.charAt(0).toUpperCase() + platform.slice(1),
      icon: platform === 'telegram' ? 'tg' : platform === 'instagram' ? 'ig' : platform === 'youtube' ? 'yt' : platform === 'github' ? 'gh' : 'x'
    };
    extras.socialLinks = [...(extras.socialLinks || []), newLink];
    this.updateProfileExtras(extras);
    return extras;
  }

  deleteSocialLink(id) {
    const extras = this.getProfileExtras();
    extras.socialLinks = (extras.socialLinks || []).filter(item => item.id !== id);
    this.updateProfileExtras(extras);
    return extras;
  }

  followUser(userToFollow) {
    const extras = this.getProfileExtras();
    if (!Array.isArray(extras.following)) extras.following = [];
    const exists = extras.following.some(f => f.id === userToFollow.id);
    if (!exists) {
      extras.following.push(userToFollow);
      this.updateProfileExtras(extras);
    }
    return extras;
  }

  unfollowUser(userId) {
    const extras = this.getProfileExtras();
    extras.following = (extras.following || []).filter(f => f.id !== userId);
    this.updateProfileExtras(extras);
    return extras;
  }

  acceptFollowRequest(reqId) {
    const extras = this.getProfileExtras();
    const req = extras.followRequests?.find(r => r.id === reqId);
    if (req) {
      extras.followRequests = extras.followRequests.filter(r => r.id !== reqId);
      extras.followers = [
        ...(extras.followers || []),
        { id: req.id, name: req.name, streak: req.streak, avatarGradient: "linear-gradient(135deg, #10b981, #06b6d4)", role: 'user' }
      ];
      this.updateProfileExtras(extras);
    }
    return extras;
  }

  // ==================== BADGES ENGINE ====================
  getBadgesStatus(currentStreak) {
    const streak = currentStreak || 0;
    return BADGES_CONFIG.map(badge => {
      const isUnlocked = streak >= badge.streakReq;
      const progressPct = isUnlocked ? 100 : Math.min(100, Math.round((streak / badge.streakReq) * 100));
      return {
        ...badge,
        isUnlocked,
        progressPct,
        currentStreak: streak
      };
    });
  }
}

export const storage = new StorageManager();
