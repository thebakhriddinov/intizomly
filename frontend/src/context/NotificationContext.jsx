import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { adminService } from '../services/adminService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { storage } from '../utils/storage';
import { audioManager } from '../utils/audio';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [announcements, setAnnouncements] = useState([]);
  const [readIds, setReadIds] = useState(() => storage.getReadAnnouncementIds());
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [browserPermission, setBrowserPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const knownIdsRef = useRef(new Set());
  const isInitialLoadRef = useRef(true);

  // 1. Load announcements
  const loadAnnouncements = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const list = await adminService.getAnnouncements();
      const currentRead = storage.getReadAnnouncementIds();
      setReadIds(currentRead);

      // Check for incoming new announcements to trigger SMS notification chime
      if (!isInitialLoadRef.current && list.length > 0) {
        const incoming = list.filter(a => a.id && !knownIdsRef.current.has(a.id));
        if (incoming.length > 0) {
          const newest = incoming[0];
          // SMS notification sound
          audioManager.playNotification();

          // Native browser notification if granted
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(`Intizomly: ${newest.title}`, {
                body: newest.message,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: `intizomly-${newest.id}`
              });
            } catch (e) {
              console.warn('[Notification] Browser notification error:', e);
            }
          }
        }
      }

      // Update known IDs
      list.forEach(a => {
        if (a.id) knownIdsRef.current.add(a.id);
      });

      setAnnouncements(list);
    } catch (err) {
      console.warn('[NotificationContext] Failed to load announcements:', err);
    } finally {
      if (!isBackground) setLoading(false);
      isInitialLoadRef.current = false;
    }
  }, []);

  // 2. Initial mount and realtime listener
  useEffect(() => {
    loadAnnouncements();

    // Event listeners for same-window / local broadcasts
    const handleNewBroadcast = (e) => {
      const newAnn = e.detail;
      if (newAnn) {
        setAnnouncements(prev => {
          const exists = prev.some(a => a.id === newAnn.id);
          if (exists) return prev;
          return [newAnn, ...prev];
        });
        if (newAnn.id) knownIdsRef.current.add(newAnn.id);
      }
    };

    const handleDeletedBroadcast = (e) => {
      const { id } = e.detail || {};
      if (id) {
        setAnnouncements(prev => prev.filter(a => a.id !== id));
      }
    };

    window.addEventListener('intizomly:new_broadcast', handleNewBroadcast);
    window.addEventListener('intizomly:broadcast_deleted', handleDeletedBroadcast);

    // Supabase Real-time Channel
    let channel = null;
    if (isSupabaseConfigured && supabase) {
      try {
        channel = supabase
          .channel('public:broadcasts_channel')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'broadcasts' },
            () => {
              loadAnnouncements(true);
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('[NotificationContext] Realtime subscription error:', err);
      }
    }

    // 25-second fallback poll
    const pollTimer = setInterval(() => {
      loadAnnouncements(true);
    }, 25000);

    return () => {
      window.removeEventListener('intizomly:new_broadcast', handleNewBroadcast);
      window.removeEventListener('intizomly:broadcast_deleted', handleDeletedBroadcast);
      clearInterval(pollTimer);
      if (channel && supabase) {
        supabase.removeChannel(channel).catch(() => {});
      }
    };
  }, [loadAnnouncements]);

  // 3. Mark single announcement as read
  const markAsRead = useCallback((id) => {
    if (!id) return;
    const updated = storage.markAnnouncementAsRead(id);
    setReadIds([...updated]);
  }, []);

  // 4. Mark all as read
  const markAllAsRead = useCallback(() => {
    const allIds = announcements.map(a => a.id).filter(Boolean);
    const updated = storage.markAllAnnouncementsAsRead(allIds);
    setReadIds([...updated]);
  }, [announcements]);

  // 5. Delete announcement (Admin)
  const deleteAnnouncement = useCallback(async (id) => {
    if (!id) return false;
    await adminService.deleteAnnouncement(id);
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    return true;
  }, []);

  // 6. Request native browser notification permission
  const requestBrowserPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    try {
      const perm = await Notification.requestPermission();
      setBrowserPermission(perm);
      return perm;
    } catch {
      return 'denied';
    }
  }, []);

  // Unread calculation
  const unreadCount = announcements.filter(a => !readIds.includes(a.id)).length;
  const unreadAnnouncements = announcements.filter(a => !readIds.includes(a.id));

  const openNotifications = useCallback(() => setIsNotificationOpen(true), []);
  const closeNotifications = useCallback(() => setIsNotificationOpen(false), []);
  const toggleNotifications = useCallback(() => setIsNotificationOpen(prev => !prev), []);

  const value = {
    announcements,
    unreadCount,
    unreadAnnouncements,
    readIds,
    loading,
    isNotificationOpen,
    openNotifications,
    closeNotifications,
    toggleNotifications,
    markAsRead,
    markAllAsRead,
    deleteAnnouncement,
    refreshAnnouncements: loadAnnouncements,
    browserPermission,
    requestBrowserPermission
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return ctx;
}

