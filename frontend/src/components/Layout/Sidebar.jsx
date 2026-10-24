import React, { memo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHabits } from '../../context/HabitsContext';
import { useLanguage } from '../../context/LanguageContext';
import { storage } from '../../utils/storage';

function SidebarComponent({ onOpenProfile, onOpenAdmin, onOpenAuth, onOpenUpgrade }) {
  const { currentUser, isAdmin, isPremium, logout } = useAuth();
  const { jumpToday, triggerBanner } = useHabits();
  const { t, lang } = useLanguage();

  const streak = storage.getGlobalStreak();

  const roleBadge = isAdmin
    ? <span className="user-role-badge role-admin">{t('roleAdmin')}</span>
    : isPremium
    ? <span className="user-role-badge role-premium">{t('rolePremium')}</span>
    : <span className="user-role-badge role-user">{t('roleUser')}</span>;

  const roleText = isAdmin
    ? t('roleAdminDesc')
    : isPremium
    ? t('rolePremiumDesc')
    : t('roleUserDesc');

  const initials = currentUser
    ? `${currentUser.firstName?.[0] || 'U'}${currentUser.lastName?.[0] || ''}`.toUpperCase()
    : 'U';

  return (
    <aside className="app-sidebar">
      <div className="sidebar-top">
        {/* Brand Logo */}
        <div className="brand-logo" onClick={jumpToday} role="button" tabIndex={0} title={t('appName')}>
          <div className="logo-icon-wrapper">
            <svg className="logo-svg" viewBox="0 0 32 32" fill="none">
              <path d="M16 2C13.5 7.5 9 11.5 9 18C9 24.075 12.134 28 16 28C19.866 28 23 24.075 23 18C23 14 20.5 10 16 2Z" fill="#B6F36B" />
              <path d="M11 18.5L14.5 22L21 14.5" stroke="#0B0D0F" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-name">Intizom<span className="accent-text">ly</span></span>
            {roleBadge}
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="sidebar-nav">
          <a href="#habits-section" className="sidebar-nav-item active">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
            <span>{t('navHabits')}</span>
          </a>

          <a href="#week-strip-card" className="sidebar-nav-item">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>{t('navWeek')}</span>
          </a>

          <a href="#github-heatmap-card" className="sidebar-nav-item">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <span>{t('navHeatmap')}</span>
          </a>

          <button
            type="button"
            className="sidebar-nav-item"
            onClick={() => triggerBanner(
              "🔔 " + (lang === 'ru' ? "Напоминание о привычках" : lang === 'en' ? "Discipline Check" : "Kunlik Intizom Eslatmasi"),
              lang === 'ru' ? "Сегодня выполнили все запланированные задачи? Проверьте свой прогресс в Intizomly! 💧📖" : lang === 'en' ? "Have you completed all planned habits today? Keep your streak burning! 💧📖" : "Bugun shakar iste'mol qildingizmi? Kitob o'qish va 2 litr suv ichish rejasi esingizdami? 🚫🍬💧"
            )}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            <span>{t('navNotifs')}</span>
            <span className="sidebar-badge">2</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              className="sidebar-nav-item"
              onClick={onOpenAdmin}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              <span>{t('navAdmin')}</span>
            </button>
          )}
        </nav>

        {/* Sidebar Streak Card */}
        <div className="sidebar-streak-card">
          <div className="sidebar-streak-header">
            <span className="streak-fire-anim">🔥</span>
            <div className="sidebar-streak-info">
              <span className="sidebar-streak-lbl">{t('streakLabel')}</span>
              <span className="sidebar-streak-num"><strong>{streak}</strong> {t('streakDays')}</span>
            </div>
          </div>
          <p className="sidebar-streak-desc">{t('streakEncourage')}</p>
        </div>
      </div>

      {/* Upgrade to PRO button if not premium */}
      {!isPremium && (
        <div style={{ padding: '0 var(--space-4) 10px var(--space-4)' }}>
          <button
            type="button"
            className="primary-btn w-100"
            onClick={onOpenUpgrade}
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              color: '#fff',
              border: 'none',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              borderRadius: '12px'
            }}
          >
            <span>⚡ PRO ga o'tish ($10)</span>
          </button>
        </div>
      )}

      {/* Sidebar User Footer */}
      <div className="sidebar-user-footer">
        <div
          className="sidebar-user-info"
          onClick={onOpenProfile}
          role="button"
          tabIndex={0}
          title={t('navProfile')}
        >
          <div className="avatar-circle" style={{ background: currentUser?.avatarGradient || 'var(--bg-surface-elevated)' }}>
            <span>{initials}</span>
          </div>
          <div className="sidebar-user-details">
            <span className="sidebar-user-name">
              {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Foydalanuvchi'}
            </span>
            <span className="sidebar-user-role-text">{roleText}</span>
          </div>
        </div>

        <button
          type="button"
          className="sidebar-logout-btn"
          onClick={logout}
          title={t('navLogout')}
          aria-label={t('navLogout')}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        </button>
      </div>
    </aside>
  );
}

export const Sidebar = memo(SidebarComponent);
