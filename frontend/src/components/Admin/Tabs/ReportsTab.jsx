import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import { IconDocumentCsv, IconEye } from '../../Common/AppIcons';

export function ReportsTab({ onShowToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters for report
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsersWithMeta({
        limit: 1000 // all users for reporting
      });
      setUsers(res.allFilteredUsers || res.users || []);
    } catch (err) {
      console.error('Failed to load report data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrlangan ro'yxat
  const filteredUsers = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (statusFilter !== 'all' && (u.status || 'active') !== statusFilter) return false;

    if (dateRange !== 'all') {
      const d = u.createdAt;
      const now = new Date();
      if (dateRange === '7days') {
        const past = new Date(now);
        past.setDate(now.getDate() - 7);
        if (d < past.toISOString().split('T')[0]) return false;
      } else if (dateRange === '30days') {
        const past = new Date(now);
        past.setDate(now.getDate() - 30);
        if (d < past.toISOString().split('T')[0]) return false;
      } else if (dateRange === 'custom') {
        if (startDate && d < startDate) return false;
        if (endDate && d > endDate) return false;
      }
    }

    return true;
  });

  const handleExport = () => {
    try {
      const rangeLabel = dateRange === 'all' ? 'barcha' : dateRange;
      const filename = `intizomly_hisobot_${rangeLabel}_${new Date().toISOString().split('T')[0]}.csv`;
      adminService.exportUsersToCSV(filteredUsers, filename);
      onShowToast?.("Eksport qilindi! 📊", `${filteredUsers.length} ta foydalanuvchi ma'lumotlari CSV faylga saqlandi`, "success");
    } catch (err) {
      onShowToast?.("Xatolik", err.message, "warning");
    }
  };

  return (
    <div className="admin-reports-tab">
      {/* Export Setup Card */}
      <div
        style={{
          padding: '24px',
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <div style={{ padding: '6px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex' }}>
            <IconDocumentCsv size={22} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Foydalanuvchilar va Intizom Hisobotini Eksport Qilish
            </h4>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Excel / Google Sheets uchun qulay UTF-8 CSV formatida yuklab olish
            </span>
          </div>
        </div>

        {/* Filter Selection Controls */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
            marginBottom: '20px'
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Ro'yxatdan o'tgan sana oralig'i
            </label>
            <select
              className="form-control"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="all">Barcha davr</option>
              <option value="7days">Oxirgi 7 kun</option>
              <option value="30days">Oxirgi 30 kun</option>
              <option value="custom">Maxsus sana oralig'i...</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Rol bo'yicha filter
            </label>
            <select
              className="form-control"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Barcha rollar</option>
              <option value="user">👤 Faqat Oddiy</option>
              <option value="premium">⚡ Faqat PRO</option>
              <option value="admin">🛡️ Faqat Admin</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Holat bo'yicha filter
            </label>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Barcha holatlar</option>
              <option value="active">🟢 Faqat Faol</option>
              <option value="blocked">🔴 Faqat Bloklangan</option>
            </select>
          </div>
        </div>

        {dateRange === 'custom' && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: 'auto' }}
            />
            <span style={{ color: 'var(--text-muted)' }}>—</span>
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ width: 'auto' }}
            />
          </div>
        )}

        {/* Export Action Card */}
        <div
          style={{
            padding: '16px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Tanlangan: <span style={{ color: 'var(--primary-accent)' }}>{filteredUsers.length}</span> ta foydalanuvchi
            </span>
            <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Faqat ruxsat etilgan ma'lumotlar eksport qilinadi (ID, Ism, Familiya, Telefon, Rol, Holat, Odatlar va Bajarilganlar soni).
            </span>
          </div>

          <button
            type="button"
            className="primary-btn"
            onClick={handleExport}
            disabled={filteredUsers.length === 0}
            style={{
              padding: '10px 22px',
              fontSize: '13px',
              fontWeight: 700,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: filteredUsers.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            <IconDocumentCsv size={16} />
            <span>CSV Faylini Yuklab Olish</span>
          </button>
        </div>
      </div>

      {/* Preview Table */}
      <div
        style={{
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflow: 'hidden'
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconEye size={16} color="var(--primary-accent)" />
            Eksport qilinadigan ma'lumotlar namunasi (Dastlabki 10 ta yozuv)
          </h4>
        </div>

        {filteredUsers.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            Tanlangan mezonlar bo'yicha hech qanday ma'lumot topilmadi
          </div>
        ) : (
          <table className="admin-users-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px' }}>Ism / Familiya</th>
                <th style={{ padding: '10px 14px' }}>Telefon</th>
                <th style={{ padding: '10px 14px' }}>Rol</th>
                <th style={{ padding: '10px 14px' }}>Holat</th>
                <th style={{ padding: '10px 14px' }}>Sana</th>
                <th style={{ padding: '10px 14px' }}>Odatlar</th>
                <th style={{ padding: '10px 14px' }}>Bajarilgan</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.slice(0, 10).map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '10px 14px', fontSize: '13px', fontWeight: 600 }}>{u.firstName} {u.lastName}</td>
                  <td style={{ padding: '10px 14px', fontSize: '12px', color: 'var(--text-secondary)' }}>{u.phone}</td>
                  <td style={{ padding: '10px 14px', fontSize: '12px' }}>{u.role}</td>
                  <td style={{ padding: '10px 14px', fontSize: '12px' }}>{u.status || 'active'}</td>
                  <td style={{ padding: '10px 14px', fontSize: '12px', color: 'var(--text-muted)' }}>{u.createdAt}</td>
                  <td style={{ padding: '10px 14px', fontSize: '12px' }}>{u.habitsCount} ta</td>
                  <td style={{ padding: '10px 14px', fontSize: '12px', color: '#10b981', fontWeight: 700 }}>{u.completionsCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
