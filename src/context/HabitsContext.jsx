import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { storage } from '../utils/storage';
import { audioManager } from '../utils/audio';
import { fireCelebrationConfetti } from '../utils/confetti';

const HabitsContext = createContext(null);

export function HabitsProvider({ children }) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [habits, setHabits] = useState(() => storage.getHabits());
  const [history, setHistory] = useState(() => storage.getHistory());
  const [settings, setSettings] = useState(() => storage.getSettings());
  const [bannerNotif, setBannerNotif] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Sync settings with audio manager and HTML document appearance/theme
  useEffect(() => {
    audioManager.setEnabled(settings.soundEnabled !== false);
    
    // Apply theme
    document.body.setAttribute('data-theme', settings.theme || 'emerald');

    // Apply appearance
    if (settings.appearance === 'system') {
      document.documentElement.removeAttribute('data-appearance');
    } else {
      document.documentElement.setAttribute('data-appearance', settings.appearance || 'system');
    }
  }, [settings]);

  const dateKey = useMemo(() => {
    return storage.formatDateKey(currentDate);
  }, [currentDate]);

  const isToday = useMemo(() => {
    const today = new Date();
    return (
      currentDate.getDate() === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  }, [currentDate]);

  const shiftDate = useCallback((deltaDays) => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      next.setDate(next.getDate() + deltaDays);
      return next;
    });
  }, []);

  const jumpToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const addToast = useCallback((title, message = '', type = 'info', duration = 4000) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    const newToast = { id, title, message, type };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const triggerBanner = useCallback((title, message) => {
    audioManager.playNotification();
    if (navigator.vibrate) {
      try { navigator.vibrate([100, 60, 140]); } catch (e) {}
    }

    const id = 'notif_' + Date.now();
    setBannerNotif({ id, title, message });

    setTimeout(() => {
      setBannerNotif(prev => (prev?.id === id ? null : prev));
    }, 6500);
  }, []);

  const dismissBanner = useCallback(() => {
    setBannerNotif(null);
  }, []);

  const toggleHabit = useCallback((habitId) => {
    const beforeStats = storage.getDayStats(dateKey);
    const newState = storage.toggleHabit(dateKey, habitId);

    // Refresh history
    setHistory({ ...storage.getHistory() });

    if (newState) {
      audioManager.playCheck();
      addToast("Bajarildi! 🎉", "Ajoyib intizom!", "success", 2000);

      const afterStats = storage.getDayStats(dateKey);
      if (afterStats.completed === afterStats.total && beforeStats.completed < beforeStats.total) {
        if (settings.confettiEnabled !== false) {
          fireCelebrationConfetti();
        }
        audioManager.playCelebration();
        addToast("Tabriklaymiz! 🌟", "Bugungi barcha vazifalar to'liq bajarildi!", "success", 5000);
      }
    } else {
      audioManager.playUncheck();
    }
  }, [dateKey, settings.confettiEnabled, addToast]);

  const addHabit = useCallback((habitData) => {
    const created = storage.addHabit(habitData);
    setHabits([...storage.getHabits()]);
    addToast("Odat qo'shildi! 🎯", created.title, "success");
    return created;
  }, [addToast]);

  const updateHabit = useCallback((id, habitData) => {
    const updated = storage.updateHabit(id, habitData);
    setHabits([...storage.getHabits()]);
    addToast("Odat yangilandi! ✍️", updated.title, "success");
    return updated;
  }, [addToast]);

  const deleteHabit = useCallback((id) => {
    const habit = storage.getHabitById(id);
    if (!habit) return false;
    const ok = storage.deleteHabit(id);
    if (ok) {
      setHabits([...storage.getHabits()]);
      setHistory({ ...storage.getHistory() });
      addToast("Odat o'chirildi", habit.title, "info");
    }
    return ok;
  }, [addToast]);

  const updateSettings = useCallback((updates) => {
    const saved = storage.saveSettings(updates);
    setSettings({ ...saved });
    return saved;
  }, []);

  return (
    <HabitsContext.Provider value={{
      currentDate,
      setCurrentDate,
      dateKey,
      isToday,
      shiftDate,
      jumpToday,
      habits,
      history,
      toggleHabit,
      addHabit,
      updateHabit,
      deleteHabit,
      settings,
      updateSettings,
      bannerNotif,
      triggerBanner,
      dismissBanner,
      toasts,
      addToast,
      removeToast
    }}>
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits() {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error('useHabits must be used within HabitsProvider');
  return ctx;
}
