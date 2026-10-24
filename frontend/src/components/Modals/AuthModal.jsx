import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHabits } from '../../context/HabitsContext';
import { useLanguage } from '../../context/LanguageContext';

export function AuthModal({ isOpen, onClose }) {
  const { login, loginById, register } = useAuth();
  const { addToast } = useHabits();
  const { t } = useLanguage();

  const [authTab, setAuthTab] = useState('login'); // 'login' or 'register'
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    const res = login(loginEmail, loginPassword);
    if (res.success) {
      addToast(t('toastWelcome'), `${res.user.firstName} (${res.user.role.toUpperCase()})`, "success");
      onClose();
    } else {
      addToast("Xatolik", res.message, "warning");
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const res = register({
      firstName: regFirstName,
      lastName: regLastName,
      email: regEmail,
      password: regPassword
    });

    if (res.success) {
      addToast(t('toastWelcome'), `${res.user.firstName}!`, "success");
      onClose();
    } else {
      addToast("Xatolik", res.message, "warning");
    }
  };

  const handleDemoLogin = (userId) => {
    const res = loginById(userId);
    if (res.success) {
      addToast(t('toastWelcome'), `${res.user.firstName} (${res.user.role.toUpperCase()})`, "success");
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card small-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-header-visual">
          <div className="logo-icon-wrapper large-logo">
            <svg className="logo-svg" viewBox="0 0 32 32" fill="none">
              <path d="M16 2C13.5 7.5 9 11.5 9 18C9 24.075 12.134 28 16 28C19.866 28 23 24.075 23 18C23 14 20.5 10 16 2Z" fill="#B6F36B" />
              <path d="M11 18.5L14.5 22L21 14.5" stroke="#0B0D0F" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="auth-title">Intizomly</h3>
          <p className="auth-subtitle">Har kunlik intizom, odatlar va maqsadlar nazorati</p>
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
          {/* Quick Demo Accounts */}
          <div className="quick-demo-accounts">
            <span className="quick-demo-label">{t('demoAccounts')}</span>
            <div className="demo-btns-grid">
              <button
                type="button"
                className="demo-user-btn"
                onClick={() => handleDemoLogin('usr_admin')}
              >
                <span className="demo-badge text-error">🛡️ ADMIN</span>
                <span className="demo-name">Bakhriddin</span>
              </button>

              <button
                type="button"
                className="demo-user-btn"
                onClick={() => handleDemoLogin('usr_premium')}
              >
                <span className="demo-badge text-amber">⚡ PRO</span>
                <span className="demo-name">Malika K.</span>
              </button>

              <button
                type="button"
                className="demo-user-btn"
                onClick={() => handleDemoLogin('usr_free')}
              >
                <span className="demo-badge text-emerald">👤 ODDIY</span>
                <span className="demo-name">Alisher Q.</span>
              </button>
            </div>
          </div>

          <div className="auth-divider">
            <span>yoki email orqali</span>
          </div>

          {authTab === 'login' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label>Email Manzil</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="masalan: bakhriddinoff01@gmail.com"
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

              <div className="form-actions" style={{ marginTop: '6px' }}>
                <button type="submit" className="primary-btn w-100">
                  {t('loginBtn')}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Ism</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Alisher"
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
                    placeholder="Qodirov"
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Manzil</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="email@misol.uz"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Parol</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Kamida 6 ta belgi..."
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-actions" style={{ marginTop: '6px' }}>
                <button type="submit" className="primary-btn w-100">
                  {t('registerBtn')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
