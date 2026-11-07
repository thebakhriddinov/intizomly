import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { adminService } from '../../../services/adminService';
import { useNotifications } from '../../../context/NotificationContext';
import { audioManager } from '../../../utils/audio';
import { getCleanAnnouncementText } from '../../../utils/announcementHelper';

function IconMegaphone({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 11 18-5v12L3 14v-3z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  );
}

function IconTrash({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function IconRefresh({ size = 14, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function IconLightning({ size = 14, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function IconClock({ size = 13, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconEye({ size = 14, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconUsers({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconEdit({ size = 13, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export function AnnouncementsTab({ onShowToast }) {
  const { triggerPopup } = useNotifications();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all'); // 'all' | 'user' | 'premium'
  const [priority, setPriority] = useState('normal'); // 'normal' | 'urgent' | 'banner'
  const [durationPreset, setDurationPreset] = useState('7d'); // '1h' | '6h' | '1d' | '3d' | '7d' | '14d' | '30d' | 'forever' | 'custom'
  const [customExpiresAt, setCustomExpiresAt] = useState('');
  const [broadcastToScreen, setBroadcastToScreen] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Read receipts modal state
  const [selectedAnnForReads, setSelectedAnnForReads] = useState(null);
  const [readsList, setReadsList] = useState([]);
  const [loadingReads, setLoadingReads] = useState(false);
  const [readsCountMap, setReadsCountMap] = useState({});

  // Inline duration edit modal state
  const [editingDurationAnn, setEditingDurationAnn] = useState(null);
  const [editDurationPreset, setEditDurationPreset] = useState('7d');
  const [editCustomExpiresAt, setEditCustomExpiresAt] = useState('');
  const [updatingDuration, setUpdatingDuration] = useState(false);

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      // Include expired so admin can inspect, edit, or delete them
      const list = await adminService.getAnnouncements({ includeExpired: true });
      setAnnouncements(list);

      // Fetch read receipts asynchronously
      const counts = {};
      await Promise.all(
        list.map(async (ann) => {
          try {
            const reads = await adminService.getAnnouncementReads(ann.id);
            counts[ann.id] = reads.length;
          } catch {
            counts[ann.id] = 0;
          }
        })
      );
      setReadsCountMap(counts);
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnnouncements();

    const handleNew = () => loadAnnouncements();
    const handleDeleted = () => loadAnnouncements();
    const handleAllDeleted = () => setAnnouncements([]);
    const handleUpdated = () => loadAnnouncements();

    window.addEventListener('intizomly:new_broadcast', handleNew);
    window.addEventListener('intizomly:broadcast_deleted', handleDeleted);
    window.addEventListener('intizomly:all_broadcasts_deleted', handleAllDeleted);
    window.addEventListener('intizomly:broadcast_updated', handleUpdated);

    return () => {
      window.removeEventListener('intizomly:new_broadcast', handleNew);
      window.removeEventListener('intizomly:broadcast_deleted', handleDeleted);
      window.removeEventListener('intizomly:all_broadcasts_deleted', handleAllDeleted);
      window.removeEventListener('intizomly:broadcast_updated', handleUpdated);
    };
  }, [loadAnnouncements]);

  const calculateExpiresAtFromPreset = (preset, customDate) => {
    if (preset === 'custom' && customDate) {
      return new Date(customDate).toISOString();
    }
    if (preset === 'forever') return null;
    const now = Date.now();
    switch (preset) {
      case '1h': return new Date(now + 1 * 60 * 60 * 1000).toISOString();
      case '6h': return new Date(now + 6 * 60 * 60 * 1000).toISOString();
      case '1d': return new Date(now + 1 * 24 * 60 * 60 * 1000).toISOString();
      case '3d': return new Date(now + 3 * 24 * 60 * 60 * 1000).toISOString();
      case '7d': return new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString();
      case '14d': return new Date(now + 14 * 24 * 60 * 60 * 1000).toISOString();
      case '30d': return new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString();
      default: return new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString();
    }
  };

  const getDaysNumFromPreset = (preset) => {
    switch (preset) {
      case '1h': return -1;
      case '6h': return -6;
      case '1d': return 1;
      case '3d': return 3;
      case '7d': return 7;
      case '14d': return 14;
      case '30d': return 30;
      case 'forever': return 0;
      default: return 7;
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      onShowToast?.("Xatolik", "Sarlavha va matn to'ldirilishi shart", "warning");
      return;
    }

    const expiresAt = calculateExpiresAtFromPreset(durationPreset, customExpiresAt);
    const durationDays = getDaysNumFromPreset(durationPreset);

    setSubmitting(true);
    try {
      const res = await adminService.createAnnouncement({
        title: title.trim(),
        message: message.trim(),
        target,
        priority,
        status: 'active',
        durationDays,
        expiresAt,
        broadcastToScreen
      });

      // Faqat o'ngdan yuqoridagi bitta Pop-up chiqadi
      if (broadcastToScreen) {
        triggerPopup(res?.announcement || { title: title.trim(), message: message.trim(), priority });
      }

      setTitle('');
      setMessage('');
      setCustomExpiresAt('');
      loadAnnouncements();
    } catch (err) {
      console.warn("E'lonni yaratish xatosi:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id, annTitle) => {
    if (!window.confirm(`"${annTitle}" e'lonini barcha foydalanuvchilardan to'liq o'chirmoqchimisiz?`)) return;
    try {
      await adminService.deleteAnnouncement(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      loadAnnouncements();
    } catch (err) {
      console.warn("E'lonni o'chirish xatosi:", err);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("DIQQAT: Barcha e'lonlarni barcha foydalanuvchilar ekranidan va bazadan to'liq o'chirib tashlamoqchimisiz?")) return;
    try {
      await adminService.deleteAllAnnouncements();
      setAnnouncements([]);
    } catch (err) {
      console.warn("E'lonlarni tozalash xatosi:", err);
    }
  };

  const handleBroadcastInstant = async (ann) => {
    try {
      await adminService.broadcastAnnouncementToScreen(ann.id);
      // Faqat o'ngdan yuqoridagi bitta Pop-up chiqadi
      triggerPopup(ann);
      loadAnnouncements();
    } catch (err) {
      console.warn("Ekranga uzatish xatosi:", err);
    }
  };

  const handleOpenDurationEdit = (ann) => {
    setEditingDurationAnn(ann);
    setEditDurationPreset(ann.duration_days ? `${ann.duration_days}d` : 'forever');
    if (ann.expires_at) {
      try {
        const d = new Date(ann.expires_at);
        const iso = d.toISOString().slice(0, 16);
        setEditCustomExpiresAt(iso);
      } catch {
        setEditCustomExpiresAt('');
      }
    } else {
      setEditCustomExpiresAt('');
    }
  };

  const handleSaveDurationEdit = async (e) => {
    e.preventDefault();
    if (!editingDurationAnn) return;

    const expiresAt = calculateExpiresAtFromPreset(editDurationPreset, editCustomExpiresAt);
    const durationDays = getDaysNumFromPreset(editDurationPreset);

    setUpdatingDuration(true);
    try {
      await adminService.updateAnnouncementDuration(editingDurationAnn.id, { durationDays, expiresAt });
      onShowToast?.("Muvaffaqiyatli!", `"${editingDurationAnn.title}" saqlash muddati yangilandi`, "success");
      setEditingDurationAnn(null);
      loadAnnouncements();
    } catch (err) {
      onShowToast?.("Xatolik", "Muddatni yangilab bo'lmadi", "warning");
    } finally {
      setUpdatingDuration(false);
    }
  };

  const handleOpenReadsModal = async (ann) => {
    setSelectedAnnForReads(ann);
    setLoadingReads(true);
    try {
      const list = await adminService.getAnnouncementReads(ann.id);
      setReadsList(list);
      setReadsCountMap(prev => ({ ...prev, [ann.id]: list.length }));
    } catch (err) {
      console.error('Failed to load reads:', err);
      setReadsList([]);
    } finally {
      setLoadingReads(false);
    }
  };

  const formatRemainingTime = (expiresAt) => {
    if (!expiresAt) return "Doimiy saqlanadi";
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return "Muddati tugagan";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) {
      const mins = Math.floor(diff / (1000 * 60));
      return `${mins} daqiqa qoldi`;
    }
    if (hours < 24) {
      return `${hours} soat qoldi`;
    }
    const days = Math.floor(hours / 24);
    return `${days} kun qoldi`;
  };

  return (
    <div className="admin-announcements-tab">
      {/* 1. Create Announcement Card */}
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
          <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', display: 'flex' }}>
            <IconMegaphone size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Yangi SMS & E'lon Yuborish (Barcha Foydalanuvchilarga)
            </h4>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Admin xabari real-time SMS bo'lib barcha qurilmalar ekranida darhol chiqadi va bildirishnomalarga tushadi
            </span>
          </div>
        </div>

        <form onSubmit={handleCreateAnnouncement}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
            {/* Title */}
            <input
              type="text"
              className="form-control"
              placeholder="Xabar sarlavhasi (masalan: Yangi tanlov boshlandi!)..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ fontSize: '13px' }}
            />

            {/* Target Audience */}
            <select
              className="form-control"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              title="Kimlarga yuborilsin?"
            >
              <option value="all">👥 Barcha foydalanuvchilarga</option>
              <option value="premium">⚡ Faqat PRO a'zolarga</option>
              <option value="user">👤 Faqat Bepul a'zolarga</option>
            </select>

            {/* Priority */}
            <select
              className="form-control"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              title="Muhimlik darajasi"
            >
              <option value="normal">🔵 Oddiy bildirishnoma</option>
              <option value="urgent">🔴 Shoshilinch (Qizil belgi bilan)</option>
              <option value="banner">🟢 Dynamic Island banner</option>
            </select>

            {/* Retention Duration */}
            <select
              className="form-control"
              value={durationPreset}
              onChange={(e) => setDurationPreset(e.target.value)}
              title="Qanchagacha saqlansin?"
            >
              <option value="1h">⏱ 1 soat saqlansin</option>
              <option value="6h">⏱ 6 soat saqlansin</option>
              <option value="1d">📅 1 kun saqlansin</option>
              <option value="3d">📅 3 kun saqlansin</option>
              <option value="7d">📅 7 kun saqlansin (Standart)</option>
              <option value="14d">📅 14 kun saqlansin</option>
              <option value="30d">📅 30 kun (1 oy) saqlansin</option>
              <option value="forever">♾ Doimiy saqlansin (Admin o'chirguncha)</option>
              <option value="custom">⚙️ Maxsus sana va vaqt kiritish...</option>
            </select>
          </div>

          {/* Custom Date & Time Picker */}
          {durationPreset === 'custom' && (
            <div style={{ marginBottom: '12px', padding: '12px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Xabar qaysi sana va soatgacha saqlansin?
              </label>
              <input
                type="datetime-local"
                className="form-control"
                value={customExpiresAt}
                onChange={(e) => setCustomExpiresAt(e.target.value)}
                required
                style={{ maxWidth: '320px' }}
              />
            </div>
          )}

          {/* Message Body */}
          <div style={{ marginBottom: '14px' }}>
            <textarea
              className="form-control"
              rows="3"
              placeholder="SMS xabar yoki e'lonning to'liq matni..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              style={{ resize: 'vertical', fontSize: '13.5px' }}
            />
          </div>

          {/* Instant Broadcast Checkbox & Submit */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={broadcastToScreen}
                onChange={(e) => setBroadcastToScreen(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#10b981' }}
              />
              <span>⚡ Darhol barcha faol foydalanuvchilar ekraniga Pop-up qilib uzatish</span>
            </label>

            <button
              type="submit"
              className="primary-btn"
              disabled={submitting}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff',
                padding: '10px 24px',
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
              <span>{submitting ? "Yuborilmoqda..." : "SMS & E'lonni Yuborish 🚀"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Announcements History List */}
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
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconMegaphone size={17} color="var(--primary-accent)" />
            Mavjud E'lonlar va SMS Boshqaruvi ({announcements.length})
          </h4>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {announcements.length > 0 && (
              <button
                type="button"
                className="secondary-btn"
                onClick={handleDeleteAll}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#EF4444',
                  borderColor: 'rgba(239, 68, 68, 0.3)'
                }}
                title="Barcha e'lonlarni bazadan to'liq tozalash"
              >
                <IconTrash size={13} />
                <span>Barchasini o'chirish</span>
              </button>
            )}

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
        </div>

        {loading && announcements.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
            E'lonlar yuklanmoqda...
          </div>
        ) : announcements.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13.5px' }}>
            Hozircha hech qanday e'lon mavjud emas. Yuqoridagi formadan yangi SMS yuborishingiz mumkin.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {announcements.map(ann => {
              const isUrgent = ann.priority === 'urgent';
              const readCount = readsCountMap[ann.id] || 0;
              const isExpired = ann.expires_at && new Date(ann.expires_at).getTime() <= Date.now();
              const remainingTimeStr = formatRemainingTime(ann.expires_at);

              return (
                <div
                  key={ann.id}
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '16px',
                    background: isExpired ? 'rgba(239, 68, 68, 0.02)' : 'transparent',
                    opacity: isExpired ? 0.75 : 1
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>
                        {ann.title}
                      </strong>

                      {/* Target Pill */}
                      <span
                        style={{
                          fontSize: '10.5px',
                          padding: '2px 7px',
                          borderRadius: '6px',
                          fontWeight: 700,
                          background: isUrgent ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                          color: isUrgent ? '#ef4444' : '#60a5fa'
                        }}
                      >
                        {ann.target === 'premium' ? '⚡ PRO' : ann.target === 'user' ? '👤 Bepul' : '👥 Barchaga'}
                      </span>

                      {/* Duration / Retention Badge with Edit trigger */}
                      <button
                        type="button"
                        onClick={() => handleOpenDurationEdit(ann)}
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontWeight: 600,
                          background: isExpired ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                          color: isExpired ? '#EF4444' : 'var(--text-secondary)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          cursor: 'pointer'
                        }}
                        title="Saqlanish muddatini o'zgartirish uchun bosing"
                      >
                        <IconClock size={11} />
                        <span>{remainingTimeStr}</span>
                        <IconEdit size={10} color="var(--primary-accent)" />
                      </button>

                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        &bull; {ann.created_at ? new Date(ann.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Yaqinda'}
                      </span>
                    </div>

                    <p style={{ margin: '0 0 10px 0', fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {getCleanAnnouncementText(ann.message)}
                    </p>

                    {/* Who Read Button / Badge */}
                    <button
                      type="button"
                      onClick={() => handleOpenReadsModal(ann)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        color: 'var(--primary-accent, #10B981)',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                      title="Ushbu xabarni o'qigan foydalanuvchilar ro'yxatini ko'rish"
                    >
                      <IconEye size={13} />
                      <span>{readCount > 0 ? `${readCount} ta foydalanuvchi o'qidi` : "Hali hech kim o'qimadi (0)"}</span>
                    </button>
                  </div>

                  {/* Actions Column */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {/* Ekranga uzatish tugmasi */}
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => handleBroadcastInstant(ann)}
                      style={{
                        padding: '7px 12px',
                        fontSize: '11.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: 700,
                        color: 'var(--primary-accent)'
                      }}
                      title="Foydalanuvchilar ekraniga darhol pop-up qilib uzatish"
                    >
                      <IconLightning size={14} color="var(--primary-accent)" />
                      <span>Ekranga uzatish</span>
                    </button>

                    {/* O'chirish tugmasi */}
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => handleDeleteAnnouncement(ann.id, ann.title)}
                      style={{
                        padding: '7px 11px',
                        fontSize: '11.5px',
                        display: 'flex',
                        alignItems: 'center',
                        color: '#ef4444',
                        borderColor: 'rgba(239, 68, 68, 0.3)'
                      }}
                      title="E'lonni barcha foydalanuvchilardan to'liq o'chirish"
                    >
                      <IconTrash size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Duration Edit Modal (Portal to body for exact screen centering) */}
      {editingDurationAnn && typeof document !== 'undefined' && createPortal(
        <div
          className="modal-backdrop"
          onClick={() => setEditingDurationAnn(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 999999,
            background: 'rgba(3, 7, 18, 0.82)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            boxSizing: 'border-box'
          }}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '440px',
              width: '100%',
              background: 'var(--bg-card, #0f172a)',
              border: '1px solid var(--border, rgba(255, 255, 255, 0.12))',
              borderRadius: '24px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                <IconClock size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Saqlanish Muddatini O'zgartirish
                </h4>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  "{editingDurationAnn.title}"
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveDurationEdit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Yangi muddatni tanlang:
                </label>
                <select
                  className="form-control"
                  value={editDurationPreset}
                  onChange={(e) => setEditDurationPreset(e.target.value)}
                >
                  <option value="1h">⏱ 1 soat saqlansin</option>
                  <option value="6h">⏱ 6 soat saqlansin</option>
                  <option value="1d">📅 1 kun saqlansin</option>
                  <option value="3d">📅 3 kun saqlansin</option>
                  <option value="7d">📅 7 kun saqlansin</option>
                  <option value="14d">📅 14 kun saqlansin</option>
                  <option value="30d">📅 30 kun saqlansin</option>
                  <option value="forever">♾ Doimiy (O'chirilguncha)</option>
                  <option value="custom">⚙️ Maxsus sana va vaqt...</option>
                </select>
              </div>

              {editDurationPreset === 'custom' && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Aniq sana va vaqtni tanlang:
                  </label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={editCustomExpiresAt}
                    onChange={(e) => setEditCustomExpiresAt(e.target.value)}
                    required
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '18px' }}>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setEditingDurationAnn(null)}
                  style={{ padding: '8px 14px', fontSize: '12.5px' }}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={updatingDuration}
                  style={{
                    background: 'var(--primary-accent, #10b981)',
                    color: '#fff',
                    padding: '8px 18px',
                    fontWeight: 700,
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {updatingDuration ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* 4. Read Receipts Inspection Modal (Portal to body for exact screen centering) */}
      {selectedAnnForReads && typeof document !== 'undefined' && createPortal(
        <div
          className="modal-backdrop"
          onClick={() => setSelectedAnnForReads(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 999999,
            background: 'rgba(3, 7, 18, 0.82)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            boxSizing: 'border-box'
          }}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '520px',
              width: '100%',
              maxHeight: '85vh',
              background: 'var(--bg-card, #0f172a)',
              border: '1px solid var(--border, rgba(255, 255, 255, 0.12))',
              borderRadius: '24px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(16, 185, 129, 0.12)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', color: '#10B981' }}>
                  <IconUsers size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Xabarni O'qiganlar ({readsList.length})
                  </h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    "{selectedAnnForReads.title}"
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="icon-action-btn"
                onClick={() => setSelectedAnnForReads(null)}
                style={{ width: '32px', height: '32px', fontSize: '18px', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            {loadingReads ? (
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <div className="loading-spinner" style={{ margin: '0 auto 10px' }}></div>
                <span>O'qilganlik ma'lumotlari yuklanmoqda...</span>
              </div>
            ) : readsList.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                Ushbu xabarni hali hech bir foydalanuvchi ochib o'qimagan.
              </div>
            ) : (
              <div style={{ maxHeight: '360px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                {readsList.map((reader, idx) => (
                  <div
                    key={reader.userId || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.06)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '13px',
                          flexShrink: 0
                        }}
                      >
                        {(reader.userName || 'F')[0].toUpperCase()}
                      </div>
                      <div>
                        <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)', display: 'block' }}>
                          {reader.userName || 'Foydalanuvchi'}
                        </strong>
                        {reader.userPhone && (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {reader.userPhone}
                          </span>
                        )}
                      </div>
                    </div>

                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {reader.readAt ? new Date(reader.readAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Hozirgina'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default AnnouncementsTab;
