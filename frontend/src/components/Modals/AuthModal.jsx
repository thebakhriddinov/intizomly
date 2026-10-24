import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHabits } from '../../context/HabitsContext';
import { useLanguage } from '../../context/LanguageContext';

export function AuthModal({ isOpen, onClose, isAuthGate = false }) {
  const { login, register, supabaseStatus } = useAuth();
  const { addToast } = useHabits();
  const { t } = useLanguage();

  const [authTab, setAuthTab] = useState('login'); // 'login' or 'register'
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await login(loginEmail, loginPassword);
      if (res.success) {
        addToast(t('toastWelcome'), `${res.user.firstName} (${(res.user.role || 'user').toUpperCase()})`, "success");
        if (onClose) onClose();
      } else {
        addToast("Xatolik", res.message, "warning");
      }
    } catch (err) {
      addToast("Xatolik", err.message || "Kirishda xatolik yuz berdi", "warning");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regEmail.trim() || !regPassword.trim() || !regFirstName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await register({
        firstName: regFirstName,
        lastName: regLastName,
        email: regEmail,
        password: regPassword
      });

      if (res.success) {
        if (res.needsEmailConfirmation) {
          addToast("Tasdiqlash xabari 📩", res.message, "info", 8000);
        } else {
          addToast(t('toastWelcome'), `${res.user.firstName}!`, "success");
        }
        if (onClose) onClose();
      } else {
        addToast("Xatolik", res.message, "warning");
      }
    } catch (err) {
      addToast("Xatolik", err.message || "Ro'yxatdan o'tishda xatolik", "warning");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillAdminCredentials = () => {
    setLoginEmail('bakhriddinoff01@gmail.com');
    setLoginPassword('password321');
  };

  return (
    <div
      className="modal-overlay"
      onClick={isAuthGate ? undefined : onClose}
      style={isAuthGate ? { background: 'rgba(8, 11, 17, 0.94)', backdropFilter: 'blur(20px)' } : undefined}
    >
      <div className="modal-card small-modal" onClick={(e) => e.stopPropagation()}>
        {!isAuthGate && (
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Yopish" style={{ position: 'absolute', top: '16px', right: '16px' }}>
            &times;
          </button>
        )}

        <div className="auth-header-visual">
          <div className="logo-icon-wrapper large-logo">
            <svg className="logo-svg" viewBox="0 0 32 32" fill="none">
              <path d="M16 2C13.5 7.5 9 11.5 9 18C9 24.075 12.134 28 16 28C19.866 28 23 24.075 23 18C23 14 20.5 10 16 2Z" fill="#B6F36B" />
              <path d="M11 18.5L14.5 22L21 14.5" stroke="#0B0D0F" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="auth-title">Intizomly</h3>
          <p className="auth-subtitle">Har kunlik intizom, odatlar va maqsadlar nazorati</p>

          <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 12px',
                borderRadius: '20px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}
            >
              🟢 Supabase Cloud faol
            </span>
          </div>
        </div>

        {/* Tab switch */}
        <div className="auth-tabs-nav">
          <button
            type="button"
            className={`auth-tab-btn ${authTab === 'login' ? 'active' : ''}`}
            onClick={() => setAuthTab('login')}
          >
            {t('authLoginTitle')}
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${authTab === 'register' ? 'active' : ''}`}
            onClick={() => setAuthTab('register')}
          >
            {t('authRegisterTitle')}
          </button>
        </div>

        <div className="modal-body">
          {authTab === 'login' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Quick Admin fill button */}
              <div style={{
                padding: '10px 12px',
                background: 'var(--bg-secondary)',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>🛡️</span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Admin hisobi</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>bakhriddinoff01@gmail.com</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={fillAdminCredentials}
                  style={{ padding: '4px 10px', fontSize: '11.5px', height: 'auto' }}
                >
                  To'ldirish
                </button>
              </div>

              <div className="form-group">
                <label>Email Manzil</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="emailingizni kiriting..."
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Parol</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Parolni kiriting..."
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-actions" style={{ marginTop: '8px' }}>
                <button
                  type="submit"
                  className="primary-btn w-100"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Kutilmoqda..." : t('loginBtn')}
                </button>
              </div>

              <div style={{ textAlign: 'center', marginTop: '6px' }}>
                <button
                  type="button"
                  className="link-btn"
                  style={{ fontSize: '12.5px', color: 'var(--primary-accent)' }}
                  onClick={() => setAuthTab('register')}
                >
                  Hisobingiz yo'qmi? Yangi hisob yarating &rarr;
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                padding: '8px 12px',
                background: 'rgba(245, 158, 11, 0.08)',
                borderRadius: '10px',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                fontSize: '11.5px',
                color: 'var(--text-secondary)',
                lineHeight: '1.4'
              }}>
                ⚡ <strong>Yangi hisob:</strong> Barcha yangi foydalanuvchilar bepul rejimda boshlaydilar. PRO imkoniyatlari uchun $10 to'lov yoki admin ruxsati beriladi.
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Ism *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ismingiz"
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Familya</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Familyangiz"
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Manzil *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="masalan: siz@gmail.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Parol *</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Kamida 6 ta belgi..."
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-actions" style={{ marginTop: '8px' }}>
                <button
                  type="submit"
                  className="primary-btn w-100"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Hisob ochilmoqda..." : t('registerBtn')}
                </button>
              </div>

              <div style={{ textAlign: 'center', marginTop: '6px' }}>
                <button
                  type="button"
                  className="link-btn"
                  style={{ fontSize: '12.5px', color: 'var(--primary-accent)' }}
                  onClick={() => setAuthTab('login')}
                >
                  Akkauntingiz bormi? Tizimga kiring &rarr;
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
