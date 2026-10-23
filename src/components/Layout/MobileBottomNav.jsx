import React, { memo } from 'react';
import { useLanguage } from '../../context/LanguageContext';

function MobileBottomNavComponent({ onOpenProfile }) {
  const { t } = useLanguage();

  return (
    <nav className="mobile-bottom-nav">
      <a href="#habits-section" className="mob-nav-btn active">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
        <span>{t('navHabits')}</span>
      </a>

      <a href="#week-strip-card" className="mob-nav-btn">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        <span>{t('navWeek')}</span>
      </a>

      <a href="#github-heatmap-card" className="mob-nav-btn">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        <span>{t('navHeatmap')}</span>
      </a>

      <button type="button" className="mob-nav-btn" onClick={onOpenProfile}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        <span>{t('tabProfile')}</span>
      </button>
    </nav>
  );
}

export const MobileBottomNav = memo(MobileBottomNavComponent);
