import React, { useState, useEffect } from 'react';
import { storage, DEFAULT_MOTIVATION_VIDEOS } from '../../../utils/storage';
import { IconVideo, IconRefresh, IconPlus, IconTrash } from '../../Common/AppIcons';

export function VideosTab({ onShowToast }) {
  const [videos, setVideos] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [author, setAuthor] = useState('Thomas Shelby / Peaky Blinders');
  const [quote, setQuote] = useState('');

  const loadVideos = () => {
    const list = storage.getMotivationVideos();
    setVideos(list || []);
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const extractId = (urlOrId) => {
    if (!urlOrId) return '';
    const trimmed = urlOrId.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : '';
  };

  const previewId = extractId(youtubeUrl);

  const handleAddVideo = (e) => {
    e.preventDefault();
    const ytId = extractId(youtubeUrl);
    if (!ytId) {
      onShowToast?.("Xatolik", "Noto'g'ri YouTube havola yoki Video ID kiritildi", "warning");
      return;
    }

    storage.addMotivationVideo({
      title: title.trim() || "Thomas Shelby — Intizom Saboqlari",
      author: author.trim() || "Thomas Shelby",
      youtubeUrl: ytId,
      quote: quote.trim() || "Intizom — bu o'z his-tuyg'ularing ustidan mutlaq g'alabadir."
    });

    onShowToast?.("Video qo'shildi! 🎬", `"${title || 'Yangi video'}" muvaffaqiyatli saqlandi`, "success");
    setTitle('');
    setYoutubeUrl('');
    setQuote('');
    setShowAddModal(false);
    loadVideos();
  };

  const handleDeleteVideo = (id, vTitle) => {
    if (window.confirm(`"${vTitle}" videosini o'chirishni tasdiqlaysizmi?`)) {
      storage.deleteMotivationVideo(id);
      onShowToast?.("O'chirildi 🗑️", `"${vTitle}" olib tashlandi`, "info");
      loadVideos();
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm("Barcha videolarni standart tasdiqlangan holatga qaytarishni tasdiqlaysizmi?")) {
      storage.videos = JSON.parse(JSON.stringify(DEFAULT_MOTIVATION_VIDEOS));
      storage.save('intizomly_motivation_videos', storage.videos);
      loadVideos();
      onShowToast?.("Tiklandi! 🔄", "Videolar tasdiqlangan holatga qaytarildi", "success");
    }
  };

  return (
    <div className="admin-videos-tab">
      {/* Top Controls Card */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '18px 24px',
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '6px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.12)', color: '#f43f5e', display: 'flex' }}>
            <IconVideo size={22} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Motivatsiya va Intizom Videolari Boshqaruvi
            </h4>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              YouTube havolalarini qo'shish, tekshirish va o'chirish
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="secondary-btn"
            onClick={handleResetDefaults}
            style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Standart tasdiqlangan videolarni tiklash"
          >
            <IconRefresh size={13} />
            <span>Standartni Tiklash</span>
          </button>

          <button
            type="button"
            className="primary-btn"
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '8px 18px',
              fontSize: '12px',
              fontWeight: 700,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <IconPlus size={14} />
            <span>Yangi YouTube Video Qo'shish</span>
          </button>
        </div>
      </div>

      {/* Videos List Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '18px'
        }}
      >
        {videos.map(v => (
          <div
            key={v.id}
            style={{
              borderRadius: '18px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Player Frame */}
            <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000' }}>
              <iframe
                src={`https://www.youtube.com/embed/${v.youtubeId}`}
                title={v.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%'
                }}
              ></iframe>
            </div>

            {/* Video Meta Info */}
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {v.title}
                </h4>
                <button
                  type="button"
                  onClick={() => handleDeleteVideo(v.id, v.title)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="O'chirish"
                >
                  <IconTrash size={13} />
                </button>
              </div>

              {v.quote && (
                <p style={{ margin: '8px 0', fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.4 }}>
                  "{v.quote}"
                </p>
              )}

              <div style={{ marginTop: 'auto', paddingTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  ID: <code style={{ color: 'var(--primary-accent)' }}>{v.youtubeId}</code>
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Ko'rishlar: {v.views || 0}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Video Modal */}
      {showAddModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddModal(false)}
          style={{ zIndex: 1100 }}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '560px',
              width: '95%',
              borderRadius: '24px',
              background: 'rgba(18, 25, 38, 0.96)',
              backdropFilter: 'blur(25px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)'
            }}
          >
            <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div className="modal-title-wrap">
                <div style={{ padding: '6px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.12)', color: '#f43f5e', display: 'flex' }}>
                  <IconVideo size={20} />
                </div>
                <div>
                  <h3 className="modal-title" style={{ fontSize: '18px', fontWeight: 700 }}>
                    YouTube Video Qo'shish
                  </h3>
                  <p className="modal-desc" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Motivatsiya sahifasi uchun YouTube videoni tekshirib joylang
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAddModal(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddVideo} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  YouTube Havolasi yoki Video ID *
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Masalan: https://www.youtube.com/watch?v=NmS8_Ls9qyU yoki NmS8_Ls9qyU"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  required
                />
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tezkor namunalar:</span>
                  {[
                    { id: 'NmS8_Ls9qyU', label: 'Stay Strong' },
                    { id: 'WFyEBIJ2Q_8', label: 'Best Speech' },
                    { id: 'AJsa0FSlHwc', label: 'Walking Alone' }
                  ].map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setYoutubeUrl(s.id);
                        if (!title) setTitle(`Thomas Shelby — ${s.label}`);
                      }}
                      style={{
                        padding: '2px 8px',
                        fontSize: '11px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'var(--primary-accent)',
                        cursor: 'pointer'
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Box */}
              {previewId && (
                <div
                  style={{
                    marginBottom: '16px',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    background: '#000'
                  }}
                >
                  <div style={{ padding: '6px 12px', background: 'rgba(16, 185, 129, 0.15)', fontSize: '11px', color: '#10b981', fontWeight: 700 }}>
                    ✅ Video topildi (ID: {previewId}) — Jonli ko'rinish:
                  </div>
                  <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${previewId}`}
                      title="Preview"
                      frameBorder="0"
                      allowFullScreen
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    ></iframe>
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Video Sarlavhasi *
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Thomas Shelby — Intizom va Sovuqqonlik Qoidalari"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Muallif / Qahramon
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Thomas Shelby / Peaky Blinders"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Iqtibos yoki Darslik xulosasi
                </label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Ushbu videodan asosiy motivatsion xulosa..."
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="primary-btn"
                  style={{
                    padding: '8px 20px',
                    fontSize: '13px',
                    fontWeight: 700,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff',
                    border: 'none'
                  }}
                >
                  Videoni Saqlash ✅
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
