import React from 'react';

export function ConfirmActionModal({
  isOpen,
  title,
  message,
  confirmText = "Ha, tasdiqlayman",
  cancelText = "Bekor qilish",
  isDanger = false,
  onConfirm,
  onCancel,
  loading = false
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel} style={{ zIndex: 1100 }}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '440px',
          padding: '24px',
          borderRadius: '20px',
          background: 'rgba(18, 25, 38, 0.95)',
          backdropFilter: 'blur(20px)',
          border: isDanger ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: isDanger ? '0 20px 50px rgba(239, 68, 68, 0.25)' : '0 20px 50px rgba(0,0,0,0.5)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: isDanger ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: isDanger ? '#ef4444' : '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              flexShrink: 0
            }}
          >
            {isDanger ? '⚠️' : '🛡️'}
          </div>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {title}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
              {message}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button
            type="button"
            className="secondary-btn"
            onClick={onCancel}
            disabled={loading}
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: 700,
              borderRadius: '12px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              background: isDanger
                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                : 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              boxShadow: isDanger ? '0 4px 14px rgba(239, 68, 68, 0.35)' : '0 4px 14px rgba(16, 185, 129, 0.35)'
            }}
          >
            {loading ? 'Bajarilmoqda...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
