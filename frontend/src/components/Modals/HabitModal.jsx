import React, { useState, useEffect } from 'react';
import { useHabits } from '../../context/HabitsContext';
import { useLanguage } from '../../context/LanguageContext';
import { HabitGlyphIcon } from '../Common/AppIcons';

export function HabitModal({ isOpen, onClose, habitToEdit }) {
  const { addHabit, updateHabit } = useHabits();
  const { t } = useLanguage();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState("Sog'liq");
  const [target, setTarget] = useState('1 marta');
  const [time, setTime] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojiList = [
    '🚫🍬', '📖', '💧', '🏃‍♂️', '⏰', '🧘', '🥗', '💻', '✍️',
    '🎯', '🏋️', '🧠', '🚴', '🍏', '🛌', '🚭', '☕', '🌟'
  ];

  useEffect(() => {
    if (habitToEdit) {
      setTitle(habitToEdit.title || '');
      setDescription(habitToEdit.description || '');
      setCategory(habitToEdit.category || "Sog'liq");
      setTarget(habitToEdit.target || '1 marta');
      setTime(habitToEdit.time || '');
      setEmoji(habitToEdit.emoji || '🎯');
    } else {
      setTitle('');
      setDescription('');
      setCategory("Sog'liq");
      setTarget('1 marta');
      setTime('08:00');
      setEmoji('🚫🍬');
    }
    setShowEmojiPicker(false);
  }, [habitToEdit, isOpen]);

  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || submitting) return;

    setSubmitting(true);
    try {
      if (habitToEdit) {
        await updateHabit(habitToEdit.id, {
          title,
          description,
          category,
          target,
          time,
          emoji
        });
      } else {
        await addHabit({
          title,
          description,
          category,
          target,
          time,
          emoji
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
            <HabitGlyphIcon emoji={emoji} category={category} title={title} size={20} />
            <div>
              <h3 className="modal-title">
                {habitToEdit ? "Odatni Tahrirlash" : "Yangi Odat Qo'shish"}
              </h3>
              <p className="modal-desc">
                {habitToEdit ? "Odat parametrlarini yangilang" : "Har kuni bajariladigan yangi intizomli amal"}
              </p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Yopish">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Odat Nomi *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Masalan: Kitob o'qish (20 bet)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Tavsif (ixtiyoriy)</label>
            <textarea
              className="form-control"
              placeholder="Ushbu odat sizga nima beradi?"
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Kategoriya</label>
              <select
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Sog'liq">Sog'liq</option>
                <option value="O'qish">O'qish</option>
                <option value="Sport">Sport</option>
                <option value="Tartib">Tartib</option>
                <option value="Rivojlanish">Rivojlanish</option>
                <option value="Kundalik">Kundalik</option>
              </select>
            </div>

            <div className="form-group">
              <label>Kunlik Maqsad</label>
              <input
                type="text"
                className="form-control"
                placeholder="1 marta, 2 litr, 20 bet"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </div>
          </div>

          {/* Bajarish Vaqti (SMS va Pin uchun) */}
          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>⏰ Bajarish Vaqti</span>
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
                  ✕ Vaqtni olib tashlash
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
              Shu vaqt kelganda telefoningizga SMS/xabar keladi va ilovaga kirganda bu odat eng tepada 📌 PIN bo'lib turadi.
            </span>
          </div>

          {/* Emoji Picker */}
          <div className="form-group">
            <label>Emoji Belgisi</label>
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
                {showEmojiPicker ? "Emojilarni yopish" : "Emoji tanlash"}
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
              Bekor qilish
            </button>
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "Saqlanmoqda..." : (habitToEdit ? "Odatni Yangilash" : "Odatni Qo'shish")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
