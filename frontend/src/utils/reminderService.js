import { storage } from './storage';
import { audioManager } from './audio';

/**
 * Intizomly — Background Real-Time Reminder Engine
 * Runs continuously in the browser, watches active reminders, plays chimes,
 * and displays in-app banner & OS-level notifications at scheduled minutes.
 */

class ReminderService {
  constructor() {
    this.intervalId = null;
    this.firedMinutes = new Set();
    this.callbacks = new Set();
    this.isRunning = false;
  }

  /**
   * Start the real-time reminder watcher (runs every 10s)
   */
  start(onTriggerCallback) {
    if (onTriggerCallback) {
      this.callbacks.add(onTriggerCallback);
    }

    if (this.isRunning) return;
    this.isRunning = true;

    // Check immediately on startup
    this.checkReminders();

    // Check every 10 seconds
    this.intervalId = setInterval(() => {
      this.checkReminders();
    }, 10000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  subscribe(callback) {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  /**
   * Get formatted local HH:MM
   */
  getCurrentTimeStr() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Check all active reminders against current local time
   */
  checkReminders() {
    try {
      const now = new Date();
      const timeStr = this.getCurrentTimeStr();
      const dateKey = now.toISOString().split('T')[0];

      const reminders = storage.getReminders();
      if (!Array.isArray(reminders) || reminders.length === 0) return;

      reminders.forEach((rem) => {
        if (!rem || rem.enabled === false) return;

        // Check if reminder matches current minute
        if (rem.time === timeStr) {
          const fireKey = `${rem.id}_${dateKey}_${timeStr}`;

          // Avoid duplicate triggers in the exact same minute
          if (this.firedMinutes.has(fireKey)) return;
          this.firedMinutes.add(fireKey);

          // Clean up old memory (keep max 100 recent keys)
          if (this.firedMinutes.size > 100) {
            const arr = Array.from(this.firedMinutes);
            this.firedMinutes = new Set(arr.slice(50));
          }

          // 1. Play authentic Apple Tri-tone chime
          audioManager.playNotification();

          // 2. Trigger native OS / browser notification if permitted
          this.sendNativeNotification(rem.title, `Intizomly: ${rem.category} vaqti keldi! (${rem.time})`);

          // 3. Notify app components (Dynamic Island Banner & UI)
          const payload = {
            title: `⏰ ${rem.time} — ${rem.title}`,
            message: `Bugungi ${rem.category} vazifangizni unutmang! Intizom — yutuq kaliti. 🔔`,
            reminder: rem
          };

          this.callbacks.forEach((cb) => {
            try {
              cb(payload);
            } catch (err) {
              console.error('Reminder callback error:', err);
            }
          });
        }
      });
    } catch (e) {
      console.warn('Reminder check error:', e);
    }
  }

  /**
   * Send OS-level push notification if browser supports and allows it
   */
  sendNativeNotification(title, body) {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'intizomly-reminder-' + Date.now(),
          renotify: true
        });
      } catch (err) {
        console.warn('Native notification dispatch failed:', err);
      }
    }
  }

  /**
   * Request permission for OS-level notifications
   */
  async requestPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }

    try {
      const res = await Notification.requestPermission();
      return res;
    } catch (err) {
      console.warn('Permission request error:', err);
      return 'denied';
    }
  }

  getPermissionStatus() {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  /**
   * Manually test a reminder right now
   */
  testReminder(rem) {
    if (!rem) return;

    // 1. Play sound
    audioManager.playNotification();

    // 2. Send native notification
    this.sendNativeNotification(
      `⏰ ${rem.time} — ${rem.title}`,
      `Sinov eslatmasi: ${rem.category} vazifasi. Tovush va bildirishnoma to'g'ri ishlamoqda!`
    );

    // 3. Broadcast to UI
    const payload = {
      title: `🔔 Sinov: ${rem.time} — ${rem.title}`,
      message: `Sinov eslatmasi muvaffaqiyatli chalindi! Tovush va bildirishnoma faol.`,
      reminder: rem
    };

    this.callbacks.forEach((cb) => {
      try {
        cb(payload);
      } catch (_) {}
    });

    return payload;
  }
}

export const reminderService = new ReminderService();
