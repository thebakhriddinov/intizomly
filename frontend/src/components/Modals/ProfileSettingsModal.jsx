import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHabits } from '../../context/HabitsContext';
import { useLanguage } from '../../context/LanguageContext';
import { storage } from '../../utils/storage';
import { validateUzbekPhone } from '../../utils/phone';
import { PWAInstallCard } from '../Common/PWAInstallCard';
import {
  IconPhone,
  IconGlobe,
  IconSun,
  IconMoon,
  IconDevice,
  IconPalette,
  IconVolume,
  IconSparkles,
  IconLightning,
  IconKey,
  IconLock,
  IconSupport,
  IconTelegram
} from '../Common/AppIcons';

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
  const [settingsPassword, setSettingsPassword] = useState('');
  const [showSettingsPassword, setShowSettingsPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPWAInstall, setShowPWAInstall] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.firstName || '');
      setLastName(currentUser.lastName || '');
      setPhone(currentUser.phone || '');
      setEmail(currentUser.email || '');
      const pwd = currentUser.password || '';
      setPassword(pwd);
      setSettingsPassword(pwd);
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (phone) {
      const v = validateUzbekPhone(phone);
      if (!v.isValid) {
        addToast("Xatolik", v.message, "warning");
        return;
      }
    }

    setSavingProfile(true);
    try {
      await updateProfile({ firstName, lastName, phone, email, password });
      addToast("Profil saqlandi! 👤", `${firstName} ${lastName}`, "success");
      onClose?.();
    } catch (err) {
      addToast("Xatolik", err.message || "Profilni saqlab bo'lmadi", "warning");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePasswordFromSettings = async (e) => {
    e?.preventDefault?.();
    if (!settingsPassword || settingsPassword.length < 6) {
      addToast("Xatolik", "Parol kamida 6 ta belgidan iborat bo'lishi kerak", "warning");
      return;
    }
    setSavingPassword(true);
    try {
      await updateProfile({ password: settingsPassword });
      setPassword(settingsPassword);
      addToast("Parol yangilandi! 🔒", "Yangi parolingiz muvaffaqiyatli saqlandi", "success");
      onClose?.();
    } catch (err) {
      addToast("Xatolik", err.message || "Parolni o'zgartirib bo'lmadi", "warning");
    } finally {
      setSavingPassword(false);
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
                <p className="profile-display-email" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IconPhone size={13} color="var(--primary-accent)" />
                  <span>{currentUser?.phone || (currentUser?.email && !currentUser.email.includes('@phone.intizomly.uz') ? currentUser.email : '70 126 5759')}</span>
                </p>
              </div>
            </div>

            {/* Profile Mini Stats */}
            <div className="profile-stats-strip">
              <div className="prof-stat-box">
                <span className="prof-stat-num">{streak}</span>
                <span className="prof-stat-lbl">{t('streakLabel')}</span>
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
                    style={{ borderColor: 'var(--amber)', color: 'var(--amber)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <IconLightning size={14} color="#F59E0B" />
                    <span>PRO ($10)</span>
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
              {/* 0. PWA MOBILE APP INSTALLATION - Accordion Toggle on Click */}
              <div className="settings-group" style={{ marginBottom: '18px' }}>
                <button
                  type="button"
                  onClick={() => setShowPWAInstall(prev => !prev)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    background: showPWAInstall ? 'rgba(182, 243, 107, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${showPWAInstall ? 'var(--primary-accent)' : 'rgba(255, 255, 255, 0.1)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.22s ease',
                    color: 'var(--text-primary)'
                  }}
                  title="Ilovani o'rnatish yo'riqnomasi"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      background: 'rgba(182, 243, 107, 0.15)',
                      border: '1px solid rgba(182, 243, 107, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary-accent)',
                      flexShrink: 0
                    }}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                        <line x1="12" y1="18" x2="12.01" y2="18" />
                      </svg>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Ilovani o'rnatish (Telefon & Kompyuter)
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {showPWAInstall ? "Yo'riqnomani yopish uchun bosing" : "Ilovani o'rnatish yo'riqnomasini ko'rish uchun bosing"}
                      </div>
                    </div>
                  </div>
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{
                      transform: showPWAInstall ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.25s ease',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {showPWAInstall && (
                  <div style={{ marginTop: '12px', animation: 'fadeIn 0.25s ease' }}>
                    <PWAInstallCard />
                  </div>
                )}
              </div>

              {/* 1. LANGUAGE SWITCHER */}
              <div className="settings-group">
                <div>
                  <h4 className="settings-group-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconGlobe size={18} color="var(--primary-accent)" />
                    <span>{t('languageLabel')}</span>
                  </h4>
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
                  <h4 className="settings-group-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconMoon size={18} color="var(--primary-accent)" />
                    <span>{t('appearanceLabel')}</span>
                  </h4>
                  <p className="settings-group-desc">{t('appearanceDesc')}</p>
                </div>
                <div className="ios-segmented-control">
                  <button
                    type="button"
                    className={`segmented-btn ${(settings.appearance || 'system') === 'system' ? 'active' : ''}`}
                    onClick={() => updateSettings({ appearance: 'system' })}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <IconDevice size={14} />
                    <span>{t('appearanceSystem')}</span>
                  </button>
                  <button
                    type="button"
                    className={`segmented-btn ${settings.appearance === 'light' ? 'active' : ''}`}
                    onClick={() => updateSettings({ appearance: 'light' })}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <IconSun size={14} />
                    <span>{t('appearanceLight')}</span>
                  </button>
                  <button
                    type="button"
                    className={`segmented-btn ${settings.appearance === 'dark' ? 'active' : ''}`}
                    onClick={() => updateSettings({ appearance: 'dark' })}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <IconMoon size={14} />
                    <span>{t('appearanceDark')}</span>
                  </button>
                </div>
              </div>

              {/* 3. LIQUID COLOR THEMES */}
              <div className="settings-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 className="settings-group-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IconPalette size={18} color="var(--primary-accent)" />
                      <span>{t('themeLabel')}</span>
                    </h4>
                    <p className="settings-group-desc">{t('themeDesc')}</p>
                  </div>
                  {!isPremium && (
                    <span className="user-role-badge role-premium" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <IconLightning size={12} color="#F59E0B" />
                      <span>PRO ONLY</span>
                    </span>
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
                    <span className="toggle-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IconVolume size={18} color="var(--primary-accent)" />
                      <span>{t('soundLabel')}</span>
                    </span>
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
                    <span className="toggle-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IconSparkles size={18} color="var(--primary-accent)" />
                      <span>{t('confettiLabel')}</span>
                    </span>
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

              {/* 5. XAVFSIZLIK & PAROL (SECURITY & PASSWORD) */}
              <div className="settings-group">
                <div style={{ marginBottom: '12px' }}>
                  <h4 className="settings-group-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconKey size={18} color="var(--primary-accent)" />
                    <span>Xavfsizlik & Parol</span>
                  </h4>
                  <p className="settings-group-desc">
                    Mavjud parolingizni ko'rishingiz yoki yangi parolga o'zgartirishingiz mumkin.
                  </p>
                </div>

                <div className="form-group" style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
                    Parolingiz
                  </label>
                  <div className="password-input-group">
                    <input
                      type={showSettingsPassword ? "text" : "password"}
                      className="form-control"
                      value={settingsPassword}
                      onChange={(e) => setSettingsPassword(e.target.value)}
                      placeholder="Kamida 6 ta belgi"
                    />
                    <button
                      type="button"
                      className="btn-toggle-password"
                      onClick={() => setShowSettingsPassword(!showSettingsPassword)}
                      title="Parolni ko'rsatish/yashirish"
                    >
                      {showSettingsPassword ? (
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                      ) : (
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      )}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button
                    type="button"
                    className="primary-btn"
                    disabled={savingPassword}
                    onClick={handleUpdatePasswordFromSettings}
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    {savingPassword ? "Saqlanmoqda..." : "Parolni saqlash"}
                  </button>
                </div>
              </div>

              {/* 6. SUPPORT & TELEGRAM */}
              <div className="settings-group support-settings-group" style={{ background: 'linear-gradient(135deg, rgba(34, 158, 217, 0.08) 0%, rgba(16, 185, 129, 0.06) 100%)', border: '1px solid rgba(34, 158, 217, 0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ flex: '1 1 240px' }}>
                    <h4 className="settings-group-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#229ED9' }}>
                      <IconSupport size={19} color="#229ED9" />
                      <span>Support & Bog'lanish</span>
                    </h4>
                    <p className="settings-group-desc" style={{ marginTop: '4px' }}>
                      Savol, taklif yoki muammolar bo'lsa, to'g'ridan-to'g'ri Telegram orqali yordam oling.
                    </p>
                  </div>
                  <a
                    href="https://t.me/thebakhriddinov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-telegram-support"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      borderRadius: '12px',
                      background: 'rgba(34, 158, 217, 0.18)',
                      border: '1px solid rgba(34, 158, 217, 0.4)',
                      color: '#229ED9',
                      fontWeight: 700,
                      fontSize: '13.5px',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 8px rgba(34, 158, 217, 0.15)'
                    }}
                  >
                    <IconTelegram size={18} color="#229ED9" />
                    <span>@thebakhriddinov</span>
                  </a>
                </div>
              </div>
            </div>
        )}
          </div>
    </div>
      );
}
