/**
 * Intizomly — Notifications & Reminders Engine
 * Handles custom daily reminders (e.g. "Bugun shakar iste'mol qildingizmi?"),
 * Web Notifications API, Service Worker Mobile Push with vibration, audio chimes,
 * in-app banners, and exact-time background scheduler.
 */

class NotificationManager {
  constructor() {
    this.storage = window.appStorage;
    this.sound = window.soundSystem;
    this.tickerInterval = null;
    this.unreadCount = 2; // initial badge
    this.triggeredThisMinute = new Set();
    this.swRegistration = null;

    this.registerServiceWorker();
    this.initDOM();
    this.checkBrowserPermissionStatus();
    this.startScheduler();
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => {
          this.swRegistration = reg;
          console.log('Intizomly Service Worker faollashtirildi:', reg.scope);
        })
        .catch(err => {
          console.log('Service Worker xatosi (lokal muhitda xavfsiz):', err);
        });
    }
  }

  initDOM() {
    // Elements
    this.bellBtn = document.getElementById('notif-bell-btn');
    this.badgeCount = document.getElementById('notif-badge-count');
    this.modal = document.getElementById('notifications-modal');
    this.closeBtn = document.getElementById('close-notifications-btn');
    this.listContainer = document.getElementById('notifications-list-container');
    this.requestPermBtn = document.getElementById('request-perm-btn');
    this.permStatusText = document.getElementById('perm-status-text');
    this.testMobilePushBtn = document.getElementById('btn-test-mobile-push');

    // Add Notif Modal
    this.addNotifBtn = document.getElementById('btn-add-custom-notif');
    this.addNotifModal = document.getElementById('add-notif-modal');
    this.closeAddNotifBtn = document.getElementById('close-add-notif-btn');
    this.cancelNotifBtn = document.getElementById('cancel-notif-btn');
    this.addNotifForm = document.getElementById('add-notif-form');

    // Footer link
    const footerLink = document.getElementById('footer-notifications-link');
    if (footerLink) {
      footerLink.addEventListener('click', () => this.openDrawer());
    }

    // Event Listeners
    if (this.bellBtn) {
      this.bellBtn.addEventListener('click', () => this.openDrawer());
    }
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.closeDrawer());
    }
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.closeDrawer();
      });
    }

    if (this.requestPermBtn) {
      this.requestPermBtn.addEventListener('click', () => this.requestBrowserPermission());
    }

    if (this.testMobilePushBtn) {
      this.testMobilePushBtn.addEventListener('click', () => {
        this.triggerNotification(
          "📱 Telefon Eslatmasi (Sinov)",
          "Bugun shakar iste'mol qildingizmi? Har kuni aynan soat 20:00 da shu xabar keladi! 🚫🍬",
          "Sog'liq",
          true
        );
      });
    }

    // Add Custom Notification
    if (this.addNotifBtn) {
      this.addNotifBtn.addEventListener('click', () => this.openAddModal());
    }
    if (this.closeAddNotifBtn) {
      this.closeAddNotifBtn.addEventListener('click', () => this.closeAddModal());
    }
    if (this.cancelNotifBtn) {
      this.cancelNotifBtn.addEventListener('click', () => this.closeAddModal());
    }
    if (this.addNotifModal) {
      this.addNotifModal.addEventListener('click', (e) => {
        if (e.target === this.addNotifModal) this.closeAddModal();
      });
    }

    if (this.addNotifForm) {
      this.addNotifForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCreateNotification();
      });
    }
  }

  openDrawer() {
    this.renderNotificationsList();
    this.modal.classList.remove('hidden');
    this.unreadCount = 0;
    this.updateBadge();
  }

  closeDrawer() {
    this.modal.classList.add('hidden');
  }

  openAddModal() {
    this.addNotifForm.reset();
    document.getElementById('notif-time-input').value = '20:00';
    this.addNotifModal.classList.remove('hidden');
    document.getElementById('notif-title-input').focus();
  }

  closeAddModal() {
    this.addNotifModal.classList.add('hidden');
  }

  updateBadge() {
    if (this.unreadCount > 0) {
      this.badgeCount.textContent = this.unreadCount;
      this.badgeCount.classList.remove('hidden');
    } else {
      this.badgeCount.classList.add('hidden');
    }
  }

  checkBrowserPermissionStatus() {
    if (!('Notification' in window)) {
      if (this.permStatusText) {
        this.permStatusText.textContent = "Ushbu qurilma bildirishnomalarni to'liq qo'llab-quvvatlamaydi";
      }
      if (this.requestPermBtn) this.requestPermBtn.style.display = 'none';
      return;
    }

    if (Notification.permission === 'granted') {
      if (this.permStatusText) {
        this.permStatusText.textContent = "✅ Bildirishnomalar faol: Telefon va brauzeringizga aynan belgilangan soatda xabarlar yuboriladi";
      }
      if (this.requestPermBtn) {
        this.requestPermBtn.textContent = "Ruxsat berilgan ✓";
        this.requestPermBtn.disabled = true;
        this.requestPermBtn.classList.add('btn-success');
      }
    } else if (Notification.permission === 'denied') {
      if (this.permStatusText) {
        this.permStatusText.textContent = "⚠️ Bildirishnomalar bloklangan. Brauzer yoki telefon sozlamalaridan ruxsat bering.";
      }
      if (this.requestPermBtn) {
        this.requestPermBtn.textContent = "Bloklangan";
        this.requestPermBtn.disabled = true;
      }
    }
  }

  async requestBrowserPermission() {
    if (!('Notification' in window)) return;
    try {
      const permission = await Notification.requestPermission();
      this.checkBrowserPermissionStatus();
      if (permission === 'granted') {
        window.appToast.show("Bildirishnomalar yoqildi! 🎉", "Har kuni belgilangan soatda telefoningizga eslatma boradi", "success");
        this.sound.playNotification();
        if ('vibrate' in navigator) navigator.vibrate([150, 80, 150]);
      }
    } catch (e) {
      console.error('Permission request error:', e);
    }
  }

  handleCreateNotification() {
    const title = document.getElementById('notif-title-input').value;
    const message = document.getElementById('notif-message-input').value;
    const time = document.getElementById('notif-time-input').value;
    const category = document.getElementById('notif-category-select').value;

    if (!title || !message) return;

    this.storage.addNotification({
      title,
      message,
      time,
      category,
      enabled: true
    });

    this.closeAddModal();
    this.renderNotificationsList();
    this.sound.playCheck();
    window.appToast.show("Yangi eslatma saqlandi!", `"${title}" har kuni aynan soat ${time} da yuboriladi`, "success");
  }

  renderNotificationsList() {
    const notifs = this.storage.getNotifications();
    if (!this.listContainer) return;

    if (notifs.length === 0) {
      this.listContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem 1rem; color: var(--text-secondary);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔔</div>
          <p>Hozircha faol eslatmalar yo'q. Yangi eslatma qo'shing!</p>
        </div>
      `;
      return;
    }

    this.listContainer.innerHTML = notifs.map(n => {
      const catIcons = {
        "Sog'liq": "🍏",
        "O'qish": "📖",
        "Sport": "🏃‍♂️",
        "Tartib": "⏰",
        "Kundalik": "🎯"
      };
      const icon = catIcons[n.category] || "🔔";

      return `
        <div class="notification-item-card" data-id="${n.id}">
          <div class="notif-item-left">
            <div class="notif-item-icon">${icon}</div>
            <div class="notif-item-details">
              <span class="notif-item-title">${this.escapeHTML(n.title)}</span>
              <span class="notif-item-message">${this.escapeHTML(n.message)}</span>
              <div class="notif-meta-tags">
                <span class="notif-time-badge">🕒 Har kuni ${n.time} da</span>
                <span class="notif-cat-badge">${n.category}</span>
              </div>
            </div>
          </div>
          <div class="notif-item-actions">
            <button class="btn-test-notif" data-test-id="${n.id}" title="Hozir sinab ko'rish">
              Sinash ⚡
            </button>
            <label class="switch-control" title="Eslatmani yoqish / o'chirish">
              <input type="checkbox" class="notif-toggle-input" data-toggle-id="${n.id}" ${n.enabled ? 'checked' : ''}>
              <span class="switch-slider"></span>
            </label>
            <button class="action-icon-btn delete-btn" data-delete-id="${n.id}" title="O'chirish">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach listeners
    this.listContainer.querySelectorAll('.notif-toggle-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-toggle-id');
        const state = this.storage.toggleNotification(id);
        window.appToast.show("Eslatma yangilandi", state ? "Eslatma faollashtirildi" : "Eslatma o'chirildi", "info");
      });
    });

    this.listContainer.querySelectorAll('.btn-test-notif').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-test-id');
        const notif = this.storage.getNotifications().find(item => item.id === id);
        if (notif) {
          this.triggerNotification(notif.title, notif.message, notif.category, true);
        }
      });
    });

    this.listContainer.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-delete-id');
        this.storage.deleteNotification(id);
        this.renderNotificationsList();
        window.appToast.show("Eslatma o'chirildi", "", "info");
      });
    });
  }

  escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  /**
   * Triggers audio chime, vibration, system mobile notification, and in-app toast
   */
  triggerNotification(title, message, category = "Eslatma", isTest = false) {
    // 1. Play sound chime
    this.sound.playNotification();

    // 2. Vibration on phone
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200, 100, 200]);
      } catch (err) {}
    }

    // 3. Increment bell badge
    this.unreadCount++;
    this.updateBadge();

    // 4. Native mobile / system notification via Service Worker or Desktop Notification
    const settings = this.storage.getSettings();
    if (settings.browserNotifEnabled && 'Notification' in window && Notification.permission === 'granted') {
      try {
        if (this.swRegistration && 'showNotification' in this.swRegistration) {
          this.swRegistration.showNotification(`Intizomly: ${title}`, {
            body: message,
            icon: 'assets/icon-192.png',
            badge: 'assets/icon-192.png',
            vibrate: [200, 100, 200, 100, 200],
            tag: 'intizomly-reminder-' + Date.now(),
            renotify: true
          });
        } else {
          const n = new Notification(`Intizomly: ${title}`, {
            body: message,
            tag: 'intizomly-reminder-' + Date.now()
          });
          n.onclick = () => {
            window.focus();
            n.close();
          };
        }
      } catch (err) {
        console.warn('Native notification failed:', err);
      }
    }

    // 5. In-app banner popup
    window.appToast.show(
      isTest ? `[TEST] ${title}` : title,
      message,
      "reminder",
      8000
    );
  }

  /**
   * Background minute ticker that checks if any reminder is scheduled for current HH:MM
   */
  startScheduler() {
    this.tickerInterval = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `${currentHours}:${currentMinutes}`;

      const notifs = this.storage.getNotifications();
      notifs.forEach(n => {
        if (n.enabled && n.time === timeStr) {
          const key = `${n.id}_${timeStr}_${now.toDateString()}`;
          if (!this.triggeredThisMinute.has(key)) {
            this.triggeredThisMinute.add(key);
            this.triggerNotification(n.title, n.message, n.category, false);
          }
        }
      });

      if (this.triggeredThisMinute.size > 50) {
        this.triggeredThisMinute.clear();
      }
    }, 15000);
  }
}

window.notificationSystem = new NotificationManager();
