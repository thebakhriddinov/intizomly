import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { IconMegaphone, IconShield, IconTrash, IconRefresh } from '../Common/AppIcons';
import { getCleanAnnouncementText } from '../../utils/announcementHelper';

function IconBell({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IconCheck({ size = 14, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function NotificationCenterModal() {
  const {
    announcements,
    unreadCount,
    readIds,
    isNotificationOpen,
    closeNotifications,
    markAsRead,
    markAllAsRead,
    deleteAnnouncement,
    deleteAllAnnouncements,
    refreshAnnouncements,
    loading,
    browserPermission,
    requestBrowserPermission
  } = useNotifications();

  const { isAdmin } = useAuth();
  const { lang } = useLanguage();

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread'

  if (!isNotificationOpen) return null;

  const filteredAnnouncements = activeFilter === 'unread'
    ? announcements.filter(a => !readIds.includes(a.id))
    : announcements;

  const formatTime = (isoString) => {
    if (!isoString) return lang === 'ru' ? 'Недавно' : 'Yaqinda';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);

      if (diffMins < 1) return lang === 'ru' ? 'Только что' : 'Hozirgina';
      if (diffMins < 60) return `${diffMins} ${lang === 'ru' ? 'мин назад' : 'daqiqa oldin'}`;
      if (diffHours < 24 && date.getDate() === now.getDate()) {
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `${lang === 'ru' ? 'Сегодня' : 'Bugun'}, ${timeStr}`;
      }
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return lang === 'ru' ? 'Недавно' : 'Yaqinda';
    }
  };

  return (
    <div className="modal-backdrop" onClick={closeNotifications}>
      <div
        className="modal-card notif-center-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          width: '100%',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden'
        }}
      >
        {/* 1. Modal Header */}
        <div className="notif-center-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="notif-center-bell-icon">
              <IconBell size={20} color="#10B981" />
              {unreadCount > 0 && <span className="notif-pulse-dot" />}
            </div>
            <div>
              <h3 className="notif-center-title">
                {lang === 'ru' ? "Уведомления и SMS" : lang === 'en' ? "Notifications & SMS" : "Bildirishnomalar & SMS"}
              </h3>
              <span className="notif-center-sub">
                {lang === 'ru'
                  ? "Официальные объявления от администрации Intizomly"
                  : lang === 'en'
                  ? "Official announcements from Intizomly Administration"
                  : "Intizomly ma'muriyatidan rasmiy e'lonlar va xabarlar"}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="icon-action-btn"
              onClick={() => refreshAnnouncements(false)}
              title={lang === 'ru' ? "Обновить" : "Yangilash"}
              style={{ width: '32px', height: '32px' }}
            >
              <IconRefresh size={14} />
            </button>
            <button
              type="button"
              className="icon-action-btn"
              onClick={closeNotifications}
              style={{ width: '32px', height: '32px', fontSize: '18px' }}
            >
              &times;
            </button>
          </div>
        </div>

        {/* 2. Subheader & Toolbar */}
        <div className="notif-center-toolbar">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              className={`filter-chip ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
              style={{ fontSize: '12px', padding: '4px 12px' }}
            >
              {lang === 'ru' ? "Все" : lang === 'en' ? "All" : "Barchasi"} ({announcements.length})
            </button>
            <button
              type="button"
              className={`filter-chip ${activeFilter === 'unread' ? 'active' : ''}`}
              onClick={() => setActiveFilter('unread')}
              style={{ fontSize: '12px', padding: '4px 12px' }}
            >
              {lang === 'ru' ? "Непрочитанные" : lang === 'en' ? "Unread" : "O'qilmaganlar"} ({unreadCount})
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {isAdmin && announcements.length > 0 && (
              <button
                type="button"
                className="btn-mark-all-read"
                onClick={() => {
                  if (window.confirm("Barcha e'lonlarni barcha foydalanuvchilardan to'liq o'chirmoqchimisiz?")) {
                    deleteAllAnnouncements();
                  }
                }}
                style={{ color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.08)' }}
                title="Barcha e'lonlarni tozalash"
              >
                <IconTrash size={12} />
                <span>{lang === 'ru' ? "Очистить все" : "Tozalash"}</span>
              </button>
            )}

            {unreadCount > 0 && (
              <button
                type="button"
                className="btn-mark-all-read"
                onClick={markAllAsRead}
                title="Barchasini o'qilgan deb belgilash"
              >
                <IconCheck size={13} />
                <span>{lang === 'ru' ? "Прочитать все" : lang === 'en' ? "Mark all read" : "Barchasini o'qish"}</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. Browser Permission Prompt Banner (if not yet granted) */}
        {browserPermission === 'default' && (
          <div className="notif-permission-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconBell size={16} color="#3B82F6" />
              <span>
                {lang === 'ru'
                  ? "Включите push-уведомления для получения срочных SMS от Intizomly"
                  : "Muhim SMS va e'lonlarni telefonda darhol olish uchun bildirishnomalarni yoqing"}
              </span>
            </div>
            <button
              type="button"
              className="btn-enable-browser-notif"
              onClick={requestBrowserPermission}
            >
              {lang === 'ru' ? "Включить" : "Yoqish"}
            </button>
          </div>
        )}

        {/* 4. Announcements List */}
        <div className="notif-center-list">
          {loading && announcements.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div className="loading-spinner" style={{ margin: '0 auto 12px' }}></div>
              <span>{lang === 'ru' ? "Загрузка сообщений..." : "Xabarlar yuklanmoqda..."}</span>
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="notif-empty-state">
              <div className="notif-empty-icon">
                <IconBell size={28} color="var(--text-muted)" />
              </div>
              <p className="notif-empty-title">
                {activeFilter === 'unread'
                  ? (lang === 'ru' ? "Все сообщения прочитаны" : "Barcha xabarlar o'qilgan!")
                  : (lang === 'ru' ? "Пока нет уведомлений" : "Hozircha xabarlar yo'q")}
              </p>
              <p className="notif-empty-desc">
                {activeFilter === 'unread'
                  ? (lang === 'ru' ? "Новые уведомления и SMS от администрации появятся здесь." : "Yangi e'lonlar va admin SMS xabarlari kelganda shu yerda ko'rinadi.")
                  : (lang === 'ru' ? "Администрация пока не публиковала объявлений." : "Intizomly ma'muriyati yangi e'lon yuborganida xabar sifatida yetkaziladi.")}
              </p>
            </div>
          ) : (
            filteredAnnouncements.map((ann) => {
              const isRead = readIds.includes(ann.id);
              const isUrgent = ann.priority === 'urgent';
              const isBanner = ann.priority === 'banner';

              return (
                <div
                  key={ann.id}
                  className={`notif-item-card ${isRead ? 'is-read' : 'is-unread'}`}
                  onClick={() => {
                    if (!isRead) markAsRead(ann.id);
                  }}
                >
                  {/* Status Indicator */}
                  {!isRead && <span className="notif-unread-badge-dot" />}

                  <div style={{ flex: 1 }}>
                    {/* Header Row: Sender + Tags + Time */}
                    <div className="notif-item-top">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span className="notif-sender-badge">
                          <IconShield size={12} color="#10B981" />
                          <span>Intizomly Admin</span>
                        </span>

                        {isUrgent && (
                          <span className="notif-pill-urgent">
                            {lang === 'ru' ? "Срочно" : "Shoshilinch"}
                          </span>
                        )}
                        {isBanner && (
                          <span className="notif-pill-banner">
                            Dynamic Island
                          </span>
                        )}
                        {!isUrgent && !isBanner && (
                          <span className="notif-pill-normal">
                            <IconMegaphone size={10} />
                            <span>{lang === 'ru' ? "Объявление" : "E'lon"}</span>
                          </span>
                        )}

                        {ann.target && ann.target !== 'all' && (
                          <span className="notif-pill-target">
                            {ann.target === 'premium' ? 'PRO' : 'Oddiy'}
                          </span>
                        )}
                      </div>

                      <span className="notif-time-text">
                        {formatTime(ann.created_at)}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="notif-item-title">
                      {ann.title}
                    </h4>

                    {/* Message Body */}
                    <p className="notif-item-body">
                      {getCleanAnnouncementText(ann.message)}
                    </p>

                    {/* Item Bottom Actions */}
                    <div className="notif-item-footer">
                      {!isRead ? (
                        <button
                          type="button"
                          className="btn-mark-item-read"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(ann.id);
                          }}
                        >
                          <IconCheck size={12} />
                          <span>{lang === 'ru' ? "Отметить прочитанным" : "O'qilgan deb belgilash"}</span>
                        </button>
                      ) : (
                        <span className="notif-read-status-lbl">
                          <IconCheck size={12} color="#10B981" />
                          <span>{lang === 'ru' ? "Прочитано" : "O'qildi"}</span>
                        </span>
                      )}

                      {isAdmin && (
                        <button
                          type="button"
                          className="btn-delete-notif"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`"${ann.title}" e'lonini o'chirmoqchimisiz?`)) {
                              deleteAnnouncement(ann.id);
                            }
                          }}
                          title="E'lonni o'chirish"
                        >
                          <IconTrash size={12} />
                          <span>{lang === 'ru' ? "Удалить" : "O'chirish"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
export default NotificationCenterModal;

