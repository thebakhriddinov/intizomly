import React, { memo, useState, useMemo } from 'react';
import { useHabits } from '../../context/HabitsContext';
import { useLanguage } from '../../context/LanguageContext';
import { storage } from '../../utils/storage';
import { HabitCard } from './HabitCard';
import { IconCheck, IconPending, IconLayers, IconTarget } from '../Common/AppIcons';

function HabitListComponent({ onOpenAddHabit, onEditHabit }) {
  const { habits, dateKey, history, deleteHabit, loading } = useHabits();
  const { t } = useLanguage();

  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'completed', 'pending'

  // Calculate counts for filters
  const { filteredHabits, countAll, countPending, countCompleted } = useMemo(() => {
    let pending = 0;
    let completed = 0;

    const list = habits.filter(h => {
      const isDone = storage.isHabitCompleted(dateKey, h.id);
      if (isDone) completed++;
      else pending++;

      // Filter by status (all, completed, pending)
      if (activeFilter === 'completed' && !isDone) return false;
      if (activeFilter === 'pending' && isDone) return false;

      return true;
    });

    return {
      filteredHabits: list,
      countAll: habits.length,
      countPending: pending,
      countCompleted: completed
    };
  }, [habits, dateKey, history, activeFilter]);

  const handleDelete = React.useCallback((id) => {
    const h = storage.habits.find(item => item.id === id) || storage.getHabitById(id);
    if (!h) return;
    if (confirm(`"${h.title}" odatini o'chirishni tasdiqlaysizmi?`)) {
      deleteHabit(id);
    }
  }, [deleteHabit]);

  return (
    <section className="habits-section" id="habits-section">
      <div className="habits-toolbar">
        <div>
          <h2 className="section-title">{t('habitsTitle')}</h2>
        </div>

        <div className="toolbar-right">
          <button
            type="button"
            className="primary-btn"
            onClick={onOpenAddHabit}
          >
            <span>{t('addHabitBtn')}</span>
          </button>
        </div>
      </div>

      {/* Filter Chips: Barchasi, Bajarilgan, Bajarilmagan */}
      <div className="filter-chips-row">
        <button
          type="button"
          className={`filter-chip ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          <IconLayers size={14} />
          <span>{t('filterAll')} ({countAll})</span>
        </button>

        <button
          type="button"
          className={`filter-chip ${activeFilter === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveFilter('completed')}
        >
          <IconCheck size={14} color="#10B981" />
          <span>{t('filterCompleted')} ({countCompleted})</span>
        </button>

        <button
          type="button"
          className={`filter-chip ${activeFilter === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveFilter('pending')}
        >
          <IconPending size={14} color="#F59E0B" />
          <span>{t('filterPending')} ({countPending})</span>
        </button>
      </div>

      {/* Habits Grid */}
      {loading ? (
        <div className="empty-state-view" style={{ minHeight: '180px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            border: '3px solid rgba(182, 243, 107, 0.2)',
            borderTopColor: '#B6F36B',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }}></div>
          <p className="empty-text" style={{ marginTop: '12px' }}>Odatlar yuklanmoqda...</p>
        </div>
      ) : filteredHabits.length > 0 ? (
        <div className="habits-grid">
          {filteredHabits.map(h => (
            <HabitCard
              key={h.id}
              habit={h}
              onEdit={onEditHabit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state-view">
          <div className="empty-icon-box">
            <IconTarget size={36} color="var(--accent-primary, #B6F36B)" />
          </div>
          <h4 className="empty-title">{t('emptyHabitsTitle')}</h4>
          <p className="empty-text">{t('emptyHabitsDesc')}</p>
          <button
            type="button"
            className="primary-btn"
            onClick={onOpenAddHabit}
          >
            <span>{t('addHabitBtn')}</span>
          </button>
        </div>
      )}
    </section>
  );
}

export const HabitList = memo(HabitListComponent);
