import React, { useState, useEffect, useCallback, memo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { storage } from '../../utils/storage';
import { IconFlame, IconShield } from '../Common/AppIcons';

const MOTIVATION_QUOTES = [
  {
    author: "Thomas Shelby",
    quote: "Men hech qachon yengilmadim. Yo g'alaba qozonaman, yo qimmatli dars olaman. Intizom — bu o'z xaraktering ustidagi hukmronlikdir.",
    tag: "Peaky Blinders"
  },
  {
    author: "Marcus Aurelius",
    quote: "Tongda uyg'onganingizda o'zingizga ayting: bugun men tirikman, nafas olyapman, fikrlay olaman va maqsadim sari yura olaman. Buni qadrlang.",
    tag: "Stoa Falsafasi"
  },
  {
    author: "Thomas Shelby",
    quote: "Kuchsiz odam his-tuyg'ulariga bo'ysunadi. Kuchli odam esa his-tuyg'ularini intizomiga bo'ysundiradi.",
    tag: "Qat'iyat"
  },
  {
    author: "Miyamoto Musashi",
    quote: "Ming kunlik mashg'ulot — bu mashq. O'n ming kunlik intizom — bu mahorat.",
    tag: "Jang San'ati"
  }
];

const SHELBY_PRINCIPLES = [
  {
    num: "01",
    title: "Sovuqqon Xotirjamlik",
    desc: "Qanchalik qiyin yoki shovqinli vaziyat bo'lmasin, ovozingizni ko'tarmang. Hissiyotni aqlga bo'ysundiring."
  },
  {
    num: "02",
    title: "Jimgina Harakat Qilish",
    desc: "Rejalaringiz haqida jar solmang. Natijangiz sizning o'rningizga gapirsin."
  },
  {
    num: "03",
    title: "Reja va Strategiya",
    desc: "Hech bir qadam tasodifiy bo'lmasligi kerak. Har bir kunni kechqurun rejalashtiring va unga sodiq qoling."
  },
  {
    num: "04",
    title: "O'z So'ziga Qat'iy Bo'lish",
    desc: "O'zingizga bergan va'dani bajarmaslik — o'zingizga bo'lgan ishonchni o'ldiradi. Kichik odatdan boshlang."
  }
];

function MotivationPageComponent() {
  const { isAdmin, currentUser } = useAuth();
  const { t, lang } = useLanguage();

  const [videos, setVideos] = useState([]);
  const [activeQuoteIdx, setActiveQuoteIdx] = useState(0);
  const [filterTag, setFilterTag] = useState('all');

  // Admin add video modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newYoutubeId, setNewYoutubeId] = useState('');
  const [newAuthor, setNewAuthor] = useState('Thomas Shelby');
  const [newQuote, setNewQuote] = useState('');

  // Load videos
  const loadVideos = useCallback(() => {
    const list = storage.getMotivationVideos();
    setVideos(list);
  }, []);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  // Handle like
  const handleLike = (id) => {
    const updated = storage.likeMotivationVideo(id);
    setVideos(updated);
  };

  // Admin: Delete video
  const handleDeleteVideo = (id) => {
    if (!isAdmin) return;
    if (window.confirm("Rostdan ham ushbu videoni o'chirmoqchimisiz?")) {
      const updated = storage.deleteMotivationVideo(id);
      setVideos(updated);
    }
  };

  // Helper to extract YouTube ID
  const extractYoutubeId = (urlOrId) => {
    if (!urlOrId) return '';
    const trimmed = urlOrId.trim();
    if (trimmed.length === 11 && !trimmed.includes('/')) return trimmed;
    const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : trimmed;
  };

  // Admin: Add video
  const handleAddVideo = (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    const ytId = extractYoutubeId(newYoutubeId);
    if (!ytId) {
      alert("Iltimos, to'g'ri YouTube havola yoki Video ID kiriting!");
      return;
    }

    storage.addMotivationVideo({
      title: newTitle.trim() || "Thomas Shelby — Intizom Saboqlari",
      author: newAuthor.trim() || "Thomas Shelby",
      youtubeId: ytId,
      embedUrl: `https://www.youtube.com/embed/${ytId}`,
      quote: newQuote.trim() || "Intizom — bu o'z xohishlaringiz ustidan mutlaq g'alabadir.",
      likes: 10,
      addedBy: currentUser ? `${currentUser.firstName} (Admin)` : "Admin"
    });

    setNewTitle('');
    setNewYoutubeId('');
    setNewQuote('');
    setShowAddModal(false);
    loadVideos();
  };

  const currentQuote = MOTIVATION_QUOTES[activeQuoteIdx];

  return (
    <div className="motivation-page">
      {/* 1. Header Banner */}
      <div className="motivation-hero-card">
        <div className="motivation-hero-glow"></div>
        <div className="motivation-hero-content">
          <div className="motivation-tag-pill">
            <IconFlame size={14} />
            <span>INTIZOM VA RUHIY KUCH</span>
          </div>
          <h2 className="motivation-hero-title">
            Iroda — mashq qilinadigan mushakdir
          </h2>
          <p className="motivation-hero-sub">
            Har kuni o'zingizni engishingiz uchun saralangan eng kuchli qoidalar va videolar to'plami.
          </p>

          {/* Admin badge or indicator */}
          <div className="motivation-admin-meta">
            {isAdmin ? (
              <button
                type="button"
                className="btn-admin-add-video"
                onClick={() => setShowAddModal(true)}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>+ Yangi Video Qo'shish (Admin)</span>
              </button>
            ) : (
              <span className="user-read-only-badge">
                <IconShield size={14} color="#10B981" />
                <span>Videolar faqat admin tomonidan saralanadi va qo'shiladi</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Interactive Daily Quote Box */}
      <div className="motivation-quote-card">
        <div className="quote-mark-icon">“</div>
        <div className="quote-body">
          <p className="quote-text">{currentQuote.quote}</p>
          <div className="quote-author-row">
            <span className="quote-author-name">{currentQuote.author}</span>
            <span className="quote-author-tag">{currentQuote.tag}</span>
          </div>
        </div>
        <div className="quote-actions">
          <button
            type="button"
            className="quote-shuffle-btn"
            onClick={() => setActiveQuoteIdx((prev) => (prev + 1) % MOTIVATION_QUOTES.length)}
            title="Boshqa iqtibos"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
            <span>Yangi Iqtibos</span>
          </button>
        </div>
      </div>

      {/* 3. Thomas Shelby & Discipline YouTube Videos */}
      <div className="motivation-section-header">
        <div className="section-title-wrap">
          <div className="section-icon-badge">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
          <div>
            <h3 className="section-heading">Thomas Shelby va Intizom Videolari</h3>
            <p className="section-subheading">Peaky Blinders intizomi va sovuqqonlik saboqlari</p>
          </div>
        </div>
        <span className="videos-count-badge">{videos.length} ta video</span>
      </div>

      <div className="videos-grid">
        {videos.map((vid) => (
          <div key={vid.id} className="video-card">
            <div className="video-player-wrap">
              <iframe
                src={`https://www.youtube.com/embed/${vid.youtubeId}`}
                title={vid.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="youtube-iframe"
              ></iframe>
            </div>

            <div className="video-info-box">
              <div className="video-title-row">
                <h4 className="video-title">{vid.title}</h4>
                {isAdmin && (
                  <button
                    type="button"
                    className="video-delete-btn"
                    onClick={() => handleDeleteVideo(vid.id)}
                    title="Videoni o'chirish (Admin)"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                )}
              </div>

              {vid.quote && (
                <p className="video-quote">"{vid.quote}"</p>
              )}

              <div className="video-footer-meta">
                <span className="video-author-badge">
                  <span className="author-dot"></span>
                  {vid.author}
                </span>

                <button
                  type="button"
                  className="video-like-btn"
                  onClick={() => handleLike(vid.id)}
                >
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="#F43F5E">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <span className="like-count">{vid.likes || 0}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Stoic & Thomas Shelby Mindset Principles */}
      <div className="motivation-section-header" style={{ marginTop: '36px' }}>
        <div className="section-title-wrap">
          <div className="section-icon-badge">
            <IconShield size={18} color="#F59E0B" />
          </div>
          <div>
            <h3 className="section-heading">Thomas Shelby Tamoyillari</h3>
            <p className="section-subheading">Iroda va xarakter tarbiyalash qoidalari</p>
          </div>
        </div>
      </div>

      <div className="principles-grid">
        {SHELBY_PRINCIPLES.map((item, idx) => (
          <div key={idx} className="principle-card">
            <div className="principle-number">{item.num}</div>
            <h4 className="principle-title">{item.title}</h4>
            <p className="principle-desc">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Admin Add Video Modal */}
      {showAddModal && isAdmin && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-card admin-video-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <span className="modal-icon-badge">🎬</span>
                <div>
                  <h3 className="modal-title">YouTube Video Qo'shish (Admin)</h3>
                  <p className="modal-subtitle">Motivatsiya sahifasiga yangi darslik yoki rolik joylash</p>
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

            <form onSubmit={handleAddVideo} className="admin-video-form">
              <div className="form-group">
                <label className="form-label">Video Sarlavhasi</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Masalan: Thomas Shelby — Qat'iy Intizom Qoidalari"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">YouTube Video Havolasi yoki ID</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://www.youtube.com/watch?v=5r3Cj9YhJtM yoki 5r3Cj9YhJtM"
                  value={newYoutubeId}
                  onChange={(e) => setNewYoutubeId(e.target.value)}
                  required
                />
                <span className="form-hint">Faqat YouTube ID yoki to'liq havola qabul qilinadi.</span>
              </div>

              <div className="form-group">
                <label className="form-label">Muallif / Qahramon</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Thomas Shelby / Peaky Blinders"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Iqtibos yoki Xulosa</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  placeholder="Ushbu videodan asosiy xulosa..."
                  value={newQuote}
                  onChange={(e) => setNewQuote(e.target.value)}
                />
              </div>

              <div className="modal-footer-btns">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setShowAddModal(false)}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="btn-modal-save"
                >
                  Joylash ✅
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export const MotivationPage = memo(MotivationPageComponent);
