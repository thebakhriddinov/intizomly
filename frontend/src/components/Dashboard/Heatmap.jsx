import React, { memo, useMemo } from 'react';
import { useHabits } from '../../context/HabitsContext';
import { useLanguage } from '../../context/LanguageContext';
import { storage } from '../../utils/storage';

function HeatmapComponent() {
  const { currentDate, setCurrentDate, dateKey, history, habits } = useHabits();
  const { t, lang } = useLanguage();

  const shortMonthsUz = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
  const shortMonthsRu = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
  const shortMonthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const shortMonths = lang === 'ru' ? shortMonthsRu : lang === 'en' ? shortMonthsEn : shortMonthsUz;

  const { squares, monthLabels, activeDaysCount, totalCompletionsInPeriod } = useMemo(() => {
    const today = new Date();
    const sqList = [];
    const monthsSet = new Set();
    let activeDays = 0;
    let totalDone = 0;

    for (let i = 69; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dKey = storage.formatDateKey(d);
      const isSelected = dKey === dateKey;
      const isFuture = d > today && dKey !== storage.formatDateKey(today);

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

      monthsSet.add(shortMonths[d.getMonth()]);

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
  }, [dateKey, history, habits, shortMonths]);

  return (
    <section className="github-heatmap-card" id="github-heatmap-card">
      <div className="heatmap-header">
        <div className="heatmap-title-wrap">
          <div className="github-icon-badge">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          </div>
          <div>
            <h3 className="heatmap-heading">
              <span>{t('heatmapTitle')}</span>
              <span className="badge-github">70 KUN</span>
            </h3>
            <p className="heatmap-subheading">{t('heatmapSubtitle')}</p>
          </div>
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

      <div className="heatmap-container">
        <div className="heatmap-weekdays-col">
          <span>Dsh</span>
          <span>Chr</span>
          <span>Jum</span>
        </div>

        <div className="heatmap-scroll-area">
          <div className="heatmap-months-row">
            {monthLabels.map((m, idx) => <span key={idx}>{m}</span>)}
          </div>

          <div className="github-squares-grid">
            {squares.map((sq) => {
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
      </div>

      <div className="heatmap-footer-info">
        <span>{t('heatmapActiveSummary')} <strong>{activeDaysCount} faol kun</strong>, {totalCompletionsInPeriod} marta odatlar bajarildi</span>
      </div>
    </section>
  );
}

export const Heatmap = memo(HeatmapComponent);
