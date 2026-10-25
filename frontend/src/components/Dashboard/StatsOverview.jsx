import React, { memo, useMemo } from 'react';
import { useHabits } from '../../context/HabitsContext';
import { useLanguage } from '../../context/LanguageContext';
import { storage } from '../../utils/storage';
import { IconFlame } from '../Common/AppIcons';

function StatsOverviewComponent() {
  const { dateKey, history, habits } = useHabits();
  const { t } = useLanguage();

  const dayStats = useMemo(() => {
    return storage.getDayStats(dateKey);
  }, [dateKey, history, habits]);

  const globalStreak = useMemo(() => {
    return storage.getGlobalStreak();
  }, [history, habits]);

  const bestStreak = useMemo(() => {
    return storage.getBestStreak();
  }, [history, habits]);

  const totalCompletions = useMemo(() => {
    return storage.getTotalCompletions();
  }, [history]);

  // Circumference for 74px ring: 2 * PI * r = 2 * PI * 34 = ~213.6
  const circumference = 213.6;
  const strokeOffset = circumference - (circumference * dayStats.percentage) / 100;

  const levelText = useMemo(() => {
    if (totalCompletions >= 50) return t('statsLevelGrandmaster');
    if (totalCompletions >= 25) return t('statsLevelMaster');
    if (totalCompletions >= 10) return t('statsLevelActive');
    return t('statsLevelBeginner');
  }, [totalCompletions, t]);

  const progressSubtext = useMemo(() => {
    if (dayStats.total === 0) return "Hozircha odatlar mavjud emas";
    if (dayStats.percentage === 100) return "Barcha vazifalar bajarildi! Chempionsiz! 🏆";
    if (dayStats.percentage >= 50) return "Ajoyib davom etyapsiz, oz qoldi!";
    if (dayStats.completed > 0) return "Birinchi qadam qo'yildi, to'xtamang!";
    return "Kunlik vazifalar boshlanmoqda";
  }, [dayStats]);

  return (
    <section className="stats-grid">
      {/* 1. Today's Progress Card (Liquid Wave + Ring) */}
      <div className="stat-card stat-progress">
        <div className="stat-card-inner">
          <div className="stat-info">
            <span className="stat-label">{t('statsTodayProgress')}</span>
            <div className="stat-huge-number">
              <span>{dayStats.completed}</span>
              <span className="stat-denom">/{dayStats.total}</span>
            </div>
            <p className="stat-subtext">{progressSubtext}</p>
          </div>

          <div className="circular-progress-wrap">
            <svg className="progress-ring" width="74" height="74" viewBox="0 0 74 74">
              <circle
                className="progress-ring-bg"
                cx="37"
                cy="37"
                r="34"
                strokeWidth="5.5"
                fill="none"
              />
              <circle
                className="progress-ring-fill"
                cx="37"
                cy="37"
                r="34"
                strokeWidth="5.5"
                fill="none"
                strokeDasharray="213.6"
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
              />
            </svg>
            <span className="progress-ring-pct">{dayStats.percentage}%</span>
          </div>
        </div>

        {/* Dynamic Liquid Wave Progress Bar */}
        <div className="stat-progress-bar-container" title={`${dayStats.percentage}% bajarildi`}>
          <div
            className="stat-progress-bar-fill"
            style={{ width: `${dayStats.percentage}%` }}
          ></div>
        </div>
      </div>

      {/* 2. Current Streak Card (Dancing Fire Aura) */}
      <div className="stat-card stat-streak">
        <div className="stat-icon-glow fire-glow">
          <IconFlame size={24} className="streak-fire-anim" />
        </div>
        <div className="stat-info">
          <span className="stat-label">{t('streakLabel')}</span>
          <div className="stat-huge-number">
            <span>{globalStreak}</span> <span className="stat-unit">{t('streakDays').split(' ')[0]}</span>
          </div>
          <p className="stat-subtext">{t('streakKeepGoing')}</p>
        </div>
        <div className="stat-mini-pill">
          <span>{t('streakBest')} <strong>{bestStreak}</strong> {t('streakDays').split(' ')[0]}</span>
        </div>
      </div>

      {/* 3. Total Completed Habits Card */}
      <div className="stat-card stat-total">
        <div className="stat-icon-glow check-glow">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div className="stat-info">
          <span className="stat-label">{t('statsTotalDone')}</span>
          <div className="stat-huge-number">
            <span>{totalCompletions}</span> <span className="stat-unit">marta</span>
          </div>
          <p className="stat-subtext">{t('statsAllDays')}</p>
        </div>
        <div className="stat-mini-pill">
          <span>{levelText}</span>
        </div>
      </div>
    </section>
  );
}

export const StatsOverview = memo(StatsOverviewComponent);
