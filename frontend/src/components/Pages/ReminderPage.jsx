import React, { useState, useEffect, useCallback, memo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useHabits } from '../../context/HabitsContext';
import { storage } from '../../utils/storage';
import { reminderService } from '../../utils/reminderService';
import { audioManager } from '../../utils/audio';
import { IconAlarm, IconLightbulb, IconSilent, IconCategory } from '../Common/AppIcons';

const CATEGORIES = [
  { id: "Sog'liq", label: "Sog'liq", color: '#10B981' },
  { id: "O'qish", label: "O'qish", color: '#3B82F6' },
  { id: "Sport", label: "Sport", color: '#F59E0B' },
  { id: "Tartib", label: "Tartib", color: '#B6F36B' },
  { id: "Maqsad", label: "Maqsad", color: '#8B5CF6' },
  { id: "Ish", label: "Ish", color: '#06B6D4' }
];

const NOTE_COLORS = [
  { id: 'emerald', bg: 'rgba(16, 185, 129, 0.12)', border: '#10b981', label: 'Yashil' },
  { id: 'amber', bg: 'rgba(245, 158, 11, 0.12)', border: '#f59e0b', label: 'Sariq' },
  { id: 'violet', bg: 'rgba(139, 92, 246, 0.12)', border: '#8b5cf6', label: 'Binafsha' },
  { id: 'cyan', bg: 'rgba(6, 182, 212, 0.12)', border: '#06b6d4', label: 'Moviy' },
  { id: 'rose', bg: 'rgba(244, 63, 94, 0.12)', border: '#f43f5e', label: 'Qizil' }
];

function ReminderPageComponent() {
  const { t } = useLanguage();
  const { triggerBanner } = useHabits();

  // Active sub-tab: 'reminders' (eslatmalar) or 'notes' (shaxsiy qaydlar - eslatmasiz)
  const [activeSubTab, setActiveSubTab] = useState('reminders');

  // Reminders state
  const [reminders, setReminders] = useState([]);
  const [showAddReminderModal, setShowAddReminderModal] = useState(false);
  const [remTitle, setRemTitle] = useState('');
  const [remTime, setRemTime] = useState('20:00');
  const [remCategory, setRemCategory] = useState("Sog'liq");
  const [notifPermission, setNotifPermission] = useState('default');
  const [isPlayingTestTone, setIsPlayingTestTone] = useState(false);

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
    setNotifPermission(reminderService.getPermissionStatus());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Request browser notification permission
  const handleRequestNotifPermission = async () => {
    const res = await reminderService.requestPermission();
    setNotifPermission(res);
    if (res === 'granted') {
      triggerBanner("✅ Ruxsat berildi", "Endi eslatmalar telefon va kompyuteringiz ekranida chiqadi!");
    }
  };

  // Quick preset time helper
  const setPresetTime = (hours, minutes) => {
    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');
    setRemTime(`${h}:${m}`);
  };

  const addMinutesToCurrentTime = (addMin) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + addMin);
    setPresetTime(now.getHours(), now.getMinutes());
  };

  // Play test sound
  const handlePreviewChime = () => {
    setIsPlayingTestTone(true);
    audioManager.playNotification();
    setTimeout(() => setIsPlayingTestTone(false), 800);
  };

  // --- REMINDERS ACTIONS ---
  const handleToggleReminder = (id) => {
    const updated = storage.toggleReminder(id);
    setReminders(storage.getReminders());
    if (updated?.enabled) {
      triggerBanner("⏰ Eslatma yoqildi", `${updated.title} (${updated.time}) faollashtirildi`);
    }
  };

  const handleDeleteReminder = (id) => {
    storage.deleteReminder(id);
    setReminders(storage.getReminders());
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

    const savedTitle = remTitle.trim();
    const savedTime = remTime;

    setRemTitle('');
    setShowAddReminderModal(false);
    loadData();

    // Trigger instant feedback & schedule confirmation
    triggerBanner("⏰ Eslatma muvaffaqiyatli saqlandi", `${savedTitle} soat ${savedTime} ga belgilandi!`);
    audioManager.playCheck();
  };

  const handleTestReminder = (rem) => {
    reminderService.testReminder(rem);
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
    storage.deleteNote(id);
    setNotes(storage.getNotes());
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
    audioManager.playCheck();
  };

  return (
    <div className="reminder-page">
      {/* 1. Header Banner & Sub-Tabs */}
      <div className="reminder-header-card">
        <div className="reminder-header-top">
          <div>
            <h2 className="reminder-main-title">Eslatmalar va Qaydlar</h2>
            <p className="reminder-main-sub">
              Haqiqiy vaqtli avtomatik eslatmalar va sokin shaxsiy intizom daftarchasi
            </p>
          </div>

          <div className="reminder-tab-switch">
            <button
              type="button"
              className={`reminder-pill-btn ${activeSubTab === 'reminders' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('reminders')}
            >
              <IconAlarm size={16} />
              <span>Eslatmalar ({reminders.length})</span>
            </button>
            <button
              type="button"
              className={`reminder-pill-btn ${activeSubTab === 'notes' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('notes')}
            >
              <IconSilent size={16} />
              <span>Sokin Qaydlar ({notes.length})</span>
            </button>
          </div>
        </div>

        {/* System Notification Status Pill */}
        {activeSubTab === 'reminders' && (
          <div className="notif-system-status-bar">
            <div className="notif-status-info">
              <span className={`status-indicator-dot ${notifPermission === 'granted' ? 'active' : 'warn'}`}></span>
              <span className="notif-status-text">
                {notifPermission === 'granted'
                  ? "Tizim bildirishnomalari faol (Oyna yopiq bo'lsa ham eslatma keladi)"
                  : "Bildirishnomalarga ruxsat berilmagan (Faqat sayt ochiq paytda eslatadi)"}
              </span>
            </div>
            {notifPermission !== 'granted' && (
              <button
                type="button"
                className="btn-enable-notif"
                onClick={handleRequestNotifPermission}
              >
                Ruxsat berish
              </button>
            )}
          </div>
        )}
      </div>

      {/* --- SUBTAB 1: REMINDERS (ESLATMALAR) --- */}
      {activeSubTab === 'reminders' && (
        <div className="reminders-content-area">
          <div className="subtab-action-bar">
            <div>
              <h3 className="subtab-heading">Vaqtli Eslatmalar</h3>
              <p className="subtab-desc">Belgilangan daqiqada ovozli signal va bildirishnoma bilan ogohlantiradi</p>
            </div>
            <button
              type="button"
              className="btn-add-primary"
              onClick={() => setShowAddReminderModal(true)}
            >
              <IconAlarm size={16} />
              <span>+ Yangi Eslatma</span>
            </button>
          </div>

          <div className="reminders-list">
            {reminders.map((rem) => (
              <div key={rem.id} className={`reminder-card ${rem.enabled ? 'is-active' : 'is-disabled'}`}>
                <div className="reminder-left">
                  <div className="reminder-time-badge">
                    <IconAlarm size={15} color="var(--primary-accent)" />
                    <span>{rem.time}</span>
                  </div>

                  <div className="reminder-details">
                    <h4 className="reminder-title">{rem.title}</h4>
                    <span className="reminder-cat-pill">
                      <IconCategory category={rem.category} size={13} />
                      <span>{rem.category}</span>
                    </span>
                  </div>
                </div>

                <div className="reminder-right">
                  {/* Test button */}
                  <button
                    type="button"
                    className="reminder-test-btn"
                    onClick={() => handleTestReminder(rem)}
                    title="Tovush va bildirishnomani sinash"
                  >
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                    <span>Sinash</span>
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
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
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
            <div className="note-banner-icon-wrap">
              <IconLightbulb size={24} />
            </div>
            <div>
              <strong>Shaxsiy Qaydlar — Eslatma Yuborilmaydi</strong>
              <p>Bu sahifada yozilgan fikrlar, g'oyalar va rejalaringiz sokin shaxsiy daftarcha kabi saqlanadi. Hech qanday tovush yoki chalg'ituvchi bildirishnoma yuborilmaydi.</p>
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
              const themeColor = NOTE_COLORS.find(c => c.id === note.color) || NOTE_COLORS[0];

              return (
                <div
                  key={note.id}
                  className="note-card"
                  style={{
                    borderLeft: `4px solid ${themeColor.border}`
                  }}
                  onClick={() => handleOpenEditNote(note)}
                >
                  <div className="note-card-header">
                    <span className="note-category-tag">
                      <IconCategory category={note.category} size={12} />
                      <span>{note.category}</span>
                    </span>
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
                    <span className="note-silent-badge">
                      <IconSilent size={12} />
                      <span>Sokin qayd</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- REDESIGNED APPLE-STYLE ADD REMINDER MODAL --- */}
      {showAddReminderModal && (
        <div className="modal-backdrop" onClick={() => setShowAddReminderModal(false)}>
          <div className="modal-card modern-reminder-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <div className="modal-icon-badge-glow">
                  <IconAlarm size={22} color="var(--primary-accent)" />
                </div>
                <div>
                  <h3 className="modal-title">Yangi Eslatma Belgilash</h3>
                  <p className="modal-subtitle">Belgilangan vaqtda musiqiy signal va bildirishnoma beriladi</p>
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

            <form onSubmit={handleAddReminder} className="reminder-form modern-form">
              {/* Eslatma sarlavhasi */}
              <div className="form-group">
                <label className="form-label">Eslatma Mazmuni</label>
                <input
                  type="text"
                  className="form-input form-input-lg"
                  placeholder="Masalan: 1 stakan suv ichish va kitob o'qish"
                  value={remTitle}
                  onChange={(e) => setRemTitle(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {/* Time display & Quick Presets */}
              <div className="form-group">
                <div className="time-picker-label-row">
                  <label className="form-label">Eslatish Vaqti</label>
                  <button
                    type="button"
                    className={`btn-preview-sound ${isPlayingTestTone ? 'active' : ''}`}
                    onClick={handlePreviewChime}
                    title="Tovushni sinash"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                    <span>{isPlayingTestTone ? "Chalinmoqda..." : "Tovushni sinash"}</span>
                  </button>
                </div>

                <div className="modern-time-display-card">
                  <input
                    type="time"
                    className="big-digital-time-input"
                    value={remTime}
                    onChange={(e) => setRemTime(e.target.value)}
                    required
                  />
                </div>

                {/* Quick Preset Buttons */}
                <div className="time-preset-chips">
                  <button type="button" className="preset-chip" onClick={() => addMinutesToCurrentTime(15)}>
                    +15 daq
                  </button>
                  <button type="button" className="preset-chip" onClick={() => addMinutesToCurrentTime(30)}>
                    +30 daq
                  </button>
                  <button type="button" className="preset-chip" onClick={() => addMinutesToCurrentTime(60)}>
                    +1 soat
                  </button>
                  <button type="button" className="preset-chip" onClick={() => setPresetTime(7, 0)}>
                    07:00 Tong
                  </button>
                  <button type="button" className="preset-chip" onClick={() => setPresetTime(13, 0)}>
                    13:00 Tush
                  </button>
                  <button type="button" className="preset-chip" onClick={() => setPresetTime(20, 0)}>
                    20:00 Kechki
                  </button>
                  <button type="button" className="preset-chip" onClick={() => setPresetTime(22, 30)}>
                    22:30 Uyqu
                  </button>
                </div>
              </div>

              {/* Category selector */}
              <div className="form-group">
                <label className="form-label">Kategoriya</label>
                <div className="category-chips-grid">
                  {CATEGORIES.map((cat) => {
                    const isSelected = remCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        className={`cat-select-chip ${isSelected ? 'selected' : ''}`}
                        onClick={() => setRemCategory(cat.id)}
                      >
                        <IconCategory category={cat.id} size={16} />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal footer buttons */}
              <div className="modal-footer-btns">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowAddReminderModal(false)}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="btn-save-primary"
                >
                  <IconAlarm size={16} color="#080B11" />
                  <span>Eslatmani Saqlash</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD / EDIT NOTE MODAL --- */}
      {showAddNoteModal && (
        <div className="modal-backdrop" onClick={() => setShowAddNoteModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <div className="modal-icon-badge-glow">
                  <IconLightbulb size={22} color="#F59E0B" />
                </div>
                <div>
                  <h3 className="modal-title">
                    {editingNote ? "Qaydni Tahrirlash" : "Yangi Shaxsiy Qayd"}
                  </h3>
                  <p className="modal-subtitle">Sokin fikrlar daftari (eslatmasiz)</p>
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
                <label className="form-label">Sarlavha</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Masalan: Ertangi kunning 3 ta asosiy qoidasi"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Qayd Matni</label>
                <textarea
                  className="form-input note-textarea"
                  rows="5"
                  placeholder="Fikrlaringiz, rejalar yoki intizom xulosalari..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Kategoriya</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Maqsad, Fikr, Xulosa..."
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Rang Ajratmasi</label>
                  <div className="color-pick-row">
                    {NOTE_COLORS.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        className={`color-dot-btn ${noteColor === c.id ? 'active' : ''}`}
                        style={{ background: c.border }}
                        onClick={() => setNoteColor(c.id)}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer-btns">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowAddNoteModal(false)}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="btn-save-primary"
                >
                  Saqlash
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
