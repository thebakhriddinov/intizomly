import React, { memo, useMemo } from 'react';
import { useHabits } from '../../context/HabitsContext';
import { useLanguage } from '../../context/LanguageContext';
import { storage } from '../../utils/storage';
import { IconFlame, IconTarget, HabitGlyphIcon, IconClock, IconPin } from '../Common/AppIcons';

function HabitCardComponent({ habit, onEdit, onDelete, isPinned = false, isCurrentActive = false }) {
  const { dateKey, history, toggleHabit } = useHabits();
  const { t, lang } = useLanguage();

  // Instant O(1) completion lookup
  const isCompleted = !!(history[dateKey] && history[dateKey][habit.id]);

  const streak = useMemo(() => {
    return storage.getHabitStreak(habit.id);
  }, [history, habit.id, habit.schedule]);

  // Generate 7-day mini history dots with minimal date allocations
  const miniDots = useMemo(() => {
    const now = Date.now();
    const dots = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      const dKey = storage.formatDateKey(d);
      const isScheduled = storage.isHabitScheduledForDate(habit, dKey);
      const done = !!(history[dKey] && history[dKey][habit.id]);
      dots.push({ dateKey: dKey, isDone: done, isToday: i === 0, isScheduled });
    }
    return dots;
  }, [history, habit]);

  const scheduleSummary = useMemo(() => {
    if (!habit.schedule || habit.schedule.length === 7) return null;
    return storage.formatScheduleSummary(habit.schedule, lang);
  }, [habit.schedule, lang]);

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
            {isCurrentActive
              ? (lang === 'ru' ? `Время выполнения (${habit.time || 'Активно'})` : lang === 'en' ? `Time to complete (${habit.time || 'Active'})` : `Hozir bajarish vaqti (${habit.time || 'Aktiv'})`)
              : (lang === 'ru' ? "Закреплено" : lang === 'en' ? "Pinned" : "Qadalgan odat")}
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
          title={isCompleted
            ? (lang === 'ru' ? "Снять отметку" : lang === 'en' ? "Unmark" : "Belgilashni bekor qilish")
            : (lang === 'ru' ? "Отметить выполненным" : lang === 'en' ? "Mark completed" : "Bajarildi deb belgilash")}
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

            {/* Custom Schedule Badge */}
            {scheduleSummary && (
              <span className="habit-schedule-badge" title={`Takrorlanish jadvali: ${scheduleSummary}`}>
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>{scheduleSummary}</span>
              </span>
            )}

            {habit.time && (
              <span className={`habit-time-badge ${isCurrentActive ? 'is-active-now' : ''}`} title={`Rejalashtirilgan vaqt: ${habit.time}`}>
                <IconClock size={11} color={isCurrentActive ? '#10B981' : 'var(--text-muted)'} />
                <span>{habit.time}</span>
              </span>
            )}
          </div>

          <div className="habit-title-row">
            <HabitGlyphIcon emoji={habit.emoji} category={habit.category} title={habit.title} size={18} />
            <span className="habit-title">{habit.title}</span>
          </div>

          {habit.description && (
            <p className="habit-description">{habit.description}</p>
          )}
        </div>
      </div>

      <div className="habit-bottom-row">
        {/* Habit-specific streak pill */}
        <div className="habit-streak-pill" title={lang === 'ru' ? "Непрерывный стрик привычки" : lang === 'en' ? "Continuous habit streak" : "Ushbu odat bo'yicha uzluksiz streak"}>
          <IconFlame size={14} />
          <span>{streak} {t('daysCount')}</span>
        </div>

        {/* 7-day mini progress dots */}
        <div className="habit-mini-history" title={lang === 'ru' ? "Результат за 7 дней" : lang === 'en' ? "7-day trend" : "So'nggi 7 kunlik natija"}>
          {miniDots.map((dot, idx) => (
            <span
              key={idx}
              className={`mini-dot ${dot.isDone ? 'done' : ''} ${dot.isToday ? 'today-dot' : ''} ${!dot.isScheduled && !dot.isDone ? 'rest-dot' : ''}`}
              title={`${dot.dateKey}: ${dot.isDone
                ? (lang === 'ru' ? 'Выполнено' : lang === 'en' ? 'Completed' : 'Bajarilgan')
                : dot.isScheduled
                ? (lang === 'ru' ? 'Не выполнено' : lang === 'en' ? 'Pending' : 'Bajarilmagan')
                : (lang === 'ru' ? 'День отдыха' : lang === 'en' ? 'Rest day' : 'Dam olish kuni')}`}
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
            title={lang === 'ru' ? "Редактировать" : lang === 'en' ? "Edit" : "Tahrirlash"}
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
            title={lang === 'ru' ? "Удалить" : lang === 'en' ? "Delete" : "O'chirish"}
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export const HabitCard = memo(HabitCardComponent);
