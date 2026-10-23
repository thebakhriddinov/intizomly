/**
 * Intizomly — Main Application Controller
 * Handles Multi-User Authentication (Oddiy, Premium, Admin),
 * Admin Dashboard & User Management, Theme Permissions,
 * Habit tracking, streaks, and mobile notifications.
 */

// Global Toast & iPhone Dynamic Island Notification System
class ToastManager {
  constructor(containerId = 'toast-container', iosContainerId = 'ios-notification-container') {
    this.container = document.getElementById(containerId);
    this.iosContainer = document.getElementById(iosContainerId);
  }

  show(title, message, type = 'info', duration = 4000) {
    // If it's a reminder or important alert, display as authentic Apple iPhone SMS/Push Banner!
    if (type === 'reminder') {
      this.showIOSBanner(title, message, 7000);
      return;
    }

    if (!this.container) return;

    const icons = {
      success: '🎉',
      info: '💡',
      warning: '⚠️',
      reminder: '🔔'
    };

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || '✨'}</div>
      <div class="toast-content">
        <span class="toast-title">${title}</span>
        ${message ? `<span class="toast-message">${message}</span>` : ''}
      </div>
      <button class="toast-close-btn" aria-label="Yopish">&times;</button>
    `;

    const closeBtn = toast.querySelector('.toast-close-btn');
    closeBtn.addEventListener('click', () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 250);
    });

    this.container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 250);
      }
    }, duration);
  }

  /**
   * Spawns authentic Apple iPhone SMS/Push Notification banner from top of screen
   */
  showIOSBanner(title, message, duration = 6500) {
    if (!this.iosContainer) {
      this.iosContainer = document.getElementById('ios-notification-container');
    }
    if (!this.iosContainer) return;

    const banner = document.createElement('div');
    banner.className = 'ios-notif-banner';
    banner.innerHTML = `
      <div class="ios-notif-header">
        <div class="ios-app-brand">
          <div class="ios-app-icon-squircle">
            <svg viewBox="0 0 32 32" fill="none">
              <path d="M16 2C13.5 7.5 9 11.5 9 18C9 24.075 12.134 28 16 28C19.866 28 23 24.075 23 18C23 14 20.5 10 16 2Z" fill="#FFFFFF"/>
              <path d="M11 18.5L14.5 22L21 14.5" stroke="#10B981" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="ios-app-name">INTIZOMLY</span>
        </div>
        <span class="ios-notif-time">hozir</span>
      </div>
      <div class="ios-notif-body">
        <h4 class="ios-notif-title">${title}</h4>
        <p class="ios-notif-message">${message}</p>
      </div>
      <div class="ios-grab-bar"></div>
    `;

    // Click or swipe dismiss
    banner.addEventListener('click', () => {
      banner.classList.add('dismissing');
      setTimeout(() => banner.remove(), 280);
    });

    this.iosContainer.appendChild(banner);

    setTimeout(() => {
      if (banner.parentElement) {
        banner.classList.add('dismissing');
        setTimeout(() => banner.remove(), 280);
      }
    }, duration);
  }
}

window.appToast = new ToastManager();

// Main App Controller
class AppController {
  constructor() {
    this.storage = window.appStorage;
    this.sound = window.soundSystem;
    this.confetti = window.confettiSystem;

    this.currentDate = new Date();
    this.activeFilter = 'all';
    this.activeCategory = 'all';
    this.searchQuery = '';

    this.initDOM();
    this.checkAuthSession();
    this.applyTheme(this.storage.getSettings().theme || 'emerald');
    this.refreshAll();
  }

  // ==================== AUTH & SESSION ====================
  checkAuthSession() {
    const user = this.storage.getCurrentUser();
    if (!user) {
      this.openAuthModal();
    } else {
      this.closeAuthModal();
      this.syncUserUI();
    }
  }

  syncUserUI() {
    const user = this.storage.getCurrentUser();
    if (!user) return;

    // Header Role Badge
    const roleBadge = document.getElementById('nav-user-role-badge');
    const adminBtn = document.getElementById('admin-panel-nav-btn');

    if (roleBadge) {
      roleBadge.className = 'user-role-badge';
      if (user.role === 'admin') {
        roleBadge.classList.add('role-admin');
        roleBadge.textContent = '🛡️ ADMIN';
        if (adminBtn) adminBtn.classList.remove('hidden');
      } else if (user.role === 'premium') {
        roleBadge.classList.add('role-premium');
        roleBadge.textContent = '⚡ PRO';
        if (adminBtn) adminBtn.classList.add('hidden');
      } else {
        roleBadge.classList.add('role-user');
        roleBadge.textContent = '👤 ODDIY';
        if (adminBtn) adminBtn.classList.add('hidden');
      }
    }

    // Avatar initials & circle
    this.renderHeaderProfile();
    this.updateThemeLockBadges();
  }

  openAuthModal() {
    const authModal = document.getElementById('auth-modal');
    if (authModal) authModal.classList.remove('hidden');
  }

  closeAuthModal() {
    const authModal = document.getElementById('auth-modal');
    if (authModal) authModal.classList.add('hidden');
  }

  initDOM() {
    // --- Auth Modal Events ---
    this.initAuthListeners();

    // --- Admin Panel Events ---
    this.initAdminPanelListeners();

    // --- Top Date Navigation ---
    this.prevDayBtn = document.getElementById('prev-day-btn');
    this.nextDayBtn = document.getElementById('next-day-btn');
    this.jumpTodayBtn = document.getElementById('jump-today-btn');
    this.currentDateText = document.getElementById('current-date-text');
    this.todayIndicatorTag = document.getElementById('today-indicator-tag');

    this.prevDayBtn.addEventListener('click', () => this.shiftDate(-1));
    this.nextDayBtn.addEventListener('click', () => this.shiftDate(1));
    this.jumpTodayBtn.addEventListener('click', () => {
      this.currentDate = new Date();
      this.refreshAll();
    });

    const brandLogo = document.getElementById('brand-logo');
    if (brandLogo) {
      brandLogo.addEventListener('click', () => {
        this.currentDate = new Date();
        this.refreshAll();
      });
    }

    // --- Avatar Trigger & Profile Modal ---
    this.avatarTriggerBtn = document.getElementById('avatar-trigger-btn');
    this.profileModal = document.getElementById('profile-settings-modal');
    this.closeProfileModalBtn = document.getElementById('close-profile-modal-btn');
    this.footerProfileLink = document.getElementById('footer-profile-link');
    this.quickSwitchUserBtn = document.getElementById('btn-quick-switch-user');

    this.avatarTriggerBtn.addEventListener('click', () => this.openProfileModal('tab-profile'));
    if (this.footerProfileLink) {
      this.footerProfileLink.addEventListener('click', () => this.openProfileModal('tab-profile'));
    }
    if (this.quickSwitchUserBtn) {
      this.quickSwitchUserBtn.addEventListener('click', () => this.openAuthModal());
    }

    // Sidebar & Mobile Navigation Bindings
    const sideUserProfileBtn = document.getElementById('sidebar-user-profile-btn');
    if (sideUserProfileBtn) {
      sideUserProfileBtn.addEventListener('click', () => this.openProfileModal('tab-profile'));
    }
    const sideLogoutBtn = document.getElementById('sidebar-logout-btn');
    if (sideLogoutBtn) {
      sideLogoutBtn.addEventListener('click', () => this.openAuthModal());
    }
    const sideNotifsBtn = document.getElementById('side-nav-notifs');
    if (sideNotifsBtn) {
      sideNotifsBtn.addEventListener('click', () => {
        if (window.notificationSystem) window.notificationSystem.openModal();
      });
    }
    const sideAdminBtn = document.getElementById('side-admin-btn');
    if (sideAdminBtn) {
      sideAdminBtn.addEventListener('click', () => this.openAdminModal());
    }
    const mobileBrand = document.getElementById('mobile-brand-logo');
    if (mobileBrand) {
      mobileBrand.addEventListener('click', () => {
        this.currentDate = new Date();
        this.refreshAll();
      });
    }

    // Mobile Bottom Nav
    const mobHabits = document.getElementById('mob-nav-habits');
    if (mobHabits) {
      mobHabits.addEventListener('click', () => {
        document.querySelectorAll('.mob-nav-btn').forEach(b => b.classList.remove('active'));
        mobHabits.classList.add('active');
        const habitsSec = document.getElementById('habits-section');
        if (habitsSec) habitsSec.scrollIntoView({ behavior: 'smooth' });
      });
    }
    const mobHeatmap = document.getElementById('mob-nav-heatmap');
    if (mobHeatmap) {
      mobHeatmap.addEventListener('click', () => {
        document.querySelectorAll('.mob-nav-btn').forEach(b => b.classList.remove('active'));
        mobHeatmap.classList.add('active');
        const heatSec = document.getElementById('github-heatmap-card');
        if (heatSec) heatSec.scrollIntoView({ behavior: 'smooth' });
      });
    }
    const mobNotifs = document.getElementById('mob-nav-notifs');
    if (mobNotifs) {
      mobNotifs.addEventListener('click', () => {
        if (window.notificationSystem) window.notificationSystem.openModal();
      });
    }
    const mobProfile = document.getElementById('mob-nav-profile');
    if (mobProfile) {
      mobProfile.addEventListener('click', () => {
        this.openProfileModal('tab-profile');
      });
    }

    this.closeProfileModalBtn.addEventListener('click', () => this.closeProfileModal());
    this.profileModal.addEventListener('click', (e) => {
      if (e.target === this.profileModal) this.closeProfileModal();
    });

    // Profile & Settings Tabs
    this.tabProfileBtn = document.getElementById('tab-btn-profile');
    this.tabSettingsBtn = document.getElementById('tab-btn-settings');
    this.tabProfilePane = document.getElementById('tab-profile');
    this.tabSettingsPane = document.getElementById('tab-settings');

    this.tabProfileBtn.addEventListener('click', () => this.switchTab('tab-profile'));
    this.tabSettingsBtn.addEventListener('click', () => this.switchTab('tab-settings'));

    // Profile Form & Controls
    this.profileForm = document.getElementById('profile-form');
    this.btnTogglePassword = document.getElementById('btn-toggle-password');
    this.passwordInput = document.getElementById('prof-password-input');
    this.eyeIconShow = document.getElementById('eye-icon-show');
    this.eyeIconHide = document.getElementById('eye-icon-hide');
    this.btnChangeAvatarColor = document.getElementById('btn-change-avatar-color');
    this.btnProfileLogout = document.getElementById('btn-profile-logout');

    this.btnTogglePassword.addEventListener('click', () => this.togglePasswordVisibility());
    this.btnChangeAvatarColor.addEventListener('click', () => this.cycleAvatarColor());
    if (this.btnProfileLogout) {
      this.btnProfileLogout.addEventListener('click', () => {
        this.storage.logout();
        this.closeProfileModal();
        this.openAuthModal();
        window.appToast.show("Tizimdan chiqildi", "Qayta kirish uchun hisob tanlang", "info");
      });
    }

    this.profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveProfile();
    });

    // --- Habit Add & Edit Modal ---
    this.openAddHabitBtn = document.getElementById('open-add-habit-btn');
    this.emptyAddBtn = document.getElementById('empty-add-btn');
    this.habitModal = document.getElementById('habit-modal');
    this.closeHabitModalBtn = document.getElementById('close-habit-modal-btn');
    this.cancelHabitBtn = document.getElementById('cancel-habit-btn');
    this.habitForm = document.getElementById('habit-form');

    this.openAddHabitBtn.addEventListener('click', () => this.openHabitModal());
    if (this.emptyAddBtn) {
      this.emptyAddBtn.addEventListener('click', () => this.openHabitModal());
    }
    this.closeHabitModalBtn.addEventListener('click', () => this.closeHabitModal());
    this.cancelHabitBtn.addEventListener('click', () => this.closeHabitModal());
    this.habitModal.addEventListener('click', (e) => {
      if (e.target === this.habitModal) this.closeHabitModal();
    });

    this.habitForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveHabit();
    });

    // Emoji Picker
    this.selectedEmojiDisplay = document.getElementById('selected-emoji-display');
    this.emojiPickerDrawer = document.getElementById('emoji-picker-drawer');
    this.habitEmojiInput = document.getElementById('habit-emoji-input');

    this.selectedEmojiDisplay.addEventListener('click', () => {
      this.emojiPickerDrawer.classList.toggle('hidden');
    });

    document.querySelectorAll('.emoji-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const emoji = btn.getAttribute('data-emoji');
        this.habitEmojiInput.value = emoji;
        this.selectedEmojiDisplay.textContent = emoji;
        this.emojiPickerDrawer.classList.add('hidden');
      });
    });

    // Search Input
    this.searchInput = document.getElementById('habit-search-input');
    this.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.renderHabits();
    });

    // Filter Chips
    document.querySelectorAll('.filter-chip[data-filter]').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip[data-filter]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.activeFilter = chip.getAttribute('data-filter');
        this.renderHabits();
      });
    });

    // Category Chips
    document.querySelectorAll('.filter-chip.cat-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip.cat-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.activeCategory = chip.getAttribute('data-category');
        this.renderHabits();
      });
    });

    // Settings Listeners
    this.initSettingsListeners();
  }

  // ==================== AUTH LISTENERS ====================
  initAuthListeners() {
    const loginTabBtn = document.getElementById('auth-tab-login-btn');
    const registerTabBtn = document.getElementById('auth-tab-register-btn');
    const loginForm = document.getElementById('auth-login-form');
    const registerForm = document.getElementById('auth-register-form');

    if (loginTabBtn && registerTabBtn) {
      loginTabBtn.addEventListener('click', () => {
        loginTabBtn.classList.add('active');
        registerTabBtn.classList.remove('active');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
      });

      registerTabBtn.addEventListener('click', () => {
        registerTabBtn.classList.add('active');
        loginTabBtn.classList.remove('active');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
      });
    }

    // 1-Click Fast Demo Testing Accounts
    document.querySelectorAll('.demo-user-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const role = btn.getAttribute('data-demo-role');
        const user = this.storage.quickLoginRole(role);
        if (user) {
          this.closeAuthModal();
          this.syncUserUI();
          this.refreshAll();
          this.sound.playCheck();
          window.appToast.show(
            `Xush kelibsiz, ${user.firstName}!`,
            `Siz ${user.role.toUpperCase()} sifatida kirdingiz`,
            "success"
          );
        }
      });
    });

    // Login Form Submit
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email-input').value;
        const password = document.getElementById('login-password-input').value;
        const res = this.storage.login(email, password);
        if (res.success) {
          this.closeAuthModal();
          this.syncUserUI();
          this.refreshAll();
          this.sound.playCheck();
          window.appToast.show("Muvaffaqiyatli kirildi! 👋", `Salom, ${res.user.firstName}!`, "success");
        } else {
          this.sound.playUncheck();
          window.appToast.show("Xatolik", res.message, "warning");
        }
      });
    }

    // Register Form Submit
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const firstName = document.getElementById('reg-firstname-input').value;
        const lastName = document.getElementById('reg-lastname-input').value;
        const email = document.getElementById('reg-email-input').value;
        const password = document.getElementById('reg-password-input').value;

        const res = this.storage.register({ firstName, lastName, email, password });
        if (res.success) {
          this.closeAuthModal();
          this.syncUserUI();
          this.refreshAll();
          this.sound.playCheck();
          window.appToast.show("Akkaunt yaratildi! 🎉", "Xush kelibsiz!", "success");
        } else {
          this.sound.playUncheck();
          window.appToast.show("Xatolik", res.message, "warning");
        }
      });
    }
  }

  // ==================== ADMIN PANEL ====================
  initAdminPanelListeners() {
    const adminNavBtn = document.getElementById('admin-panel-nav-btn');
    const adminFooterLink = document.getElementById('footer-admin-link');
    const adminModal = document.getElementById('admin-panel-modal');
    const closeAdminBtn = document.getElementById('close-admin-panel-btn');
    const adminAddUserForm = document.getElementById('admin-add-user-form');
    const adminBroadcastForm = document.getElementById('admin-broadcast-form');

    const openAdmin = () => {
      const user = this.storage.getCurrentUser();
      if (!user || user.role !== 'admin') {
        window.appToast.show("Ruxsat yo'q", "Admin paneliga faqat admin kirishi mumkin!", "warning");
        return;
      }
      this.renderAdminData();
      adminModal.classList.remove('hidden');
    };

    if (adminNavBtn) adminNavBtn.addEventListener('click', openAdmin);
    if (adminFooterLink) adminFooterLink.addEventListener('click', openAdmin);
    if (closeAdminBtn) closeAdminBtn.addEventListener('click', () => adminModal.classList.add('hidden'));
    if (adminModal) {
      adminModal.addEventListener('click', (e) => {
        if (e.target === adminModal) adminModal.classList.add('hidden');
      });
    }

    // Admin Add User
    if (adminAddUserForm) {
      adminAddUserForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const firstName = document.getElementById('admin-new-firstname').value;
        const lastName = document.getElementById('admin-new-lastname').value;
        const email = document.getElementById('admin-new-email').value;
        const password = document.getElementById('admin-new-password').value;
        const role = document.getElementById('admin-new-role').value;

        const res = this.storage.adminAddUser({ firstName, lastName, email, password, role });
        if (res.success) {
          adminAddUserForm.reset();
          this.renderAdminData();
          this.sound.playCheck();
          window.appToast.show("Foydalanuvchi qo'shildi! ✅", `${firstName} (${role.toUpperCase()})`, "success");
        } else {
          window.appToast.show("Xatolik", res.message, "warning");
        }
      });
    }

    // Admin Broadcast Notification
    if (adminBroadcastForm) {
      adminBroadcastForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('admin-broadcast-title').value;
        const message = document.getElementById('admin-broadcast-message').value;

        window.notificationSystem.triggerNotification(
          `📢 [Admin Xabari] ${title}`,
          message,
          "Admin",
          false
        );
        adminBroadcastForm.reset();
        window.appToast.show("Xabar barchaga yuborildi!", "", "success");
      });
    }
  }

  renderAdminData() {
    const stats = this.storage.getAdminStats();
    document.getElementById('admin-kpi-total-users').textContent = stats.totalUsers;
    document.getElementById('admin-kpi-premium-users').textContent = stats.premiumUsers;
    document.getElementById('admin-kpi-free-users').textContent = stats.freeUsers;
    document.getElementById('admin-kpi-habits-done').textContent = stats.totalDone;

    const tbody = document.getElementById('admin-users-tbody');
    if (!tbody) return;

    const users = this.storage.getUsers();
    tbody.innerHTML = users.map(u => {
      const initials = this.getInitials(u.firstName, u.lastName);
      const isPremium = u.role === 'premium';
      const isAdmin = u.role === 'admin';

      let roleBadge = '';
      if (isAdmin) roleBadge = '<span class="user-role-badge role-admin">🛡️ ADMIN</span>';
      else if (isPremium) roleBadge = '<span class="user-role-badge role-premium">⚡ PRO</span>';
      else roleBadge = '<span class="user-role-badge role-user">👤 ODDIY</span>';

      let actionBtn = '';
      if (!isAdmin) {
        actionBtn = `
          <button class="btn-toggle-premium-action ${isPremium ? 'btn-revoke-premium' : 'btn-grant-premium'}" data-admin-toggle-id="${u.id}">
            ${isPremium ? 'Oddiyga Tushirish' : '⚡ PRO Berish'}
          </button>
          <button class="action-icon-btn delete-btn" data-admin-delete-id="${u.id}" title="O'chirish">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        `;
      } else {
        actionBtn = '<span class="text-muted" style="font-size: 0.75rem;">Bosh Boshqaruvchi</span>';
      }

      return `
        <tr>
          <td>
            <div class="table-user-cell">
              <div class="table-avatar" style="background: ${u.avatarGradient || '#10B981'};">${initials}</div>
              <strong>${this.escapeHTML(u.firstName)} ${this.escapeHTML(u.lastName)}</strong>
            </div>
          </td>
          <td>${this.escapeHTML(u.email)}</td>
          <td>${roleBadge}</td>
          <td>${u.createdAt || '2026-01-01'}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              ${actionBtn}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach Toggle Premium listeners
    tbody.querySelectorAll('.btn-toggle-premium-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-admin-toggle-id');
        const updated = this.storage.toggleUserPremium(id);
        if (updated) {
          this.renderAdminData();
          this.syncUserUI();
          this.sound.playCheck();
          window.appToast.show(
            "Foydalanuvchi yangilandi! 🌟",
            `${updated.firstName} endi ${updated.role.toUpperCase()}`,
            "success"
          );
        }
      });
    });

    // Attach Delete User listeners
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-admin-delete-id');
        const res = this.storage.deleteUser(id);
        if (res.success) {
          this.renderAdminData();
          this.sound.playUncheck();
          window.appToast.show("Foydalanuvchi o'chirildi", "", "info");
        } else {
          window.appToast.show("Xatolik", res.message, "warning");
        }
      });
    });
  }

  // ==================== THEMES & PERMISSIONS ====================
  initSettingsListeners() {
    this.initAppearance();

    // Theme options with Premium check
    document.querySelectorAll('.theme-option-card').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-set-theme');
        const canUse = this.storage.canUseTheme(theme);

        if (!canUse) {
          this.sound.playUncheck();
          window.appToast.show(
            "⚡ PRO Talab Qilinadi!",
            "Ushbu mavzuni ishlatish uchun PRO a'zolik kerak. Admindan so'rang yoki rolingizni yangilang.",
            "warning",
            5000
          );
          return;
        }

        this.applyTheme(theme);
        this.storage.updateSettings({ theme });
        document.querySelectorAll('.theme-option-card').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.sound.playCheck();
        window.appToast.show("Mavzu o'zgardi! 🎨", "", "success", 2000);
      });
    });

    // Sound toggle
    const soundToggle = document.getElementById('setting-sound-toggle');
    const settings = this.storage.getSettings();
    soundToggle.checked = settings.soundEnabled !== false;
    soundToggle.addEventListener('change', (e) => {
      this.storage.updateSettings({ soundEnabled: e.target.checked });
      this.sound.setEnabled(e.target.checked);
      if (e.target.checked) this.sound.playCheck();
    });

    // Confetti toggle
    const confettiToggle = document.getElementById('setting-confetti-toggle');
    confettiToggle.checked = settings.confettiEnabled !== false;
    confettiToggle.addEventListener('change', (e) => {
      this.storage.updateSettings({ confettiEnabled: e.target.checked });
      if (e.target.checked) this.confetti.fire(60);
    });

    // Browser notif toggle
    const notifToggle = document.getElementById('setting-browser-notif-toggle');
    notifToggle.checked = settings.browserNotifEnabled !== false;
    notifToggle.addEventListener('change', (e) => {
      this.storage.updateSettings({ browserNotifEnabled: e.target.checked });
    });

    // Export Data JSON
    const exportBtn = document.getElementById('btn-export-data');
    exportBtn.addEventListener('click', () => {
      const dataStr = this.storage.exportAllData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `intizomly-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      window.appToast.show("Zaxira nusxa yuklandi! 💾", "Barcha odatlar va tarixingiz saqlandi", "success");
    });

    // Import Data JSON
    const importInput = document.getElementById('import-file-input');
    importInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const success = this.storage.importAllData(event.target.result);
        if (success) {
          window.appToast.show("Ma'lumotlar tiklandi! ✅", "Barcha ma'lumotlar yuklandi", "success");
          this.refreshAll();
        } else {
          window.appToast.show("Xatolik", "Fayl formati noto'g'ri", "warning");
        }
      };
      reader.readAsText(file);
    });

    // Reset Data
    const resetBtn = document.getElementById('btn-reset-data');
    resetBtn.addEventListener('click', () => {
      if (confirm("Rostdan ham barcha odatlar va hisoblarni qayta boshlamoqchimisiz?")) {
        this.storage.resetAllData();
        this.refreshAll();
        this.syncUserUI();
        window.appToast.show("Ma'lumotlar qayta boshlandi", "", "info");
      }
    });
  }

  updateThemeLockBadges() {
    const user = this.storage.getCurrentUser();
    const isFree = user && user.role === 'user';

    document.querySelectorAll('.theme-option-card').forEach(card => {
      const theme = card.getAttribute('data-set-theme');
      const badge = card.querySelector('.theme-badge-premium');
      if (badge) {
        if (isFree) {
          badge.textContent = '🔒 PRO';
          badge.style.opacity = '1';
        } else {
          badge.textContent = '⚡ PRO';
          badge.style.opacity = '0.7';
        }
      }
    });
  }

  applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    document.querySelectorAll('.theme-option-card').forEach(b => {
      if (b.getAttribute('data-set-theme') === theme) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });
  }

  // ==================== APPLE APPEARANCE (LIGHT / DARK / SYSTEM) ====================
  initAppearance() {
    const settings = this.storage.getSettings();
    const appearance = settings.appearance || 'system';
    this.applyAppearance(appearance);

    // Header Quick Toggle
    const headerToggle = document.getElementById('btn-appearance-toggle');
    if (headerToggle) {
      headerToggle.addEventListener('click', () => {
        const isDark = this.isCurrentlyDark();
        const nextMode = isDark ? 'light' : 'dark';
        this.applyAppearance(nextMode);
        this.storage.updateSettings({ appearance: nextMode });
        this.sound.playCheck();
        window.appToast.show(
          nextMode === 'dark' ? "Qorong'i rejim 🌙" : "Yorug' rejim ☀️",
          "Ko'rinish yangilandi",
          "info",
          2000
        );
      });
    }

    // Settings Segmented Control
    document.querySelectorAll('#appearance-segmented-control .segmented-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-appearance-val');
        this.applyAppearance(val);
        this.storage.updateSettings({ appearance: val });
        this.sound.playCheck();
      });
    });

    // Listen to OS system color-scheme changes if appearance is 'system'
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const curSettings = this.storage.getSettings();
        if ((curSettings.appearance || 'system') === 'system') {
          this.applyAppearance('system');
        }
      });
    }
  }

  isCurrentlyDark() {
    const explicit = document.documentElement.getAttribute('data-appearance');
    if (explicit === 'dark') return true;
    if (explicit === 'light') return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  applyAppearance(appearance) {
    if (appearance === 'system') {
      document.documentElement.removeAttribute('data-appearance');
    } else {
      document.documentElement.setAttribute('data-appearance', appearance);
    }

    // Update segmented buttons
    document.querySelectorAll('#appearance-segmented-control .segmented-btn').forEach(b => {
      if (b.getAttribute('data-appearance-val') === appearance) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    // Update theme-color meta tag
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', this.isCurrentlyDark() ? '#000000' : '#F5F5F7');
    }
  }

  // ==================== DATE CONTROLS ====================
  shiftDate(deltaDays) {
    const newDate = new Date(this.currentDate);
    newDate.setDate(newDate.getDate() + deltaDays);
    this.currentDate = newDate;
    this.refreshAll();
  }

  isCurrentDateToday() {
    const today = new Date();
    return (
      this.currentDate.getDate() === today.getDate() &&
      this.currentDate.getMonth() === today.getMonth() &&
      this.currentDate.getFullYear() === today.getFullYear()
    );
  }

  getDateKey() {
    return this.storage.formatDateKey(this.currentDate);
  }

  renderDateDisplay() {
    const isToday = this.isCurrentDateToday();
    const monthsUz = [
      'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
      'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
    ];
    const weekdaysUz = [
      'Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'
    ];

    const dayNum = this.currentDate.getDate();
    const monthName = monthsUz[this.currentDate.getMonth()];
    const weekdayName = weekdaysUz[this.currentDate.getDay()];

    if (isToday) {
      this.currentDateText.textContent = `Bugun, ${dayNum}-${monthName}`;
      this.todayIndicatorTag.textContent = "BUGUN";
      this.todayIndicatorTag.classList.remove('is-past');
      this.jumpTodayBtn.style.display = 'none';
    } else {
      this.currentDateText.textContent = `${dayNum}-${monthName}, ${weekdayName}`;
      this.todayIndicatorTag.textContent = this.currentDate < new Date() ? "O'TGAN KUN" : "KELAJAK";
      this.todayIndicatorTag.classList.add('is-past');
      this.jumpTodayBtn.style.display = 'inline-block';
    }
  }

  // ==================== 7-DAY STRIP ====================
  renderWeekStrip() {
    const stripContainer = document.getElementById('week-days-strip');
    if (!stripContainer) return;

    const shortDaysUz = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Juma', 'Shan'];
    const today = new Date();

    const days = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(this.currentDate);
      d.setDate(d.getDate() + i);
      days.push(d);
    }

    let completedDaysInWeek = 0;

    stripContainer.innerHTML = days.map(d => {
      const dKey = this.storage.formatDateKey(d);
      const isSelected = dKey === this.getDateKey();
      const isToday = (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      );

      const stats = this.storage.getDayStats(dKey);
      let statusClass = '';
      if (stats.total > 0 && stats.completed === stats.total) {
        statusClass = 'full-done';
        completedDaysInWeek++;
      } else if (stats.completed > 0) {
        statusClass = 'partial-done';
      }

      return `
        <div class="week-day-cell ${isSelected ? 'active-selected' : ''} ${isToday ? 'is-today' : ''}" data-date="${dKey}">
          <span class="day-name">${shortDaysUz[d.getDay()]}</span>
          <span class="day-number">${d.getDate()}</span>
          <span class="day-status-indicator ${statusClass}"></span>
        </div>
      `;
    }).join('');

    stripContainer.querySelectorAll('.week-day-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        const dKey = cell.getAttribute('data-date');
        const [y, m, d] = dKey.split('-').map(Number);
        this.currentDate = new Date(y, m - 1, d);
        this.refreshAll();
      });
    });

    const weekPct = Math.round((completedDaysInWeek / 7) * 100);
    const weekPctText = document.getElementById('week-pct-text');
    if (weekPctText) weekPctText.textContent = `${weekPct}%`;
  }

  // ==================== OVERVIEW STATS ====================
  renderStats() {
    const dateKey = this.getDateKey();
    const dayStats = this.storage.getDayStats(dateKey);
    const globalStreak = this.storage.getGlobalStreak();
    const bestStreak = this.storage.getBestStreak();
    const totalCompletions = this.storage.getTotalCompletions();

    document.getElementById('stat-completed-count').textContent = dayStats.completed;
    document.getElementById('stat-total-count').textContent = dayStats.total;
    document.getElementById('stat-circle-pct').textContent = `${dayStats.percentage}%`;
    document.getElementById('stat-bar-fill').style.width = `${dayStats.percentage}%`;

    const circleFill = document.getElementById('stat-circle-fill');
    if (circleFill) {
      const circumference = 213.6;
      const offset = circumference - (circumference * dayStats.percentage) / 100;
      circleFill.style.strokeDashoffset = offset;
      if (dayStats.percentage === 100) {
        circleFill.setAttribute('stroke', 'var(--success)');
      } else {
        circleFill.setAttribute('stroke', 'var(--primary)');
      }
    }

    const subtextEl = document.getElementById('stat-progress-subtext');
    if (subtextEl) {
      if (dayStats.total === 0) {
        subtextEl.textContent = "Hozircha odatlar mavjud emas";
      } else if (dayStats.percentage === 100) {
        subtextEl.textContent = "Barcha vazifalar bajarildi! Chempionsiz! 🏆";
      } else if (dayStats.percentage >= 50) {
        subtextEl.textContent = "Ajoyib davom etyapsiz, oz qoldi!";
      } else if (dayStats.completed > 0) {
        subtextEl.textContent = "Birinchi qadam qo'yildi, to'xtamang!";
      } else {
        subtextEl.textContent = "Kunlik vazifalar boshlanmoqda";
      }
    }

    document.getElementById('stat-current-streak').textContent = globalStreak;
    document.getElementById('header-streak-count').textContent = globalStreak;
    const sideStreak = document.getElementById('sidebar-streak-count');
    if (sideStreak) sideStreak.textContent = globalStreak;
    document.getElementById('stat-best-streak').textContent = bestStreak;
    document.getElementById('stat-total-done').textContent = totalCompletions;

    const levelTextEl = document.getElementById('stat-level-text');
    if (levelTextEl) {
      if (totalCompletions >= 50) {
        levelTextEl.textContent = "👑 Grandmaster Intizomchi";
      } else if (totalCompletions >= 25) {
        levelTextEl.textContent = "⚡ Master Intizomchi";
      } else if (totalCompletions >= 10) {
        levelTextEl.textContent = "🔥 Faol Intizomchi";
      } else {
        levelTextEl.textContent = "🌱 Yangi Boshlovchi";
      }
    }
  }

  // ==================== HABITS LIST ====================
  renderHabits() {
    const listContainer = document.getElementById('habits-list-container');
    const emptyView = document.getElementById('empty-habits-view');
    const dateKey = this.getDateKey();
    const allHabits = this.storage.getHabits();

    let completedCount = 0;
    let pendingCount = 0;

    const filtered = allHabits.filter(h => {
      const isDone = this.storage.isHabitCompleted(dateKey, h.id);
      if (isDone) completedCount++;
      else pendingCount++;

      if (this.activeFilter === 'completed' && !isDone) return false;
      if (this.activeFilter === 'pending' && isDone) return false;

      if (this.activeCategory !== 'all' && h.category !== this.activeCategory) return false;

      if (this.searchQuery) {
        const matchesTitle = h.title.toLowerCase().includes(this.searchQuery);
        const matchesDesc = (h.description || '').toLowerCase().includes(this.searchQuery);
        if (!matchesTitle && !matchesDesc) return false;
      }

      return true;
    });

    const countAll = document.getElementById('count-filter-all');
    const countPending = document.getElementById('count-filter-pending');
    const countCompleted = document.getElementById('count-filter-completed');
    if (countAll) countAll.textContent = allHabits.length;
    if (countPending) countPending.textContent = pendingCount;
    if (countCompleted) countCompleted.textContent = completedCount;

    if (filtered.length === 0) {
      listContainer.innerHTML = '';
      emptyView.classList.remove('hidden');
      return;
    }

    emptyView.classList.add('hidden');

    listContainer.innerHTML = filtered.map(h => {
      const isDone = this.storage.isHabitCompleted(dateKey, h.id);
      const streak = this.storage.getHabitStreak(h.id);
      const miniDotsHtml = this.generateHabitMiniHistory(h.id);

      return `
        <div class="habit-card ${isDone ? 'is-completed' : ''}" data-id="${h.id}">
          <div class="habit-top-row">
            <button class="habit-checkbox-btn" data-toggle-id="${h.id}" title="${isDone ? 'Belgilashni bekor qilish' : 'Bajarildi deb belgilash'}" aria-label="Bajarildi">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </button>
            <div class="habit-body">
              <div class="habit-header-badge-row">
                <span class="habit-category-tag">${h.category}</span>
                <span class="habit-target-tag">🎯 ${h.target || '1 marta'}</span>
              </div>
              <div class="habit-title-row">
                <span class="habit-emoji">${h.emoji || '🎯'}</span>
                <span class="habit-title">${this.escapeHTML(h.title)}</span>
              </div>
              ${h.description ? `<p class="habit-description">${this.escapeHTML(h.description)}</p>` : ''}
            </div>
          </div>

          <div class="habit-bottom-row">
            <div class="habit-streak-pill" title="Ushbu odat bo'yicha uzluksiz streak">
              <span>🔥</span>
              <span>${streak} kun</span>
            </div>

            <div class="habit-mini-history" title="So'nggi 7 kunlik natija">
              ${miniDotsHtml}
            </div>

            <div class="habit-actions">
              <button class="action-icon-btn edit-habit-btn" data-edit-id="${h.id}" title="Tahrirlash">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              </button>
              <button class="action-icon-btn delete-btn delete-habit-btn" data-delete-id="${h.id}" title="O'chirish">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    listContainer.querySelectorAll('.habit-card').forEach(card => {
      const habitId = card.getAttribute('data-id');
      card.addEventListener('click', (e) => {
        if (e.target.closest('.habit-actions') || e.target.closest('.action-icon-btn')) {
          return;
        }
        this.toggleHabitCompletion(habitId);
      });
    });

    listContainer.querySelectorAll('.edit-habit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-edit-id');
        this.openHabitModal(id);
      });
    });

    listContainer.querySelectorAll('.delete-habit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-delete-id');
        this.handleDeleteHabit(id);
      });
    });
  }

  generateHabitMiniHistory(habitId) {
    const today = new Date();
    let dotsHtml = '';
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dKey = this.storage.formatDateKey(d);
      const isDone = this.storage.isHabitCompleted(dKey, habitId);
      const isToday = i === 0;
      dotsHtml += `<span class="mini-dot ${isDone ? 'done' : ''} ${isToday ? 'today-dot' : ''}"></span>`;
    }
    return dotsHtml;
  }

  toggleHabitCompletion(habitId) {
    const dateKey = this.getDateKey();
    const wasCompleted = this.storage.isHabitCompleted(dateKey, habitId);
    const beforeStats = this.storage.getDayStats(dateKey);

    const newState = this.storage.toggleHabit(dateKey, habitId);

    if (newState) {
      this.sound.playCheck();
      window.appToast.show("Bajarildi! 🎉", "Ajoyib intizom!", "success", 2500);

      const afterStats = this.storage.getDayStats(dateKey);
      if (afterStats.completed === afterStats.total && beforeStats.completed < beforeStats.total) {
        const settings = this.storage.getSettings();
        if (settings.confettiEnabled !== false) {
          this.confetti.fire(150);
        }
        this.sound.playCelebration();
        window.appToast.show("Tabriklaymiz! 🌟", "Bugungi barcha vazifalar to'liq bajarildi!", "success", 6000);
      }
    } else {
      this.sound.playUncheck();
    }

    this.renderStats();
    this.renderWeekStrip();
    this.renderHabits();
  }

  handleDeleteHabit(habitId) {
    const habit = this.storage.getHabitById(habitId);
    if (!habit) return;

    if (confirm(`"${habit.title}" odatini o'chirishni tasdiqlaysizmi?`)) {
      this.storage.deleteHabit(habitId);
      this.refreshAll();
      window.appToast.show("Odat o'chirildi", "", "info");
    }
  }

  // ==================== ADD / EDIT HABIT ====================
  openHabitModal(habitId = '') {
    const titleEl = document.getElementById('habit-modal-title');
    const subtitleEl = document.getElementById('habit-modal-subtitle');
    const idInput = document.getElementById('habit-id-input');
    const titleInput = document.getElementById('habit-title-input');
    const descInput = document.getElementById('habit-desc-input');
    const catSelect = document.getElementById('habit-category-select');
    const targetInput = document.getElementById('habit-target-input');
    const emojiInput = document.getElementById('habit-emoji-input');
    const emojiDisplay = document.getElementById('selected-emoji-display');

    this.emojiPickerDrawer.classList.add('hidden');

    if (habitId) {
      const h = this.storage.getHabitById(habitId);
      if (!h) return;
      titleEl.textContent = "Odatni Tahrirlash";
      subtitleEl.textContent = "Odat parametrlari va maqsadini yangilang";
      idInput.value = h.id;
      titleInput.value = h.title;
      descInput.value = h.description || '';
      catSelect.value = h.category || "Kundalik";
      targetInput.value = h.target || "1 marta";
      emojiInput.value = h.emoji || "🎯";
      emojiDisplay.textContent = h.emoji || "🎯";
    } else {
      titleEl.textContent = "Yangi Odat Qo'shish";
      subtitleEl.textContent = "Har kuni bajariladigan yangi intizomli amalni belgilang";
      idInput.value = '';
      this.habitForm.reset();
      emojiInput.value = "🚫🍬";
      emojiDisplay.textContent = "🚫🍬";
      targetInput.value = "1 marta";
    }

    this.habitModal.classList.remove('hidden');
    titleInput.focus();
  }

  closeHabitModal() {
    this.habitModal.classList.add('hidden');
  }

  saveHabit() {
    const id = document.getElementById('habit-id-input').value;
    const title = document.getElementById('habit-title-input').value;
    const desc = document.getElementById('habit-desc-input').value;
    const category = document.getElementById('habit-category-select').value;
    const target = document.getElementById('habit-target-input').value;
    const emoji = document.getElementById('habit-emoji-input').value;

    if (!title.trim()) return;

    if (id) {
      this.storage.updateHabit(id, {
        title,
        description: desc,
        category,
        target,
        emoji
      });
      window.appToast.show("Odat yangilandi! ✍️", title, "success");
    } else {
      this.storage.addHabit({
        title,
        description: desc,
        category,
        target,
        emoji
      });
      window.appToast.show("Yangi odat qo'shildi! 🚀", title, "success");
    }

    this.sound.playCheck();
    this.closeHabitModal();
    this.refreshAll();
  }

  // ==================== PROFILE MODAL ====================
  openProfileModal(defaultTab = 'tab-profile') {
    this.loadProfileIntoForm();
    this.switchTab(defaultTab);
    this.profileModal.classList.remove('hidden');
  }

  closeProfileModal() {
    this.profileModal.classList.add('hidden');
  }

  switchTab(tabId) {
    if (tabId === 'tab-profile') {
      this.tabProfileBtn.classList.add('active');
      this.tabSettingsBtn.classList.remove('active');
      this.tabProfilePane.classList.remove('hidden');
      this.tabSettingsPane.classList.add('hidden');
    } else {
      this.tabProfileBtn.classList.remove('active');
      this.tabSettingsBtn.classList.add('active');
      this.tabProfilePane.classList.add('hidden');
      this.tabSettingsPane.classList.remove('hidden');
    }
  }

  loadProfileIntoForm() {
    const user = this.storage.getCurrentUser();
    if (!user) return;

    document.getElementById('prof-firstname-input').value = user.firstName || '';
    document.getElementById('prof-lastname-input').value = user.lastName || '';
    document.getElementById('prof-email-input').value = user.email || '';
    document.getElementById('prof-password-input').value = user.password || '';

    const initials = this.getInitials(user.firstName, user.lastName);
    document.getElementById('profile-avatar-initials').textContent = initials;
    document.getElementById('profile-display-fullname').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('profile-display-email-text').textContent = user.email;

    // Role badge inside profile
    const profRoleBadge = document.getElementById('profile-role-badge');
    if (profRoleBadge) {
      profRoleBadge.className = 'user-role-badge';
      if (user.role === 'admin') {
        profRoleBadge.classList.add('role-admin');
        profRoleBadge.textContent = '🛡️ ADMIN';
      } else if (user.role === 'premium') {
        profRoleBadge.classList.add('role-premium');
        profRoleBadge.textContent = '⚡ PRO';
      } else {
        profRoleBadge.classList.add('role-user');
        profRoleBadge.textContent = '👤 ODDIY';
      }
    }

    const bigAvatarCircle = document.getElementById('profile-big-avatar');
    if (bigAvatarCircle && user.avatarGradient) {
      bigAvatarCircle.style.background = user.avatarGradient;
    }

    document.getElementById('prof-stat-total-done').textContent = this.storage.getTotalCompletions();
    document.getElementById('prof-stat-streak').textContent = `${this.storage.getBestStreak()} kun`;
    document.getElementById('prof-stat-joined').textContent = user.createdAt || '2026';
  }

  saveProfile() {
    const firstName = document.getElementById('prof-firstname-input').value;
    const lastName = document.getElementById('prof-lastname-input').value;
    const email = document.getElementById('prof-email-input').value;
    const password = document.getElementById('prof-password-input').value;

    if (!firstName || !email) return;

    this.storage.updateProfile({
      firstName,
      lastName,
      email,
      password
    });

    this.syncUserUI();
    this.loadProfileIntoForm();
    this.sound.playCheck();
    window.appToast.show("Profil saqlandi! ✅", "Ma'lumotlaringiz yangilandi", "success");
  }

  togglePasswordVisibility() {
    const isPass = this.passwordInput.type === 'password';
    this.passwordInput.type = isPass ? 'text' : 'password';
    if (isPass) {
      this.eyeIconShow.classList.add('hidden');
      this.eyeIconHide.classList.remove('hidden');
    } else {
      this.eyeIconShow.classList.remove('hidden');
      this.eyeIconHide.classList.add('hidden');
    }
  }

  cycleAvatarColor() {
    const gradients = [
      'linear-gradient(135deg, #10b981, #06b6d4)',
      'linear-gradient(135deg, #6366f1, #ec4899)',
      'linear-gradient(135deg, #f59e0b, #ef4444)',
      'linear-gradient(135deg, #8b5cf6, #3b82f6)',
      'linear-gradient(135deg, #14b8a6, #a855f7)'
    ];

    const currentUser = this.storage.getCurrentUser();
    if (!currentUser) return;

    let currentIdx = gradients.indexOf(currentUser.avatarGradient);
    let nextIdx = (currentIdx + 1) % gradients.length;
    const nextGrad = gradients[nextIdx];

    this.storage.updateProfile({ avatarGradient: nextGrad });
    this.renderHeaderProfile();
    this.loadProfileIntoForm();
  }

  renderHeaderProfile() {
    const user = this.storage.getCurrentUser();
    if (!user) return;

    const initials = this.getInitials(user.firstName, user.lastName);
    const navInitials = document.getElementById('nav-avatar-initials');
    const navCircle = document.getElementById('nav-avatar-circle');

    if (navInitials) navInitials.textContent = initials;
    if (navCircle && user.avatarGradient) {
      navCircle.style.background = user.avatarGradient;
    }

    // Sidebar user sync
    const sideInitials = document.getElementById('sidebar-avatar-initials');
    const sideCircle = document.getElementById('sidebar-avatar-circle');
    const sideName = document.getElementById('sidebar-user-name');
    const sideRoleText = document.getElementById('sidebar-user-role-text');
    const sideAdminBtn = document.getElementById('side-admin-btn');

    if (sideInitials) sideInitials.textContent = initials;
    if (sideCircle && user.avatarGradient) sideCircle.style.background = user.avatarGradient;
    if (sideName) sideName.textContent = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
    if (sideRoleText) {
      if (user.role === 'admin') sideRoleText.textContent = '🛡️ Admin';
      else if (user.role === 'premium') sideRoleText.textContent = '⚡ PRO A\'zo';
      else sideRoleText.textContent = 'Oddiy A\'zo';
    }
    if (sideAdminBtn) {
      if (user.role === 'admin') sideAdminBtn.classList.remove('hidden');
      else sideAdminBtn.classList.add('hidden');
    }
  }

  getInitials(first, last) {
    const f = (first || 'A').charAt(0).toUpperCase();
    const l = (last || 'Q').charAt(0).toUpperCase();
    return `${f}${l}`;
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

  // ==================== GITHUB STYLE CONTRIBUTION HEATMAP ====================
  renderGitHubHeatmap() {
    const grid = document.getElementById('github-squares-grid');
    const monthsRow = document.getElementById('heatmap-months-row');
    const summaryText = document.getElementById('heatmap-summary-text');
    if (!grid) return;

    const today = new Date();
    const totalDays = 70; // 10 weeks
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (totalDays - 1));

    // Align start to Monday
    const dayOfWeek = startDate.getDay();
    const distanceToMonday = (dayOfWeek + 6) % 7;
    startDate.setDate(startDate.getDate() - distanceToMonday);

    const daysList = [];
    let cur = new Date(startDate);
    const endDate = new Date(today);
    // Align end to upcoming Sunday
    const endDayOfWeek = endDate.getDay();
    const distanceToSunday = (7 - endDayOfWeek) % 7;
    endDate.setDate(endDate.getDate() + distanceToSunday);

    let activeDaysCount = 0;
    let totalCompletionsInPeriod = 0;

    while (cur <= endDate) {
      daysList.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }

    const monthsUz = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
    const currentMonthMap = [];
    let lastMonth = -1;

    grid.innerHTML = daysList.map(d => {
      const dKey = this.storage.formatDateKey(d);
      const isSelected = dKey === this.getDateKey();
      const isToday = this.storage.formatDateKey(today) === dKey;
      const isFuture = d > today;

      if (!isFuture && d.getMonth() !== lastMonth) {
        lastMonth = d.getMonth();
        currentMonthMap.push(monthsUz[lastMonth]);
      }

      const stats = this.storage.getDayStats(dKey);
      let lvl = 0;
      if (!isFuture && stats.total > 0 && stats.completed > 0) {
        activeDaysCount++;
        totalCompletionsInPeriod += stats.completed;
        const pct = stats.percentage;
        if (pct >= 76) lvl = 4;
        else if (pct >= 51) lvl = 3;
        else if (pct >= 26) lvl = 2;
        else lvl = 1;
      }

      const dateLabel = `${d.getDate()}-${monthsUz[d.getMonth()]}`;
      const titleText = isFuture ? `${dateLabel}: Kelajak kun` : `${dateLabel}: ${stats.completed}/${stats.total} ta odat bajarildi (${stats.percentage}%)`;

      return `
        <div class="gh-square gh-lvl-${isFuture ? '0' : lvl} ${isSelected ? 'is-current-selected' : ''}" 
             data-gh-date="${dKey}" 
             title="${titleText}">
        </div>
      `;
    }).join('');

    if (monthsRow) {
      monthsRow.innerHTML = currentMonthMap.slice(-4).map(m => `<span>${m}</span>`).join('');
    }

    if (summaryText) {
      summaryText.textContent = `So'nggi 70 kunda: ${activeDaysCount} faol kun, ${totalCompletionsInPeriod} marta odatlar bajarildi`;
    }

    // Attach click handler on each square to navigate directly to that day!
    grid.querySelectorAll('.gh-square').forEach(sq => {
      sq.addEventListener('click', () => {
        const dKey = sq.getAttribute('data-gh-date');
        const [y, m, d] = dKey.split('-').map(Number);
        this.currentDate = new Date(y, m - 1, d);
        this.refreshAll();
      });
    });
  }

  refreshAll() {
    this.renderDateDisplay();
    this.renderWeekStrip();
    this.renderGitHubHeatmap();
    this.renderStats();
    this.renderHabits();
  }
}

// Bootstrap Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AppController();
});
