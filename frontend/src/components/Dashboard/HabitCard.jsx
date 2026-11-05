import React, { memo, useMemo } from 'react';
import { useHabits } from '../../context/HabitsContext';
import { storage } from '../../utils/storage';
import { IconFlame, IconTarget, HabitGlyphIcon, IconClock, IconPin } from '../Common/AppIcons';

function HabitCardComponent({ habit, onEdit, onDelete, isPinned = false, isCurrentActive = false }) {
  const { dateKey, history, toggleHabit } = useHabits();

  // Instant O(1) completion lookup
  const isCompleted = !!(history[dateKey] && history[dateKey][habit.id]);

  const streak = useMemo(() => {
    return storage.getHabitStreak(habit.id);
  }, [history, habit.id]);

  // Generate 7-day mini history dots with minimal date allocations
  const miniDots = useMemo(() => {
    const now = Date.now();
    const dots = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      const dKey = storage.formatDateKey(d);
      const done = !!(history[dKey] && history[dKey][habit.id]);
      dots.push({ dateKey: dKey, isDone: done, isToday: i === 0 });
    }
    return dots;
  }, [history, habit.id]);

  return (
    <div
      className={`habit-card ${isCompleted ? 'is-completed' : ''} ${isPinned || isCurrentActive ? 'is-pinned-active' : ''}`}
      onClick={(e) => {
        // Prevent toggling when clicking action buttons
        if (e.target.closest('.habit-actions') || e.target.closest('.action-icon-btn')) {
          return;
        }
        toggleHabit(habit.id);
      }}
      role="button"
      tabIndex={0}
    >
      {/* Pinned / Active Time Ribbon */}
      {(isPinned || isCurrentActive) && (
        <div className="habit-pinned-banner">
          <span className="pinned-pulse-dot"></span>
          <IconPin size={12} color="#10B981" />
          <span className="pinned-title-text">
            {isCurrentActive ? `Hozir bajarish vaqti (${habit.time || 'Aktiv'})` : "Qadalgan odat"}
          </span>
          <span className="pinned-chip-tag">PIN</span>
        </div>
      )}

      <div className="habit-top-row">
        {/* Apple Reminders / Liquid Jelly Checkbox */}
        <button
          type="button"
          className="habit-checkbox-btn"
          onClick={(e) => {
            e.stopPropagation();
            toggleHabit(habit.id);
          }}
          title={isCompleted ? "Belgilashni bekor qilish" : "Bajarildi deb belgilash"}
          aria-label="Bajarildi"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </button>

        <div className="habit-body">
          <div className="habit-header-badge-row">
            <span className="habit-category-tag">{habit.category}</span>
            <span className="habit-target-tag">
              <IconTarget size={12} color="#8B5CF6" />
              <span>{habit.target || '1 marta'}</span>
            </span>
            {habit.time && (
              <span className={`habit-time-badge ${isCurrentActive ? 'is-active-now' : ''}`} title={`Rejalashtirilgan vaqt: ${habit.time}`}>
                <IconClock size={11} color={isCurrentActive ? '#10B981' : 'var(--text-muted)'} />
                <span>{habit.time}</span>
              </span>
            )}
          </div>

          <div className="habit-title-row">
            <HabitGlyphIcon emoji={habit.emoji} category={habit.category} title={habit.title} size={16} />
            <span className="habit-title">{habit.title}</span>
          </div>

          {habit.description && (
            <p className="habit-description">{habit.description}</p>
          )}
        </div>
      </div>

      <div className="habit-bottom-row">
        {/* Habit-specific streak pill */}
        <div className="habit-streak-pill" title="Ushbu odat bo'yicha uzluksiz streak">
          <IconFlame size={14} />
          <span>{streak} kun</span>
        </div>

        {/* 7-day mini progress dots */}
        <div className="habit-mini-history" title="So'nggi 7 kunlik natija">
          {miniDots.map((dot, idx) => (
            <span
              key={idx}
              className={`mini-dot ${dot.isDone ? 'done' : ''} ${dot.isToday ? 'today-dot' : ''}`}
            ></span>
          ))}
        </div>

        {/* Action icons (Edit / Delete) */}
        <div className="habit-actions">
          <button
            type="button"
            className="action-icon-btn edit-habit-btn"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(habit);
            }}
            title="Tahrirlash"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          </button>

          <button
            type="button"
            className="action-icon-btn delete-btn delete-habit-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(habit.id);
            }}
            title="O'chirish"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export const HabitCard = memo(HabitCardComponent);
