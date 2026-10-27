import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import { useHabits } from '../../../context/HabitsContext';
import { IconMegaphone, IconRefresh, IconLightning } from '../../Common/AppIcons';

export function AnnouncementsTab({ onShowToast }) {
  const { triggerBanner } = useHabits();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Yangi e'lon formasi
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');
  const [priority, setPriority] = useState('normal'); // 'normal' | 'urgent' | 'banner'
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const list = await adminService.getAnnouncements();
      setAnnouncements(list);
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      onShowToast?.("Xatolik", "Sarlavha va matn to'ldirilishi shart", "warning");
      return;
    }

    setSubmitting(true);
    try {
      await adminService.createAnnouncement({
        title: title.trim(),
        message: message.trim(),
        target,
        priority,
        status: 'active'
      });

      // Darhol ekranga Dynamic Island bildirishnomasi chiqarish
      triggerBanner(`📢 ${title}`, message);
      onShowToast?.("E'lon yuborildi! 🚀", `"${title}" tizim a'zolariga yetkazildi`, "success");

      setTitle('');
      setMessage('');
      loadAnnouncements();
    } catch (err) {
      onShowToast?.("Xatolik", err.message || "E'lonni yaratib bo'lmadi", "warning");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBroadcastInstant = (ann) => {
    triggerBanner(`📢 [Admin] ${ann.title}`, ann.message);
    onShowToast?.("Ekranga uzatildi! ⚡", `"${ann.title}" Dynamic Island orqali ko'rsatildi`, "success");
  };

  return (
    <div className="admin-announcements-tab">
      {/* Create Announcement Card */}
      <div
        style={{
          padding: '24px',
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ padding: '6px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', display: 'flex' }}>
            <IconMegaphone size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Yangi E'lon / Bildirishnoma Yaratish
            </h4>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Tizim foydalanuvchilari uchun rasmiy bildirishnoma yuborish
            </span>
          </div>
        </div>

        <form onSubmit={handleCreateAnnouncement}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px 180px', gap: '12px', marginBottom: '12px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="E'lon sarlavhasi (masalan: Yangi haftalik musobaqa boshlandi!) *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <select
              className="form-control"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            >
              <option value="all">Barcha Foydalanuvchilarga</option>
              <option value="premium">Faqat PRO A'zolarga</option>
              <option value="user">Faqat Oddiy A'zolarga</option>
            </select>

            <select
              className="form-control"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="normal">Oddiy E'lon</option>
              <option value="urgent">Muhim / Shoshilinch</option>
              <option value="banner">Dynamic Island Banner</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <textarea
              className="form-control"
              rows="3"
              placeholder="E'lonning batafsil matni..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              style={{ resize: 'vertical', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="submit"
              className="primary-btn"
              disabled={submitting}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff',
                padding: '8px 20px',
                fontWeight: 700,
                borderRadius: '12px',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <IconMegaphone size={16} />
              <span>{submitting ? "Yuborilmoqda..." : "E'lonni Ekranga Chiqarish"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Announcements List */}
      <div
        style={{
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconMegaphone size={16} color="var(--primary-accent)" />
            Mavjud E'lonlar Tarixi ({announcements.length})
          </h4>
          <button
            type="button"
            className="secondary-btn"
            onClick={loadAnnouncements}
            style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <IconRefresh size={13} />
            <span>Yangilash</span>
          </button>
        </div>

        {loading && announcements.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
            E'lonlar yuklanmoqda...
          </div>
        ) : announcements.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            Hozircha hech qanday e'lon yaratilmagan
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {announcements.map(ann => {
              const isUrgent = ann.priority === 'urgent';
              return (
                <div
                  key={ann.id}
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                        {ann.title}
                      </strong>
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '6px',
                          fontWeight: 700,
                          background: isUrgent ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                          color: isUrgent ? '#ef4444' : '#60a5fa'
                        }}
                      >
                        {ann.target === 'premium' ? 'PRO' : ann.target === 'user' ? 'Oddiy' : 'Barchaga'}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        &bull; {ann.created_at ? new Date(ann.created_at).toLocaleDateString() : 'Yaqinda'}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {ann.message}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => handleBroadcastInstant(ann)}
                      style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      title="Foydalanuvchilar ekraniga darhol uzatish"
                    >
                      <IconLightning size={13} color="var(--primary-accent)" />
                      <span>Ekranga uzatish</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
