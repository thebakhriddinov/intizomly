import React, { useState } from 'react';
import { IconTrophy, IconPlus, IconCheck } from '../Common/AppIcons';

const PRESET_EMOJIS = ['🎯', '🚫🍬', '⏰', '💧', '📖', '🏃‍♂️', '🧘‍♂️', '⚡', '🥗', '🛡️', '💎', '🦅', '🔥', '💪', '🏆'];

export function AddChallengeModal({ isOpen, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [description, setDescription] = useState('');
  const [targetDays, setTargetDays] = useState(30);
  const [badgeName, setBadgeName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      onSave({
        title: title.trim(),
        emoji,
        description: description.trim() || `${targetDays} kunlik shaxsiy intizom musobaqasi`,
        targetDays: parseInt(targetDays) || 30,
        badgeName: badgeName.trim() || `${title.trim()} Qahramoni 🏆`
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge-glow" style={{ background: 'rgba(182, 243, 107, 0.15)', color: '#b6f36b' }}>
              <IconTrophy size={20} />
            </div>
            <div>
              <h3 className="modal-title" style={{ margin: 0, fontSize: '17px' }}>Yangi Challenge Yaratish</h3>
              <p className="modal-subtitle" style={{ margin: 0, fontSize: '12px', color: 'var(--text-tertiary)' }}>
                Barcha a'zolar uchun guruh musobaqasi va reyting ligasi
              </p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Yopish">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body" style={{ padding: '16px 20px 24px 20px' }}>
          {/* Challenge Title */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px', display: 'block' }}>
              Musobaqa Nomi
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Masalan: 21 Kun Tonggi 06:00 Uyg'onish"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Emoji Selector */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px', display: 'block' }}>
              Belgi (Emoji)
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '110px', overflowY: 'auto' }}>
              {PRESET_EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setEmoji(em)}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    border: emoji === em ? '2px solid var(--primary-accent)' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: emoji === em ? 'rgba(182, 243, 107, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    fontSize: '18px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Duration in Days */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px', display: 'block' }}>
              Davomiyligi (Muddati)
            </label>
            <div className="ios-segmented-control" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              {[7, 14, 21, 30].map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`segmented-btn ${targetDays === d ? 'active' : ''}`}
                  onClick={() => setTargetDays(d)}
                >
                  {d} kun
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px', display: 'block' }}>
              Qoidalar va Tavsif
            </label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Guruh ishtirokchilari nima qilishi kerakligini tushuntiring..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Badge Reward Name */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px', display: 'block' }}>
              Mukofot Unvoni (Badge)
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Masalan: Tonggi Lochin 🦅"
              value={badgeName}
              onChange={(e) => setBadgeName(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="secondary-btn"
              onClick={onClose}
              disabled={submitting}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="primary-btn"
              disabled={submitting || !title.trim()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <IconCheck size={16} color="#080D05" />
              <span>{submitting ? "Yaratilmoqda..." : "Challengeni Boshlash"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
