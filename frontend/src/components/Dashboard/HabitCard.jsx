import React, { memo, useMemo } from 'react';
import { useHabits } from '../../context/HabitsContext';
import { storage } from '../../utils/storage';

function HabitCardComponent({ habit, onEdit, onDelete }) {
  const { dateKey, history, toggleHabit } = useHabits();

  const isCompleted = useMemo(() => {
    return storage.isHabitCompleted(dateKey, habit.id);
  }, [dateKey, history, habit.id]);

  const streak = useMemo(() => {
    return storage.getHabitStreak(habit.id);
  }, [history, habit.id]);

  // Generate 7-day mini history dots
  const miniDots = useMemo(() => {
    const today = new Date();
    const dots = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dKey = storage.formatDateKey(d);
      const done = storage.isHabitCompleted(dKey, habit.id);
      dots.push({ dateKey: dKey, isDone: done, isToday: i === 0 });
    }
    return dots;
  }, [history, habit.id]);

  return (
    <div
      className={`habit-card ${isCompleted ? 'is-completed' : ''}`}
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
            <span className="habit-target-tag">🎯 {habit.target || '1 marta'}</span>
          </div>

          <div className="habit-title-row">
            <span className="habit-emoji">{habit.emoji || '🎯'}</span>
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
          <span>🔥</span>
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
