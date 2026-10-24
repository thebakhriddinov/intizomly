import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHabits } from '../../context/HabitsContext';
import { useLanguage } from '../../context/LanguageContext';
import { storage } from '../../utils/storage';

export function AdminModal({ isOpen, onClose }) {
  const { users, adminToggleUserRole, adminDeleteUser, adminAddUser } = useAuth();
  const { triggerBanner, addToast } = useHabits();
  const { t } = useLanguage();

  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('user');

  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  if (!isOpen) return null;

  const adminStats = storage.getAdminStats();

  const handleAddUser = (e) => {
    e.preventDefault();
    const res = adminAddUser({
      firstName: newFirstName,
      lastName: newLastName,
      email: newEmail,
      password: newPassword,
      role: newRole
    });

    if (res.success) {
      setNewFirstName('');
      setNewLastName('');
      setNewEmail('');
      setNewPassword('');
      addToast("Foydalanuvchi qo'shildi! ✅", `${newFirstName} (${newRole.toUpperCase()})`, "success");
    } else {
      addToast("Xatolik", res.message, "warning");
    }
  };

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastTitle.trim()) return;

    triggerBanner(`📢 [Admin] ${broadcastTitle}`, broadcastMessage || "Barcha a'zolar uchun muhim xabar!");
    addToast("Bildirishnoma yuborildi! 🚀", broadcastTitle, "success");
    setBroadcastTitle('');
    setBroadcastMessage('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card admin-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge" style={{ color: 'var(--error)' }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <div>
              <h3 className="modal-title">{t('adminTitle')}</h3>
              <p className="modal-desc">{t('adminDesc')}</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Yopish">&times;</button>
        </div>

        <div className="modal-body">
          {/* KPI Cards Grid */}
          <div className="admin-kpi-grid">
            <div className="admin-kpi-card">
              <span className="kpi-lbl">{t('kpiUsers')}</span>
              <span className="kpi-num text-blue">{adminStats.totalUsers}</span>
            </div>
            <div className="admin-kpi-card">
              <span className="kpi-lbl">{t('kpiPremium')}</span>
              <span className="kpi-num text-amber">{adminStats.premiumUsers}</span>
            </div>
            <div className="admin-kpi-card">
              <span className="kpi-lbl">{t('kpiFree')}</span>
              <span className="kpi-num">{adminStats.freeUsers}</span>
            </div>
            <div className="admin-kpi-card">
              <span className="kpi-lbl">{t('kpiDone')}</span>
              <span className="kpi-num text-emerald">{adminStats.totalDone}</span>
            </div>
          </div>

          {/* Broadcast Form */}
          <div className="admin-subcard">
            <div className="admin-subcard-header">
              <h4>📢 {t('adminBroadcastTitle')}</h4>
              <span className="text-hint">Barcha a'zolarning ekraniga tezkor iPhone bildirishnomasi yuboriladi</span>
            </div>
            <form onSubmit={handleBroadcast}>
              <div className="form-row-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Xabar sarlavhasi (masalan: Bugun soat 20:00 da audit)"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  required
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Xabar matni..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                />
              </div>
              <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="primary-btn">
                  <span>{t('broadcastBtn')}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Add User Form */}
          <div className="admin-subcard">
            <div className="admin-subcard-header">
              <h4>➕ Yangi Foydalanuvchi Qo'shish</h4>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="form-row-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ism *"
                  value={newFirstName}
                  onChange={(e) => setNewFirstName(e.target.value)}
                  required
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Familya *"
                  value={newLastName}
                  onChange={(e) => setNewLastName(e.target.value)}
                  required
                />
                <select
                  className="form-control"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  <option value="user">👤 Oddiy A'zo</option>
                  <option value="premium">⚡ PRO A'zo</option>
                  <option value="admin">🛡️ Administrator</option>
                </select>
              </div>

              <div className="form-row-2" style={{ marginTop: '8px' }}>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email Manzil *"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Parol *"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="secondary-btn">
                  Foydalanuvchini Saqlash
                </button>
              </div>
            </form>
          </div>

          {/* Users Table */}
          <div className="admin-subcard">
            <div className="admin-subcard-header">
              <h4>👥 Tizim Foydalanuvchilari Ro'yxati</h4>
              <span className="text-hint">Bitta bosishda ⚡ PRO berish yoki qaytarib olish mumkin</span>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th>Foydalanuvchi</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Qo'shilgan</th>
                    <th>Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => {
                    const isAdm = u.role === 'admin';
                    const isPrem = u.role === 'premium';
                    const initials = `${u.firstName?.[0] || 'U'}${u.lastName?.[0] || ''}`.toUpperCase();

                    return (
                      <tr key={u.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: u.avatarGradient || 'var(--primary-accent)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11px',
                                fontWeight: 700,
                                color: '#fff'
                              }}
                            >
                              {initials}
                            </div>
                            <strong>{u.firstName} {u.lastName}</strong>
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td>
                          {isAdm ? (
                            <span className="user-role-badge role-admin">🛡️ ADMIN</span>
                          ) : isPrem ? (
                            <span className="user-role-badge role-premium">⚡ PRO</span>
                          ) : (
                            <span className="user-role-badge role-user">👤 ODDIY</span>
                          )}
                        </td>
                        <td>{u.createdAt || '2026-01-01'}</td>
                        <td>
                          {!isAdm ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                type="button"
                                className={`btn-toggle-premium-action ${isPrem ? 'btn-revoke-premium' : 'btn-grant-premium'}`}
                                onClick={() => adminToggleUserRole(u.id)}
                              >
                                {isPrem ? t('adminRevokePro') : t('adminGrantPro')}
                              </button>
                              <button
                                type="button"
                                className="action-icon-btn delete-btn"
                                onClick={() => {
                                  if (confirm(`"${u.firstName}"ni o'chirishni tasdiqlaysizmi?`)) {
                                    adminDeleteUser(u.id);
                                  }
                                }}
                                title={t('adminDeleteUser')}
                              >
                                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                              </button>
                            </div>
                          ) : (
                            <span className="text-muted" style={{ fontSize: '11px' }}>Boshqaruvchi</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
