import React, { memo } from 'react';
import { useHabits } from '../../context/HabitsContext';
import { useLanguage } from '../../context/LanguageContext';

function DateNavigatorComponent({ className = '' }) {
  const {
    currentDate,
    shiftDate,
    jumpToday,
    isToday
  } = useHabits();
  const { t, lang } = useLanguage();

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

  const formattedDateText = isToday
    ? `${lang === 'ru' ? 'Сегодня' : lang === 'en' ? 'Today' : 'Bugun'}, ${dayNum}-${monthName}`
    : `${dayNum}-${monthName}, ${weekdayName}`;

  return (
    <div className={`date-navigator ${className}`}>
      <button
        type="button"
        className="date-nav-btn prev-day-btn"
        onClick={() => shiftDate(-1)}
        title="Oldingi kun"
        aria-label="Oldingi kun"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <div
        className="date-display"
        onClick={jumpToday}
        role="button"
        tabIndex={0}
        title={t('resetTodayTitle')}
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <span className="current-date-text" id="current-date-text">{formattedDateText}</span>
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
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      {/* Styled Qayta Boshlash (Reset to Today) button */}
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
  );
}

export const DateNavigator = memo(DateNavigatorComponent);
