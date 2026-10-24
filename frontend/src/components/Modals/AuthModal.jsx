import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHabits } from '../../context/HabitsContext';
import { useLanguage } from '../../context/LanguageContext';
import { validateUzbekPhone, formatUzbekPhone } from '../../utils/phone';

export function AuthModal({ isOpen, onClose, onLoginSuccess, isAuthGate = false }) {
  const { login, register } = useAuth();
  const { addToast } = useHabits();
  const { t } = useLanguage();

  const [authTab, setAuthTab] = useState('login'); // 'login' or 'register'
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const phoneValidation = validateUzbekPhone(loginPhone);
    if (!phoneValidation.isValid) {
      addToast("Xatolik", phoneValidation.message, "warning");
      return;
    }

    if (!loginPassword.trim()) {
      addToast("Xatolik", "Iltimos, parolni kiriting", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(phoneValidation.normalized, loginPassword);
      if (res.success) {
        const isAdm = res.user.role === 'admin';
        if (isAdm) {
          addToast("Xush kelibsiz, Boshqaruvchi! 🛡️", `${res.user.firstName} ${res.user.lastName}`, "success");
        } else {
          addToast(t('toastWelcome'), `${res.user.firstName}!`, "success");
        }

        if (onLoginSuccess) {
          onLoginSuccess(res.user);
        } else if (onClose) {
          onClose();
        }
      } else {
        addToast("Kirishda xatolik", res.message, "warning");
      }
    } catch (err) {
      addToast("Kirishda xatolik", err.message || "Tizimga kirib bo'lmadi", "warning");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!regFirstName.trim()) {
      addToast("Xatolik", "Iltimos, ismingizni kiriting", "warning");
      return;
    }

    if (!regLastName.trim()) {
      addToast("Xatolik", "Iltimos, familiyangizni kiriting", "warning");
      return;
    }

    const phoneValidation = validateUzbekPhone(regPhone);
    if (!phoneValidation.isValid) {
      addToast("Xatolik", phoneValidation.message, "warning");
      return;
    }

    if (!regPassword || regPassword.trim().length < 6) {
      addToast("Xatolik", "Parol kamida 6 ta belgidan iborat bo'lishi kerak", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register({
        firstName: regFirstName.trim(),
        lastName: regLastName.trim(),
        phone: phoneValidation.normalized,
        password: regPassword.trim()
      });

      if (res.success) {
        addToast("Tabriklaymiz! 🎉", `${res.user.firstName}, hisobingiz muvaffaqiyatli ochildi!`, "success");
        if (onLoginSuccess) {
          onLoginSuccess(res.user);
        } else if (onClose) {
          onClose();
        }
      } else {
        addToast("Ro'yxatdan o'tishda xatolik", res.message, "warning");
      }
    } catch (err) {
      addToast("Ro'yxatdan o'tishda xatolik", err.message || "Akkaunt yaratib bo'lmadi", "warning");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={isAuthGate ? undefined : onClose}
      style={isAuthGate ? { background: 'rgba(8, 11, 17, 0.94)', backdropFilter: 'blur(20px)' } : undefined}
    >
      <div className="modal-card small-modal" onClick={(e) => e.stopPropagation()}>
        {!isAuthGate && (
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Yopish"
            style={{ position: 'absolute', top: '16px', right: '16px' }}
          >
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
            disabled={isSubmitting}
          >
            {t('authLoginTitle')}
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${authTab === 'register' ? 'active' : ''}`}
            onClick={() => setAuthTab('register')}
            disabled={isSubmitting}
          >
            {t('authRegisterTitle')}
          </button>
        </div>

        <div className="modal-body">
          {authTab === 'login' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label>Telefon Raqam *</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="+998 (90) 123-45-67 yoki 70 126 57 59"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  disabled={isSubmitting}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Parol *</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Parolingizni kiriting..."
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                >
                  Hisobingiz yo'qmi? Yangi hisob oching &rarr;
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
                ⚡ <strong>Yangi hisob:</strong> Har bir yangi a'zo uchun bepul shaxsiy intizom paneli ochiladi. Email tasdiqlash talab qilinmaydi.
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
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Familiya *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Familiyangiz"
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Telefon Raqam *</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="+998 (90) 123-45-67 yoki 90 123 45 67"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="form-actions" style={{ marginTop: '8px' }}>
                <button
                  type="submit"
                  className="primary-btn w-100"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Akkaunt ochilmoqda..." : t('registerBtn')}
                </button>
              </div>

              <div style={{ textAlign: 'center', marginTop: '6px' }}>
                <button
                  type="button"
                  className="link-btn"
                  style={{ fontSize: '12.5px', color: 'var(--primary-accent)' }}
                  onClick={() => setAuthTab('login')}
                  disabled={isSubmitting}
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
