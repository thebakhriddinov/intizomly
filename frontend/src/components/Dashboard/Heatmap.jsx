import React, { memo, useMemo, useState } from 'react';
import { useHabits } from '../../context/HabitsContext';
import { useLanguage } from '../../context/LanguageContext';
import { storage } from '../../utils/storage';
import { IconCalendar, IconGrid } from '../Common/AppIcons';

const MONTH_NAMES_UZ = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
];
const MONTH_NAMES_RU = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];
const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES_UZ = ['Dsh', 'Ssh', 'Chr', 'Pay', 'Jum', 'Shn', 'Yak'];
const WEEKDAY_NAMES_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const WEEKDAY_NAMES_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function HeatmapComponent() {
  const { dateKey, history, habits, setCurrentDate } = useHabits();
  const { t, lang } = useLanguage();

  const monthNames = lang === 'ru' ? MONTH_NAMES_RU : lang === 'en' ? MONTH_NAMES_EN : MONTH_NAMES_UZ;
  const weekdayNames = lang === 'ru' ? WEEKDAY_NAMES_RU : lang === 'en' ? WEEKDAY_NAMES_EN : WEEKDAY_NAMES_UZ;

  // View mode: 'month' (calendar grid for chosen month) or 'streak70' (continuous 70-day strip)
  const [viewMode, setViewMode] = useState('month');

  // Month offset relative to current date (0 = current month, -1 = last month, -2 = 2 months ago, etc.)
  const [monthOffset, setMonthOffset] = useState(0);

  // Compute reference month
  const targetDate = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  const currentYear = targetDate.getFullYear();
  const currentMonthIdx = targetDate.getMonth();
  const currentMonthLabel = `${monthNames[currentMonthIdx]} ${currentYear}`;

  const isCurrentMonthNow = monthOffset === 0;

  // Month navigation handlers
  const handlePrevMonth = () => setMonthOffset((prev) => prev - 1);
  const handleNextMonth = () => setMonthOffset((prev) => prev + 1);
  const handleResetMonth = () => setMonthOffset(0);

  // 1. Data calculation for Selected Month Calendar Grid
  const monthCalendarData = useMemo(() => {
    const today = new Date();
    const todayKey = storage.formatDateKey(today);

    // Days in this month
    const totalDaysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();

    // First day of week (Monday=0 ... Sunday=6)
    const firstDayIndex = (new Date(currentYear, currentMonthIdx, 1).getDay() + 6) % 7;

    const days = [];
    let monthCompletions = 0;
    let activeDaysInMonth = 0;

    // Blank leading days from previous month
    for (let b = 0; b < firstDayIndex; b++) {
      days.push({ isBlank: true, key: `blank_${b}` });
    }

    // Actual days of this month
    for (let dayNum = 1; dayNum <= totalDaysInMonth; dayNum++) {
      const d = new Date(currentYear, currentMonthIdx, dayNum);
      const dKey = storage.formatDateKey(d);
      const isSelected = dKey === dateKey;
      const isToday = dKey === todayKey;
      const isFuture = d > today && dKey !== todayKey;

      const stats = storage.getDayStats(dKey);
      if (stats.completed > 0 && !isFuture) {
        activeDaysInMonth++;
        monthCompletions += stats.completed;
      }

      let lvl = 0;
      if (!isFuture) {
        if (stats.percentage >= 100) lvl = 4;
        else if (stats.percentage >= 66) lvl = 3;
        else if (stats.percentage >= 33) lvl = 2;
        else if (stats.completed > 0) lvl = 1;
      }

      days.push({
        isBlank: false,
        key: dKey,
        dayNum,
        date: d,
        dateKey: dKey,
        isSelected,
        isToday,
        isFuture,
        lvl: isFuture ? 0 : lvl,
        stats
      });
    }

    const monthConsistency = totalDaysInMonth > 0
      ? Math.round((activeDaysInMonth / totalDaysInMonth) * 100)
      : 0;

    return {
      days,
      activeDaysInMonth,
      monthCompletions,
      monthConsistency,
      totalDaysInMonth
    };
  }, [currentYear, currentMonthIdx, dateKey, history, habits]);

  // 2. Data calculation for Continuous 70-Day Strip
  const streak70Data = useMemo(() => {
    const today = new Date();
    const todayKey = storage.formatDateKey(today);
    const sqList = [];
    const monthsSet = new Set();
    let activeDays = 0;
    let totalDone = 0;

    for (let i = 69; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dKey = storage.formatDateKey(d);
      const isSelected = dKey === dateKey;
      const isFuture = d > today && dKey !== todayKey;

      const stats = storage.getDayStats(dKey);
      if (stats.completed > 0 && !isFuture) {
        activeDays++;
        totalDone += stats.completed;
      }

      let lvl = 0;
      if (!isFuture) {
        if (stats.percentage >= 100) lvl = 4;
        else if (stats.percentage >= 66) lvl = 3;
        else if (stats.percentage >= 33) lvl = 2;
        else if (stats.completed > 0) lvl = 1;
      }

      monthsSet.add(monthNames[d.getMonth()].slice(0, 3));

      sqList.push({
        dateKey: dKey,
        date: d,
        lvl: isFuture ? 0 : lvl,
        isSelected,
        isFuture,
        stats
      });
    }

    return {
      squares: sqList,
      monthLabels: Array.from(monthsSet).slice(-4),
      activeDaysCount: activeDays,
      totalCompletionsInPeriod: totalDone
    };
  }, [dateKey, history, habits, monthNames]);

  return (
    <section className="github-heatmap-card" id="github-heatmap-card">
      {/* Top Header */}
      <div className="heatmap-header">
        <div className="heatmap-title-wrap">
          <div className="github-icon-badge">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </div>
          <div>
            <h3 className="heatmap-heading">
              <span>{t('heatmapTitle')}</span>
              <span className="badge-github">
                {viewMode === 'month' ? currentMonthLabel : '70 KUN'}
              </span>
            </h3>
            <p className="heatmap-subheading">
              {viewMode === 'month'
                ? (lang === 'ru' ? 'Просмотр любого месяца и архив дисциплины' : lang === 'en' ? 'Browse any month & habits archive' : "Oylar bo'yicha intizom monitoringi va arxivi")
                : t('heatmapSubtitle')}
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="heatmap-controls-row">
          <div className="heatmap-view-tabs">
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              <IconCalendar size={14} />
              <span>{lang === 'ru' ? 'По месяцам' : lang === 'en' ? 'Monthly' : "Oylik"}</span>
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'streak70' ? 'active' : ''}`}
              onClick={() => setViewMode('streak70')}
            >
              <IconGrid size={14} />
              <span>70 {lang === 'ru' ? 'дней' : lang === 'en' ? 'days' : "kun"}</span>
            </button>
          </div>

          <div className="heatmap-legend">
            <span>{t('heatmapLegendLess')}</span>
            <div className="gh-legend-box gh-lvl-0"></div>
            <div className="gh-legend-box gh-lvl-1"></div>
            <div className="gh-legend-box gh-lvl-2"></div>
            <div className="gh-legend-box gh-lvl-3"></div>
            <div className="gh-legend-box gh-lvl-4"></div>
            <span>{t('heatmapLegendMore')}</span>
          </div>
        </div>
      </div>

      {/* Month Navigator Toolbar (Active in Month Mode) */}
      {viewMode === 'month' && (
        <div className="heatmap-month-nav-bar">
          <button
            type="button"
            className="month-nav-arrow-btn"
            onClick={handlePrevMonth}
            title={lang === 'ru' ? 'Предыдущий месяц' : lang === 'en' ? 'Previous month' : "Oldingi oy"}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            <span>{lang === 'ru' ? 'Пред.' : lang === 'en' ? 'Prev' : "Oldingi"}</span>
          </button>

          <div className="month-display-badge">
            <span className="month-current-text">{currentMonthLabel}</span>
            {!isCurrentMonthNow && (
              <button
                type="button"
                className="month-jump-today-btn"
                onClick={handleResetMonth}
              >
                {lang === 'ru' ? 'К текущему месяцу' : lang === 'en' ? 'Current Month' : "Hozirgi oyga"}
              </button>
            )}
          </div>

          <button
            type="button"
            className="month-nav-arrow-btn"
            onClick={handleNextMonth}
            title={lang === 'ru' ? 'Следующий месяц' : lang === 'en' ? 'Next month' : "Keyingi oy"}
          >
            <span>{lang === 'ru' ? 'След.' : lang === 'en' ? 'Next' : "Keyingi"}</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      )}

      {/* VIEW 1: MONTH CALENDAR GRID */}
      {viewMode === 'month' ? (
        <div className="month-calendar-view">
          {/* Weekday headers */}
          <div className="month-grid-weekdays">
            {weekdayNames.map((w, idx) => (
              <span key={idx} className="month-weekday-lbl">{w}</span>
            ))}
          </div>

          {/* Days grid */}
          <div className="month-days-grid">
            {monthCalendarData.days.map((dayItem) => {
              if (dayItem.isBlank) {
                return <div key={dayItem.key} className="month-day-cell is-blank" />;
              }

              const tooltip = dayItem.isFuture
                ? `${dayItem.dateKey}: Kelajak`
                : `${dayItem.dateKey}: ${dayItem.stats.completed}/${dayItem.stats.total} ta bajarildi (${dayItem.stats.percentage}%)`;

              return (
                <div
                  key={dayItem.key}
                  className={`month-day-cell gh-lvl-${dayItem.lvl} ${dayItem.isSelected ? 'is-current-selected' : ''} ${dayItem.isToday ? 'is-today-cell' : ''}`}
                  onClick={() => setCurrentDate(new Date(dayItem.date))}
                  title={tooltip}
                  role="button"
                  tabIndex={0}
                >
                  <span className="day-number">{dayItem.dayNum}</span>
                  {dayItem.isToday && <span className="today-dot" title="Bugun" />}
                  {dayItem.stats.completed > 0 && (
                    <span className="day-mini-badge">{dayItem.stats.completed}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Month Stats Summary */}
          <div className="heatmap-footer-info">
            <span>
              <strong>{currentMonthLabel}</strong>: {monthCalendarData.activeDaysInMonth} faol kun ({monthCalendarData.monthConsistency}%), {monthCalendarData.monthCompletions} marta odatlar bajarildi
            </span>
          </div>
        </div>
      ) : (
        /* VIEW 2: CONTINUOUS 70-DAY STRIP */
        <div className="heatmap-container">
          <div className="heatmap-weekdays-col">
            <span>Dsh</span>
            <span>Chr</span>
            <span>Jum</span>
          </div>

          <div className="heatmap-scroll-area">
            <div className="heatmap-months-row">
              {streak70Data.monthLabels.map((m, idx) => <span key={idx}>{m}</span>)}
            </div>

            <div className="github-squares-grid">
              {streak70Data.squares.map((sq) => {
                const dateLabel = sq.dateKey;
                const titleText = sq.isFuture
                  ? `${dateLabel}: Kelajak`
                  : `${dateLabel}: ${sq.stats.completed}/${sq.stats.total} ta odat bajarildi (${sq.stats.percentage}%)`;

                return (
                  <div
                    key={sq.dateKey}
                    className={`gh-square gh-lvl-${sq.lvl} ${sq.isSelected ? 'is-current-selected' : ''}`}
                    onClick={() => setCurrentDate(new Date(sq.date))}
                    title={titleText}
                    role="button"
                    tabIndex={0}
                  ></div>
                );
              })}
            </div>
          </div>

          <div className="heatmap-footer-info">
            <span>
              {t('heatmapActiveSummary')} <strong>{streak70Data.activeDaysCount} faol kun</strong>, {streak70Data.totalCompletionsInPeriod} marta odatlar bajarildi
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

export const Heatmap = memo(HeatmapComponent);
