import React, { memo, useMemo } from 'react';
import { useHabits } from '../../context/HabitsContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { storage } from '../../utils/storage';
import { DateNavigator } from '../Dashboard/DateNavigator';

import { BrandLogo } from '../Common/BrandLogo';
import { IconFlame } from '../Common/AppIcons';

function HeaderComponent({ onSelectTab }) {
  const { jumpToday, history, habits } = useHabits();
  const { t, lang } = useLanguage();
  const { unreadCount, openNotifications } = useNotifications();

  const streak = useMemo(() => {
    return storage.getGlobalStreak();
  }, [history, habits]);

  return (
    <header className="app-header">
      <div className="header-left">
        {/* Brand logo (Telefonda va Desktopda bir xil) */}
        <BrandLogo
          size="md"
          onClick={() => {
            onSelectTab?.('home');
            jumpToday();
          }}
          className="header-brand-logo"
        />

        {/* Global Streak Capsule */}
        <div className="header-streak-badge" title="Joriy uzluksiz intizom streak">
          <IconFlame size={16} className="streak-fire-anim" />
          <span><strong>{streak}</strong> {t('streakDays')}</span>
        </div>

        {/* Date Navigator (Desktop Only) */}
        <DateNavigator className="desktop-date-nav" />
      </div>

      {/* Header Right Actions - Faqat Notifications ikoni */}
      <div className="header-right">
        <button
          type="button"
          className={`icon-action-btn notif-bell-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
          onClick={openNotifications}
          title={lang === 'ru' ? `Уведомления (${unreadCount})` : lang === 'en' ? `Notifications (${unreadCount})` : `Bildirishnomalar & SMS (${unreadCount} ta yangi)`}
          aria-label="Bildirishnomalar va SMS"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </button>
      </div>
    </header>
  );
}

export const Header = memo(HeaderComponent);
