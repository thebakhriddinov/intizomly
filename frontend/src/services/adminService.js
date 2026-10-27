// ==============================================================================
// Intizomly — Admin Service (Client-Side)
// Barcha admin funksiyalarini boshqarish: Analitika, Foydalanuvchilar,
// Intizom, E'lonlar, Hisobotlar (CSV) va Xavfsizlik Audit loglari
// ==============================================================================

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { supabaseService } from './supabaseService';
import { validateUzbekPhone, formatUzbekPhone } from '../utils/phone';
import { getUserPassword, saveUserPassword } from '../utils/storage';

export const adminService = {
  /**
   * Joriy foydalanuvchining Supabase JWT tokenini olish
   */
  async getAuthToken() {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data } = await supabase.auth.getSession();
      return data?.session?.access_token || null;
    } catch (e) {
      console.warn('[AdminService] getAuthToken error:', e);
      return null;
    }
  },

  /**
   * Server-side Admin API so'rovlarini bajarish
   */
  async fetchAdminApi(path, options = {}) {
    const token = await this.getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    try {
      const res = await fetch(path, {
        ...options,
        headers
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || `So'rovda xatolik (${res.status})`);
      }

      return data;
    } catch (err) {
      console.error(`[AdminService API Error] ${path}:`, err);
      throw err;
    }
  },

  // ============================================================================
  // 1. DASHBOARD & ANALITIKA
  // ============================================================================
  async getDashboardStats({ dateRange = 'all', startDate = null, endDate = null } = {}) {
    // 1. Server API orqali sinab ko'rish
    try {
      const res = await this.fetchAdminApi('/api/admin/stats', { method: 'GET' });
      if (res.success && res.stats) {
        return this.filterStatsByDateRange(res.stats, { dateRange, startDate, endDate });
      }
    } catch (e) {
      console.warn('[AdminService] Server API fallback to direct Supabase query:', e.message);
    }

    // 2. Direct Supabase Query Fallback (RLS orqali admin huquqi bilan)
    if (!isSupabaseConfigured) {
      return this.getMockDashboardStats();
    }

    const { data: profiles } = await supabase.from('profiles').select('*');
    const { data: habits } = await supabase.from('habits').select('id, user_id, created_at');
    const { data: completions } = await supabase.from('habit_completions').select('*');

    const allProfiles = profiles || [];
    const allHabits = habits || [];
    const allCompletions = completions || [];

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    const weekStr = startOfWeek.toISOString().split('T')[0];
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStr = startOfMonth.toISOString().split('T')[0];

    let registeredToday = 0;
    let registeredThisWeek = 0;
    let registeredThisMonth = 0;

    for (const p of allProfiles) {
      const d = (p.created_at || '').split('T')[0];
      if (d >= todayStr) registeredToday++;
      if (d >= weekStr) registeredThisWeek++;
      if (d >= monthStr) registeredThisMonth++;
    }

    const dauUsers = new Set();
    const mauUsers = new Set();
    for (const c of allCompletions) {
      const d = c.date_key || (c.completed_at ? c.completed_at.split('T')[0] : '');
      if (d === todayStr) dauUsers.add(c.user_id);
      if (d >= monthStr) mauUsers.add(c.user_id);
    }

    // So'nggi 14 kunlik grafik
    const growthPoints = [];
    for (let i = 13; i >= 0; i--) {
      const targetD = new Date(now);
      targetD.setDate(now.getDate() - i);
      const dateKey = targetD.toISOString().split('T')[0];
      const label = `${targetD.getDate()}.${targetD.getMonth() + 1}`;

      const totalUsers = allProfiles.filter(p => (p.created_at || '').split('T')[0] <= dateKey).length;
      const newUsers = allProfiles.filter(p => (p.created_at || '').split('T')[0] === dateKey).length;
      const completionsOnDay = allCompletions.filter(c => (c.date_key || '').startsWith(dateKey)).length;

      growthPoints.push({
        date: dateKey,
        label,
        totalUsers,
        newUsers,
        completions: completionsOnDay
      });
    }

    const stats = {
      totalUsers: allProfiles.length,
      registeredToday,
      registeredThisWeek,
      registeredThisMonth,
      dau: dauUsers.size,
      mau: mauUsers.size,
      premiumUsers: allProfiles.filter(p => p.role === 'premium').length,
      adminUsers: allProfiles.filter(p => p.role === 'admin').length,
      regularUsers: allProfiles.filter(p => p.role === 'user' || !p.role).length,
      blockedUsers: allProfiles.filter(p => p.status === 'blocked').length,
      totalHabits: allHabits.length,
      totalCompletions: allCompletions.length,
      growthPoints
    };

    return stats;
  },

  filterStatsByDateRange(stats, { dateRange, startDate, endDate }) {
    if (dateRange === 'all') return stats;

    const now = new Date();
    let filterStart = null;
    let filterEnd = now.toISOString().split('T')[0];

    if (dateRange === 'today') {
      filterStart = now.toISOString().split('T')[0];
    } else if (dateRange === '7days') {
      const d = new Date(now);
      d.setDate(now.getDate() - 7);
      filterStart = d.toISOString().split('T')[0];
    } else if (dateRange === '30days') {
      const d = new Date(now);
      d.setDate(now.getDate() - 30);
      filterStart = d.toISOString().split('T')[0];
    } else if (dateRange === 'this_month') {
      filterStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    } else if (dateRange === 'custom' && startDate) {
      filterStart = startDate;
      if (endDate) filterEnd = endDate;
    }

    if (!filterStart) return stats;

    const filteredGrowth = (stats.growthPoints || []).filter(
      pt => pt.date >= filterStart && pt.date <= filterEnd
    );

    return {
      ...stats,
      growthPoints: filteredGrowth
    };
  },

  // ============================================================================
  // 2. USER MANAGEMENT (PAGINATION, SEARCH, FILTER, CRUD, BLOCK)
  // ============================================================================
  async getUsersWithMeta({
    search = '',
    role = 'all',
    status = 'all',
    sortBy = 'created_at',
    sortOrder = 'desc',
    page = 1,
    limit = 10
  } = {}) {
    if (!isSupabaseConfigured) return { users: [], totalCount: 0, totalPages: 1 };

    // 1. Profiler, odatlar va completions ni yuklash
    const { data: rawProfiles, error: pErr } = await supabase
      .from('profiles')
      .select('*');

    if (pErr) throw pErr;

    const { data: habits } = await supabase.from('habits').select('id, user_id');
    const { data: completions } = await supabase.from('habit_completions').select('user_id');

    // Foydalanuvchilar bo'yicha hisob-kitoblar xaritasi
    const habitsCountByUser = {};
    for (const h of habits || []) {
      habitsCountByUser[h.user_id] = (habitsCountByUser[h.user_id] || 0) + 1;
    }

    const completionsCountByUser = {};
    for (const c of completions || []) {
      completionsCountByUser[c.user_id] = (completionsCountByUser[c.user_id] || 0) + 1;
    }

    // Foydalanuvchilarni to'ldirish
    let enriched = (rawProfiles || []).map(p => {
      const phone = p.phone || (p.email && p.email.includes('@phone.intizomly.uz') ? p.email.replace('@phone.intizomly.uz', '') : '') || '';
      const password = getUserPassword({
        id: p.id,
        phone,
        email: p.email,
        role: p.role,
        password: p.password
      });

      return {
        id: p.id,
        firstName: p.first_name || '',
        lastName: p.last_name || '',
        phone,
        formattedPhone: phone ? formatUzbekPhone(phone) : '—',
        email: p.email || '',
        password,
        role: p.role || 'user',
        status: p.status || 'active',
        bannedAt: p.banned_at || null,
        bannedReason: p.banned_reason || null,
        avatarGradient: p.avatar_gradient || 'linear-gradient(135deg, #10b981, #3b82f6)',
        createdAt: p.created_at ? p.created_at.split('T')[0] : '2026-01-01',
        habitsCount: habitsCountByUser[p.id] || 0,
        completionsCount: completionsCountByUser[p.id] || 0
      };
    });

    // 2. Qidiruv (Ism, familiya, telefon raqami)
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      const digits = q.replace(/\D/g, '');
      enriched = enriched.filter(u => {
        const full = `${u.firstName} ${u.lastName}`.toLowerCase();
        return (
          full.includes(q) ||
          u.phone.includes(digits || q) ||
          (u.email && u.email.toLowerCase().includes(q))
        );
      });
    }

    // 3. Rol bo'yicha filter
    if (role !== 'all') {
      enriched = enriched.filter(u => u.role === role);
    }

    // 4. Holat bo'yicha filter (active / blocked)
    if (status !== 'all') {
      enriched = enriched.filter(u => u.status === status);
    }

    // 5. Saralash (Sort)
    enriched.sort((a, b) => {
      let valA = a[sortBy] ?? '';
      let valB = b[sortBy] ?? '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const totalCount = enriched.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const startIdx = (safePage - 1) * limit;
    const paginatedUsers = enriched.slice(startIdx, startIdx + limit);

    return {
      users: paginatedUsers,
      allFilteredUsers: enriched, // Eksport uchun
      totalCount,
      totalPages,
      currentPage: safePage
    };
  },

  /**
   * Yangi foydalanuvchi qo'shish (Server-side API)
   */
  async createUser({ firstName, lastName, phone, password, role = 'user' }) {
    const v = validateUzbekPhone(phone);
    if (!v.isValid) {
      throw new Error(v.message);
    }

    const cleanPass = password.trim();
    saveUserPassword(v.normalized, cleanPass);
    saveUserPassword(`${v.normalized}@phone.intizomly.uz`, cleanPass);

    const res = await this.fetchAdminApi('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: v.normalized,
        password: cleanPass,
        role
      })
    });

    if (res?.user?.id) {
      saveUserPassword(res.user.id, cleanPass);
    }
    return res;
  },

  /**
   * Foydalanuvchi ma'lumotlarini yangilash (Ism, familiya, rol, yangi parol)
   */
  async updateUser(userId, data) {
    if (data?.password && String(data.password).trim()) {
      saveUserPassword(userId, String(data.password).trim());
    }
    return await this.fetchAdminApi(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  /**
   * Akkauntni bloklash (Supabase Auth ban_duration + DB status)
   */
  async blockUser(userId, reason = "Administrator tomonidan bloklandi") {
    return await this.fetchAdminApi(`/api/admin/users/${userId}/block`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  },

  /**
   * Akkauntni qayta faollashtirish (Unblock)
   */
  async unblockUser(userId) {
    return await this.fetchAdminApi(`/api/admin/users/${userId}/unblock`, {
      method: 'POST',
      body: JSON.stringify({})
    });
  },

  /**
   * Foydalanuvchini o'chirish (Delete)
   */
  async deleteUser(userId) {
    return await this.fetchAdminApi(`/api/admin/users/${userId}`, {
      method: 'DELETE'
    });
  },

  // ============================================================================
  // 3. INTIZOM VA FOYDALANUVCHI FAOLIK (DISCIPLINE & LEADERBOARD)
  // ============================================================================
  async getDisciplineData() {
    if (!isSupabaseConfigured) return { leaderboard: [], overview: {} };

    const { data: profiles } = await supabase.from('profiles').select('id, first_name, last_name, role, avatar_gradient, email, phone');
    const { data: habits } = await supabase.from('habits').select('*');
    const { data: completions } = await supabase.from('habit_completions').select('*');

    const allProfiles = profiles || [];
    const allHabits = habits || [];
    const allCompletions = completions || [];

    // Har bir foydalanuvchi bo'yicha ko'rsatkichlar
    const userHabits = {};
    for (const h of allHabits) {
      if (!userHabits[h.user_id]) userHabits[h.user_id] = [];
      userHabits[h.user_id].push(h);
    }

    const userCompletions = {};
    for (const c of allCompletions) {
      if (!userCompletions[c.user_id]) userCompletions[c.user_id] = [];
      userCompletions[c.user_id].push(c);
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Haftalik va oylik taqqoslash
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const weekStr = startOfWeek.toISOString().split('T')[0];

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStr = startOfMonth.toISOString().split('T')[0];

    let weeklyCompletionsCount = 0;
    let monthlyCompletionsCount = 0;

    for (const c of allCompletions) {
      const d = c.date_key || '';
      if (d >= weekStr) weeklyCompletionsCount++;
      if (d >= monthStr) monthlyCompletionsCount++;
    }

    // Leaderboard
    const leaderboard = allProfiles.map(p => {
      const pHabits = userHabits[p.id] || [];
      const pCompletions = userCompletions[p.id] || [];

      // Unikal kunlar soni
      const uniqueDates = new Set(pCompletions.map(c => c.date_key));

      // Bajarilish foizi taxmini (oxirgi 7 kunda)
      const possibleSevenDayCompletions = Math.max(1, pHabits.length * 7);
      const recentSevenDaysCompletions = pCompletions.filter(c => c.date_key >= weekStr).length;
      const rate = Math.min(100, Math.round((recentSevenDaysCompletions / possibleSevenDayCompletions) * 100));

      const phone = p.phone || (p.email && p.email.includes('@phone.intizomly.uz') ? p.email.replace('@phone.intizomly.uz', '') : '') || '';

      return {
        id: p.id,
        name: `${p.first_name} ${p.last_name}`.trim() || 'Foydalanuvchi',
        phone: phone ? formatUzbekPhone(phone) : '—',
        role: p.role,
        avatarGradient: p.avatar_gradient,
        habitsCount: pHabits.length,
        totalCompletions: pCompletions.length,
        activeDays: uniqueDates.size,
        completionRate: pHabits.length > 0 ? rate : 0
      };
    });

    // Reyting bo'yicha saralash (bajarilgan odatlar soni va faol kunlar bo'yicha)
    leaderboard.sort((a, b) => b.totalCompletions - a.totalCompletions || b.activeDays - a.activeDays);

    return {
      leaderboard,
      overview: {
        totalHabits: allHabits.length,
        totalCompletions: allCompletions.length,
        weeklyCompletions: weeklyCompletionsCount,
        monthlyCompletions: monthlyCompletionsCount,
        avgHabitsPerUser: allProfiles.length > 0 ? (allHabits.length / allProfiles.length).toFixed(1) : 0,
        activeRatePct: allProfiles.length > 0 ? Math.round((leaderboard.filter(u => u.totalCompletions > 0).length / allProfiles.length) * 100) : 0
      }
    };
  },

  // ============================================================================
  // 4. E'LONLAR VA BILDIRISHNOMALAR (ANNOUNCEMENTS CRUD)
  // ============================================================================
  async getAnnouncements() {
    try {
      const res = await this.fetchAdminApi('/api/admin/announcements', { method: 'GET' });
      if (res.success && res.announcements) return res.announcements;
    } catch {
      // Fallback
    }

    if (isSupabaseConfigured) {
      const broadcasts = await supabaseService.getBroadcasts();
      return broadcasts.map(b => ({
        id: b.id,
        title: b.title,
        message: b.message,
        target: 'all',
        status: 'active',
        priority: 'banner',
        created_at: b.created_at
      }));
    }

    return [];
  },

  async createAnnouncement({ title, message, target = 'all', priority = 'normal', status = 'active' }) {
    return await this.fetchAdminApi('/api/admin/announcements', {
      method: 'POST',
      body: JSON.stringify({ title, message, target, priority, status })
    });
  },

  // ============================================================================
  // 5. AUDIT LOGS
  // ============================================================================
  async getAuditLogs() {
    try {
      const res = await this.fetchAdminApi('/api/admin/audit-logs', { method: 'GET' });
      if (res.success && res.logs) return res.logs;
    } catch (e) {
      console.warn('[AdminService] getAuditLogs error:', e);
    }
    return [];
  },

  // ============================================================================
  // 6. HISOBOTLAR VA CSV EKSPORT
  // ============================================================================
  exportUsersToCSV(users = [], filename = `intizomly_foydalanuvchilar_${new Date().toISOString().split('T')[0]}.csv`) {
    if (!users || users.length === 0) {
      throw new Error("Eksport qilish uchun foydalanuvchilar topilmadi");
    }

    // CSV ustunlari
    const headers = [
      "ID",
      "Ism",
      "Familiya",
      "Telefon",
      "Parol",
      "Email",
      "Rol",
      "Holat",
      "Ro'yxatdan o'tgan sana",
      "Jami Odatlar",
      "Bajarilganlar soni"
    ];

    const escapeCell = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = users.map(u => [
      escapeCell(u.id),
      escapeCell(u.firstName),
      escapeCell(u.lastName),
      escapeCell(u.phone),
      escapeCell(u.password || ''),
      escapeCell(u.email),
      escapeCell(u.role),
      escapeCell(u.status || 'active'),
      escapeCell(u.createdAt),
      escapeCell(u.habitsCount || 0),
      escapeCell(u.completionsCount || 0)
    ].join(','));

    // UTF-8 BOM qo'shish (Excel o'zbek harflarini to'g'ri ko'rsatishi uchun)
    const BOM = '\uFEFF';
    const csvContent = BOM + [headers.join(','), ...rows].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  }
};
