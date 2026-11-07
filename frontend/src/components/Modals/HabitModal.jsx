import React, { useState, useEffect, useMemo } from 'react';
import { useHabits } from '../../context/HabitsContext';
import { useLanguage } from '../../context/LanguageContext';
import { HabitGlyphIcon } from '../Common/AppIcons';

const PRESET_ALL = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const PRESET_WORKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri'];
const PRESET_WEEKENDS = ['sat', 'sun'];

export function HabitModal({ isOpen, onClose, habitToEdit }) {
  const { addHabit, updateHabit } = useHabits();
  const { t, lang } = useLanguage();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState("Sog'liq");
  const [target, setTarget] = useState('1 marta');
  const [time, setTime] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [selectedDays, setSelectedDays] = useState(PRESET_ALL);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojiList = [
    '🚫🍬', '📖', '💧', '🏃‍♂️', '⏰', '🧘', '🥗', '💻', '✍️',
    '🎯', '🏋️', '🧠', '🚴', '🍏', '🛌', '🚭', '☕', '🌟'
  ];

  const weekdays = useMemo(() => [
    { id: 'mon', label: lang === 'ru' ? 'Пн' : lang === 'en' ? 'Mon' : 'Dsh', full: lang === 'ru' ? 'Понедельник' : lang === 'en' ? 'Monday' : 'Dushanba' },
    { id: 'tue', label: lang === 'ru' ? 'Вт' : lang === 'en' ? 'Tue' : 'Ssh', full: lang === 'ru' ? 'Вторник' : lang === 'en' ? 'Tuesday' : 'Seshanba' },
    { id: 'wed', label: lang === 'ru' ? 'Ср' : lang === 'en' ? 'Wed' : 'Chr', full: lang === 'ru' ? 'Среда' : lang === 'en' ? 'Wednesday' : 'Chorshanba' },
    { id: 'thu', label: lang === 'ru' ? 'Чт' : lang === 'en' ? 'Thu' : 'Pay', full: lang === 'ru' ? 'Четверг' : lang === 'en' ? 'Thursday' : 'Payshanba' },
    { id: 'fri', label: lang === 'ru' ? 'Пт' : lang === 'en' ? 'Fri' : 'Jum', full: lang === 'ru' ? 'Пятница' : lang === 'en' ? 'Friday' : 'Juma' },
    { id: 'sat', label: lang === 'ru' ? 'Сб' : lang === 'en' ? 'Sat' : 'Shn', full: lang === 'ru' ? 'Суббота' : lang === 'en' ? 'Saturday' : 'Shanba' },
    { id: 'sun', label: lang === 'ru' ? 'Вс' : lang === 'en' ? 'Sun' : 'Yak', full: lang === 'ru' ? 'Воскресенье' : lang === 'en' ? 'Sunday' : 'Yakshanba' }
  ], [lang]);

  useEffect(() => {
    if (habitToEdit) {
      setTitle(habitToEdit.title || '');
      setDescription(habitToEdit.description || '');
      setCategory(habitToEdit.category || (lang === 'ru' ? "Здоровье" : lang === 'en' ? "Health" : "Sog'liq"));
      setTarget(habitToEdit.target || (lang === 'ru' ? '1 раз' : lang === 'en' ? '1 time' : '1 marta'));
      setTime(habitToEdit.time || '');
      setEmoji(habitToEdit.emoji || '🎯');
      const initialSchedule = Array.isArray(habitToEdit.schedule) && habitToEdit.schedule.length > 0
        ? habitToEdit.schedule
        : PRESET_ALL;
      setSelectedDays(initialSchedule);
    } else {
      setTitle('');
      setDescription('');
      setCategory(lang === 'ru' ? "Здоровье" : lang === 'en' ? "Health" : "Sog'liq");
      setTarget(lang === 'ru' ? '1 раз' : lang === 'en' ? '1 time' : '1 marta');
      setTime('08:00');
      setEmoji('🚫🍬');
      setSelectedDays(PRESET_ALL);
    }
    setShowEmojiPicker(false);
  }, [habitToEdit, isOpen, lang]);

  const [submitting, setSubmitting] = useState(false);

  // Toggle individual day selection
  const handleToggleDay = (dayId) => {
    setSelectedDays(prev => {
      if (prev.includes(dayId)) {
        if (prev.length <= 1) return prev; // At least one day selected
        return prev.filter(d => d !== dayId);
      } else {
        const next = [...prev, dayId];
        return PRESET_ALL.filter(d => next.includes(d));
      }
    });
  };

  const handleApplyPreset = (preset) => {
    setSelectedDays([...preset]);
  };

  const scheduleSummaryText = useMemo(() => {
    if (selectedDays.length === 7) {
      return lang === 'ru' ? "Каждый день (7 дней)" : lang === 'en' ? "Every day (7 days)" : "Har kuni (7 kun)";
    }
    if (selectedDays.length === 5 && !selectedDays.includes('sat') && !selectedDays.includes('sun')) {
      return lang === 'ru' ? "Будние дни (Пн–Пт)" : lang === 'en' ? "Weekdays (Mon–Fri)" : "Ish kunlari (Dsh–Jum)";
    }
    if (selectedDays.length === 2 && selectedDays.includes('sat') && selectedDays.includes('sun')) {
      return lang === 'ru' ? "Выходные (Сб–Вс)" : lang === 'en' ? "Weekends (Sat–Sun)" : "Dam olish kunlari (Shn–Yak)";
    }
    return lang === 'ru'
      ? `${selectedDays.length} дн. в неделю`
      : lang === 'en'
      ? `${selectedDays.length} days/week`
      : `Haftada ${selectedDays.length} kun`;
  }, [selectedDays, lang]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || submitting) return;

    setSubmitting(true);
    const finalSchedule = selectedDays.length > 0 ? selectedDays : PRESET_ALL;

    try {
      if (habitToEdit) {
        await updateHabit(habitToEdit.id, {
          title,
          description,
          category,
          target,
          time,
          emoji,
          schedule: finalSchedule
        });
      } else {
        await addHabit({
          title,
          description,
          category,
          target,
          time,
          emoji,
          schedule: finalSchedule
        });
      }
      onClose();
    } catch (err) {
      console.error('[HabitModal] Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card small-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <HabitGlyphIcon emoji={emoji} category={category} title={title} size={22} />
            <div>
              <h3 className="modal-title">
                {habitToEdit
                  ? (lang === 'ru' ? "Редактировать привычку" : lang === 'en' ? "Edit Habit" : "Odatni Tahrirlash")
                  : (lang === 'ru' ? "Добавить новую привычку" : lang === 'en' ? "Add New Habit" : "Yangi Odat Qo'shish")}
              </h3>
              <p className="modal-desc">
                {habitToEdit
                  ? (lang === 'ru' ? "Обновите параметры и график привычки" : lang === 'en' ? "Update habit parameters and schedule" : "Odat parametrlari va jadvalini yangilang")
                  : (lang === 'ru' ? "Новое дисциплинированное действие по графику" : lang === 'en' ? "New disciplined action on your schedule" : "O'z jadvalingiz bo'yicha yangi intizomli amal")}
              </p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Yopish">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>{lang === 'ru' ? "Название привычки *" : lang === 'en' ? "Habit Title *" : "Odat Nomi *"}</label>
            <input
              type="text"
              className="form-control"
              placeholder={lang === 'ru' ? "Например: Поход в зал, Чтение книг" : lang === 'en' ? "E.g. Going to gym, Reading books" : "Masalan: Zalga borish, Kitob o'qish"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>{lang === 'ru' ? "Описание (необязательно)" : lang === 'en' ? "Description (optional)" : "Tavsif (ixtiyoriy)"}</label>
            <textarea
              className="form-control"
              placeholder={lang === 'ru' ? "Что вам дает эта привычка?" : lang === 'en' ? "What value does this habit bring?" : "Ushbu odat sizga nima beradi?"}
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>{lang === 'ru' ? "Категория" : lang === 'en' ? "Category" : "Kategoriya"}</label>
              <select
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Sog'liq">{lang === 'ru' ? "Здоровье" : lang === 'en' ? "Health" : "Sog'liq"}</option>
                <option value="O'qish">{lang === 'ru' ? "Чтение" : lang === 'en' ? "Reading" : "O'qish"}</option>
                <option value="Sport">{lang === 'ru' ? "Спорт" : lang === 'en' ? "Sport" : "Sport"}</option>
                <option value="Tartib">{lang === 'ru' ? "Порядок" : lang === 'en' ? "Order" : "Tartib"}</option>
                <option value="Rivojlanish">{lang === 'ru' ? "Развитие" : lang === 'en' ? "Growth" : "Rivojlanish"}</option>
                <option value="Kundalik">{lang === 'ru' ? "Ежедневное" : lang === 'en' ? "Daily" : "Kundalik"}</option>
              </select>
            </div>

            <div className="form-group">
              <label>{lang === 'ru' ? "Цель на день" : lang === 'en' ? "Daily Target" : "Kunlik Maqsad"}</label>
              <input
                type="text"
                className="form-control"
                placeholder={lang === 'ru' ? "1 раз, 2 литра, 20 страниц" : lang === 'en' ? "1 time, 2 liters, 20 pages" : "1 marta, 2 litr, 20 bet"}
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </div>
          </div>

          {/* CUSTOM SCHEDULE: Hafta kunlarini tanlash */}
          <div className="form-group schedule-picker-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{lang === 'ru' ? "📅 График повторений" : lang === 'en' ? "📅 Repetition Schedule" : "📅 Takrorlanish Jadvali"}</span>
                <span className="schedule-summary-pill">{scheduleSummaryText}</span>
              </label>
            </div>

            {/* Quick Presets */}
            <div className="schedule-presets-row">
              <button
                type="button"
                className={`preset-chip-btn ${selectedDays.length === 7 ? 'active' : ''}`}
                onClick={() => handleApplyPreset(PRESET_ALL)}
              >
                {lang === 'ru' ? "Каждый день" : lang === 'en' ? "Every day" : "Har kuni"}
              </button>
              <button
                type="button"
                className={`preset-chip-btn ${selectedDays.length === 5 && !selectedDays.includes('sat') && !selectedDays.includes('sun') ? 'active' : ''}`}
                onClick={() => handleApplyPreset(PRESET_WORKDAYS)}
              >
                {lang === 'ru' ? "Будние дни" : lang === 'en' ? "Weekdays" : "Ish kunlari"}
              </button>
              <button
                type="button"
                className={`preset-chip-btn ${selectedDays.length === 2 && selectedDays.includes('sat') && selectedDays.includes('sun') ? 'active' : ''}`}
                onClick={() => handleApplyPreset(PRESET_WEEKENDS)}
              >
                {lang === 'ru' ? "Выходные" : lang === 'en' ? "Weekends" : "Dam olish"}
              </button>
            </div>

            {/* 7-Day Selector Buttons */}
            <div className="schedule-days-grid">
              {weekdays.map(day => {
                const isSelected = selectedDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    className={`schedule-day-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleToggleDay(day.id)}
                    title={`${day.full} (${isSelected ? (lang === 'ru' ? 'Выбрано' : lang === 'en' ? 'Selected' : 'Tanlangan') : (lang === 'ru' ? 'Не выбрано' : lang === 'en' ? 'Unselected' : 'Tanlanmagan')})`}
                    aria-pressed={isSelected}
                  >
                    <span className="schedule-day-text">{day.label}</span>
                    <span className="schedule-day-check">
                      {isSelected ? '✓' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bajarish Vaqti (SMS va Pin uchun) */}
          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>⏰ {lang === 'ru' ? "Время выполнения" : lang === 'en' ? "Scheduled Time" : "Bajarish Vaqti"}</span>
                <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 700 }}>(SMS & Pin)</span>
              </label>
              {time && (
                <button
                  type="button"
                  onClick={() => setTime('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    padding: '2px 4px'
                  }}
                >
                  ✕ {lang === 'ru' ? "Удалить время" : lang === 'en' ? "Remove time" : "Vaqtni olib tashlash"}
                </button>
              )}
            </div>

            <input
              type="time"
              className="form-control"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: time ? '#10B981' : 'var(--text-primary)',
                letterSpacing: '0.5px',
                marginBottom: '8px'
              }}
            />

            {/* Quick time chip presets */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
              {['06:30', '07:30', '09:00', '12:30', '14:00', '16:30', '18:00', '20:00', '21:30'].map(tStr => (
                <button
                  key={tStr}
                  type="button"
                  onClick={() => setTime(tStr)}
                  className={`preset-chip-btn ${time === tStr ? 'active' : ''}`}
                  style={{ padding: '3px 9px', fontSize: '11px', borderRadius: '8px' }}
                >
                  {tStr}
                </button>
              ))}
            </div>

            <span className="form-hint" style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block', lineHeight: 1.4 }}>
              {lang === 'ru'
                ? "В указанное время придет напоминание/SMS и привычка будет закреплена 📌 в самом верху."
                : lang === 'en'
                ? "At this scheduled time, you will receive an alert/SMS and this habit will be 📌 PINNED to the top."
                : "Shu vaqt kelganda telefoningizga SMS/xabar keladi va ilovaga kirganda bu odat eng tepada 📌 PIN bo'lib turadi."}
            </span>
          </div>

          {/* Emoji Picker */}
          <div className="form-group">
            <label>{lang === 'ru' ? "Иконка / Emoji" : lang === 'en' ? "Icon / Emoji" : "Emoji Belgisi"}</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div
                style={{
                  fontSize: '24px',
                  width: '44px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--bg-secondary)',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                {emoji}
              </div>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                style={{ height: '40px' }}
              >
                {showEmojiPicker
                  ? (lang === 'ru' ? "Закрыть эмодзи" : lang === 'en' ? "Close emojis" : "Emojilarni yopish")
                  : (lang === 'ru' ? "Выбрать эмодзи" : lang === 'en' ? "Choose emoji" : "Emoji tanlash")}
              </button>
            </div>

            {showEmojiPicker && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '8px',
                padding: '12px',
                background: 'var(--bg-secondary)',
                borderRadius: '12px',
                marginTop: '8px'
              }}>
                {emojiList.map(em => (
                  <button
                    key={em}
                    type="button"
                    style={{
                      fontSize: '22px',
                      background: em === emoji ? 'var(--primary-accent-subtle)' : 'transparent',
                      border: em === emoji ? '1px solid var(--primary-accent)' : 'none',
                      borderRadius: '8px',
                      padding: '6px',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setEmoji(em);
                      setShowEmojiPicker(false);
                    }}
                  >
                    {em}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions" style={{ marginTop: '12px' }}>
            <button type="button" className="btn-subtle" onClick={onClose}>
              {lang === 'ru' ? "Отмена" : lang === 'en' ? "Cancel" : "Bekor qilish"}
            </button>
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting
                ? (lang === 'ru' ? "Сохранение..." : lang === 'en' ? "Saving..." : "Saqlanmoqda...")
                : (habitToEdit
                  ? (lang === 'ru' ? "Обновить привычку" : lang === 'en' ? "Update Habit" : "Odatni Yangilash")
                  : (lang === 'ru' ? "Добавить привычку" : lang === 'en' ? "Add Habit" : "Odatni Qo'shish"))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
