import React, { memo, useRef, useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { audioManager } from '../../utils/audio';

const NAV_TABS = [
  {
    id: 'home',
    labelKey: 'navHome',
    defaultLabel: 'Home',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    )
  },
  {
    id: 'motivation',
    labelKey: 'navMotivation',
    defaultLabel: 'Motivatsiya',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    )
  },
  {
    id: 'reminder',
    labelKey: 'navReminder',
    defaultLabel: 'Eslatma',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    )
  },
  {
    id: 'rankings',
    labelKey: 'navRankings',
    defaultLabel: 'Reyting',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.45 1-1 1H7" />
        <path d="M14 14.66V17c0 .55.45 1 1 1h2" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
      </svg>
    )
  },
  {
    id: 'you',
    labelKey: 'navYou',
    defaultLabel: 'You',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    )
  }
];

function MobileBottomNavComponent({ activeTab = 'home', onSelectTab }) {
  const { t } = useLanguage();
  const navContainerRef = useRef(null);

  // Active tab index for fluid pill calculation
  const activeIndex = Math.max(0, NAV_TABS.findIndex((tab) => tab.id === activeTab));

  // Touch gesture state for sliding / dragging between tabs like iPhone
  const touchStartXRef = useRef(0);
  const isDraggingRef = useRef(false);

  const handleTabClick = (tabId) => {
    try {
      audioManager.playUncheck();
    } catch (_) {}
    onSelectTab?.(tabId);
  };

  // Touch Start
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    isDraggingRef.current = true;
  };

  // Touch Move: determine which tab is under finger or swipe direction
  const handleTouchMove = (e) => {
    if (!isDraggingRef.current || !navContainerRef.current) return;
    const clientX = e.touches[0].clientX;
    const rect = navContainerRef.current.getBoundingClientRect();

    if (clientX >= rect.left && clientX <= rect.right) {
      const relativeX = clientX - rect.left;
      const tabWidth = rect.width / NAV_TABS.length;
      const hoveredIndex = Math.min(
        NAV_TABS.length - 1,
        Math.max(0, Math.floor(relativeX / tabWidth))
      );
      const targetTab = NAV_TABS[hoveredIndex];
      if (targetTab && targetTab.id !== activeTab) {
        onSelectTab?.(targetTab.id);
      }
    }
  };

  // Touch End
  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  // Calculate indicator position
  // 5 tabs => each is 20% width
  const indicatorLeftPercent = activeIndex * 20;

  return (
    <nav
      className="mobile-liquid-bottom-nav"
      id="mobile-liquid-nav"
      ref={navContainerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Liquid sliding background pill that glides with iPhone spring inertia */}
      <div
        className="liquid-nav-indicator"
        style={{
          width: '20%',
          transform: `translateX(${indicatorLeftPercent * 5}%)`
        }}
      >
        <div className="liquid-pill-glow"></div>
        <div className="liquid-pill-body"></div>
      </div>

      {NAV_TABS.map((tab, idx) => {
        const isActive = tab.id === activeTab;
        const label = t(tab.labelKey) || tab.defaultLabel;

        return (
          <button
            key={tab.id}
            type="button"
            className={`mob-liquid-tab-btn ${isActive ? 'is-active' : ''}`}
            onClick={() => handleTabClick(tab.id)}
            aria-label={label}
            aria-selected={isActive}
            role="tab"
          >
            <div className="tab-icon-wrapper">
              {tab.icon}
              {tab.id === 'rankings' && (
                <span className="tab-dot-notification"></span>
              )}
            </div>
            <span className="tab-label-text">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export const MobileBottomNav = memo(MobileBottomNavComponent);
