import React, { memo, useState, useMemo } from 'react';
import { useHabits } from '../../context/HabitsContext';
import { useLanguage } from '../../context/LanguageContext';
import { storage } from '../../utils/storage';
import { HabitCard } from './HabitCard';

function HabitListComponent({ onOpenAddHabit, onEditHabit }) {
  const { habits, dateKey, history, deleteHabit, loading } = useHabits();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'pending', 'completed'
  const [activeCategory, setActiveCategory] = useState('all');

  // Calculate counts for filters
  const { filteredHabits, countAll, countPending, countCompleted } = useMemo(() => {
    let pending = 0;
    let completed = 0;

    const list = habits.filter(h => {
      const isDone = storage.isHabitCompleted(dateKey, h.id);
      if (isDone) completed++;
      else pending++;

      // Filter by status
      if (activeFilter === 'completed' && !isDone) return false;
      if (activeFilter === 'pending' && isDone) return false;

      // Filter by category
      if (activeCategory !== 'all' && h.category !== activeCategory) return false;

      // Filter by search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = h.title.toLowerCase().includes(q);
        const matchesDesc = (h.description || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }

      return true;
    });

    return {
      filteredHabits: list,
      countAll: habits.length,
      countPending: pending,
      countCompleted: completed
    };
  }, [habits, dateKey, history, activeFilter, activeCategory, searchQuery]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set();
    habits.forEach(h => {
      if (h.category) set.add(h.category);
    });
    return Array.from(set);
  }, [habits]);

  const handleDelete = (id) => {
    const h = storage.getHabitById(id);
    if (!h) return;
    if (confirm(`"${h.title}" odatini o'chirishni tasdiqlaysizmi?`)) {
      deleteHabit(id);
    }
  };

  return (
    <section className="habits-section" id="habits-section">
      <div className="habits-toolbar">
        <div>
          <h2 className="section-title">{t('habitsTitle')}</h2>
          <p className="section-subtitle">{t('habitsSubtitle')}</p>
        </div>

        <div className="toolbar-right">
          {/* iOS Style Search Input */}
          <div className="search-input-wrapper">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label={t('searchPlaceholder')}
            />
          </div>

          <button
            type="button"
            className="primary-btn"
            onClick={onOpenAddHabit}
          >
            <span>{t('addHabitBtn')}</span>
          </button>
        </div>
      </div>

      {/* Filter Chips (Status & Categories) */}
      <div className="filter-chips-row">
        <button
          type="button"
          className={`filter-chip ${activeFilter === 'all' && activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => { setActiveFilter('all'); setActiveCategory('all'); }}
        >
          {t('filterAll')} ({countAll})
        </button>

        <button
          type="button"
          className={`filter-chip ${activeFilter === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveFilter('pending')}
        >
          ⏳ {t('filterPending')} ({countPending})
        </button>

        <button
          type="button"
          className={`filter-chip ${activeFilter === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveFilter('completed')}
        >
          ✅ {t('filterCompleted')} ({countCompleted})
        </button>

        <div className="filter-chip-divider"></div>

        {categories.map(cat => (
          <button
            key={cat}
            type="button"
            className={`filter-chip ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(activeCategory === cat ? 'all' : cat)}
          >
            {cat}
          </button>
        ))}
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
          <div className="empty-icon-box">🎯</div>
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
