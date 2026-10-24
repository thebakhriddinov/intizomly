import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHabits } from '../../context/HabitsContext';
import { useLanguage } from '../../context/LanguageContext';
import { storage } from '../../utils/storage';

export function ProfileSettingsModal({ isOpen, onClose, initialTab = 'profile', onOpenAuth, onOpenUpgrade }) {
  const { currentUser, isPremium, isAdmin, updateProfile, logout } = useAuth();
  const { settings, updateSettings, dateKey, history, habits, addToast } = useHabits();
  const { t, lang, setLanguage } = useLanguage();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [savingProfile, setSavingProfile] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.firstName || '');
      setLastName(currentUser.lastName || '');
      setPhone(currentUser.phone || '');
      setEmail(currentUser.email || '');
      setPassword(currentUser.password || '');
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({ firstName, lastName, phone, email, password });
      addToast("Profil saqlandi! 👤", `${firstName} ${lastName}`, "success");
    } catch (err) {
      addToast("Xatolik", err.message || "Profilni saqlab bo'lmadi", "warning");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleThemeSelect = (themeName) => {
    if (!isPremium && themeName !== 'emerald') {
      if (onOpenUpgrade) {
        onClose();
        onOpenUpgrade();
      }
      return;
    }
    updateSettings({ theme: themeName });
  };

  const streak = storage.getGlobalStreak();
  const totalDone = storage.getTotalCompletions();
  const todayStats = storage.getDayStats(dateKey);

  const initials = currentUser
    ? `${currentUser.firstName?.[0] || 'U'}${currentUser.lastName?.[0] || ''}`.toUpperCase()
    : 'AQ';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card profile-settings-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="tabs-header-nav">
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span>{t('tabProfile')}</span>
            </button>
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              <span>{t('tabSettings')}</span>
            </button>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Yopish">&times;</button>
        </div>

        {activeTab === 'profile' ? (
          <form onSubmit={handleProfileSubmit} className="modal-body">
            {/* Profile Avatar Card */}
            <div className="profile-avatar-header">
              <div className="big-avatar-wrapper">
                <div className="big-avatar-circle" style={{ background: currentUser?.avatarGradient || 'var(--bg-surface-elevated)' }}>
                  <span>{initials}</span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div className="profile-name-row">
                  <h3 className="profile-display-name">
                    {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Alisher Qodirov'}
                  </h3>
                  {isAdmin ? (
                    <span className="user-role-badge role-admin">{t('roleAdmin')}</span>
                  ) : isPremium ? (
                    <span className="user-role-badge role-premium">{t('rolePremium')}</span>
                  ) : (
                    <span className="user-role-badge role-user">{t('roleUser')}</span>
                  )}
                </div>
                <p className="profile-display-email">📞 {currentUser?.phone || (currentUser?.email && !currentUser.email.includes('@phone.intizomly.uz') ? currentUser.email : '70 126 5759')}</p>
              </div>
            </div>

            {/* Profile Mini Stats */}
            <div className="profile-stats-strip">
              <div className="prof-stat-box">
                <span className="prof-stat-num">{streak}</span>
                <span className="prof-stat-lbl">{t('streakLabel')}</span>
              </div>
              <div className="prof-stat-box">
                <span className="prof-stat-num">{totalDone}</span>
                <span className="prof-stat-lbl">{t('statsTotalDone')}</span>
              </div>
              <div className="prof-stat-box">
                <span className="prof-stat-num">{todayStats.percentage}%</span>
                <span className="prof-stat-lbl">{t('statsTodayProgress')}</span>
              </div>
            </div>

            {/* Profile Inputs */}
            <div className="form-row-2">
              <div className="form-group">
                <label>{t('profileName').split(' ')[0]}</label>
                <input
                  type="text"
                  className="form-control"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>{t('profileName').split(' ')[2] || 'Familya'}</label>
                <input
                  type="text"
                  className="form-control"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Telefon Raqam</label>
              <input
                type="tel"
                className="form-control"
                placeholder="Masalan: 70 126 5759 yoki 90 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>{t('profilePassword')}</label>
              <div className="password-input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  title="Parolni ko'rsatish/yashirish"
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-actions" style={{ justifyContent: 'space-between', marginTop: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-subtle"
                  style={{ color: 'var(--error, #ef4444)' }}
                  onClick={() => {
                    onClose();
                    logout();
                  }}
                >
                  Chiqish (Logout)
                </button>
                {!isPremium && (
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => {
                      onClose();
                      if (onOpenUpgrade) onOpenUpgrade();
                    }}
                    style={{ borderColor: 'var(--amber)', color: 'var(--amber)' }}
                  >
                    ⚡ PRO ($10)
                  </button>
                )}
              </div>
              <button type="submit" className="primary-btn" disabled={savingProfile}>
                {savingProfile ? "Saqlanmoqda..." : t('saveProfileBtn')}
              </button>
            </div>
          </form>
        ) : (
          <div className="modal-body">
            {/* 1. LANGUAGE SWITCHER (NEW FEATURE REQUEST) */}
            <div className="settings-group">
              <div>
                <h4 className="settings-group-title">🌐 {t('languageLabel')}</h4>
                <p className="settings-group-desc">{t('languageDesc')}</p>
              </div>
              <div className="ios-segmented-control" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <button
                  type="button"
                  className={`segmented-btn ${lang === 'uz' ? 'active' : ''}`}
                  onClick={() => setLanguage('uz')}
                >
                  🇺🇿 O'zbekcha
                </button>
                <button
                  type="button"
                  className={`segmented-btn ${lang === 'ru' ? 'active' : ''}`}
                  onClick={() => setLanguage('ru')}
                >
                  🇷🇺 Русский
                </button>
                <button
                  type="button"
                  className={`segmented-btn ${lang === 'en' ? 'active' : ''}`}
                  onClick={() => setLanguage('en')}
                >
                  🇬🇧 English
                </button>
              </div>
            </div>

            {/* 2. APPEARANCE (LIGHT / DARK / SYSTEM) */}
            <div className="settings-group">
              <div>
                <h4 className="settings-group-title">🌓 {t('appearanceLabel')}</h4>
                <p className="settings-group-desc">{t('appearanceDesc')}</p>
              </div>
              <div className="ios-segmented-control">
                <button
                  type="button"
                  className={`segmented-btn ${(settings.appearance || 'system') === 'system' ? 'active' : ''}`}
                  onClick={() => updateSettings({ appearance: 'system' })}
                >
                  ⚙️ {t('appearanceSystem')}
                </button>
                <button
                  type="button"
                  className={`segmented-btn ${settings.appearance === 'light' ? 'active' : ''}`}
                  onClick={() => updateSettings({ appearance: 'light' })}
                >
                  ☀️ {t('appearanceLight')}
                </button>
                <button
                  type="button"
                  className={`segmented-btn ${settings.appearance === 'dark' ? 'active' : ''}`}
                  onClick={() => updateSettings({ appearance: 'dark' })}
                >
                  🌙 {t('appearanceDark')}
                </button>
              </div>
            </div>

            {/* 3. LIQUID COLOR THEMES */}
            <div className="settings-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 className="settings-group-title">🎨 {t('themeLabel')}</h4>
                  <p className="settings-group-desc">{t('themeDesc')}</p>
                </div>
                {!isPremium && (
                  <span className="user-role-badge role-premium">⚡ PRO ONLY</span>
                )}
              </div>

              <div className="theme-picker-grid">
                <div
                  className={`theme-option-card ${settings.theme === 'emerald' ? 'active' : ''}`}
                  onClick={() => handleThemeSelect('emerald')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="theme-swatch swatch-emerald"></div>
                  <span className="theme-title">{t('themeEmerald')}</span>
                </div>

                <div
                  className={`theme-option-card ${settings.theme === 'violet' ? 'active' : ''}`}
                  onClick={() => handleThemeSelect('violet')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="theme-swatch swatch-violet"></div>
                  <span className="theme-title">{t('themeViolet')}</span>
                  {!isPremium && <span className="theme-badge-premium">PRO</span>}
                </div>

                <div
                  className={`theme-option-card ${settings.theme === 'cyber' ? 'active' : ''}`}
                  onClick={() => handleThemeSelect('cyber')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="theme-swatch swatch-cyber"></div>
                  <span className="theme-title">{t('themeCyber')}</span>
                  {!isPremium && <span className="theme-badge-premium">PRO</span>}
                </div>

                <div
                  className={`theme-option-card ${settings.theme === 'gold' ? 'active' : ''}`}
                  onClick={() => handleThemeSelect('gold')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="theme-swatch swatch-gold"></div>
                  <span className="theme-title">{t('themeGold')}</span>
                  {!isPremium && <span className="theme-badge-premium">PRO</span>}
                </div>

                <div
                  className={`theme-option-card ${settings.theme === 'oled' ? 'active' : ''}`}
                  onClick={() => handleThemeSelect('oled')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="theme-swatch swatch-oled"></div>
                  <span className="theme-title">{t('themeOled')}</span>
                  {!isPremium && <span className="theme-badge-premium">PRO</span>}
                </div>
              </div>
            </div>

            {/* 4. SOUND & CONFETTI TOGGLES */}
            <div className="settings-group">
              <div className="setting-toggle-row">
                <div>
                  <span className="toggle-title">🔊 {t('soundLabel')}</span>
                  <span className="toggle-sub">{t('soundDesc')}</span>
                </div>
                <label className="switch-control">
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled !== false}
                    onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>

              <div className="setting-toggle-row">
                <div>
                  <span className="toggle-title">🎉 {t('confettiLabel')}</span>
                  <span className="toggle-sub">{t('confettiDesc')}</span>
                </div>
                <label className="switch-control">
                  <input
                    type="checkbox"
                    checked={settings.confettiEnabled !== false}
                    onChange={(e) => updateSettings({ confettiEnabled: e.target.checked })}
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
