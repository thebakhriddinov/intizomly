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
   * Supports both ServiceWorker showNotification (for phones / Android / PWA) and direct Notification
   */
  async sendNativeNotification(title, body, extra = {}) {
    if (typeof window === 'undefined') return;

    // 1. Play authentic Apple iPhone "Ding" text chime
    try {
      audioManager.playNotification();
    } catch (_) { }

    // 2. Hardware vibration on phone
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }
    } catch (_) { }

    // 3. Dispatch native OS/mobile notification
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      const options = {
        body: body || '',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: 'intizomly-reminder-' + Date.now(),
        renotify: true,
        vibrate: [200, 100, 200, 100, 200],
        silent: false,
        requireInteraction: false,
        data: {
          url: extra.url || '/?tab=reminders',
          date: Date.now()
        }
      };

      // Priority 1: ServiceWorker (Required for phones / Android Chrome / Mobile PWA)
      if ('serviceWorker' in navigator) {
        try {
          const regPromise = navigator.serviceWorker.ready;
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('SW timeout')), 1200));
          const reg = await Promise.race([regPromise, timeoutPromise]);
          if (reg && reg.showNotification) {
            await reg.showNotification(title, options);
            return;
          }
        } catch (swErr) {
          try {
            const reg = await navigator.serviceWorker.getRegistration();
            if (reg && reg.showNotification) {
              await reg.showNotification(title, options);
              return;
            }
          } catch (_) { }
        }
      }

      // Priority 2: Standard desktop browser constructor
      try {
        const notif = new Notification(title, options);
        notif.onclick = () => {
          try {
            window.focus();
            notif.close();
          } catch (_) { }
        };
      } catch (err) {
        console.warn('Native notification dispatch failed:', err);
      }
    }
  }

  /**
   * Alias for sendNativeNotification
   */
  async showNotification(title, options = {}) {
    const body = typeof options === 'string' ? options : (options.body || '');
    return this.sendNativeNotification(title, body, options);
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
      if (res === 'granted') {
        // Send instant test notification on phone
        setTimeout(() => {
          this.sendNativeNotification(
            "🔔 Bildirishnomalar faollashtirildi!",
            "Intizomly: Telefoningizga eslatmalar va iPhone 'Ding' tovushi keladi."
          );
        }, 200);
      }
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
   * Manually test a reminder or trigger immediate test notification on phone
   */
  async testReminder(rem) {
    const reminderItem = rem || {
      title: "Kundalik intizom eslatmasi",
      time: this.getCurrentTimeStr(),
      category: "Intizom"
    };

    // 1. Send native phone notification + play iPhone ding + vibrate
    await this.sendNativeNotification(
      `🔔 ${reminderItem.time} — ${reminderItem.title}`,
      `Intizomly: ${reminderItem.category} vaqti bo'ldi! Qat'iyat va intizomni saqlang.`
    );

    // 2. Broadcast to UI
    const payload = {
      title: `🔔 Sinov: ${reminderItem.time} — ${reminderItem.title}`,
      message: `Haqiqiy bildirishnoma va iPhone "Ding" ovozi muvaffaqiyatli yuborildi!`,
      reminder: reminderItem
    };

    this.callbacks.forEach((cb) => {
      try {
        cb(payload);
      } catch (_) { }
    });

    return payload;
  }
}

export const reminderService = new ReminderService();
