import React from 'react';
import { useHabits } from '../../context/HabitsContext';

export function ToastContainer() {
  const { toasts, removeToast } = useHabits();

  if (!toasts.length) return null;

  const icons = {
    success: '🎉',
    info: '💡',
    warning: '⚠️',
    reminder: '🔔'
  };

  return (
    <div className="toast-container" id="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast-item toast-${t.type || 'info'}`}>
          <div className="toast-icon">{icons[t.type] || '✨'}</div>
          <div className="toast-content">
            <span className="toast-title">{t.title}</span>
            {t.message && <span className="toast-message">{t.message}</span>}
          </div>
          <button
            type="button"
            className="toast-close-btn"
            onClick={() => removeToast(t.id)}
            aria-label="Yopish"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
