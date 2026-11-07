import React, { useEffect, useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { IconFlame, IconShield, IconMegaphone } from '../Common/AppIcons';

export function FloatingSMSPopUp() {
  const { popupAnnouncement, dismissPopup, openNotifications, markAsRead } = useNotifications();
  const [isPaused, setIsPaused] = useState(false);

  if (!popupAnnouncement) return null;

  const isUrgent = popupAnnouncement.priority === 'urgent';

  const handleOpen = () => {
    markAsRead(popupAnnouncement.id);
    dismissPopup();
    openNotifications();
  };

  return (
    <div
      className="floating-sms-popup-wrap"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={`floating-sms-popup-card ${isUrgent ? 'is-urgent' : ''}`}>
        {/* Progress Bar Timer */}
        <div className={`sms-popup-progress-bar ${isPaused ? 'is-paused' : ''}`} />

        <div className="sms-popup-content">
          {/* Top row: Brand + Tag + Close */}
          <div className="sms-popup-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div className="sms-popup-logo-badge">
                <IconFlame size={13} />
              </div>
              <span className="sms-popup-app-label">INTIZOMLY SMS</span>
              <span className="sms-popup-dot">&bull;</span>
              <span className="sms-popup-time-lbl">Hozirgina</span>
            </div>

            <button
              type="button"
              className="sms-popup-close-btn"
              onClick={dismissPopup}
              title="Yopish"
              aria-label="Yopish"
            >
              &times;
            </button>
          </div>

          {/* Title & Body */}
          <div className="sms-popup-body-wrap" onClick={handleOpen}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span className="sms-admin-tag">
                <IconShield size={11} color="#10B981" />
                <span>Admin</span>
              </span>
              <h5 className="sms-popup-title">
                {popupAnnouncement.title}
              </h5>
            </div>

            <p className="sms-popup-message">
              {popupAnnouncement.message}
            </p>
          </div>

          {/* Bottom Actions */}
          <div className="sms-popup-footer">
            <button
              type="button"
              className="sms-popup-action-btn"
              onClick={handleOpen}
            >
              <span>Xabarni o'qish</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FloatingSMSPopUp;

