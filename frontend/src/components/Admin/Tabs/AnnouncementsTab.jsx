import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../../services/adminService';
import { useHabits } from '../../../context/HabitsContext';
import { IconMegaphone, IconRefresh, IconLightning, IconTrash, IconShield, IconUsers } from '../../Common/AppIcons';
import { audioManager } from '../../../utils/audio';

function IconEye({ size = 14, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
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

export function AnnouncementsTab({ onShowToast }) {
  const { triggerBanner } = useHabits();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Yangi e'lon formasi
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');
  const [priority, setPriority] = useState('normal'); // 'normal' | 'urgent' | 'banner'
  const [durationDays, setDurationDays] = useState(7); // Default 7 kun saqlash
  const [submitting, setSubmitting] = useState(false);

  // Read receipts modal state
  const [selectedAnnForReads, setSelectedAnnForReads] = useState(null);
  const [readsList, setReadsList] = useState([]);
  const [loadingReads, setLoadingReads] = useState(false);
  const [readsCountMap, setReadsCountMap] = useState({});

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      // Include expired so admin can inspect or delete them
      const list = await adminService.getAnnouncements({ includeExpired: true });
      setAnnouncements(list);

      // Asynchronously fetch read counts for each announcement
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
  }, [loadAnnouncements]);

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
        status: 'active',
        durationDays: Number(durationDays)
      });

      // SMS qo'ng'irog'i (Ding) tovushi
      audioManager.playNotification();

      // Darhol ekranga Dynamic Island bildirishnomasi chiqarish
      triggerBanner(`📢 [Admin SMS]: ${title.trim()}`, message.trim());
      onShowToast?.("SMS & E'lon yuborildi! 🚀", `"${title}" barcha foydalanuvchilar bildirishnomalariga jo'natildi`, "success");

      setTitle('');
      setMessage('');
      loadAnnouncements();
    } catch (err) {
      onShowToast?.("Xatolik", err.message || "E'lonni yaratib bo'lmadi", "warning");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id, annTitle) => {
    if (!window.confirm(`"${annTitle}" e'lonini o'chirmoqchimisiz?`)) return;
    try {
      await adminService.deleteAnnouncement(id);
      onShowToast?.("O'chirildi", `"${annTitle}" e'loni olib tashlandi`, "info");
      loadAnnouncements();
    } catch (err) {
      onShowToast?.("Xatolik", "E'lonni o'chirib bo'lmadi", "warning");
    }
  };

  const handleBroadcastInstant = (ann) => {
    audioManager.playNotification();
    triggerBanner(`📢 [Admin SMS] ${ann.title}`, ann.message);
    onShowToast?.("Ekranga uzatildi! ⚡", `"${ann.title}" Dynamic Island orqali ko'rsatildi`, "success");
  };

  const handleOpenReadsModal = async (ann) => {
    setSelectedAnnForReads(ann);
    setLoadingReads(true);
    try {
      const list = await adminService.getAnnouncementReads(ann.id);
      setReadsList(list);
    } catch (err) {
      console.error('Failed to load reads:', err);
      setReadsList([]);
    } finally {
      setLoadingReads(false);
    }
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
          <div style={{ padding: '6px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', display: 'flex' }}>
            <IconMegaphone size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Yangi SMS & E'lon Yuborish (Barcha A'zolarga)
            </h4>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Yuborilgan xabar boshqa qurilmalar platformaga kirishi bilan pop-up bo'lib chiqadi va saqlanish muddati tugagach avtomatik tozalanadi
            </span>
          </div>
        </div>

        <form onSubmit={handleCreateAnnouncement}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 160px 170px 170px', gap: '12px', marginBottom: '12px' }}>
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
              title="Kimlarga yuborilsin"
            >
              <option value="all">Barchaga (Hammaga)</option>
              <option value="premium">Faqat PRO A'zolarga</option>
              <option value="user">Faqat Oddiy A'zolarga</option>
            </select>

            <select
              className="form-control"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              title="Muhimlik darajasi"
            >
              <option value="normal">Oddiy E'lon</option>
              <option value="urgent">Muhim / Shoshilinch</option>
              <option value="banner">Dynamic Island SMS</option>
            </select>

            <select
              className="form-control"
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              title="Saqlanish muddati"
            >
              <option value="1">1 kun saqlansin</option>
              <option value="3">3 kun saqlansin</option>
              <option value="7">7 kun saqlansin (Standart)</option>
              <option value="14">14 kun saqlansin</option>
              <option value="30">30 kun (1 oy) saqlansin</option>
              <option value="0">Doimiy (O'chirilguncha)</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <textarea
              className="form-control"
              rows="3"
              placeholder="SMS xabar yoki e'lonning to'liq matni..."
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
              <span>{submitting ? "Yuborilmoqda..." : "SMS & E'lonni Yuborish (Barcha a'zolarga)"}</span>
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
              const readCount = readsCountMap[ann.id] || 0;
              const isExpired = ann.expires_at && new Date(ann.expires_at).getTime() < Date.now();

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
                    opacity: isExpired ? 0.6 : 1
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '14.5px', color: 'var(--text-primary)' }}>
                        {ann.title}
                      </strong>

                      {/* Target Pill */}
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

                      {/* Duration / Retention Badge */}
                      <span
                        style={{
                          fontSize: '10.5px',
                          padding: '2px 7px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: 600,
                          background: isExpired ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                          color: isExpired ? '#EF4444' : 'var(--text-muted)'
                        }}
                      >
                        <IconClock size={11} />
                        <span>
                          {isExpired
                            ? "Muddati tugagan"
                            : ann.duration_days
                            ? `${ann.duration_days} kun saqlanadi`
                            : "Doimiy saqlanadi"}
                        </span>
                      </span>

                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        &bull; {ann.created_at ? new Date(ann.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Yaqinda'}
                      </span>
                    </div>

                    <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {ann.message}
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
                        padding: '3px 10px',
                        borderRadius: '8px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                      title="Ushbu xabarni o'qigan foydalanuvchilar ro'yxati"
                    >
                      <IconEye size={12} />
                      <span>{readCount > 0 ? `${readCount} ta foydalanuvchi o'qidi` : "Hali hech kim o'qimadi (0)"}</span>
                    </button>
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
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => handleDeleteAnnouncement(ann.id, ann.title)}
                      style={{ padding: '6px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                      title="E'lonni butunlay o'chirish"
                    >
                      <IconTrash size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Read Receipts Inspection Modal */}
      {selectedAnnForReads && (
        <div className="modal-backdrop" onClick={() => setSelectedAnnForReads(null)}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '500px', width: '100%', padding: '24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', color: '#10B981' }}>
                  <IconUsers size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Xabarni O'qiganlar
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
                style={{ width: '30px', height: '30px', fontSize: '18px' }}
              >
                &times;
              </button>
            </div>

            <div style={{ marginBottom: '14px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
              Jami o'qiganlar: <strong>{readsList.length} ta foydalanuvchi</strong>
            </div>

            {loadingReads ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                O'qiganlar ro'yxati tekshirilmoqda...
              </div>
            ) : readsList.length === 0 ? (
              <div style={{ padding: '30px 20px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '14px', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
                <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-muted)' }}>
                  Ushbu e'lonni hozircha hech kim o'qimagan.
                </p>
              </div>
            ) : (
              <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {readsList.map((reader, idx) => (
                  <div
                    key={reader.userId || idx}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {(reader.userName?.[0] || 'U').toUpperCase()}
                      </div>
                      <div>
                        <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)', display: 'block' }}>
                          {reader.userName}
                        </strong>
                        {reader.userPhone && (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {reader.userPhone}
                          </span>
                        )}
                      </div>
                    </div>

                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {reader.readAt ? new Date(reader.readAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Yaqinda'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AnnouncementsTab;
