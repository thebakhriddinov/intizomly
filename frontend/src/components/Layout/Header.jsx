import React, { memo } from 'react';
import { useHabits } from '../../context/HabitsContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { storage } from '../../utils/storage';
import { DateNavigator } from '../Dashboard/DateNavigator';

function HeaderComponent({ onOpenProfile, onOpenAdmin, onOpenAuth, onOpenUpgrade }) {
  const {
    jumpToday,
    settings,
    updateSettings,
    triggerBanner
  } = useHabits();
  const { currentUser, isAdmin, isPremium } = useAuth();
  const { t, lang } = useLanguage();

  const streak = storage.getGlobalStreak();

  const toggleAppearance = () => {
    const cur = settings.appearance || 'system';
    const next = cur === 'dark' ? 'light' : 'dark';
    updateSettings({ appearance: next });
  };

  const isDarkMode = settings.appearance === 'dark' || (
    settings.appearance !== 'light' &&
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  const initials = currentUser
    ? `${currentUser.firstName?.[0] || 'U'}${currentUser.lastName?.[0] || ''}`.toUpperCase()
    : 'AQ';

  return (
    <header className="app-header">
      <div className="header-left">
        {/* Mobile brand logo */}
        <div className="mobile-only-brand" onClick={jumpToday} role="button" tabIndex={0}>
          <div className="logo-icon-wrapper">
            <svg className="logo-svg" viewBox="0 0 32 32" fill="none">
              <path d="M16 2C13.5 7.5 9 11.5 9 18C9 24.075 12.134 28 16 28C19.866 28 23 24.075 23 18C23 14 20.5 10 16 2Z" fill="#B6F36B" />
              <path d="M11 18.5L14.5 22L21 14.5" stroke="#0B0D0F" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="brand-name">Intizom<span className="accent-text">ly</span></span>
        </div>

        {/* Global Streak Capsule */}
        <div className="header-streak-badge" title="Joriy uzluksiz intizom streak">
          <span className="streak-fire-anim">🔥</span>
          <span><strong>{streak}</strong> {t('streakDays')}</span>
        </div>

        {/* Date Navigator (Desktop Only) */}
        <DateNavigator className="desktop-date-nav" />
      </div>

      {/* Header Right Actions */}
      <div className="header-right">
        {!isPremium && (
          <button
            type="button"
            className="primary-btn"
            onClick={onOpenUpgrade}
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              color: '#fff',
              border: 'none',
              padding: '5px 12px',
              fontSize: '11.5px',
              fontWeight: 700,
              borderRadius: '20px'
            }}
          >
            ⚡ PRO ($10)
          </button>
        )}

        {isAdmin && (
          <button
            type="button"
            className="admin-panel-btn"
            onClick={onOpenAdmin}
            title={t('navAdmin')}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <span>{t('navAdmin')}</span>
          </button>
        )}

        {/* Appearance Toggle */}
        <button
          type="button"
          className="icon-action-btn appearance-toggle-btn"
          onClick={toggleAppearance}
          title={isDarkMode ? t('appearanceLight') : t('appearanceDark')}
          aria-label="Tashqi ko'rinish"
        >
          {isDarkMode ? (
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
          ) : (
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          )}
        </button>

        {/* Quick iPhone Notification Banner Trigger */}
        <button
          type="button"
          className="icon-action-btn notif-bell-btn"
          onClick={() => triggerBanner(
            "🔔 " + (lang === 'ru' ? "Напоминание о привычках" : lang === 'en' ? "Discipline Check" : "Kunlik Intizom Eslatmasi"),
            lang === 'ru' ? "Сегодня выполнили все запланированные задачи? Проверьте свой прогресс в Intizomly! 💧📖" : lang === 'en' ? "Have you completed all planned habits today? Keep your streak burning! 💧📖" : "Bugun shakar iste'mol qildingizmi? Kitob o'qish va 2 litr suv ichish rejasi esingizdami? 🚫🍬💧"
          )}
          title={t('navNotifs')}
          aria-label={t('navNotifs')}
        >
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          <span className="notification-badge">2</span>
        </button>

        {/* User Avatar Trigger */}
        <div
          className="user-avatar-trigger"
          onClick={onOpenProfile}
          role="button"
          tabIndex={0}
          title={t('navProfile')}
        >
          <div className="avatar-circle" style={{ background: currentUser?.avatarGradient || 'var(--bg-secondary)' }}>
            <span>{initials}</span>
          </div>
          <span className="avatar-online-dot"></span>
        </div>
      </div>
    </header>
  );
}

export const Header = memo(HeaderComponent);
