import React, { useState, useEffect } from 'react';
import { validateUzbekPhone, formatUzbekPhone } from '../../../utils/phone';

export function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  userToEdit = null,
  loading = false
}) {
  const isEdit = !!userToEdit;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [status, setStatus] = useState('active');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (userToEdit) {
      setFirstName(userToEdit.firstName || '');
      setLastName(userToEdit.lastName || '');
      setPhone(userToEdit.phone || '');
      setRole(userToEdit.role || 'user');
      setStatus(userToEdit.status || 'active');
      setPassword('');
    } else {
      setFirstName('');
      setLastName('');
      setPhone('');
      setPassword('');
      setRole('user');
      setStatus('active');
    }
    setErrorMsg('');
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg("Ism va familiyani kiriting");
      return;
    }

    if (!isEdit) {
      const v = validateUzbekPhone(phone);
      if (!v.isValid) {
        setErrorMsg(v.message);
        return;
      }
      if (!password || password.trim().length < 6) {
        setErrorMsg("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
        return;
      }
    }

    if (isEdit && password && password.trim().length < 6) {
      setErrorMsg("Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }

    onSubmit({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      role,
      status,
      password: password.trim() ? password.trim() : undefined
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1050 }}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '520px',
          width: '95%',
          borderRadius: '24px',
          background: 'rgba(18, 25, 38, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6)'
        }}
      >
        <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div className="modal-title-wrap">
            <div
              className="modal-icon-badge"
              style={{
                background: 'rgba(182, 243, 107, 0.15)',
                color: 'var(--primary-accent)',
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px'
              }}
            >
              {isEdit ? '✏️' : '👤'}
            </div>
            <div>
              <h3 className="modal-title" style={{ fontSize: '18px', fontWeight: 700 }}>
                {isEdit ? "Foydalanuvchini Tahrirlash" : "Yangi Foydalanuvchi Qo'shish"}
              </h3>
              <p className="modal-desc" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {isEdit
                  ? `${userToEdit.firstName} ${userToEdit.lastName} akkaunt ma'lumotlarini o'zgartirish`
                  : "Tizimga yangi xavfsiz foydalanuvchi hisobini qo'shish"}
              </p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Yopish">&times;</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {errorMsg && (
            <div
              style={{
                padding: '10px 14px',
                marginBottom: '16px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Ism *
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Mustafo"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Familiya *
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Bakhriddinov"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Telefon Raqam *
            </label>
            <input
              type="tel"
              className="form-control"
              placeholder="90 123 45 67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isEdit}
              required={!isEdit}
              style={{ opacity: isEdit ? 0.75 : 1 }}
            />
            {isEdit && (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Telefon raqami Supabase Auth bilan bog'langanligi sababli o'zgarmasdir.
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Foydalanuvchi Roli
              </label>
              <select
                className="form-control"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="user">👤 Oddiy A'zo</option>
                <option value="premium">⚡ PRO A'zo ($10)</option>
                <option value="admin">🛡️ Administrator</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Akkaunt Holati
              </label>
              <select
                className="form-control"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="active">🟢 Faol (Active)</option>
                <option value="blocked">🔴 Bloklangan (Blocked)</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              {isEdit ? "Yangi Parol (ixtiyoriy)" : "Parol *"}
            </label>
            <input
              type="password"
              className="form-control"
              placeholder={isEdit ? "O'zgartirmaslik uchun bo'sh qoldiring" : "Kamida 6 ta belgi"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!isEdit}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="secondary-btn"
              onClick={onClose}
              disabled={loading}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="primary-btn"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff',
                padding: '8px 20px',
                fontWeight: 700,
                borderRadius: '12px',
                border: 'none'
              }}
            >
              {loading ? "Saqlanmoqda..." : isEdit ? "O'zgarishlarni Saqlash" : "Foydalanuvchini Yaratish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
