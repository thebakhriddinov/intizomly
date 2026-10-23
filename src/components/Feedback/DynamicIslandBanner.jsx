import React from 'react';
import { useHabits } from '../../context/HabitsContext';

export function DynamicIslandBanner() {
  const { bannerNotif, dismissBanner } = useHabits();

  if (!bannerNotif) return null;

  return (
    <div className="ios-notification-container" id="ios-notification-container">
      <div className="ios-notif-banner" onClick={dismissBanner}>
        <div className="ios-notif-header">
          <div className="ios-app-brand">
            <div className="ios-app-icon-squircle">
              <svg viewBox="0 0 32 32" fill="none">
                <path d="M16 2C13.5 7.5 9 11.5 9 18C9 24.075 12.134 28 16 28C19.866 28 23 24.075 23 18C23 14 20.5 10 16 2Z" fill="#FFFFFF" />
                <path d="M11 18.5L14.5 22L21 14.5" stroke="#10B981" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="ios-app-name">INTIZOMLY</span>
          </div>
          <span className="ios-notif-time">hozir</span>
        </div>

        <div className="ios-notif-body">
          <h4 className="ios-notif-title">{bannerNotif.title}</h4>
          <p className="ios-notif-message">{bannerNotif.message}</p>
        </div>

        <div className="ios-grab-bar"></div>
      </div>
    </div>
  );
}
