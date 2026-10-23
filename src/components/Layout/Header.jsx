import React, { memo } from 'react';
import { useHabits } from '../../context/HabitsContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { storage } from '../../utils/storage';

function HeaderComponent({ onOpenProfile, onOpenAdmin, onOpenAuth }) {
  const {
    currentDate,
    shiftDate,
    jumpToday,
    isToday,
    settings,
    updateSettings,
    triggerBanner,
    history
  } = useHabits();
  const { currentUser, isAdmin, isPremium } = useAuth();
  const { t, lang } = useLanguage();

  const streak = storage.getGlobalStreak();

  const monthsUz = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
  ];
  const monthsRu = [
    'Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня',
    'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'
  ];
  const monthsEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdaysUz = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
  const weekdaysRu = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  const weekdaysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const monthList = lang === 'ru' ? monthsRu : lang === 'en' ? monthsEn : monthsUz;
  const weekdayList = lang === 'ru' ? weekdaysRu : lang === 'en' ? weekdaysEn : weekdaysUz;

  const dayNum = currentDate.getDate();
  const monthName = monthList[currentDate.getMonth()];
  const weekdayName = weekdayList[currentDate.getDay()];

  let formattedDateText = isToday
    ? `${lang === 'ru' ? 'Сегодня' : lang === 'en' ? 'Today' : 'Bugun'}, ${dayNum}-${monthName}`
    : `${dayNum}-${monthName}, ${weekdayName}`;

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

        {/* Date Navigator with styled Qayta Boshlash button */}
        <div className="date-navigator">
          <button
            type="button"
            className="date-nav-btn prev-day-btn"
            onClick={() => shiftDate(-1)}
            title="Oldingi kun"
            aria-label="Oldingi kun"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>

          <div className="date-display" onClick={jumpToday} role="button" tabIndex={0} title={t('resetTodayTitle')}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span id="current-date-text">{formattedDateText}</span>
            <span className={`today-indicator-tag ${isToday ? '' : 'is-past'}`}>
              {isToday ? t('today') : currentDate < new Date() ? t('pastDay') : t('futureDay')}
            </span>
          </div>

          <button
            type="button"
            className="date-nav-btn next-day-btn"
            onClick={() => shiftDate(1)}
            title="Keyingi kun"
            aria-label="Keyingi kun"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>

          {/* STYLED QAYTA BOSHLASH BUTTON */}
          {!isToday && (
            <button
              type="button"
              className="styled-reset-today-btn"
              onClick={jumpToday}
              title={t('resetTodayTitle')}
            >
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
              <span>{t('resetToday')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Header Right Actions */}
      <div className="header-right">
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
