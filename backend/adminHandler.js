// ==============================================================================
// Intizomly — Server-Side Admin API Handler
// Ushbu modul faqat SERVER muhitida ishlaydi (Node.js).
// SUPABASE_SERVICE_ROLE_KEY hech qachon brauzerga yoki frontend kodiga chiqmaydi!
// ==============================================================================

import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

// Environment fayllarni o'qish (ildiz yoki frontend/.env.local)
function getEnvConfig() {
  const rootDir = process.cwd();
  const envCandidates = [
    path.join(rootDir, '.env.local'),
    path.join(rootDir, 'frontend', '.env.local'),
    path.join(rootDir, '.env'),
    path.join(rootDir, 'frontend', '.env')
  ];

  let supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  let anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

  for (const envPath of envCandidates) {
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf8');
        const urlMatch = content.match(/VITE_SUPABASE_URL=(.*)/);
        const secretMatch = content.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);
        const anonMatch = content.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

        if (!supabaseUrl && urlMatch) supabaseUrl = urlMatch[1].trim();
        if (!serviceRoleKey && secretMatch) serviceRoleKey = secretMatch[1].trim();
        if (!anonKey && anonMatch) anonKey = anonMatch[1].trim();
      } catch (e) {
        console.warn('[AdminHandler] Env read warning:', e.message);
      }
    }
  }

  // Standart fallback
  if (!supabaseUrl) supabaseUrl = 'https://zeixsiogmznsngwqfedd.supabase.co';
  if (!anonKey) anonKey = 'sb_publishable_ir9uyEbjniRkBlSUdlE6uw_LpvZaez9';

  return { supabaseUrl, serviceRoleKey, anonKey };
}

const { supabaseUrl, serviceRoleKey, anonKey } = getEnvConfig();

// Maxfiy Service Role Client (RLS ni chetlab o'tish va auth.admin amallar uchun)
const supabaseAdmin = serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;

// Anon Client (Faqat token tekshirish uchun)
const supabaseAuthChecker = createClient(supabaseUrl, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Xotiradagi audit loglar (agar database jadvali hali ochilmagan bo'lsa fallback uchun)
const memoryAuditLogs = [];

/**
 * So'rov yuborgan foydalanuvchining adminligini tekshirish (Server-side RBAC)
 */
async function authenticateAdmin(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    return { ok: false, status: 401, error: "Avtorizatsiya tokeni topilmadi" };
  }

  if (!supabaseAdmin) {
    return { ok: false, status: 500, error: "Serverda SUPABASE_SERVICE_ROLE_KEY sozlanmagan" };
  }

  // 1. Supabase Auth orqali tokenni tekshirish
  const { data: userData, error: authError } = await supabaseAuthChecker.auth.getUser(token);
  if (authError || !userData?.user) {
    return { ok: false, status: 401, error: "Yaroqsiz yoki muddati o'tgan sessiya" };
  }

  const userId = userData.user.id;

  // 2. Database `profiles` jadvalidan `role === 'admin'` ekanligini serverda tekshirish
  const { data: profile, error: profError } = await supabaseAdmin
    .from('profiles')
    .select('id, first_name, last_name, role')
    .eq('id', userId)
    .maybeSingle();

  if (profError || !profile || profile.role !== 'admin') {
    return { ok: false, status: 403, error: "Ruxsat etilmadi: Sizda administratorlik huquqi yo'q" };
  }

  return {
    ok: true,
    user: userData.user,
    profile
  };
}

/**
 * Audit log yozish (DB + Memory fallback)
 */
async function recordAuditLog({ adminId, adminName, action, targetType, targetId, targetName, details, ip }) {
  const entry = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    admin_id: adminId || null,
    admin_name: adminName || 'Admin',
    action,
    target_type: targetType,
    target_id: String(targetId || ''),
    target_name: targetName || '',
    details: details || {},
    ip_address: ip || '127.0.0.1',
    created_at: new Date().toISOString()
  };

  memoryAuditLogs.unshift(entry);
  if (memoryAuditLogs.length > 500) memoryAuditLogs.pop();

  if (supabaseAdmin) {
    try {
      await supabaseAdmin.from('audit_logs').insert({
        admin_id: adminId,
        admin_name: adminName,
        action,
        target_type: targetType,
        target_id: String(targetId || ''),
        target_name: targetName,
        details: details || {},
        ip_address: ip || '127.0.0.1'
      });
    } catch (e) {
      // Jadval mavjud bo'lmasa xotiradagi fallback ishlaydi
    }
  }

  return entry;
}

/**
 * Asosiy API routeri
 */
export async function handleAdminApi(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;
  const method = req.method.toUpperCase();

  // CORS va JSON headerlar
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }

  if (!pathname.startsWith('/api/admin')) {
    return false;
  }

  // 1. Admin huquqlarini tekshirish
  const authCheck = await authenticateAdmin(req);
  if (!authCheck.ok) {
    res.statusCode = authCheck.status;
    res.end(JSON.stringify({ success: false, message: authCheck.error }));
    return true;
  }

  const { user: adminUser, profile: adminProfile } = authCheck;
  const adminName = `${adminProfile.first_name || ''} ${adminProfile.last_name || ''}`.trim() || 'Admin';
  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';

  // Request body ni o'qish yordamchisi
  const readJsonBody = async () => {
    return new Promise((resolve) => {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch {
          resolve({});
        }
      });
    });
  };

  try {
    // --------------------------------------------------------------------------
    // 1. STATS: Aggregatsiya qilingan haqiqiy statistika
    // GET /api/admin/stats
    // --------------------------------------------------------------------------
    if (pathname === '/api/admin/stats' && method === 'GET') {
      const { data: profiles, error: pErr } = await supabaseAdmin.from('profiles').select('*');
      const { data: habits, error: hErr } = await supabaseAdmin.from('habits').select('id, user_id, created_at');
      const { data: completions, error: cErr } = await supabaseAdmin.from('habit_completions').select('*');

      if (pErr) throw pErr;

      const allProfiles = profiles || [];
      const allHabits = habits || [];
      const allCompletions = completions || [];

      // Vaqt mezonlari
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

      // Faol foydalanuvchilar (DAU / MAU)
      const dauUsers = new Set();
      const mauUsers = new Set();
      for (const c of allCompletions) {
        const d = c.date_key || (c.completed_at ? c.completed_at.split('T')[0] : '');
        if (d === todayStr) dauUsers.add(c.user_id);
        if (d >= monthStr) mauUsers.add(c.user_id);
      }

      // O'sish grafigi ma'lumotlari (so'nggi 14 kun)
      const growthPoints = [];
      for (let i = 13; i >= 0; i--) {
        const targetD = new Date(now);
        targetD.setDate(now.getDate() - i);
        const dateKey = targetD.toISOString().split('T')[0];
        const label = `${targetD.getDate()}.${targetD.getMonth() + 1}`;

        // Shu kungacha jami a'zolar
        const totalUpTo = allProfiles.filter(p => (p.created_at || '').split('T')[0] <= dateKey).length;
        // Shu kuni ro'yxatdan o'tganlar
        const newOnDay = allProfiles.filter(p => (p.created_at || '').split('T')[0] === dateKey).length;
        // Shu kungi bajarilgan odatlar soni
        const completionsOnDay = allCompletions.filter(c => (c.date_key || '').startsWith(dateKey)).length;

        growthPoints.push({
          date: dateKey,
          label,
          totalUsers: totalUpTo,
          newUsers: newOnDay,
          completions: completionsOnDay
        });
      }

      const premiumUsers = allProfiles.filter(p => p.role === 'premium').length;
      const adminUsers = allProfiles.filter(p => p.role === 'admin').length;
      const regularUsers = allProfiles.filter(p => p.role === 'user' || !p.role).length;
      const blockedUsers = allProfiles.filter(p => p.status === 'blocked').length;

      res.statusCode = 200;
      res.end(JSON.stringify({
        success: true,
        stats: {
          totalUsers: allProfiles.length,
          registeredToday,
          registeredThisWeek,
          registeredThisMonth,
          dau: dauUsers.size,
          mau: mauUsers.size,
          premiumUsers,
          adminUsers,
          regularUsers,
          blockedUsers,
          totalHabits: allHabits.length,
          totalCompletions: allCompletions.length,
          growthPoints
        }
      }));
      return true;
    }

    // --------------------------------------------------------------------------
    // 2. USERS: Yangi foydalanuvchi yaratish (Server-side auth.admin)
    // POST /api/admin/users
    // --------------------------------------------------------------------------
    if (pathname === '/api/admin/users' && method === 'POST') {
      const body = await readJsonBody();
      const { firstName, lastName, phone, password, role } = body;

      if (!firstName || !lastName || !phone || !password) {
        res.statusCode = 400;
        res.end(JSON.stringify({ success: false, message: "Ism, familiya, telefon va parol to'ldirilishi shart" }));
        return true;
      }

      const digits = phone.replace(/\D/g, '');
      const fullDigits = digits.length === 9 ? '998' + digits : digits;
      const email = `${fullDigits}@phone.intizomly.uz`;
      const assignedRole = ['user', 'premium', 'admin'].includes(role) ? role : 'user';

      // Supabase Auth orqali server-side yaratish
      const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: String(password).trim(),
        email_confirm: true,
        user_metadata: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: fullDigits
        }
      });

      if (createErr) {
        res.statusCode = 400;
        res.end(JSON.stringify({ success: false, message: createErr.message }));
        return true;
      }

      const userId = newUser.user.id;

      // Profiles jadvalida rolni o'rnatish
      await supabaseAdmin.from('profiles').upsert({
        id: userId,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email,
        role: assignedRole,
        updated_at: new Date().toISOString()
      });

      // Audit log
      await recordAuditLog({
        adminId: adminUser.id,
        adminName,
        action: 'user_created',
        targetType: 'user',
        targetId: userId,
        targetName: `${firstName} ${lastName}`,
        details: { phone: fullDigits, role: assignedRole },
        ip: clientIp
      });

      res.statusCode = 201;
      res.end(JSON.stringify({
        success: true,
        message: "Foydalanuvchi muvaffaqiyatli yaratildi",
        user: { id: userId, firstName, lastName, phone: fullDigits, role: assignedRole }
      }));
      return true;
    }

    // --------------------------------------------------------------------------
    // 3. USERS: Foydalanuvchi ma'lumotlarini yangilash
    // PUT /api/admin/users/:id
    // --------------------------------------------------------------------------
    const updateMatch = pathname.match(/^\/api\/admin\/users\/([a-zA-Z0-9-]+)$/);
    if (updateMatch && method === 'PUT') {
      const targetUserId = updateMatch[1];
      const body = await readJsonBody();
      const { firstName, lastName, role, password, status } = body;

      const profileUpdates = { updated_at: new Date().toISOString() };
      if (firstName !== undefined) profileUpdates.first_name = firstName.trim();
      if (lastName !== undefined) profileUpdates.last_name = lastName.trim();
      if (role && ['user', 'premium', 'admin'].includes(role)) profileUpdates.role = role;
      if (status && ['active', 'blocked'].includes(status)) profileUpdates.status = status;

      // Parol o'zgartirilayotgan bo'lsa Auth tizimida yangilash
      if (password && String(password).trim().length >= 6) {
        await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
          password: String(password).trim()
        });
      }

      // Ism va metadata ni auth tizimida ham yangilash
      if (firstName || lastName) {
        await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
          user_metadata: {
            first_name: firstName?.trim(),
            last_name: lastName?.trim()
          }
        });
      }

      // Profiles ni yangilash (status ustuni mavjud bo'lmasa xatolik bermasligi uchun try-catch)
      let { error: pErr } = await supabaseAdmin
        .from('profiles')
        .update(profileUpdates)
        .eq('id', targetUserId);

      if (pErr && pErr.message && pErr.message.includes('status')) {
        delete profileUpdates.status;
        const res2 = await supabaseAdmin.from('profiles').update(profileUpdates).eq('id', targetUserId);
        pErr = res2.error;
      }

      if (pErr) throw pErr;

      await recordAuditLog({
        adminId: adminUser.id,
        adminName,
        action: 'user_updated',
        targetType: 'user',
        targetId: targetUserId,
        targetName: `${firstName || ''} ${lastName || ''}`.trim() || targetUserId,
        details: { updates: profileUpdates, passwordChanged: !!password },
        ip: clientIp
      });

      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, message: "Foydalanuvchi ma'lumotlari yangilandi" }));
      return true;
    }

    // --------------------------------------------------------------------------
    // 4. USERS: Akkauntni bloklash (Supabase Auth ban_duration + Database status)
    // POST /api/admin/users/:id/block
    // --------------------------------------------------------------------------
    const blockMatch = pathname.match(/^\/api\/admin\/users\/([a-zA-Z0-9-]+)\/block$/);
    if (blockMatch && method === 'POST') {
      const targetUserId = blockMatch[1];
      const body = await readJsonBody();
      const reason = body.reason || "Administrator tomonidan bloklandi";

      // 1. Supabase Auth da real bloklash (Kirish va sessiya darhol to'xtatiladi!)
      const { error: banErr } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
        ban_duration: '876000h' // 100 yilga ban
      });

      if (banErr) throw banErr;

      // 2. Database profilida status = 'blocked' qilish
      try {
        await supabaseAdmin.from('profiles').update({
          status: 'blocked',
          banned_at: new Date().toISOString(),
          banned_reason: reason,
          updated_at: new Date().toISOString()
        }).eq('id', targetUserId);
      } catch (e) {
        // status ustuni yo'q bo'lsa ham Auth ban muvaffaqiyatli bo'ldi
      }

      await recordAuditLog({
        adminId: adminUser.id,
        adminName,
        action: 'user_blocked',
        targetType: 'user',
        targetId: targetUserId,
        targetName: targetUserId,
        details: { reason, duration: '876000h' },
        ip: clientIp
      });

      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, message: "Foydalanuvchi akkaunti muvaffaqiyatli bloklandi" }));
      return true;
    }

    // --------------------------------------------------------------------------
    // 5. USERS: Akkauntni qayta faollashtirish (Unblock)
    // POST /api/admin/users/:id/unblock
    // --------------------------------------------------------------------------
    const unblockMatch = pathname.match(/^\/api\/admin\/users\/([a-zA-Z0-9-]+)\/unblock$/);
    if (unblockMatch && method === 'POST') {
      const targetUserId = unblockMatch[1];

      // 1. Supabase Auth da ban ni yechish
      const { error: unbanErr } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
        ban_duration: 'none'
      });

      if (unbanErr) throw unbanErr;

      // 2. Database profilida status = 'active' qilish
      try {
        await supabaseAdmin.from('profiles').update({
          status: 'active',
          banned_at: null,
          banned_reason: null,
          updated_at: new Date().toISOString()
        }).eq('id', targetUserId);
      } catch (e) {
        // Graceful fallback
      }

      await recordAuditLog({
        adminId: adminUser.id,
        adminName,
        action: 'user_unblocked',
        targetType: 'user',
        targetId: targetUserId,
        targetName: targetUserId,
        details: { unblocked_at: new Date().toISOString() },
        ip: clientIp
      });

      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, message: "Foydalanuvchi akkaunti qayta faollashtirildi" }));
      return true;
    }

    // --------------------------------------------------------------------------
    // 6. USERS: Foydalanuvchini o'chirish (Delete)
    // DELETE /api/admin/users/:id
    // --------------------------------------------------------------------------
    const deleteMatch = pathname.match(/^\/api\/admin\/users\/([a-zA-Z0-9-]+)$/);
    if (deleteMatch && method === 'DELETE') {
      const targetUserId = deleteMatch[1];

      if (targetUserId === adminUser.id) {
        res.statusCode = 400;
        res.end(JSON.stringify({ success: false, message: "O'z admin akkauntingizni o'chira olmaysiz" }));
        return true;
      }

      // 1. Supabase Auth foydalanuvchisini o'chirish
      await supabaseAdmin.auth.admin.deleteUser(targetUserId);

      // 2. Profiles dan o'chirish (Cascade orqali boshqa jadvallar ham tozalanadi)
      await supabaseAdmin.from('profiles').delete().eq('id', targetUserId);

      await recordAuditLog({
        adminId: adminUser.id,
        adminName,
        action: 'user_deleted',
        targetType: 'user',
        targetId: targetUserId,
        targetName: targetUserId,
        details: {},
        ip: clientIp
      });

      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, message: "Foydalanuvchi butunlay o'chirildi" }));
      return true;
    }

    // --------------------------------------------------------------------------
    // 7. AUDIT LOGS: Tarixni olish
    // GET /api/admin/audit-logs
    // --------------------------------------------------------------------------
    if (pathname === '/api/admin/audit-logs' && method === 'GET') {
      let dbLogs = [];
      try {
        const { data, error } = await supabaseAdmin
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
        if (!error && data) dbLogs = data;
      } catch (e) {
        // Fallback to memory
      }

      // Birlashtirish (DB + memory)
      const combined = [...dbLogs];
      const seen = new Set(dbLogs.map(l => l.id));
      for (const m of memoryAuditLogs) {
        if (!seen.has(m.id)) combined.push(m);
      }
      combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, logs: combined.slice(0, 100) }));
      return true;
    }

    // --------------------------------------------------------------------------
    // 8. ANNOUNCEMENTS: E'lonlar CRUD
    // GET /api/admin/announcements
    // POST /api/admin/announcements
    // PUT /api/admin/announcements/:id
    // DELETE /api/admin/announcements/:id
    // --------------------------------------------------------------------------
    if (pathname === '/api/admin/announcements' && method === 'GET') {
      let items = [];
      try {
        const { data, error } = await supabaseAdmin
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) items = data;
      } catch {
        // Fallback to broadcasts table
        const { data } = await supabaseAdmin
          .from('broadcasts')
          .select('*')
          .order('created_at', { ascending: false });
        items = (data || []).map(b => ({
          id: b.id,
          title: b.title,
          message: b.message,
          target: 'all',
          status: 'active',
          priority: 'banner',
          created_at: b.created_at
        }));
      }

      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, announcements: items }));
      return true;
    }

    if (pathname === '/api/admin/announcements' && method === 'POST') {
      const body = await readJsonBody();
      const { title, message, target = 'all', priority = 'normal', status = 'active' } = body;

      if (!title || !message) {
        res.statusCode = 400;
        res.end(JSON.stringify({ success: false, message: "Sarlavha va matn kiritilishi shart" }));
        return true;
      }

      let createdItem = null;
      try {
        const { data, error } = await supabaseAdmin
          .from('announcements')
          .insert({
            author_id: adminUser.id,
            title: title.trim(),
            message: message.trim(),
            target,
            priority,
            status
          })
          .select()
          .single();
        if (!error) createdItem = data;
      } catch {
        // Fallback
      }

      // Broadcasts jadvaliga ham parallel qo'shish (eski bildirishnoma tizimi bilan moslik uchun)
      try {
        await supabaseAdmin.from('broadcasts').insert({
          author_id: adminUser.id,
          title: title.trim(),
          message: message.trim()
        });
      } catch (e) {
        // Ignore
      }

      await recordAuditLog({
        adminId: adminUser.id,
        adminName,
        action: 'announcement_created',
        targetType: 'announcement',
        targetId: createdItem?.id || 'broadcast',
        targetName: title,
        details: { target, priority, status },
        ip: clientIp
      });

      res.statusCode = 201;
      res.end(JSON.stringify({
        success: true,
        message: "E'lon muvaffaqiyatli yaratildi",
        announcement: createdItem || { id: Date.now().toString(), title, message, target, priority, status, created_at: new Date().toISOString() }
      }));
      return true;
    }

    // Unknown endpoint
    res.statusCode = 404;
    res.end(JSON.stringify({ success: false, message: "Admin API marshruti topilmadi" }));
    return true;

  } catch (err) {
    console.error('[AdminHandler Error]:', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ success: false, message: err.message || "Serverda ichki xatolik yuz berdi" }));
    return true;
  }
}
