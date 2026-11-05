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
  PROFILE_EXTRAS: 'intizomly_profile_extras_v2',
  PUBLIC_PROFILES: 'intizomly_public_profiles_v2',
  APP_LIMITS: 'intizomly_app_limits_v2',
  SCREEN_TIME: 'intizomly_screen_time_v2'
};

export const DEFAULT_APP_LIMITS = [
  {
    id: 'app_instagram',
    name: 'Instagram',
    category: 'Ijtimoiy tarmoq',
    icon: 'instagram',
    color: '#E1306C',
    url: 'https://www.instagram.com',
    appScheme: 'instagram://app',
    timeSpent: 25,
    limit: 60,
    enabled: true
  },
  {
    id: 'app_telegram',
    name: 'Telegram',
    category: 'Messenjer & Aloqa',
    icon: 'telegram',
    color: '#229ED9',
    url: 'https://web.telegram.org/k/',
    appScheme: 'tg://resolve',
    timeSpent: 30,
    limit: 90,
    enabled: true
  },
  {
    id: 'app_youtube',
    name: 'YouTube',
    category: 'Video & Darslar',
    icon: 'youtube',
    color: '#FF0000',
    url: 'https://www.youtube.com',
    appScheme: 'vnd.youtube://',
    timeSpent: 20,
    limit: 45,
    enabled: true
  },
  {
    id: 'app_tiktok',
    name: 'TikTok',
    category: 'Qisqa videolar',
    icon: 'tiktok',
    color: '#00F2FE',
    url: 'https://www.tiktok.com',
    appScheme: 'snssdk1233://',
    timeSpent: 35,
    limit: 30,
    enabled: true
  },
  {
    id: 'app_browser',
    name: 'Brauzer & Web',
    category: 'Internet & Qidiruv',
    icon: 'web',
    color: '#10B981',
    url: 'https://www.google.com',
    appScheme: '',
    timeSpent: 15,
    limit: 60,
    enabled: false
  }
];

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

export const saveUserPassword = (key, password) => {
  if (!key || !password) return;
  try {
    const raw = localStorage.getItem('intizomly_user_passwords');
    const map = raw ? JSON.parse(raw) : {};
    const cleanPass = String(password).trim();
    map[String(key).toLowerCase().trim()] = cleanPass;
    const digits = String(key).replace(/\D/g, '');
    if (digits.length >= 7) {
      map[digits] = cleanPass;
      if (digits.length === 9) map['998' + digits] = cleanPass;
    }
    localStorage.setItem('intizomly_user_passwords', JSON.stringify(map));
  } catch (e) { }
};

export const getUserPassword = (userOrId) => {
  try {
    if (userOrId && typeof userOrId === 'object') {
      if (userOrId.password && typeof userOrId.password === 'string' && userOrId.password.trim()) {
        return userOrId.password.trim();
      }
    }

    const raw = localStorage.getItem('intizomly_user_passwords');
    const map = raw ? JSON.parse(raw) : {};

    if (typeof userOrId === 'string') {
      const q = userOrId.toLowerCase().trim();
      const digits = q.replace(/\D/g, '');
      return map[q] || map[digits] || '';
    }

    if (userOrId && typeof userOrId === 'object') {
      const id = String(userOrId.id || '').toLowerCase();
      const email = String(userOrId.email || '').toLowerCase();
      const phone = String(userOrId.phone || '');
      const digits = phone.replace(/\D/g, '');

      const found = map[id] || map[email] || map[digits] || map[phone];
      if (found) return found;

      return '';
    }
  } catch (e) { }
  return '';
};

export const DEFAULT_HABITS = [
  {
    id: 'habit_sugar',
    title: "Shakar iste'mol qilmaslik",
    emoji: '🚫🍬',
    description: "Kun davomida qo'shimcha shakar, shirinliklar va shakarli ichimliklardan butunlay voz kechish",
    category: "Sog'liq",
    target: "Kun bo'yi toza",
    time: "20:00",
    createdAt: Date.now() - 86400000 * 7
  },
  {
    id: 'habit_reading',
    title: "Kitob o'qish (20 bet)",
    emoji: '📖',
    description: "Shaxsiy rivojlanish, intellekt yoki badiiy adabiyotdan kamida 20 bet mutolaa qilish",
    category: "O'qish",
    target: "20 bet",
    time: "14:00",
    createdAt: Date.now() - 86400000 * 7
  },
  {
    id: 'habit_water',
    title: "Kamida 2 litr toza suv ichish",
    emoji: '💧',
    description: "Har 1.5 - 2 soatda 1 stakan toza suv ichib, ichki organizmni tetik saqlash",
    category: "Sog'liq",
    target: "2 litr",
    time: "16:00",
    createdAt: Date.now() - 86400000 * 7
  },
  {
    id: 'habit_workout',
    title: "30 daqiqa jismoniy mashq",
    emoji: '🏃‍♂️',
    description: "Ertalabki yugurish, turnik yoki kuchaytirilgan gimnastika mashqlari",
    category: "Sport",
    target: "30 daqiqa",
    time: "07:30",
    createdAt: Date.now() - 86400000 * 7
  },
  {
    id: 'habit_early_wake',
    title: "Ertalab 06:30 da uyg'onish",
    emoji: '⏰',
    description: "Kunning barakali qismini qo'ldan boy bermaslik va rejalarni unumli boshlash",
    category: "Tartib",
    target: "06:30 da",
    time: "06:30",
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
    title: "Thomas Shelby — Sovuqqon Iroda va Qat'iy Intizom",
    author: "Thomas Shelby / Peaky Blinders",
    youtubeId: "NmS8_Ls9qyU",
    embedUrl: "https://www.youtube.com/embed/NmS8_Ls9qyU",
    quote: "Kuchsiz odam his-tuyg'ulariga bo'ysunadi. Kuchli odam esa his-tuyg'ularini intizomiga bo'ysundiradi.",
    likes: 342,
    addedBy: "Admin",
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 'vid_shelby_2',
    title: "Thomas Shelby — Qat'iyat va Yengilmas Xarakter Saboqlari",
    author: "Thomas Shelby / Peaky Blinders",
    youtubeId: "WFyEBIJ2Q_8",
    embedUrl: "https://www.youtube.com/embed/WFyEBIJ2Q_8",
    quote: "Hech qachon dushmaningizga g'azabingizni ko'rsatmang. Shunchaki rejangizni jimgina bajaring.",
    likes: 489,
    addedBy: "Admin",
    createdAt: Date.now() - 86400000 * 5
  },
  {
    id: 'vid_shelby_3',
    title: "Thomas Shelby — Yolg'iz Qadam va Shaxsiy Kuch",
    author: "Thomas Shelby / Peaky Blinders",
    youtubeId: "AJsa0FSlHwc",
    embedUrl: "https://www.youtube.com/embed/AJsa0FSlHwc",
    quote: "Agar buyuk maqsadlarga erishmoqchi bo'lsang, ko'pchilikning olqishini kutishni to'xtatishing kerak.",
    likes: 560,
    addedBy: "Admin",
    createdAt: Date.now() - 86400000 * 7
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
    participantsCount: 5,
    badgeName: "Shakar Qotili 🛡️",
    joined: true,
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
    participantsCount: 3,
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
    participantsCount: 2,
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
    participantsCount: 2,
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
  bio: "",
  socialLinks: [],
  followers: [],
  following: [],
  followRequests: []
};

export const DEFAULT_PUBLIC_PROFILES = {};

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

    // 7. Motivation Videos (Avtomatik tozalash va yangilash)
    const hasBrokenVideos = Array.isArray(this.videos) && this.videos.some(v =>
      !v.youtubeId ||
      v.youtubeId.trim().length !== 11 ||
      v.youtubeId === '5r3Cj9YhJtM' ||
      v.youtubeId === 'fD3qZ8_U9lA'
    );
    if (!this.videos || !Array.isArray(this.videos) || this.videos.length === 0 || hasBrokenVideos) {
      const customVideos = Array.isArray(this.videos)
        ? this.videos.filter(v =>
          v.youtubeId &&
          v.youtubeId.trim().length === 11 &&
          v.youtubeId !== '5r3Cj9YhJtM' &&
          v.youtubeId !== 'fD3qZ8_U9lA' &&
          !DEFAULT_MOTIVATION_VIDEOS.some(dv => dv.youtubeId === v.youtubeId)
        )
        : [];
      this.videos = [...DEFAULT_MOTIVATION_VIDEOS, ...customVideos];
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
    if (!this.challenges || !Array.isArray(this.challenges) || this.challenges.length === 0) {
      this.challenges = JSON.parse(JSON.stringify(DEFAULT_CHALLENGES));
      this.save(STORAGE_KEYS.CHALLENGES, this.challenges);
    } else {
      // Ensure default requirements: if all challenges are unjoined, join only ch_no_sugar
      const joinedCount = this.challenges.filter(c => c.joined).length;
      if (joinedCount === 0) {
        this.challenges = this.challenges.map(c => ({
          ...c,
          joined: c.id === 'ch_no_sugar'
        }));
        this.save(STORAGE_KEYS.CHALLENGES, this.challenges);
      }
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

  addHabit({ title, emoji, description, category, target, time, isPinned }) {
    const newHabit = {
      id: 'habit_' + Date.now(),
      title: title.trim(),
      emoji: emoji || '🎯',
      description: (description || '').trim(),
      category: category || "Kundalik",
      target: target || "1 marta",
      time: (time || '').trim(),
      isPinned: !!isPinned,
      createdAt: Date.now()
    };

    this.habits.push(newHabit);
    this.save(STORAGE_KEYS.HABITS, this.habits);
    return newHabit;
  }

  updateHabit(id, { title, emoji, description, category, target, time, isPinned }) {
    const h = this.habits.find(item => item.id === id);
    if (!h) return null;

    if (title !== undefined) h.title = title.trim();
    if (emoji !== undefined) h.emoji = emoji;
    if (description !== undefined) h.description = (description || '').trim();
    if (category !== undefined) h.category = category;
    if (target !== undefined) h.target = target;
    if (time !== undefined) h.time = (time || '').trim();
    if (isPinned !== undefined) h.isPinned = !!isPinned;

    this.save(STORAGE_KEYS.HABITS, this.habits);
    return h;
  }

  getActiveCurrentHabitId(habitsList, historyMap, dateKey) {
    const list = Array.isArray(habitsList) ? habitsList : this.habits;
    if (!list || list.length === 0) return null;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // 1. Manually pinned habit that is uncompleted today
    const manualPinned = list.find(h => h.isPinned && !this.isHabitCompleted(dateKey, h.id));
    if (manualPinned) return manualPinned.id;

    // 2. Uncompleted habits with a scheduled time
    const uncompletedWithTime = list.filter(h => {
      const isDone = this.isHabitCompleted(dateKey, h.id);
      return !isDone && h.time && /^\d{1,2}:\d{2}$/.test(h.time);
    });

    if (uncompletedWithTime.length === 0) {
      return null;
    }

    // 3. Find habit whose scheduled time is active or closest to current time
    let bestHabit = null;
    let minScore = Infinity;

    uncompletedWithTime.forEach(h => {
      const parts = h.time.split(':').map(Number);
      const habitMins = parts[0] * 60 + parts[1];
      const diff = Math.abs(currentMinutes - habitMins);

      // Give high priority if currently within active time window (-30 min before to +60 min after)
      const inActiveWindow = (currentMinutes >= habitMins - 30 && currentMinutes <= habitMins + 75);
      const score = inActiveWindow ? diff : diff + 500;

      if (score < minScore) {
        minScore = score;
        bestHabit = h;
      }
    });

    return bestHabit ? bestHabit.id : uncompletedWithTime[0].id;
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
    let list = this.videos || DEFAULT_MOTIVATION_VIDEOS;
    if (Array.isArray(list)) {
      // Har doim yaroqsiz yoki bo'sh ID li videolarni tozalaymiz
      const cleaned = list.filter(v => v && v.youtubeId && v.youtubeId.trim().length === 11);
      if (cleaned.length !== list.length) {
        this.videos = cleaned.length > 0 ? cleaned : DEFAULT_MOTIVATION_VIDEOS;
        this.save(STORAGE_KEYS.MOTIVATION_VIDEOS, this.videos);
        return this.videos;
      }
      return list;
    }
    return DEFAULT_MOTIVATION_VIDEOS;
  }

  addMotivationVideo({ title, youtubeUrl, youtubeId, quote, author, addedBy }) {
    let yId = (youtubeUrl || youtubeId || '').trim();

    // 1. Iframe src ichidan qidirish
    const iframeMatch = yId.match(/src=["']([^"']+)["']/i);
    if (iframeMatch) {
      yId = iframeMatch[1];
    }

    // 2. Aniq YouTube URL patternlari
    const match = yId.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+?&v=|shorts\/|live\/))([a-zA-Z0-9_-]{11})/);
    if (match) {
      yId = match[1];
    } else if (/^[a-zA-Z0-9_-]{11}$/.test(yId)) {
      // Allaqachon 11 belgili to'g'ri ID
    } else if (yId.includes('v=')) {
      yId = yId.split('v=')[1].split('&')[0];
    } else if (yId.includes('youtu.be/')) {
      yId = yId.split('youtu.be/')[1].split('?')[0];
    }

    // 3. Agar 11 belgili bo'lmasa, umumiy regex
    if (!yId || yId.length !== 11) {
      const anyMatch = yId.match(/([a-zA-Z0-9_-]{11})/);
      if (anyMatch) yId = anyMatch[1];
    }

    // Xavfsizlik fallback:
    if (!yId || yId.length !== 11) {
      yId = "NmS8_Ls9qyU";
    }

    const newVideo = {
      id: 'vid_' + Date.now(),
      title: (title || '').trim() || "Thomas Shelby — Intizom Saboqlari",
      author: author?.trim() || "Thomas Shelby / Peaky Blinders",
      youtubeId: yId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${yId}`,
      quote: quote?.trim() || "Intizom — bu o'z his-tuyg'ularing ustidan mutlaq g'alabadir.",
      likes: Math.floor(Math.random() * 50) + 120,
      addedBy: addedBy || "Admin",
      createdAt: Date.now()
    };

    if (!Array.isArray(this.videos)) this.videos = [];
    this.videos.unshift(newVideo);
    this.save(STORAGE_KEYS.MOTIVATION_VIDEOS, this.videos);
    return newVideo;
  }

  updateMotivationVideo(id, updates) {
    if (!Array.isArray(this.videos)) return null;
    const idx = this.videos.findIndex(v => v.id === id);
    if (idx !== -1) {
      if (updates.youtubeUrl) {
        const match = updates.youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/);
        const yId = match ? match[1] : (updates.youtubeUrl.trim().length === 11 ? updates.youtubeUrl.trim() : this.videos[idx].youtubeId);
        updates.youtubeId = yId;
        updates.embedUrl = `https://www.youtube.com/embed/${yId}`;
        delete updates.youtubeUrl;
      }
      this.videos[idx] = { ...this.videos[idx], ...updates, updatedAt: Date.now() };
      this.save(STORAGE_KEYS.MOTIVATION_VIDEOS, this.videos);
      return this.videos[idx];
    }
    return null;
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
    if (!ch) return { error: 'NOT_FOUND', message: "Musobaqa topilmadi" };

    if (ch.joined) {
      return { success: true, alreadyJoined: true, challenge: ch };
    }

    // Maksimal 4 ta musobaqaga bir vaqtda a'zo bo'lish cheklovi
    const joinedCount = this.challenges.filter(item => item.joined && item.id !== id).length;
    if (joinedCount >= 4) {
      return {
        error: 'MAX_LIMIT_REACHED',
        joinedCount,
        message: "Siz bir vaqtning o'zida ko'pi bilan 4 ta musobaqaga a'zo bo'la olasiz (4/4 limit)!"
      };
    }

    ch.joined = true;
    if (currentUser?.id) {
      this.saveChallengeParticipant(id, currentUser.id);
    }

    const currentName = currentUser
      ? `${currentUser.firstName || 'Men'} ${currentUser.lastName || ''}`.trim()
      : 'Siz (Foydalanuvchi)';
    if (!Array.isArray(ch.leaderboard)) ch.leaderboard = [];
    const exists = ch.leaderboard.some(row => row.isCurrent || row.name === currentName);
    if (!exists) {
      const curStreak = this.getGlobalStreak() || 12;
      ch.leaderboard.push({
        rank: ch.leaderboard.length + 1,
        id: currentUser?.id || 'usr_current',
        name: currentName,
        streak: curStreak,
        completionRate: 95,
        points: curStreak * 50,
        isCurrent: true,
        avatarGradient: currentUser?.avatarGradient || "linear-gradient(135deg, #10b981, #b6f36b)",
        avatarUrl: currentUser?.avatarUrl || ''
      });
      ch.leaderboard.sort((a, b) => b.points - a.points);
      ch.leaderboard.forEach((item, index) => { item.rank = index + 1; });
    }
    ch.participantsCount = ch.leaderboard.length;

    this.save(STORAGE_KEYS.CHALLENGES, this.challenges);
    return { success: true, challenge: ch };
  }

  leaveChallenge(id, currentUser) {
    if (!Array.isArray(this.challenges)) return null;
    const ch = this.challenges.find(item => item.id === id);
    if (!ch) return null;
    ch.joined = false;
    if (currentUser?.id) {
      this.removeChallengeParticipant(id, currentUser.id);
    }
    ch.leaderboard = (ch.leaderboard || []).filter(row => !row.isCurrent && row.id !== currentUser?.id);
    ch.leaderboard.forEach((item, index) => { item.rank = index + 1; });
    ch.participantsCount = ch.leaderboard.length;

    this.save(STORAGE_KEYS.CHALLENGES, this.challenges);
    return ch;
  }

  getChallengeParticipants(challengeId) {
    try {
      const raw = localStorage.getItem('intizomly_challenge_participants');
      const all = raw ? JSON.parse(raw) : {};
      return all[challengeId] || [];
    } catch {
      return [];
    }
  }

  saveChallengeParticipant(challengeId, userId) {
    if (!challengeId || !userId) return;
    try {
      const raw = localStorage.getItem('intizomly_challenge_participants');
      const all = raw ? JSON.parse(raw) : {};
      if (!Array.isArray(all[challengeId])) all[challengeId] = [];
      if (!all[challengeId].includes(userId)) {
        all[challengeId].push(userId);
      }
      localStorage.setItem('intizomly_challenge_participants', JSON.stringify(all));
    } catch { }
  }

  removeChallengeParticipant(challengeId, userId) {
    if (!challengeId || !userId) return;
    try {
      const raw = localStorage.getItem('intizomly_challenge_participants');
      const all = raw ? JSON.parse(raw) : {};
      if (Array.isArray(all[challengeId])) {
        all[challengeId] = all[challengeId].filter(id => id !== userId);
        localStorage.setItem('intizomly_challenge_participants', JSON.stringify(all));
      }
    } catch { }
  }

  addChallenge({ title, emoji, description, badgeName, targetDays = 30 }) {
    if (!Array.isArray(this.challenges)) {
      this.challenges = [...DEFAULT_CHALLENGES];
    }
    const newChallenge = {
      id: 'ch_' + Date.now(),
      title: (title || '').trim(),
      emoji: emoji || '🎯',
      description: (description || '').trim(),
      participantsCount: 0,
      badgeName: badgeName || "Intizom Qahramoni 🛡️",
      targetDays: parseInt(targetDays) || 30,
      joined: false,
      leaderboard: [],
      createdAt: Date.now()
    };
    this.challenges.unshift(newChallenge);
    this.save(STORAGE_KEYS.CHALLENGES, this.challenges);
    return newChallenge;
  }

  deleteChallenge(id) {
    if (!Array.isArray(this.challenges)) return false;
    this.challenges = this.challenges.filter(c => c.id !== id);
    this.save(STORAGE_KEYS.CHALLENGES, this.challenges);
    return true;
  }

  // ==================== PROFILE EXTRAS & SOCIALS ====================
  getProfileExtras() {
    let extras = this.profileExtras || { ...DEFAULT_PROFILE_EXTRAS };
    // Ensure clean state if previously seeded with fake mock users
    if (extras.followers && extras.followers.some(f => f.id === 'f_1' || f.id === 'f_2' || f.id === 'f_3')) {
      extras.followers = [];
    }
    if (extras.following && extras.following.some(f => f.id === 'f_1' || f.id === 'f_2')) {
      extras.following = [];
    }
    if (extras.followRequests && extras.followRequests.some(r => r.id === 'req_1')) {
      extras.followRequests = [];
    }
    return extras;
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

    // ==================== PUBLIC PROFILES & SOCIAL GRAPH ====================
    getAllPublicProfiles() {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.PUBLIC_PROFILES);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') return parsed;
        }
      } catch (e) { }
      return { ...DEFAULT_PUBLIC_PROFILES };
    }

    saveAllPublicProfiles(profilesMap) {
      try {
        localStorage.setItem(STORAGE_KEYS.PUBLIC_PROFILES, JSON.stringify(profilesMap));
      } catch (e) { }
    }

    getPublicProfile(userId, fallback = {}) {
      if (!userId) return null;
      const all = this.getAllPublicProfiles();
      let profile = all[userId];

      const rawFirst = (fallback.firstName || fallback.first_name || '').trim();
      const rawLast = (fallback.lastName || fallback.last_name || '').trim();
      let fullName = (fallback.name || `${rawFirst} ${rawLast}`).trim();
      if (!fullName && fallback.phone && fallback.phone !== '+998 -- --- -- --') {
        fullName = formatUzbekPhone(fallback.phone) || fallback.phone;
      }
      if (!fullName) {
        fullName = 'Foydalanuvchi';
      }

      const realSocials = Array.isArray(fallback.socialLinks)
        ? fallback.socialLinks
        : (Array.isArray(fallback.socials) ? fallback.socials : []);

      if (!profile) {
        profile = {
          id: userId,
          name: fullName,
          firstName: rawFirst || (fullName !== 'Foydalanuvchi' ? fullName.split(' ')[0] : ''),
          lastName: rawLast || (fullName !== 'Foydalanuvchi' ? fullName.split(' ').slice(1).join(' ') : ''),
          phone: fallback.phone && fallback.phone !== '+998 -- --- -- --' ? fallback.phone : '',
          bio: (fallback.bio || '').trim(),
          avatarUrl: fallback.avatarUrl || fallback.avatar_url || '',
          avatarGradient: fallback.avatarGradient || fallback.avatar_gradient || 'linear-gradient(135deg, #10b981, #06b6d4)',
          role: fallback.role || 'user',
          streak: Number(fallback.streak) || 0,
          points: Number(fallback.points) || (Number(fallback.streak) || 0) * 50,
          socialLinks: realSocials,
          followers: Array.isArray(fallback.followers) ? fallback.followers : [],
          following: Array.isArray(fallback.following) ? fallback.following : []
        };
        all[userId] = profile;
        this.saveAllPublicProfiles(all);
      } else {
        let changed = false;

        // Clean out legacy fake default bios if present
        if (profile.bio && (profile.bio.includes("Intizom — bu o'z xohishlaringiz") || profile.bio.includes("Intizomli hayot tarafdori"))) {
          profile.bio = (fallback.bio || '').trim();
          changed = true;
        }

        // Clean out legacy fake default telegram handles
        if (Array.isArray(profile.socialLinks) && profile.socialLinks.some(s => s.id?.startsWith('soc_tg_def_') || s.username === 'thebakhriddinov' || s.username === 'foydalanuvchi')) {
          profile.socialLinks = realSocials;
          changed = true;
        }

        if (fallback.avatarUrl && fallback.avatarUrl !== profile.avatarUrl) {
          profile.avatarUrl = fallback.avatarUrl;
          changed = true;
        }
        if (fallback.bio !== undefined && fallback.bio !== profile.bio) {
          profile.bio = String(fallback.bio).trim();
          changed = true;
        }
        if (fullName && fullName !== 'Foydalanuvchi' && profile.name !== fullName) {
          profile.name = fullName;
          if (rawFirst) profile.firstName = rawFirst;
          if (rawLast) profile.lastName = rawLast;
          changed = true;
        }
        if (fallback.phone && fallback.phone !== '+998 -- --- -- --' && fallback.phone !== profile.phone) {
          profile.phone = fallback.phone;
          changed = true;
        }
        if (realSocials.length > 0) {
          profile.socialLinks = realSocials;
          changed = true;
        }
        if (fallback.streak !== undefined && Number(fallback.streak) !== profile.streak) {
          profile.streak = Number(fallback.streak);
          profile.points = profile.streak * 50;
          changed = true;
        }
        if (changed) {
          all[userId] = profile;
          this.saveAllPublicProfiles(all);
        }
      }

      return profile;
    }

    savePublicProfile(profile) {
      if (!profile || !profile.id) return;
      const all = this.getAllPublicProfiles();
      all[profile.id] = { ...(all[profile.id] || {}), ...profile };
      this.saveAllPublicProfiles(all);
      return all[profile.id];
    }

    isFollowing(targetUserId, currentUserId) {
      if (!targetUserId || !currentUserId) return false;
      const extras = this.getProfileExtras();
      if (extras.following?.some(f => f.id === targetUserId)) return true;
      const target = this.getPublicProfile(targetUserId);
      return target?.followers?.some(f => f.id === currentUserId) || false;
    }

    followUser(userToFollow, currentUser) {
      if (!userToFollow || !userToFollow.id) return;
      const extras = this.getProfileExtras();
      if (!Array.isArray(extras.following)) extras.following = [];

        const currentId = currentUser?.id || 'usr_current';
        const currentName = currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'Siz' : 'Siz';
        const currentAvatar = extras.avatarUrl || currentUser?.avatarGradient || 'linear-gradient(135deg, #10b981, #06b6d4)';

        if (!extras.following.some(f => f.id === userToFollow.id)) {
          extras.following.push({
            id: userToFollow.id,
            name: userToFollow.name || `${userToFollow.firstName || ''} ${userToFollow.lastName || ''}`.trim() || 'Foydalanuvchi',
            streak: userToFollow.streak || 0,
            avatarGradient: userToFollow.avatarGradient || 'linear-gradient(135deg, #10b981, #06b6d4)',
            avatarUrl: userToFollow.avatarUrl || ''
          });
          this.updateProfileExtras(extras);
        }

        const targetProf = this.getPublicProfile(userToFollow.id, userToFollow);
        if (!targetProf.followers.some(f => f.id === currentId)) {
          targetProf.followers.push({
            id: currentId,
            name: currentName,
            streak: this.getGlobalStreak(),
            avatarGradient: currentAvatar,
            avatarUrl: extras.avatarUrl || ''
          });
          this.savePublicProfile(targetProf);
        }

        const myProf = this.getPublicProfile(currentId, {
          id: currentId,
          name: currentName,
          phone: currentUser?.phone,
          bio: extras.bio,
          avatarUrl: extras.avatarUrl,
          streak: this.getGlobalStreak()
        });
        if (!myProf.following.some(f => f.id === userToFollow.id)) {
          myProf.following.push({
            id: userToFollow.id,
            name: userToFollow.name || `${userToFollow.firstName || ''} ${userToFollow.lastName || ''}`.trim() || 'Foydalanuvchi',
            streak: userToFollow.streak || 0,
            avatarGradient: userToFollow.avatarGradient || 'linear-gradient(135deg, #10b981, #06b6d4)',
            avatarUrl: userToFollow.avatarUrl || ''
          });
          this.savePublicProfile(myProf);
        }

        return extras;
      }

        unfollowUser(userIdToUnfollow, currentUserId) {
          if (!userIdToUnfollow) return;
          const extras = this.getProfileExtras();
          extras.following = (extras.following || []).filter(f => f.id !== userIdToUnfollow);
          this.updateProfileExtras(extras);

          const myId = currentUserId || 'usr_current';

          const targetProf = this.getPublicProfile(userIdToUnfollow);
          if (targetProf) {
            targetProf.followers = (targetProf.followers || []).filter(f => f.id !== myId);
            this.savePublicProfile(targetProf);
          }

          const myProf = this.getPublicProfile(myId);
          if (myProf) {
            myProf.following = (myProf.following || []).filter(f => f.id !== myId);
            this.savePublicProfile(myProf);
          }

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
              unlocked: isUnlocked,
              isUnlocked,
              progressPct,
              currentStreak: streak
            };
          });
        }

        // ==================== CONTROL & APP LIMITS ENGINE ====================
        getAppLimits() {
          try {
            const stored = localStorage.getItem(STORAGE_KEYS.APP_LIMITS);
            if (stored) {
              const parsed = JSON.parse(stored);
              if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
              }
            }
          } catch (e) { }
          this.saveAppLimits(DEFAULT_APP_LIMITS);
          return DEFAULT_APP_LIMITS;
        }

        saveAppLimits(limits) {
          try {
            localStorage.setItem(STORAGE_KEYS.APP_LIMITS, JSON.stringify(limits));
          } catch (e) { }
          return limits;
        }

        toggleAppLimit(id) {
          const limits = this.getAppLimits();
          const updated = limits.map(app => app.id === id ? { ...app, enabled: !app.enabled } : app);
          this.saveAppLimits(updated);
          return updated;
        }

        updateAppLimit(id, limitMinutes) {
          const limits = this.getAppLimits();
          const updated = limits.map(app => app.id === id ? { ...app, limit: Number(limitMinutes) } : app);
          this.saveAppLimits(updated);
          return updated;
        }

        addAppLimit(newApp) {
          const limits = this.getAppLimits();
          const item = {
            id: 'app_' + Date.now(),
            name: newApp.name || 'Yangi Ilova',
            category: newApp.category || 'Boshqa',
            icon: newApp.icon || 'web',
            color: newApp.color || '#10B981',
            url: newApp.url || 'https://www.google.com',
            appScheme: newApp.appScheme || '',
            timeSpent: Number(newApp.timeSpent) || 0,
            limit: Number(newApp.limit) || 30,
            enabled: true
          };
          const updated = [...limits, item];
          this.saveAppLimits(updated);
          return updated;
        }

        deleteAppLimit(id) {
          const limits = this.getAppLimits();
          const updated = limits.filter(app => app.id !== id);
          this.saveAppLimits(updated);
          return updated;
        }

        incrementAppTime(id, minutes = 1) {
          const limits = this.getAppLimits();
          const updated = limits.map(app => app.id === id ? { ...app, timeSpent: (app.timeSpent || 0) + minutes } : app);
          this.saveAppLimits(updated);
          return updated;
        }
      }

      export const storage = new StorageManager();
      export { StorageManager };
      export default storage;
