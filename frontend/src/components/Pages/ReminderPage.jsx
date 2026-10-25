import React, { useState, useEffect, useCallback, memo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useHabits } from '../../context/HabitsContext';
import { storage } from '../../utils/storage';

const NOTE_COLORS = [
  { id: 'emerald', bg: 'rgba(16, 185, 129, 0.12)', border: '#10b981', label: 'Yashil' },
  { id: 'amber', bg: 'rgba(245, 158, 11, 0.12)', border: '#f59e0b', label: 'Sariq' },
  { id: 'violet', bg: 'rgba(139, 92, 246, 0.12)', border: '#8b5cf6', label: 'Binafsha' },
  { id: 'cyan', bg: 'rgba(6, 182, 212, 0.12)', border: '#06b6d4', label: 'Moviy' },
  { id: 'rose', bg: 'rgba(244, 63, 94, 0.12)', border: '#f43f5e', label: 'Qizil' }
];

function ReminderPageComponent() {
  const { t, lang } = useLanguage();
  const { triggerBanner } = useHabits();

  // Active sub-tab: 'reminders' (eslatmalar) or 'notes' (shaxsiy qaydlar - eslatmasiz)
  const [activeSubTab, setActiveSubTab] = useState('reminders');

  // Reminders state
  const [reminders, setReminders] = useState([]);
  const [showAddReminderModal, setShowAddReminderModal] = useState(false);
  const [remTitle, setRemTitle] = useState('');
  const [remTime, setRemTime] = useState('20:00');
  const [remCategory, setRemCategory] = useState("Sog'liq");

  // Notes state
  const [notes, setNotes] = useState([]);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState("Maqsad");
  const [noteColor, setNoteColor] = useState('emerald');

  const loadData = useCallback(() => {
    setReminders(storage.getReminders());
    setNotes(storage.getNotes());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- REMINDERS ACTIONS ---
  const handleToggleReminder = (id) => {
    const updated = storage.toggleReminder(id);
    setReminders(updated);
  };

  const handleDeleteReminder = (id) => {
    const updated = storage.deleteReminder(id);
    setReminders(updated);
  };

  const handleAddReminder = (e) => {
    e.preventDefault();
    if (!remTitle.trim()) return;

    storage.addReminder({
      title: remTitle.trim(),
      time: remTime || "12:00",
      category: remCategory,
      enabled: true,
      completed: false
    });

    setRemTitle('');
    setShowAddReminderModal(false);
    loadData();
    triggerBanner("⏰ Eslatma qo'shildi", `${remTitle.trim()} soat ${remTime} ga belgilandi!`);
  };

  const handleTestReminder = (rem) => {
    triggerBanner(`⏰ ${rem.time} — ${rem.title}`, `Diqqat: Bugungi ${rem.category} vazifasini unutmang! Intizom — yutuq kaliti! 🔔`);
  };

  // --- NOTES ACTIONS ---
  const handleOpenAddNote = () => {
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteCategory("Maqsad");
    setNoteColor('emerald');
    setShowAddNoteModal(true);
  };

  const handleOpenEditNote = (n) => {
    setEditingNote(n);
    setNoteTitle(n.title);
    setNoteContent(n.content);
    setNoteCategory(n.category || "Fikr");
    setNoteColor(n.color || 'emerald');
    setShowAddNoteModal(true);
  };

  const handleDeleteNote = (id) => {
    const updated = storage.deleteNote(id);
    setNotes(updated);
  };

  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!noteTitle.trim() && !noteContent.trim()) return;

    if (editingNote) {
      storage.updateNote(editingNote.id, {
        title: noteTitle.trim() || "Nomsiz Qayd",
        content: noteContent.trim(),
        category: noteCategory,
        color: noteColor
      });
    } else {
      storage.addNote({
        title: noteTitle.trim() || "Yangi Qayd",
        content: noteContent.trim(),
        category: noteCategory,
        color: noteColor
      });
    }

    setShowAddNoteModal(false);
    loadData();
  };

  return (
    <div className="reminder-page">
      {/* 1. Header Banner & Sub-Tabs */}
      <div className="reminder-header-card">
        <div className="reminder-header-top">
          <div>
            <h2 className="reminder-main-title">Eslatmalar va Qaydlar</h2>
            <p className="reminder-main-sub">
              Vaqtida bajarilishi kerak bo'lgan ishlar va eslatmasiz shaxsiy fikrlar daftari
            </p>
          </div>

          <div className="reminder-tab-switch">
            <button
              type="button"
              className={`reminder-pill-btn ${activeSubTab === 'reminders' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('reminders')}
            >
              ⏰ Eslatmalar ({reminders.length})
            </button>
            <button
              type="button"
              className={`reminder-pill-btn ${activeSubTab === 'notes' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('notes')}
            >
              📝 Qaydlar ({notes.length})
            </button>
          </div>
        </div>
      </div>

      {/* --- SUBTAB 1: REMINDERS (ESLATMALAR) --- */}
      {activeSubTab === 'reminders' && (
        <div className="reminders-content-area">
          <div className="subtab-action-bar">
            <div>
              <h3 className="subtab-heading">Vaqtli Eslatmalar</h3>
              <p className="subtab-desc">Kun davomida rejalaringizni unutmasligingiz uchun o'z vaqtida bildirishnoma beradi</p>
            </div>
            <button
              type="button"
              className="btn-add-primary"
              onClick={() => setShowAddReminderModal(true)}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>+ Yangi Eslatma</span>
            </button>
          </div>

          <div className="reminders-list">
            {reminders.map((rem) => (
              <div key={rem.id} className={`reminder-card ${rem.enabled ? 'is-active' : 'is-disabled'}`}>
                <div className="reminder-left">
                  <div className="reminder-time-badge">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{rem.time}</span>
                  </div>

                  <div className="reminder-details">
                    <h4 className="reminder-title">{rem.title}</h4>
                    <span className="reminder-cat-pill">{rem.category}</span>
                  </div>
                </div>

                <div className="reminder-right">
                  {/* Test button */}
                  <button
                    type="button"
                    className="reminder-test-btn"
                    onClick={() => handleTestReminder(rem)}
                    title="Hozir eslatish (Test)"
                  >
                    🔔
                  </button>

                  {/* Toggle switch */}
                  <label className="liquid-switch" title={rem.enabled ? "Faol" : "O'chirilgan"}>
                    <input
                      type="checkbox"
                      checked={rem.enabled}
                      onChange={() => handleToggleReminder(rem.id)}
                    />
                    <span className="slider round"></span>
                  </label>

                  {/* Delete */}
                  <button
                    type="button"
                    className="reminder-delete-btn"
                    onClick={() => handleDeleteReminder(rem.id)}
                    title="O'chirish"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- SUBTAB 2: NOTES (NOTE YOZIB QOYADI LEKIN ESLATMAYDI) --- */}
      {activeSubTab === 'notes' && (
        <div className="notes-content-area">
          {/* Note disclaimer banner */}
          <div className="note-info-banner">
            <span className="note-banner-icon">💡</span>
            <div>
              <strong>Shaxsiy Qaydlar — Eslatma Yuborilmaydi</strong>
              <p>Bu sahifada yozilgan fikrlar, g'oyalar va qaydlar siz uchun sokin daftarcha vazifasini o'taydi. Hech qanday tovush yoki bezovta qiluvchi eslatma yuborilmaydi.</p>
            </div>
          </div>

          <div className="subtab-action-bar">
            <div>
              <h3 className="subtab-heading">Mening Qaydlarim</h3>
              <p className="subtab-desc">Fikrlar, intizom qoidalari va kelajak rejalari</p>
            </div>
            <button
              type="button"
              className="btn-add-primary"
              onClick={handleOpenAddNote}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>+ Yangi Qayd</span>
            </button>
          </div>

          <div className="notes-grid">
            {notes.map((note) => {
              const colorObj = NOTE_COLORS.find(c => c.id === note.color) || NOTE_COLORS[0];
              return (
                <div
                  key={note.id}
                  className="note-card"
                  style={{
                    backgroundColor: colorObj.bg,
                    borderColor: colorObj.border
                  }}
                  onClick={() => handleOpenEditNote(note)}
                >
                  <div className="note-card-header">
                    <span className="note-category-tag">{note.category}</span>
                    <button
                      type="button"
                      className="note-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note.id);
                      }}
                      title="Qaydni o'chirish"
                    >
                      &times;
                    </button>
                  </div>

                  <h4 className="note-title">{note.title}</h4>
                  <p className="note-body">{note.content}</p>

                  <div className="note-footer">
                    <span className="note-date">{note.updatedAt || 'Bugun'}</span>
                    <span className="note-silent-badge">🔕 Sokin qayd</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- ADD REMINDER MODAL --- */}
      {showAddReminderModal && (
        <div className="modal-backdrop" onClick={() => setShowAddReminderModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <span className="modal-icon-badge">⏰</span>
                <div>
                  <h3 className="modal-title">Yangi Eslatma Qo'shish</h3>
                  <p className="modal-subtitle">Belgilangan vaqtda eslatma yuboriladi</p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAddReminderModal(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddReminder} className="reminder-form">
              <div className="form-group">
                <label className="form-label">Eslatma Nomi</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Masalan: 1 stakan suv ichish va kitob o'qish"
                  value={remTitle}
                  onChange={(e) => setRemTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Eslatish Vaqti</label>
                  <input
                    type="time"
                    className="form-input"
                    value={remTime}
                    onChange={(e) => setRemTime(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Kategoriya</label>
                  <select
                    className="form-input"
                    value={remCategory}
                    onChange={(e) => setRemCategory(e.target.value)}
                  >
                    <option value="Sog'liq">Sog'liq 💧</option>
                    <option value="O'qish">O'qish 📖</option>
                    <option value="Sport">Sport 🏃‍♂️</option>
                    <option value="Tartib">Tartib ⏰</option>
                    <option value="Boshqa">Boshqa ✨</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer-btns">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setShowAddReminderModal(false)}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="btn-modal-save"
                >
                  Eslatmani Saqlash ✅
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD/EDIT NOTE MODAL --- */}
      {showAddNoteModal && (
        <div className="modal-backdrop" onClick={() => setShowAddNoteModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <span className="modal-icon-badge">📝</span>
                <div>
                  <h3 className="modal-title">{editingNote ? "Qaydni Tahrirlash" : "Yangi Qayd Yozish"}</h3>
                  <p className="modal-subtitle">Bu qayd uchun eslatma yuborilmaydi (sokin daftarcha)</p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAddNoteModal(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="note-form">
              <div className="form-group">
                <label className="form-label">Qayd Sarlavhasi</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Masalan: Yangi haftalik intizom rejasi"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Matn / Fikrlar</label>
                <textarea
                  className="form-textarea"
                  rows="4"
                  placeholder="Bu yerga o'z maqsadlaringiz, g'oyalaringiz va tamoyillaringizni yozib qo'ying..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Qayd Rangi</label>
                <div className="note-color-picker">
                  {NOTE_COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`color-pick-circle ${noteColor === c.id ? 'is-selected' : ''}`}
                      style={{ backgroundColor: c.border }}
                      onClick={() => setNoteColor(c.id)}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <div className="modal-footer-btns">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setShowAddNoteModal(false)}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="btn-modal-save"
                >
                  Saqlash ✅
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export const ReminderPage = memo(ReminderPageComponent);
