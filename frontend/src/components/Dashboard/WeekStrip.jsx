import React, { memo, useMemo } from 'react';
import { useHabits } from '../../context/HabitsContext';
import { useLanguage } from '../../context/LanguageContext';
import { storage } from '../../utils/storage';

function WeekStripComponent() {
  const { currentDate, setCurrentDate, dateKey, history } = useHabits();
  const { t, lang } = useLanguage();

  const shortDaysUz = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Juma', 'Shan'];
  const shortDaysRu = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const shortDaysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const shortDays = lang === 'ru' ? shortDaysRu : lang === 'en' ? shortDaysEn : shortDaysUz;
  const today = new Date();

  const { days, completedDaysCount } = useMemo(() => {
    const list = [];
    let completedCount = 0;

    for (let i = -3; i <= 3; i++) {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + i);
      const dKey = storage.formatDateKey(d);
      const isSelected = dKey === dateKey;
      const isTodayDate = (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      );

      const stats = storage.getDayStats(dKey);
      let statusClass = '';
      if (stats.total > 0 && stats.completed === stats.total) {
        statusClass = 'full-done';
        completedCount++;
      } else if (stats.completed > 0) {
        statusClass = 'partial-done';
      }

      list.push({
        date: d,
        dateKey: dKey,
        dayNum: d.getDate(),
        dayName: shortDays[d.getDay()],
        isSelected,
        isTodayDate,
        statusClass
      });
    }

    return { days: list, completedDaysCount: completedCount };
  }, [currentDate, dateKey, history, shortDays]);

  const weekPct = Math.round((completedDaysCount / 7) * 100);

  return (
    <section className="week-strip-card" id="week-strip-card">
      <div className="week-strip-header">
        <div className="week-strip-title">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <span>{t('weekTitle')}</span>
        </div>
        <div className="week-completion-info">
          <span>7 kundan: <strong className="highlight-val">{completedDaysCount} kun</strong> to'liq ({weekPct}%)</span>
        </div>
      </div>

      <div className="week-days-container">
        {days.map(d => (
          <div
            key={d.dateKey}
            className={`week-day-cell ${d.isSelected ? 'active-selected' : ''} ${d.isTodayDate ? 'is-today' : ''}`}
            onClick={() => setCurrentDate(new Date(d.date))}
            role="button"
            tabIndex={0}
          >
            <span className="day-name">{d.dayName}</span>
            <span className="day-number">{d.dayNum}</span>
            <span className={`day-status-indicator ${d.statusClass}`}></span>
          </div>
        ))}
      </div>
    </section>
  );
}

export const WeekStrip = memo(WeekStripComponent);
