import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { audioManager } from '../utils/audio';
import { fireCelebrationConfetti } from '../utils/confetti';
import { useAuth } from './AuthContext';
import { supabaseService } from '../services/supabaseService';
import { reminderService } from '../utils/reminderService';

const HabitsContext = createContext(null);

export function HabitsProvider({ children }) {
  const { currentUser } = useAuth();

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [habits, setHabits] = useState(() => storage.getHabits());
  const [history, setHistory] = useState(() => storage.getHistory());
  const [settings, setSettings] = useState(() => storage.getSettings());
  const [loading, setLoading] = useState(false);
  const [bannerNotif, setBannerNotif] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Keep storage in sync with active habits and history for stats and streak engines
  useEffect(() => {
    storage.habits = habits;
    storage.history = history;
  }, [habits, history]);

  // Sync data whenever currentUser changes (Supabase Cloud vs Local Demo)
  useEffect(() => {
    let isMounted = true;

    async function loadUserData() {
      if (!currentUser?.isSupabaseUser) {
        // Local Demo or Guest user
        setHabits([...storage.getHabits()]);
        setHistory({ ...storage.getHistory() });
        setSettings({ ...storage.getSettings() });
        return;
      }

      setLoading(true);
      try {
        const [cloudHabits, cloudCompletions, cloudSettings] = await Promise.all([
          supabaseService.getHabits(currentUser.id),
          supabaseService.getCompletions(currentUser.id),
          supabaseService.getSettings(currentUser.id)
        ]);

        if (!isMounted) return;

        // If user has habits in cloud, use them
        if (cloudHabits && cloudHabits.length > 0) {
          setHabits(cloudHabits);
          storage.habits = cloudHabits;
        } else {
          // If fresh user with no habits, auto-seed starter habits into Supabase
          try {
            const initialHabits = [
              { title: "Shakar iste'mol qilmaslik", emoji: '🚫🍬', description: "Kun davomida qo'shimcha shakar va shirinliklardan butunlay voz kechish", category: "Sog'liq", target: "Kun bo'yi toza" },
              { title: "Kitob o'qish (20 bet)", emoji: '📖', description: "Shaxsiy rivojlanish yoki badiiy adabiyotdan kamida 20 bet mutolaa qilish", category: "O'qish", target: "20 bet" },
              { title: "Kamida 2 litr toza suv ichish", emoji: '💧', description: "Har 1.5 - 2 soatda 1 stakan toza suv ichib, ichki organizmni tetik saqlash", category: "Sog'liq", target: "2 litr" },
              { title: "30 daqiqa jismoniy mashq", emoji: '🏃‍♂️', description: "Ertalabki yugurish yoki gimnastika mashqlari", category: "Sport", target: "30 daqiqa" },
              { title: "Ertalab 06:30 da uyg'onish", emoji: '⏰', description: "Kunning barakali qismini qo'ldan boy bermaslik", category: "Tartib", target: "06:30 da" }
            ];

            const createdList = [];
            for (const h of initialHabits) {
              const created = await supabaseService.createHabit(currentUser.id, h);
              createdList.push(created);
            }
            if (isMounted) {
              setHabits(createdList);
              storage.habits = createdList;
            }
          } catch (seedErr) {
            console.warn('[Habits] Seed starter habits warning:', seedErr);
            setHabits([]);
          }
        }

        if (cloudCompletions) {
          setHistory(cloudCompletions);
          storage.history = cloudCompletions;
        }

        if (cloudSettings) {
          setSettings(cloudSettings);
        }
      } catch (err) {
        console.error('[Habits] Failed to load data from Supabase:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.id, currentUser?.isSupabaseUser]);

  // Sync settings with audio manager and HTML document appearance/theme
  useEffect(() => {
    audioManager.setEnabled(settings.soundEnabled !== false);
    document.body.setAttribute('data-theme', settings.theme || 'emerald');

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

  // Real-time background reminder runner
  useEffect(() => {
    reminderService.start(({ title, message }) => {
      triggerBanner(title, message);
    });

    return () => {
      reminderService.stop();
    };
  }, [triggerBanner]);

  // ==================== HABITS CRUD & TOGGLE ====================

  const toggleHabit = useCallback(async (habitId) => {
    // 1. O(1) Aniq joriy holatni aniqlaymiz
    const isCurrentlyDone = !!(storage.history?.[dateKey]?.[habitId]);
    const newState = !isCurrentlyDone;

    // 2. Storage va React State ni sinxron yangilaymiz
    const updatedHistory = { ...storage.history };
    if (!updatedHistory[dateKey]) {
      updatedHistory[dateKey] = {};
    } else {
      updatedHistory[dateKey] = { ...updatedHistory[dateKey] };
    }

    if (newState) {
      updatedHistory[dateKey][habitId] = true;
    } else {
      delete updatedHistory[dateKey][habitId];
    }

    storage.history = updatedHistory;
    storage.save(STORAGE_KEYS.HISTORY, updatedHistory);
    setHistory(updatedHistory);

    // 3. Foydalanuvchiga aniq feedback (bajarildi yoki bekor qilindi)
    if (newState) {
      addToast("Bajarildi! 🎉", "Ajoyib intizom!", "success", 2000);

      const afterStats = storage.getDayStats(dateKey);
      if (afterStats.total > 0 && afterStats.completed === afterStats.total) {
        if (settings.confettiEnabled !== false) {
          fireCelebrationConfetti();
        }
        audioManager.playCelebration();
        addToast("Tabriklaymiz! 🌟", "Bugungi barcha vazifalar to'liq bajarildi!", "success", 5000);
      }
    } else {
      addToast("Bekor qilindi", "Vazifa bajarilmagan holatga qaytarildi", "info", 2000);
    }

    // 4. Agar Supabase ulangan bo'lsa, server bilan sinxronlash
    if (currentUser?.isSupabaseUser) {
      try {
        await supabaseService.toggleCompletion(currentUser.id, habitId, dateKey, isCurrentlyDone);
      } catch (err) {
        console.error('[Habits] Toggle error on Supabase:', err);
        // Rollback
        const rollbackHistory = { ...storage.history };
        if (isCurrentlyDone) {
          if (!rollbackHistory[dateKey]) rollbackHistory[dateKey] = {};
          rollbackHistory[dateKey][habitId] = true;
        } else if (rollbackHistory[dateKey]) {
          delete rollbackHistory[dateKey][habitId];
        }
        storage.history = rollbackHistory;
        storage.save(STORAGE_KEYS.HISTORY, rollbackHistory);
        setHistory(rollbackHistory);
        addToast("Xatolik", "Server bilan sinxronlashda xatolik yuz berdi", "warning");
      }
    }
  }, [dateKey, settings.confettiEnabled, addToast, currentUser]);

  const addHabit = useCallback(async (habitData) => {
    if (currentUser?.isSupabaseUser) {
      try {
        const created = await supabaseService.createHabit(currentUser.id, habitData);
        setHabits(prev => [...prev, created]);
        storage.habits = [...storage.habits, created];
        addToast("Odat qo'shildi! 🎯", created.title, "success");
        return created;
      } catch (err) {
        console.error('[Habits] Failed to create habit in Supabase:', err);
        addToast("Xatolik", err.message || "Odatni qo'shib bo'lmadi", "warning");
        throw err;
      }
    }

    const created = storage.addHabit(habitData);
    setHabits([...storage.getHabits()]);
    addToast("Odat qo'shildi! 🎯", created.title, "success");
    return created;
  }, [currentUser, addToast]);

  const updateHabit = useCallback(async (id, habitData) => {
    if (currentUser?.isSupabaseUser) {
      try {
        const updated = await supabaseService.updateHabit(id, habitData);
        setHabits(prev => prev.map(h => (h.id === id ? updated : h)));
        storage.habits = storage.habits.map(h => (h.id === id ? updated : h));
        addToast("Odat yangilandi! ✍️", updated.title, "success");
        return updated;
      } catch (err) {
        console.error('[Habits] Failed to update habit in Supabase:', err);
        addToast("Xatolik", err.message || "Odatni yangilab bo'lmadi", "warning");
        throw err;
      }
    }

    const updated = storage.updateHabit(id, habitData);
    setHabits([...storage.getHabits()]);
    addToast("Odat yangilandi! ✍️", updated.title, "success");
    return updated;
  }, [currentUser, addToast]);

  const deleteHabit = useCallback(async (id) => {
    const habit = storage.habits.find(h => h.id === id) || storage.getHabitById(id);
    if (!habit) return false;

    if (currentUser?.isSupabaseUser) {
      try {
        await supabaseService.deleteHabit(id);
        setHabits(prev => prev.filter(h => h.id !== id));
        storage.habits = storage.habits.filter(h => h.id !== id);

        // Clean up history
        setHistory(prev => {
          const updatedHistory = { ...prev };
          Object.keys(updatedHistory).forEach(dKey => {
            if (updatedHistory[dKey][id]) {
              const copy = { ...updatedHistory[dKey] };
              delete copy[id];
              updatedHistory[dKey] = copy;
            }
          });
          storage.history = updatedHistory;
          return updatedHistory;
        });

        addToast("Odat o'chirildi", habit.title, "info");
        return true;
      } catch (err) {
        console.error('[Habits] Failed to delete habit in Supabase:', err);
        addToast("Xatolik", err.message || "Odatni o'chirib bo'lmadi", "warning");
        return false;
      }
    }

    const ok = storage.deleteHabit(id);
    if (ok) {
      setHabits([...storage.getHabits()]);
      setHistory({ ...storage.getHistory() });
      addToast("Odat o'chirildi", habit.title, "info");
    }
    return ok;
  }, [currentUser, addToast]);

  const updateSettings = useCallback(async (updates) => {
    setSettings(prev => {
      const merged = { ...prev, ...updates };
      storage.saveSettings(updates);
      return merged;
    });

    if (currentUser?.isSupabaseUser) {
      try {
        await supabaseService.updateSettings(currentUser.id, updates);
      } catch (err) {
        console.warn('[Habits] Save settings to Supabase warning:', err);
      }
    }
  }, [currentUser]);

  const contextValue = useMemo(() => ({
    currentDate,
    setCurrentDate,
    dateKey,
    isToday,
    shiftDate,
    jumpToday,
    habits,
    history,
    loading,
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
  }), [
    currentDate,
    dateKey,
    isToday,
    shiftDate,
    jumpToday,
    habits,
    history,
    loading,
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
  ]);

  return (
    <HabitsContext.Provider value={contextValue}>
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits() {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error('useHabits must be used within HabitsProvider');
  return ctx;
}
