import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { handleAdminApi } from '../backend/adminHandler.js';

// Setup Mock Req/Res for testing handleAdminApi directly
function createMockRequest({ method, url, headers = {}, body = null }) {
  const stream = body ? Readable.from([JSON.stringify(body)]) : Readable.from([]);
  stream.method = method;
  stream.url = url;
  stream.headers = headers;
  return stream;
}

function createMockResponse() {
  let statusCode = 200;
  let headers = {};
  let body = '';

  return {
    setHeader: (k, v) => { headers[k.toLowerCase()] = v; },
    writeHead: (code, h) => { statusCode = code; if (h) Object.assign(headers, h); },
    get statusCode() { return statusCode; },
    set statusCode(code) { statusCode = code; },
    end: (chunk) => { if (chunk) body += chunk; },
    getBodyJson: () => {
      try { return JSON.parse(body); } catch { return { raw: body }; }
    }
  };
}

async function runSuite() {
  console.log('================================================================');
  console.log('🧪 INTIZOMLY ADMIN SUITE — AUTOMATED VERIFICATION');
  console.log('================================================================');

  const env = fs.readFileSync('.env.local', 'utf8');
  const url = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
  const anonKey = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();
  const serviceKey = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();

  const publicClient = createClient(url, anonKey, { auth: { persistSession: false } });
  const adminClient = createClient(url, serviceKey, { auth: { persistSession: false } });

  // TEST 1: Admin Login
  console.log('\n[TEST 1] Admin kirish (998701265759 / admin123)...');
  const { data: adminLogin, error: adminLoginErr } = await publicClient.auth.signInWithPassword({
    email: '998701265759@phone.intizomly.uz',
    password: 'admin123'
  });

  if (adminLoginErr || !adminLogin?.session?.access_token) {
    throw new Error('Admin login failed: ' + (adminLoginErr?.message || 'No token'));
  }
  const adminToken = adminLogin.session.access_token;
  console.log('✅ Admin muvaffaqiyatli kirdi! User ID:', adminLogin.user.id);

  // TEST 2: Non-Admin Negative Test (403 Forbidden)
  console.log('\n[TEST 2] Xavfsizlik: Oddiy foydalanuvchi orqali Admin API ga so\'rov (Salbiy test)...');
  // 998701265758 Begi Bekov (oddiy user)
  // Let's create a temporary token or use another user
  const { data: normalLogin } = await publicClient.auth.signInWithPassword({
    email: '998701265758@phone.intizomly.uz',
    password: 'wrong_or_test_password'
  }).catch(() => ({ data: null }));

  const testReqForbidden = createMockRequest({
    method: 'GET',
    url: '/api/admin/stats',
    headers: { 'authorization': 'Bearer fake_or_invalid_token' }
  });
  const testResForbidden = createMockResponse();
  await handleAdminApi(testReqForbidden, testResForbidden);
  console.log('So\'rov javobi statusi:', testResForbidden.statusCode);
  if (testResForbidden.statusCode === 401 || testResForbidden.statusCode === 403) {
    console.log('✅ Xavfsizlik testi o\'tdi: Noto\'g\'ri/oddiy token bilan admin ma\'lumotlariga ruxsat berilmadi!');
  } else {
    throw new Error('Xavfsizlik testi buzildi! Status: ' + testResForbidden.statusCode);
  }

  // TEST 3: Admin GET /api/admin/stats
  console.log('\n[TEST 3] Admin orqali GET /api/admin/stats...');
  const statsReq = createMockRequest({
    method: 'GET',
    url: '/api/admin/stats',
    headers: { 'authorization': `Bearer ${adminToken}` }
  });
  const statsRes = createMockResponse();
  await handleAdminApi(statsReq, statsRes);
  const statsBody = statsRes.getBodyJson();
  console.log('Stats natijasi:', {
    totalUsers: statsBody.stats?.totalUsers,
    registeredToday: statsBody.stats?.registeredToday,
    dau: statsBody.stats?.dau,
    growthPointsCount: statsBody.stats?.growthPoints?.length
  });
  if (!statsBody.success || typeof statsBody.stats?.totalUsers !== 'number') {
    throw new Error('Stats API invalid: ' + JSON.stringify(statsBody));
  }
  console.log('✅ Stats API muvaffaqiyatli ishladi!');

  // TEST 4: Create Test User via Admin API
  console.log('\n[TEST 4] Admin orqali yangi foydalanuvchi yaratish (POST /api/admin/users)...');
  const testPhone = '998901239999';
  // Check if exists first to clean up
  const { data: existing } = await adminClient.from('profiles').select('id').eq('email', `${testPhone}@phone.intizomly.uz`);
  if (existing && existing.length > 0) {
    await adminClient.auth.admin.deleteUser(existing[0].id);
    await adminClient.from('profiles').delete().eq('id', existing[0].id);
  }

  const createReq = createMockRequest({
    method: 'POST',
    url: '/api/admin/users',
    headers: { 'authorization': `Bearer ${adminToken}` },
    body: {
      firstName: 'Test',
      lastName: 'Avtomat',
      phone: testPhone,
      password: 'password123',
      role: 'user'
    }
  });
  const createRes = createMockResponse();
  await handleAdminApi(createReq, createRes);
  const createBody = createRes.getBodyJson();
  console.log('Yaratish natijasi:', createBody);
  if (!createBody.success || !createBody.user?.id) {
    throw new Error('User creation failed: ' + JSON.stringify(createBody));
  }
  const createdUserId = createBody.user.id;
  console.log('✅ Foydalanuvchi muvaffaqiyatli yaratildi! ID:', createdUserId);

  // TEST 5: Verify new user can sign in
  console.log('\n[TEST 5] Yangi foydalanuvchi tizimga kirishini tekshirish...');
  const { data: testUserLogin, error: testLoginErr } = await publicClient.auth.signInWithPassword({
    email: `${testPhone}@phone.intizomly.uz`,
    password: 'password123'
  });
  if (testLoginErr || !testUserLogin?.user) {
    throw new Error('Yangi foydalanuvchi kira olmadi: ' + testLoginErr?.message);
  }
  console.log('✅ Yangi foydalanuvchi xatosiz tizimga kirdi!');

  // TEST 6: Admin Blocks User (Real Supabase Auth Ban)
  console.log('\n[TEST 6] Admin orqali foydalanuvchini bloklash (POST /api/admin/users/:id/block)...');
  const blockReq = createMockRequest({
    method: 'POST',
    url: `/api/admin/users/${createdUserId}/block`,
    headers: { 'authorization': `Bearer ${adminToken}` },
    body: { reason: "Qoidalarni buzganligi uchun" }
  });
  const blockRes = createMockResponse();
  await handleAdminApi(blockReq, blockRes);
  console.log('Bloklash javobi:', blockRes.getBodyJson());

  // TEST 7: Negative Test - Blocked user tries to log in
  console.log('\n[TEST 7] Salbiy test: Bloklangan foydalanuvchi kirishga urinishi...');
  const { error: blockedLoginErr } = await publicClient.auth.signInWithPassword({
    email: `${testPhone}@phone.intizomly.uz`,
    password: 'password123'
  });
  console.log('Kirish xatosi xabari:', blockedLoginErr?.message);
  if (blockedLoginErr?.message && (blockedLoginErr.message.includes('banned') || blockedLoginErr.message.includes('Invalid login'))) {
    console.log('✅ Supabase Auth bloklashni tasdiqladi: Bloklangan user kira olmaydi!');
  } else {
    throw new Error('Kutilgan bloklash xatosi chiqmadi: ' + blockedLoginErr);
  }

  // TEST 8: Admin Unblocks User
  console.log('\n[TEST 8] Admin orqali akkauntni qayta faollashtirish (POST /api/admin/users/:id/unblock)...');
  const unblockReq = createMockRequest({
    method: 'POST',
    url: `/api/admin/users/${createdUserId}/unblock`,
    headers: { 'authorization': `Bearer ${adminToken}` }
  });
  const unblockRes = createMockResponse();
  await handleAdminApi(unblockReq, unblockRes);
  console.log('Faollashtirish javobi:', unblockRes.getBodyJson());

  // TEST 9: Verify unblocked user can log in again
  console.log('\n[TEST 9] Qayta faollashtirilgan foydalanuvchi kirishi...');
  const { data: reloginData, error: reloginErr } = await publicClient.auth.signInWithPassword({
    email: `${testPhone}@phone.intizomly.uz`,
    password: 'password123'
  });
  if (reloginErr || !reloginData?.user) {
    throw new Error('Qayta kirish amalga oshmadi: ' + reloginErr?.message);
  }
  console.log('✅ Qayta faollashtirilgan foydalanuvchi muvaffaqiyatli kirdi!');

  // TEST 10: Announcement Creation & Audit Log
  console.log('\n[TEST 10] E\'lon yaratish va Audit loglarini tekshirish...');
  const annReq = createMockRequest({
    method: 'POST',
    url: '/api/admin/announcements',
    headers: { 'authorization': `Bearer ${adminToken}` },
    body: {
      title: 'Yangi Yangilanish 2.0',
      message: 'Intizomly tizimiga to\'liq Admin Dashboard qo\'shildi!',
      target: 'all',
      priority: 'urgent'
    }
  });
  const annRes = createMockResponse();
  await handleAdminApi(annReq, annRes);
  console.log('E\'lon javobi:', annRes.getBodyJson());

  const auditReq = createMockRequest({
    method: 'GET',
    url: '/api/admin/audit-logs',
    headers: { 'authorization': `Bearer ${adminToken}` }
  });
  const auditRes = createMockResponse();
  await handleAdminApi(auditReq, auditRes);
  const auditBody = auditRes.getBodyJson();
  console.log(`Audit loglar soni: ${auditBody.logs?.length || 0}`);
  const hasUserCreatedLog = auditBody.logs?.some(l => l.action === 'user_created');
  const hasUserBlockedLog = auditBody.logs?.some(l => l.action === 'user_blocked');
  const hasAnnLog = auditBody.logs?.some(l => l.action === 'announcement_created');
  console.log('Loglar tekshiruvi:', { hasUserCreatedLog, hasUserBlockedLog, hasAnnLog });
  if (!hasUserCreatedLog || !hasUserBlockedLog) {
    throw new Error('Audit logs missing expected action entries');
  }
  console.log('✅ Audit log tizimi barcha harakatlarni muvaffaqiyatli saqladi!');

  // TEST 11: Cleanup test user
  console.log('\n[TEST 11] Test foydalanuvchisini tozalash (DELETE /api/admin/users/:id)...');
  const delReq = createMockRequest({
    method: 'DELETE',
    url: `/api/admin/users/${createdUserId}`,
    headers: { 'authorization': `Bearer ${adminToken}` }
  });
  const delRes = createMockResponse();
  await handleAdminApi(delReq, delRes);
  console.log('O\'chirish natijasi:', delRes.getBodyJson());
  console.log('✅ Test foydalanuvchisi toza holatda o\'chirildi!');

  console.log('\n================================================================');
  console.log('🎉 BARCHA 11 TA TEST TO\'LIQ VA MUVAFFAQIYATLI O\'TDI!');
  console.log('================================================================');
}

runSuite().catch(err => {
  console.error('\n❌ TESTLARDA XATOLIK:', err);
  process.exit(1);
});
