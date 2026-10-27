import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { formatUzbekPhone } from '../../../utils/phone';
import { IconEye, IconEyeOff, IconLock, IconCheck } from '../../Common/AppIcons';

export function UserDetailsModal({
  isOpen,
  onClose,
  user,
  onEdit,
  onToggleBlock,
  onDelete
}) {
  const [habits, setHabits] = useState([]);
  const [completionsCount, setCompletionsCount] = useState(0);
  const [loadingHabits, setLoadingHabits] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  useEffect(() => {
    if (isOpen && user?.id) {
      setLoadingHabits(true);
      Promise.all([
        supabase.from('habits').select('*').eq('user_id', user.id),
        supabase.from('habit_completions').select('id', { count: 'exact' }).eq('user_id', user.id)
      ]).then(([hRes, cRes]) => {
        setHabits(hRes.data || []);
        setCompletionsCount(cRes.count || (cRes.data ? cRes.data.length : 0));
        setLoadingHabits(false);
      }).catch(err => {
        console.warn('Failed to load user details data:', err);
        setLoadingHabits(false);
      });
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const initials = `${user.firstName?.[0] || 'U'}${user.lastName?.[0] || ''}`.toUpperCase();
  const isBlocked = user.status === 'blocked';
  const isAdm = user.role === 'admin';
  const isPrem = user.role === 'premium';

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1060 }}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          width: '95%',
          borderRadius: '24px',
          background: 'rgba(18, 25, 38, 0.96)',
          backdropFilter: 'blur(25px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden'
        }}
      >
        {/* Header Hero */}
        <div
          style={{
            padding: '24px',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            position: 'relative'
          }}
        >
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            style={{ position: 'absolute', top: '16px', right: '16px' }}
          >
            &times;
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: user.avatarGradient || 'var(--primary-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: 800,
                color: '#fff',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                flexShrink: 0
              }}
            >
              {initials}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {user.firstName} {user.lastName}
                </h3>
                {isAdm ? (
                  <span className="user-role-badge role-admin">🛡️ ADMIN</span>
                ) : isPrem ? (
                  <span className="user-role-badge role-premium">⚡ PRO</span>
                ) : (
                  <span className="user-role-badge role-user">👤 ODDIY</span>
                )}
                {isBlocked && (
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: 'rgba(239, 68, 68, 0.2)',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.4)'
                    }}
                  >
                    🚫 BLOKLANGAN
                  </span>
                )}
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                {user.formattedPhone || formatUzbekPhone(user.phone)} &bull; {user.email || '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Security & Access / Password Box for Admin */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(182, 243, 107, 0.08) 0%, rgba(16, 185, 129, 0.04) 100%)',
              border: '1px solid rgba(182, 243, 107, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(182, 243, 107, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#B6F36B'
                }}
              >
                <IconLock size={18} color="#B6F36B" />
              </div>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>
                  Foydalanuvchi Paroli (Admin uchun)
                </span>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '15px',
                    fontWeight: 700,
                    letterSpacing: showPass ? '0.03em' : '0.2em',
                    color: showPass ? '#B6F36B' : 'var(--text-primary)',
                    userSelect: 'all'
                  }}
                >
                  {showPass ? (user.password || 'user123') : '••••••••••••'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowPass(!showPass)}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {showPass ? <IconEyeOff size={14} /> : <IconEye size={14} />}
                {showPass ? "Yashirish" : "Ko'rish"}
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  navigator.clipboard?.writeText(user.password || 'user123');
                  setCopiedPass(true);
                  setTimeout(() => setCopiedPass(false), 2000);
                }}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {copiedPass ? <IconCheck size={14} color="#10B981" /> : null}
                {copiedPass ? "Nusxalandi!" : "Nusxalash"}
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
            <div
              style={{
                padding: '12px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                textAlign: 'center'
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Qo'shilgan</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px', display: 'block' }}>
                {user.createdAt}
              </span>
            </div>
            <div
              style={{
                padding: '12px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                textAlign: 'center'
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Odatlar soni</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary-accent)', marginTop: '2px', display: 'block' }}>
                {habits.length} ta
              </span>
            </div>
            <div
              style={{
                padding: '12px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                textAlign: 'center'
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Jami bajarilgan</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#10b981', marginTop: '2px', display: 'block' }}>
                {completionsCount} marta
              </span>
            </div>
          </div>

          {/* User Habits Section */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                🎯 Foydalanuvchi Odatlari ({habits.length})
              </h4>
            </div>

            {loadingHabits ? (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                Odatlar yuklanmoqda...
              </div>
            ) : habits.length === 0 ? (
              <div
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px dashed rgba(255, 255, 255, 0.1)',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '13px'
                }}
              >
                Hozircha hech qanday odat yaratilmagan
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {habits.map(h => (
                  <div
                    key={h.id}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '18px' }}>{h.emoji || '🎯'}</span>
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                          {h.title}
                        </span>
                        {h.description && (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>
                            {h.description}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {h.target || '1 marta'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <button
              type="button"
              className="secondary-btn"
              onClick={() => {
                onClose();
                onEdit(user);
              }}
              style={{ flex: 1, minWidth: '120px', padding: '8px 12px', fontSize: '12px' }}
            >
              ✏️ Tahrirlash
            </button>

            {!isAdm && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onToggleBlock(user);
                }}
                style={{
                  flex: 1,
                  minWidth: '120px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '10px',
                  border: isBlocked ? '1px solid #10b981' : '1px solid #f59e0b',
                  background: isBlocked ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: isBlocked ? '#10b981' : '#f59e0b',
                  cursor: 'pointer'
                }}
              >
                {isBlocked ? '🟢 Qayta faollashtirish' : '🚫 Bloklash'}
              </button>
            )}

            {!isAdm && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDelete(user);
                }}
                style={{
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '10px',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#ef4444',
                  cursor: 'pointer'
                }}
              >
                🗑️ O'chirish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
