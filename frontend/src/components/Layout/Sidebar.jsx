import React, { memo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHabits } from '../../context/HabitsContext';
import { useLanguage } from '../../context/LanguageContext';
import { storage } from '../../utils/storage';

import { BrandLogo } from '../Common/BrandLogo';

function SidebarComponent({
  activeTab = 'home',
  onSelectTab,
  onOpenProfile,
  onOpenAdmin,
  onOpenAuth,
  onOpenUpgrade
}) {
  const { currentUser, isAdmin, isPremium, logout } = useAuth();
  const { jumpToday } = useHabits();
  const { t } = useLanguage();

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

  const handleBrandClick = () => {
    onSelectTab?.('home');
    jumpToday();
  };

  return (
    <aside className="app-sidebar">
      <div className="sidebar-top">
        {/* Modern Brand Logo */}
        <BrandLogo
          size="md"
          roleBadge={roleBadge}
          onClick={handleBrandClick}
          className="sidebar-brand-btn"
        />

        {/* Sidebar Navigation */}
        <nav className="sidebar-nav">
          {/* Tab 1: Home */}
          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => onSelectTab?.('home')}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>{t('navHome') || 'Home'}</span>
          </button>

          {/* Tab 2: Motivation */}
          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === 'motivation' ? 'active' : ''}`}
            onClick={() => onSelectTab?.('motivation')}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span>{t('navMotivation') || 'Motivatsiya'}</span>
            <span className="sidebar-badge-shelby">Shelby</span>
          </button>

          {/* Tab 3: Reminder */}
          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === 'reminder' ? 'active' : ''}`}
            onClick={() => onSelectTab?.('reminder')}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{t('navReminder') || 'Eslatma & Qayd'}</span>
          </button>

          {/* Tab 4: Rankings */}
          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === 'rankings' ? 'active' : ''}`}
            onClick={() => onSelectTab?.('rankings')}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.45 1-1 1H7" />
              <path d="M14 14.66V17c0 .55.45 1 1 1h2" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
            <span>{t('navRankings') || 'Reytinglar'}</span>
          </button>

          {/* Tab 5: You (Profile) */}
          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === 'you' ? 'active' : ''}`}
            onClick={() => onSelectTab?.('you')}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>{t('navYou') || 'Profil'}</span>
          </button>

          {/* Admin Command Center */}
          {isAdmin && (
            <button
              type="button"
              className="sidebar-nav-item"
              onClick={onOpenAdmin}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
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
          onClick={() => onSelectTab?.('you')}
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
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </aside>
  );
}

export const Sidebar = memo(SidebarComponent);
