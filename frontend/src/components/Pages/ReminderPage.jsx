import React, { useState, useEffect, useCallback, memo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useHabits } from '../../context/HabitsContext';
import { storage } from '../../utils/storage';
import { reminderService } from '../../utils/reminderService';
import { audioManager } from '../../utils/audio';
import {
  IconAlarm,
  IconLightbulb,
  IconSilent,
  IconCategory,
  IconFocus,
  IconBook,
  IconCode,
  IconEdit,
  IconTrophy
} from '../Common/AppIcons';

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

const FOCUS_PRESETS = [
  { mins: 10, label: '10 daq', desc: 'Tezkor' },
  { mins: 15, label: '15 daq', desc: 'Qisqa' },
  { mins: 20, label: '20 daq', desc: 'Standart Dars', isDefault: true },
  { mins: 25, label: '25 daq', desc: 'Pomodoro' },
  { mins: 30, label: '30 daq', desc: 'Chuqur' },
  { mins: 45, label: '45 daq', desc: 'Universitet' },
  { mins: 60, label: '60 daq', desc: 'Imtihon' }
];

const FOCUS_SUBJECTS = [
  { id: 'study', title: "Dars & Vazifa", type: 'book' },
  { id: 'coding', title: "Dasturlash & Kod", type: 'code' },
  { id: 'reading', title: "Kitob Mutolaasi", type: 'book' },
  { id: 'deepwork', title: "Chuqur Diqqat", type: 'focus' },
  { id: 'notes', title: "Konspekt & Til", type: 'edit' }
];

function FocusSubjectIcon({ type, size = 15 }) {
  if (type === 'code') return <IconCode size={size} />;
  if (type === 'edit') return <IconEdit size={size} />;
  if (type === 'focus') return <IconFocus size={size} />;
  return <IconBook size={size} />;
}

function ReminderPageComponent() {
  const { t } = useLanguage();
  const { triggerBanner } = useHabits();

  // Active sub-tab: 'focus' (Default for study timer), 'reminders' (vaqtli eslatmalar), or 'notes' (shaxsiy qaydlar)
  const [activeSubTab, setActiveSubTab] = useState('focus');

  // --- FOCUS TIMER STATE ---
  // Default: 20 minutes (1200 seconds)
  const [focusDuration, setFocusDuration] = useState(20 * 60);
  const [focusTimeLeft, setFocusTimeLeft] = useState(20 * 60);
  const [isFocusRunning, setIsFocusRunning] = useState(false);
  const [focusSubject, setFocusSubject] = useState("Dars & Vazifa");
  const [focusSessionCount, setFocusSessionCount] = useState(() => {
    try {
      const saved = localStorage.getItem('intizomly_focus_sessions');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

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
  const [noteColor, setNoteColor] = useState('emerald');

  // Toggle state for lamp (tip) banners - only visible when clicked
  const [showFocusTip, setShowFocusTip] = useState(false);
  const [showNotesTip, setShowNotesTip] = useState(false);

  const loadData = useCallback(() => {
    setReminders(storage.getReminders());
    setNotes(storage.getNotes());
    setNotifPermission(reminderService.getPermissionStatus());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Focus Timer countdown effect
  useEffect(() => {
    let interval = null;
    if (isFocusRunning && focusTimeLeft > 0) {
      interval = setInterval(() => {
        setFocusTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsFocusRunning(false);
            handleFocusFinished();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFocusRunning, focusTimeLeft]);

  // Completion sound, chime & notification
  const handleFocusFinished = useCallback(() => {
    // 1. Play high-grade resonant Focus completion chime
    audioManager.playFocusDone();
    setTimeout(() => {
      audioManager.playCelebration();
    }, 700);

    // 2. Vibrate phone (haptic feedback)
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([350, 150, 350, 150, 600]);
      } catch (e) {}
    }

    // 3. Desktop / phone OS system push notification
    reminderService.showNotification("🎉 Dars va Focus vaqti yakunlandi!", {
      body: `${focusSubject}: ${Math.round(focusDuration / 60)} daqiqalik chuqur dars seansi yakunlandi. Endi biroz dam oling!`
    });

    // 4. In-app dynamic toast
    triggerBanner(
      "🎯 Focus Muvaffaqiyatli Yakunlandi!",
      `Barakalla! "${focusSubject}" bo'yicha ${Math.round(focusDuration / 60)} daqiqa o'tirib dars qildingiz. Dam olish vaqti!`
    );

    // 5. Increment daily count
    setFocusSessionCount((c) => {
      const next = c + 1;
      try {
        localStorage.setItem('intizomly_focus_sessions', next.toString());
      } catch (e) {}
      return next;
    });
  }, [focusDuration, focusSubject, triggerBanner]);

  // Focus adjustments
  const handleSetDuration = (minutes) => {
    const totalSecs = Math.max(60, Math.min(180 * 60, minutes * 60));
    setFocusDuration(totalSecs);
    setFocusTimeLeft(totalSecs);
    setIsFocusRunning(false);
  };

  const handleAdjustMinutes = (deltaMin) => {
    const currentMin = Math.round(focusTimeLeft / 60);
    const newMin = Math.max(1, Math.min(180, currentMin + deltaMin));
    handleSetDuration(newMin);
  };

  const handleToggleFocus = () => {
    audioManager.init();
    if (focusTimeLeft === 0) {
      setFocusTimeLeft(focusDuration);
      setIsFocusRunning(true);
    } else {
      setIsFocusRunning(!isFocusRunning);
    }
  };

  const handleResetFocus = () => {
    setIsFocusRunning(false);
    setFocusTimeLeft(focusDuration);
  };

  const formatFocusTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

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

    // Telefon uchun bildirishnoma ruxsatini tekshirish va so'rash
    if (notifPermission === 'default') {
      reminderService.requestPermission().then((res) => setNotifPermission(res));
    }

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
            <div className="focus-header-badge">
              <IconFocus size={16} color="#10B981" />
              <span>Dars & Chuqur Diqqat</span>
            </div>
            <h2 className="reminder-main-title">Focus & Intizom Hub</h2>
            <p className="reminder-main-sub">
              O'tirib dars qilish taymeri, vaqtli eslatmalar va shaxsiy intizom daftari
            </p>
          </div>

          <div className="reminder-tab-switch">
            <button
              type="button"
              className={`reminder-pill-btn ${activeSubTab === 'focus' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('focus')}
            >
              <IconFocus size={16} />
              <span>Focus Taymer</span>
            </button>
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
            {notifPermission === 'granted' ? (
              <button
                type="button"
                className="btn-enable-notif"
                onClick={async () => {
                  await reminderService.testReminder({
                    title: "Kundalik intizom eslatmasi",
                    time: reminderService.getCurrentTimeStr(),
                    category: "Intizom"
                  });
                  triggerBanner("Bildirishnoma yuborildi", "Telefoningizga bildirishnoma va iPhone Ding tovushi yuborildi!");
                }}
                style={{
                  background: 'rgba(16, 185, 129, 0.18)',
                  color: '#10B981',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                title="Haqiqiy bildirishnomani telefonda sinab ko'rish"
              >
                <IconAlarm size={14} color="#10B981" />
                <span>Sinov bildirishnomasi</span>
              </button>
            ) : (
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

      {/* --- SUBTAB 1: FOCUS TAYMER (STUDY & DEEP WORK COUNTDOWN) --- */}
      {activeSubTab === 'focus' && (
        <div className="focus-content-area">
          {/* Subject / Purpose Picker */}
          <div className="focus-subject-picker">
            <span className="focus-picker-label">Dars yo'nalishi:</span>
            <div className="focus-subjects-row">
              {FOCUS_SUBJECTS.map((subj) => (
                <button
                  key={subj.id}
                  type="button"
                  className={`focus-subject-chip ${focusSubject === subj.title ? 'active' : ''}`}
                  onClick={() => setFocusSubject(subj.title)}
                >
                  <FocusSubjectIcon type={subj.type} size={15} />
                  <span>{subj.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Focus Card with Circular Timer */}
          <div className="focus-timer-card">
            <div className="focus-gauge-wrapper">
              <svg className="focus-svg-gauge" width="280" height="280" viewBox="0 0 280 280">
                <defs>
                  <linearGradient id="focusGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#34D399" />
                  </linearGradient>
                  <filter id="focusGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#10B981" floodOpacity="0.45" />
                  </filter>
                </defs>

                {/* Background track circle */}
                <circle
                  cx="140"
                  cy="140"
                  r="110"
                  className="focus-circle-bg"
                  fill="none"
                  strokeWidth="14"
                />

                {/* Animated Green Countdown Circle */}
                <circle
                  cx="140"
                  cy="140"
                  r="110"
                  className="focus-circle-progress"
                  fill="none"
                  stroke="url(#focusGreenGrad)"
                  strokeWidth="14"
                  strokeDasharray={2 * Math.PI * 110}
                  strokeDashoffset={(2 * Math.PI * 110) * (1 - (focusDuration > 0 ? focusTimeLeft / focusDuration : 0))}
                  strokeLinecap="round"
                  filter="url(#focusGlow)"
                  transform="rotate(-90 140 140)"
                />
              </svg>

              {/* Inside center content */}
              <div className="focus-center-content">
                <div className="focus-status-tag">
                  {isFocusRunning ? (
                    <span className="focus-pill-live">
                      <span className="focus-live-dot"></span>
                      Dars jarayoni
                    </span>
                  ) : focusTimeLeft === 0 ? (
                    <span className="focus-pill-finished">
                      <IconTrophy size={13} color="#F59E0B" />
                      <span>Bajarildi!</span>
                    </span>
                  ) : (
                    <span className="focus-pill-idle">
                      Tayyormisiz?
                    </span>
                  )}
                </div>

                <div className="focus-digital-clock">
                  {formatFocusTime(focusTimeLeft)}
                </div>

                <div className="focus-subject-text">
                  {focusSubject}
                </div>

                <div className="focus-time-subinfo">
                  {focusTimeLeft === 0
                    ? "Dam olish vaqti keldi"
                    : `${Math.ceil(focusTimeLeft / 60)} daqiqa qoldi`}
                </div>
              </div>
            </div>

            {/* Micro Minute Adjustment Buttons */}
            <div className="focus-adjust-row">
              <button
                type="button"
                className="btn-time-adjust"
                onClick={() => handleAdjustMinutes(-5)}
                disabled={isFocusRunning}
                title="5 daqiqa kamaytirish"
              >
                -5 daq
              </button>
              <button
                type="button"
                className="btn-time-adjust"
                onClick={() => handleAdjustMinutes(-1)}
                disabled={isFocusRunning}
                title="1 daqiqa kamaytirish"
              >
                -1 daq
              </button>
              <button
                type="button"
                className="btn-time-adjust"
                onClick={() => handleAdjustMinutes(1)}
                disabled={isFocusRunning}
                title="1 daqiqa qo'shish"
              >
                +1 daq
              </button>
              <button
                type="button"
                className="btn-time-adjust"
                onClick={() => handleAdjustMinutes(5)}
                disabled={isFocusRunning}
                title="5 daqiqa qo'shish"
              >
                +5 daq
              </button>
            </div>

            {/* Quick Preset Duration Chips */}
            <div className="focus-presets-row">
              {FOCUS_PRESETS.map((preset) => {
                const isSelected = focusDuration === preset.mins * 60;
                return (
                  <button
                    key={preset.mins}
                    type="button"
                    className={`focus-preset-chip ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSetDuration(preset.mins)}
                    disabled={isFocusRunning}
                  >
                    <span className="preset-chip-mins">{preset.label}</span>
                    <span className="preset-chip-desc">{preset.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Main Action Buttons */}
            <div className="focus-actions-row">
              <button
                type="button"
                className={`btn-focus-main ${isFocusRunning ? 'is-running' : 'is-idle'}`}
                onClick={handleToggleFocus}
              >
                {isFocusRunning ? (
                  <>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1.5" />
                      <rect x="14" y="4" width="4" height="16" rx="1.5" />
                    </svg>
                    <span>Pauza Qilish</span>
                  </>
                ) : focusTimeLeft === 0 ? (
                  <>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="1 4 1 10 7 10" />
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                    </svg>
                    <span>Yangi Dars Boshlash</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <polygon points="6 3 20 12 6 21 6 3" />
                    </svg>
                    <span>Darsni Boshlash</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn-focus-reset"
                onClick={handleResetFocus}
                title="Taymerni qayta o'rnatish"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
                <span>Qayta O'rnatish</span>
              </button>

              <button
                type="button"
                className="btn-focus-chime-test"
                onClick={() => {
                  audioManager.playFocusDone();
                  triggerBanner("🔔 Focus Qo'ng'irog'i", "Dars vaqti tugaganda mana shunday yoqimli ovoz yangraydi!");
                }}
                title="Tugash ovozini sinash"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span>Ovozni sinash</span>
              </button>
            </div>
          </div>

          {/* Bottom Focus Meta & Inspiration */}
          <div className="focus-insights-grid">
            <div className="focus-stat-box">
              <div className="focus-stat-icon-wrap">
                <IconFocus size={24} color="#10B981" />
              </div>
              <div className="focus-stat-info">
                <span className="focus-stat-val">{focusSessionCount} ta seans</span>
                <span className="focus-stat-label">Bugun o'tirilgan darslar</span>
              </div>
            </div>

            <div className="focus-stat-box">
              <div className="focus-stat-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#3B82F6" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div className="focus-stat-info">
                <span className="focus-stat-val">{focusSessionCount * 20} daqiqa</span>
                <span className="focus-stat-label">Jami chuqur diqqat vaqti</span>
              </div>
            </div>
          </div>

          {/* Toggleable Focus Tip (Lamp / Maslahat) */}
          <div className="focus-tip-container">
            <button
              type="button"
              className={`focus-tip-toggle-btn ${showFocusTip ? 'active' : ''}`}
              onClick={() => setShowFocusTip((prev) => !prev)}
              aria-label="Foydali tavsiya"
            >
              <div className="focus-tip-icon">
                <IconLightbulb size={20} color="#F59E0B" />
              </div>
              <span className="focus-tip-toggle-title">Oltin intizom tavsiyasi</span>
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{
                  marginLeft: 'auto',
                  transform: showFocusTip ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s ease'
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showFocusTip && (
              <div className="focus-tip-banner animate-fade-in" style={{ marginTop: '8px' }}>
                <div className="focus-tip-text">
                  <strong>Oltin Intizom Qoidasi:</strong> Dars boshlanganda telefoningizni qo'ldan uzoqqa qo'ying. 20 daqiqa hech qanday ijtimoiy tarmoqlarsiz faqat bitta mavzuni o'rganish miyaning diqqat markazini 3 barobarga oshiradi.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
          {/* Note disclaimer toggle (Lamp / Maslahat) */}
          <div className="note-info-container">
            <button
              type="button"
              className={`note-info-toggle-btn ${showNotesTip ? 'active' : ''}`}
              onClick={() => setShowNotesTip((prev) => !prev)}
              aria-label="Shaxsiy qaydlar eslatmasi"
            >
              <div className="note-banner-icon-wrap">
                <IconLightbulb size={20} color="#F59E0B" />
              </div>
              <span className="note-info-toggle-title">Shaxsiy qaydlar eslatmasi</span>
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{
                  marginLeft: 'auto',
                  transform: showNotesTip ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s ease'
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showNotesTip && (
              <div className="note-info-banner animate-fade-in" style={{ marginTop: '8px' }}>
                <div>
                  <strong>Shaxsiy Qaydlar — Eslatma Yuborilmaydi</strong>
                  <p>Bu sahifada yozilgan fikrlar, g'oyalar va rejalaringiz sokin shaxsiy daftarcha kabi saqlanadi. Hech qanday tovush yoki chalg'ituvchi bildirishnoma yuborilmaydi.</p>
                </div>
              </div>
            )}
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
