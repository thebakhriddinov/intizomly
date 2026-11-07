import React, { useEffect, useState, useRef } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { IconFlame, IconShield, IconMegaphone } from '../Common/AppIcons';
import { getCleanAnnouncementText } from '../../utils/announcementHelper';

export function FloatingSMSPopUp() {
  const { popupAnnouncement, dismissPopup, openNotifications, markAsRead } = useNotifications();
  const [isPaused, setIsPaused] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [dismissDirection, setDismissDirection] = useState('right');

  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const currentDragXRef = useRef(0);

  // Reset when popup changes
  useEffect(() => {
    setDragX(0);
    setIsDragging(false);
    setIsDismissing(false);
    currentDragXRef.current = 0;
  }, [popupAnnouncement?.id]);

  if (!popupAnnouncement) return null;

  const isUrgent = popupAnnouncement.priority === 'urgent';

  const handleOpen = (e) => {
    // Agar foydalanuvchi surayotgan bo'lsa, bosish ishlamasin
    if (Math.abs(currentDragXRef.current) > 15) return;
    markAsRead(popupAnnouncement.id);
    dismissPopup();
    openNotifications();
  };

  // Touch Swipe Handlers (Telefonda yonga surib o'chirish / dismiss)
  const handleTouchStart = (e) => {
    if (!e.touches?.[0]) return;
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    setIsDragging(true);
    setIsPaused(true);
  };

  const handleTouchMove = (e) => {
    if (!e.touches?.[0]) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartXRef.current;
    const diffY = currentY - touchStartYRef.current;

    // Gorizontal surish vertikal harakatdan ustun bo'lsa
    if (Math.abs(diffX) > Math.abs(diffY)) {
      currentDragXRef.current = diffX;
      setDragX(diffX);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    const finalDiffX = currentDragXRef.current;

    // 60px dan ko'proq surilsa - yonga surib tashlash (Dismiss)
    if (Math.abs(finalDiffX) > 60) {
      const dir = finalDiffX > 0 ? 'right' : 'left';
      setDismissDirection(dir);
      setIsDismissing(true);

      setTimeout(() => {
        dismissPopup();
      }, 220);
    } else {
      // Aks holda joyiga qaytish (Snap back)
      setDragX(0);
      currentDragXRef.current = 0;
      setIsPaused(false);
    }
  };

  // Drag va Dismiss animatsiyalari
  const cardStyle = {
    transform: isDismissing
      ? `translateX(${dismissDirection === 'right' ? '125%' : '-125%'}) scale(0.95)`
      : `translateX(${dragX}px)`,
    opacity: isDismissing
      ? 0
      : Math.max(0.15, 1 - Math.abs(dragX) / 260),
    transition: isDragging
      ? 'none'
      : 'transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.24s ease',
    touchAction: 'pan-y'
  };

  return (
    <div
      className="floating-sms-popup-wrap"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div
        className={`floating-sms-popup-card ${isUrgent ? 'is-urgent' : ''}`}
        style={cardStyle}
      >
        {/* Progress Bar Timer */}
        <div className={`sms-popup-progress-bar ${isPaused || isDragging ? 'is-paused' : ''}`} />

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
              onClick={(e) => {
                e.stopPropagation();
                dismissPopup();
              }}
              title="Yopish (yoki yonga suring)"
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
              {getCleanAnnouncementText(popupAnnouncement.message)}
            </p>
          </div>

          {/* Bottom Actions + Swipe Hint on mobile */}
          <div className="sms-popup-footer">
            <button
              type="button"
              className="sms-popup-action-btn"
              onClick={handleOpen}
            >
              <span>Xabarni o'qish</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>

            <span className="sms-popup-swipe-hint" style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.45)', marginLeft: 'auto' }}>
              yonga surib yoping &rarr;
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FloatingSMSPopUp;
