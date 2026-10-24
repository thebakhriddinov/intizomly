import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export function EnvWarningBanner() {
  const { supabaseStatus } = useAuth();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('intizomly_env_banner_dismissed') === 'true';
    } catch {
      return false;
    }
  });
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If already configured or user dismissed it, don't show
  if (supabaseStatus?.isConfigured || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem('intizomly_env_banner_dismissed', 'true');
    } catch {}
  };

  return (
    <>
      <div className="env-warning-banner">
        <div className="env-banner-content">
          <span className="env-banner-icon">⚡</span>
          <div className="env-banner-text">
            <strong>Supabase Cloud:</strong> Ilova hozirda xavfsiz <em>Lokal Demo</em> rejimida ishlamoqda.
            Haqiqiy Supabase bazasiga ulash uchun <code>frontend/.env.local</code> fayliga kalitlarni kiriting.
          </div>
          <button
            type="button"
            className="env-banner-guide-btn"
            onClick={() => setShowGuideModal(true)}
          >
            Yo'riqnoma
          </button>
          <button
            type="button"
            className="env-banner-close-btn"
            onClick={handleDismiss}
            aria-label="Yopish"
          >
            &times;
          </button>
        </div>
      </div>

      {showGuideModal && (
        <div className="modal-overlay" onClick={() => setShowGuideModal(false)}>
          <div className="modal-card small-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">🛠️ Supabase Sozlash Qo'llanmasi</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowGuideModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body" style={{ fontSize: '13.5px', lineHeight: '1.6' }}>
              <p>Haqiqiy Supabase ma'lumotlar bazasini ulash uchun quyidagi 3 qadamni bajaring:</p>
              
              <ol style={{ paddingLeft: '20px', margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>
                  <strong>1. SQL sxemani ishga tushiring:</strong><br />
                  Supabase Dashboard &rarr; <em>SQL Editor</em> sahifasiga o'ting va loyihadagi <code>supabase_schema.sql</code> fayli kodini nusxalab yurgizing.
                </li>
                <li>
                  <strong>2. Kalitlarni oling:</strong><br />
                  Supabase Dashboard &rarr; <em>Project Settings</em> &rarr; <em>API</em> bo'limidan <strong>Project URL</strong> va <strong>anon public key</strong> ni nusxalang.
                </li>
                <li>
                  <strong>3. .env.local faylini yarating:</strong><br />
                  <code>frontend/.env.local</code> fayliga quyidagilarni yozing:
                  <pre style={{
                    background: 'var(--bg-secondary)',
                    padding: '8px',
                    borderRadius: '8px',
                    marginTop: '4px',
                    fontSize: '12px',
                    overflowX: 'auto'
                  }}>
                    VITE_SUPABASE_URL=https://your-id.supabase.co{'\n'}
                    VITE_SUPABASE_ANON_KEY=your-anon-key
                  </pre>
                </li>
              </ol>

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => setShowGuideModal(false)}
                >
                  Tushundim
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
