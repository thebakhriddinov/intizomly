import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { useHabits } from '../../context/HabitsContext';
import { storage } from '../../utils/storage';
import { audioManager } from '../../utils/audio';
import {
  IconControl,
  IconHourglass,
  IconBan,
  IconInstagram,
  IconTelegram,
  IconYouTube,
  IconTikTok,
  IconGlobeWeb,
  IconPlus,
  IconTrash,
  IconSparkles,
  IconLock,
  IconLightning,
  IconCheck,
  IconExternal,
  IconShield
} from '../Common/AppIcons';

// Popular app presets with real verified URLs and deep-link schemes
const APP_PRESETS = [
  {
    name: 'Instagram',
    category: 'Ijtimoiy tarmoq',
    icon: 'instagram',
    color: '#E1306C',
    url: 'https://www.instagram.com',
    appScheme: 'instagram://app',
    defaultLimit: 60
  },
  {
    name: 'Telegram',
    category: 'Messenjer & Aloqa',
    icon: 'telegram',
    color: '#229ED9',
    url: 'https://web.telegram.org/k/',
    appScheme: 'tg://resolve',
    defaultLimit: 90
  },
  {
    name: 'YouTube',
    category: 'Video & Darslar',
    icon: 'youtube',
    color: '#FF0000',
    url: 'https://www.youtube.com',
    appScheme: 'vnd.youtube://',
    defaultLimit: 45
  },
  {
    name: 'TikTok',
    category: 'Qisqa videolar',
    icon: 'tiktok',
    color: '#00F2FE',
    url: 'https://www.tiktok.com',
    appScheme: 'snssdk1233://',
    defaultLimit: 30
  },
  {
    name: 'Twitter (X)',
    category: 'Ijtimoiy tarmoq',
    icon: 'web',
    color: '#1DA1F2',
    url: 'https://x.com',
    appScheme: 'twitter://',
    defaultLimit: 30
  },
  {
    name: 'Facebook',
    category: 'Ijtimoiy tarmoq',
    icon: 'web',
    color: '#1877F2',
    url: 'https://www.facebook.com',
    appScheme: '',
    defaultLimit: 40
  },
  {
    name: 'Reddit',
    category: 'Munozara & Forum',
    icon: 'web',
    color: '#FF4500',
    url: 'https://www.reddit.com',
    appScheme: '',
    defaultLimit: 30
  },
  {
    name: 'Pinterest',
    category: 'Dizayn & G\'oyalar',
    icon: 'web',
    color: '#BD081C',
    url: 'https://www.pinterest.com',
    appScheme: '',
    defaultLimit: 30
  }
];

// App Icon Resolver
function renderAppIcon(iconKey, size = 24) {
  switch (iconKey) {
    case 'instagram':
      return <IconInstagram size={size} />;
    case 'telegram':
      return <IconTelegram size={size} color="#229ED9" />;
    case 'youtube':
      return <IconYouTube size={size} color="#FF0000" />;
    case 'tiktok':
      return <IconTikTok size={size} />;
    case 'web':
    default:
      return <IconGlobeWeb size={size} color="#10B981" />;
  }
}

export function ControlPage() {
  const { addToast } = useHabits();

  const [apps, setApps] = useState(() => storage.getAppLimits());
  
  // Real active window session tracking
  const [activeSessionApp, setActiveSessionApp] = useState(null);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const activeAppWindowRef = useRef(null);

  // App exited / lockout modal (NOT intizomly logout - target app was closed!)
  const [lockedOutApp, setLockedOutApp] = useState(null);

  // Attempted to open blocked app modal
  const [blockedAttemptApp, setBlockedAttemptApp] = useState(null);

  // Add App Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [newAppName, setNewAppName] = useState('');
  const [newAppUrl, setNewAppUrl] = useState('');
  const [newAppCategory, setNewAppCategory] = useState('Ijtimoiy tarmoq');
  const [newAppIcon, setNewAppIcon] = useState('web');
  const [newAppLimit, setNewAppLimit] = useState(30);

  // Calculate totals
  const totalScreenTimeMinutes = useMemo(() => {
    return apps.reduce((sum, app) => sum + (app.timeSpent || 0), 0);
  }, [apps]);

  const totalScreenHours = Math.floor(totalScreenTimeMinutes / 60);
  const totalScreenRemainingMins = totalScreenTimeMinutes % 60;

  const exceededApps = useMemo(() => {
    return apps.filter(app => app.enabled && (app.timeSpent >= app.limit));
  }, [apps]);

  // Sync to storage
  const updateAppsState = useCallback((newApps) => {
    setApps(newApps);
    storage.saveAppLimits(newApps);
  }, []);

  // Force close active app window and trigger target app lockout
  const forceExitTargetApp = useCallback((app) => {
    // 1. Forcibly close external window if open
    if (activeAppWindowRef.current && !activeAppWindowRef.current.closed) {
      try {
        activeAppWindowRef.current.close();
      } catch (e) {}
    }
    activeAppWindowRef.current = null;
    setActiveSessionApp(null);
    setSessionSeconds(0);

    // 2. Play warning audio chime
    try {
      audioManager?.play('warning');
    } catch (e) {}

    // 3. Dispatch system notification
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`⏳ ${app.name} yopildi!`, {
          body: `Kunlik ${app.limit} daqiqalik me'yor tugadi. Intizomly bu ilovani yopdi va blokladi.`,
          icon: '/logo.png',
          vibrate: [300, 150, 300]
        });
      } catch (e) {}
    }

    // 4. Show App Exited modal (User stays in Intizomly!)
    setLockedOutApp(app);
  }, []);

  // Live session timer simulation & window status checker
  useEffect(() => {
    if (!activeSessionApp) return;

    const interval = setInterval(() => {
      // Check if user manually closed the opened window
      if (activeAppWindowRef.current && activeAppWindowRef.current.closed) {
        activeAppWindowRef.current = null;
        setActiveSessionApp(null);
        addToast("Sessiya yakunlandi", `${activeSessionApp.name} oynasi yopildi`, "info");
        return;
      }

      setSessionSeconds(prev => {
        const next = prev + 1;
        // Every 5 seconds during active session, increment 1 minute (for fast real-time feedback)
        if (next % 5 === 0) {
          setApps(prevApps => {
            const current = prevApps.find(a => a.id === activeSessionApp.id);
            if (!current) return prevApps;

            const newSpent = (current.timeSpent || 0) + 1;
            const updated = prevApps.map(a => a.id === activeSessionApp.id ? { ...a, timeSpent: newSpent } : a);
            storage.saveAppLimits(updated);

            // Check limit breach
            if (current.enabled && newSpent >= current.limit) {
              setTimeout(() => {
                forceExitTargetApp({ ...current, timeSpent: newSpent });
              }, 100);
            }
            return updated;
          });
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSessionApp, forceExitTargetApp, addToast]);

  // LAUNCH REAL APP
  const handleLaunchApp = (app) => {
    // Check if app is blocked
    if (app.enabled && app.timeSpent >= app.limit) {
      setBlockedAttemptApp(app);
      try {
        audioManager?.play('warning');
      } catch (e) {}
      return;
    }

    // Open target app
    const targetUrl = app.url || 'https://www.google.com';
    const childWin = window.open(targetUrl, '_blank', 'noopener=no,noreferrer=no');
    activeAppWindowRef.current = childWin;
    setActiveSessionApp(app);
    setSessionSeconds(0);

    addToast(
      `${app.name} ochildi! 🚀`,
      `Intizomly nazorati faol. Limit: ${app.limit} daqiqa (yetganda avtomatik yopiladi)`,
      "success"
    );
  };

  // Close active app manually
  const handleCloseActiveApp = () => {
    if (activeAppWindowRef.current && !activeAppWindowRef.current.closed) {
      try {
        activeAppWindowRef.current.close();
      } catch (e) {}
    }
    activeAppWindowRef.current = null;
    const appName = activeSessionApp?.name || 'Ilova';
    setActiveSessionApp(null);
    setSessionSeconds(0);
    addToast("Ilova yopildi", `${appName} sessiyasi muvaffaqiyatli to'xtatildi`, "info");
  };

  // Toggle app restriction
  const handleToggleLimit = (id) => {
    const updated = apps.map(app => {
      if (app.id === id) {
        const willEnable = !app.enabled;
        if (willEnable && app.timeSpent >= app.limit) {
          setTimeout(() => forceExitTargetApp({ ...app, enabled: true }), 200);
        }
        return { ...app, enabled: willEnable };
      }
      return app;
    });
    updateAppsState(updated);
    addToast("Cheklov yangilandi", "Sozlama saqlandi", "info");
  };

  // Change limit minutes
  const handleChangeLimit = (id, newLimitMinutes) => {
    const updated = apps.map(app => {
      if (app.id === id) {
        const numLimit = Number(newLimitMinutes);
        if (app.enabled && app.timeSpent >= numLimit) {
          setTimeout(() => forceExitTargetApp({ ...app, limit: numLimit }), 200);
        }
        return { ...app, limit: numLimit };
      }
      return app;
    });
    updateAppsState(updated);
  };

  // Simulate usage (+10 min)
  const handleAddMinutes = (id, mins) => {
    const updated = apps.map(app => {
      if (app.id === id) {
        const newSpent = Math.max(0, (app.timeSpent || 0) + mins);
        if (app.enabled && newSpent >= app.limit) {
          setTimeout(() => forceExitTargetApp({ ...app, timeSpent: newSpent }), 200);
        }
        return { ...app, timeSpent: newSpent };
      }
      return app;
    });
    updateAppsState(updated);
  };

  // Reset time spent today
  const handleResetAppTime = (id) => {
    const updated = apps.map(app => app.id === id ? { ...app, timeSpent: 0 } : app);
    updateAppsState(updated);
    addToast("Vaqt tozalandi", "Bugungi sarflangan vaqt 0 ga qaytarildi", "success");
  };

  // Delete custom app
  const handleDeleteApp = (id) => {
    const updated = apps.filter(app => app.id !== id);
    updateAppsState(updated);
    addToast("O'chirildi", "Ilova nazorat ro'yxatidan olib tashlandi", "info");
  };

  // Select a preset in Add Modal
  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset.name);
    setNewAppName(preset.name);
    setNewAppUrl(preset.url);
    setNewAppCategory(preset.category);
    setNewAppIcon(preset.icon);
    setNewAppLimit(preset.defaultLimit);
  };

  // Add custom app submit
  const handleCreateApp = (e) => {
    e.preventDefault();
    if (!newAppName.trim()) return;

    let cleanUrl = newAppUrl.trim();
    if (cleanUrl && !cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    const newApp = {
      id: 'app_' + Date.now(),
      name: newAppName.trim(),
      category: newAppCategory,
      icon: newAppIcon,
      color: '#10B981',
      url: cleanUrl || 'https://www.google.com',
      timeSpent: 0,
      limit: Number(newAppLimit) || 30,
      enabled: true
    };

    const updated = [...apps, newApp];
    updateAppsState(updated);
    setShowAddModal(false);
    setNewAppName('');
    setNewAppUrl('');
    setSelectedPreset(null);
    addToast("Qo'shildi! 📱", `${newApp.name} real nazoratga olindi`, "success");
  };

  return (
    <div className="control-page-container">
      {/* 1. HERO HEADER */}
      <div className="control-header-card">
        <div className="control-header-left">
          <div className="control-title-row">
            <div className="control-icon-badge">
              <IconControl size={24} color="#10B981" />
            </div>
            <div>
              <h2 className="control-title">Control & Screen Time</h2>
              <p className="control-subtitle">
                Mavjud ilovalarni ishga tushirish, vaqtini nazorat qilish va limitdan oshganda avtomatik yopish
              </p>
            </div>
          </div>
        </div>

        <div className="control-header-right">
          <button
            type="button"
            className="control-add-btn"
            onClick={() => {
              setSelectedPreset(null);
              setNewAppName('');
              setNewAppUrl('');
              setShowAddModal(true);
            }}
          >
            <IconPlus size={16} />
            <span>Mavjud Ilova Qo'shish</span>
          </button>
        </div>
      </div>

      {/* ACTIVE APP LIVE MONITOR FLOATING BAR (If any app is currently running) */}
      {activeSessionApp && (
        <div className="active-app-live-bar">
          <div className="active-app-bar-left">
            <div className="active-app-bar-icon">
              {renderAppIcon(activeSessionApp.icon, 22)}
            </div>
            <div>
              <div className="active-app-bar-title">
                <strong>{activeSessionApp.name}</strong> ochiq va nazorat ostida
                <span className="live-pulse-badge">Jonli hisoblanmoqda</span>
              </div>
              <div className="active-app-bar-sub">
                Sarflangan: {activeSessionApp.timeSpent} daqiqa / {activeSessionApp.limit} daqiqada avtomatik yopiladi
              </div>
            </div>
          </div>
          <div className="active-app-bar-right">
            <button
              type="button"
              className="btn-close-active-app"
              onClick={handleCloseActiveApp}
            >
              <IconBan size={15} color="#fff" />
              <span>Ilovani Yopish</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. REAL-TIME STATS STRIP */}
      <div className="control-stats-grid">
        {/* Total Screen Time Card */}
        <div className="control-stat-card primary-card">
          <div className="stat-card-header">
            <span className="stat-label">
              <IconHourglass size={16} color="#10B981" />
              <span>Bugungi Umumiy Screen Time</span>
            </span>
            <span className="live-indicator">
              <span className="pulse-dot"></span> Jonli
            </span>
          </div>
          <div className="stat-big-number">
            {totalScreenHours}<span>soat</span> {totalScreenRemainingMins}<span>daq</span>
          </div>
          <div className="stat-progress-track">
            <div
              className="stat-progress-fill"
              style={{
                width: `${Math.min(100, (totalScreenTimeMinutes / 360) * 100)}%`,
                background: totalScreenTimeMinutes > 300 ? '#EF4444' : 'linear-gradient(90deg, #10B981, #06B6D4)'
              }}
            ></div>
          </div>
          <span className="stat-subtext">Kunlik me'yor: ko'pi bilan 4-5 soat</span>
        </div>

        {/* Limit Breaches Card */}
        <div className={`control-stat-card ${exceededApps.length > 0 ? 'warning-card' : ''}`}>
          <div className="stat-card-header">
            <span className="stat-label">
              <IconShield size={16} color={exceededApps.length > 0 ? '#EF4444' : '#10B981'} />
              <span>Bloklangan Ilovalar</span>
            </span>
          </div>
          <div className="stat-big-number">
            {exceededApps.length} <span>ta ilova</span>
          </div>
          <span className="stat-subtext">
            {exceededApps.length > 0
              ? `${exceededApps.map(a => a.name).join(', ')} limitga yetgan va yopilgan`
              : "Hozircha barcha ilovalar belgilangan me'yorda"}
          </span>
        </div>

        {/* Real App Enforcement Status */}
        <div className="control-stat-card session-card">
          <div className="stat-card-header">
            <span className="stat-label">
              <IconLightning size={16} color="#F59E0B" />
              <span>Avto-Yopish Rejimi</span>
            </span>
          </div>
          <div className="stat-big-number-inactive" style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <IconCheck size={18} color="#10B981" />
            <span>Faol (Avto-chiqarish)</span>
          </div>
          <span className="stat-subtext">
            Limitdan oshgan ilova o'sha zahotiyoq yopiladi va qayta ochish taqiqlanadi
          </span>
        </div>
      </div>

      {/* 3. APP LIMITS SECTION */}
      <div className="control-section">
        <div className="control-section-header">
          <h3 className="section-title">
            <IconLock size={18} color="var(--primary-accent)" />
            <span>Mavjud Ilovalar va Cheklovlar</span>
          </h3>
          <span className="section-caption">
            "Ilovani Ochish" orqali real ilovaga kirishingiz mumkin. Vaqt tugashi bilan o'sha ilovaning o'zi avtomatik yopiladi.
          </span>
        </div>

        <div className="apps-limit-list">
          {apps.map((app) => {
            const pct = Math.min(100, Math.round(((app.timeSpent || 0) / (app.limit || 1)) * 100));
            const isExceeded = app.enabled && (app.timeSpent >= app.limit);
            const isWarning = app.enabled && !isExceeded && pct >= 75;
            const isRunning = activeSessionApp?.id === app.id;

            return (
              <div
                key={app.id}
                className={`app-limit-card ${isExceeded ? 'card-exceeded' : isWarning ? 'card-warning' : ''}`}
              >
                <div className="app-card-top">
                  <div className="app-card-identity">
                    <div className="app-card-icon-wrap">
                      {renderAppIcon(app.icon, 24)}
                    </div>
                    <div className="app-card-title-wrap">
                      <div className="app-name-row">
                        <h4 className="app-name">{app.name}</h4>
                        <span className="app-category-badge">{app.category}</span>
                        {isExceeded && (
                          <span className="exceeded-badge">
                            <IconBan size={12} color="#fff" />
                            <span>BLOKLANGAN</span>
                          </span>
                        )}
                        {isRunning && (
                          <span className="running-badge">
                            <span className="pulse-dot"></span>
                            <span>HOZIR OCHIQ</span>
                          </span>
                        )}
                      </div>
                      <div className="app-time-row">
                        <span className="time-spent-bold">{app.timeSpent} daq</span>
                        <span className="time-separator">/</span>
                        <span className="time-limit-soft">{app.limit} daq me'yor</span>
                        <span className="time-pct">({pct}%)</span>
                      </div>
                    </div>
                  </div>

                  <div className="app-card-toggle-wrap">
                    <label className="switch-control" title={app.enabled ? "Cheklov faol" : "Cheklov o'chiq"}>
                      <input
                        type="checkbox"
                        checked={app.enabled}
                        onChange={() => handleToggleLimit(app.id)}
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="app-card-progress-track">
                  <div
                    className={`app-card-progress-bar ${isExceeded ? 'bar-exceeded' : isWarning ? 'bar-warning' : 'bar-normal'}`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>

                {/* Controls strip */}
                <div className="app-card-bottom-actions">
                  <div className="quick-limit-selector">
                    <span className="quick-label">Cheklov:</span>
                    {[15, 30, 45, 60, 90, 120].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        className={`btn-pill-limit ${app.limit === mins ? 'active' : ''}`}
                        onClick={() => handleChangeLimit(app.id, mins)}
                      >
                        {mins >= 60 ? `${mins / 60}s` : `${mins}d`}
                      </button>
                    ))}
                  </div>

                  <div className="app-action-buttons">
                    {/* LAUNCH REAL TARGET APP */}
                    <button
                      type="button"
                      className={`btn-app-launch ${isExceeded ? 'btn-launch-blocked' : ''}`}
                      onClick={() => handleLaunchApp(app)}
                      title={isExceeded ? "Ilova bloklangan! Limitga yetilgan." : "Haqiqiy ilovani ochish"}
                    >
                      {isExceeded ? (
                        <>
                          <IconBan size={14} color="#EF4444" />
                          <span>Bloklangan</span>
                        </>
                      ) : (
                        <>
                          <IconExternal size={14} />
                          <span>Ilovani Ochish</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="btn-app-simulate"
                      onClick={() => handleAddMinutes(app.id, 10)}
                      title="10 daqiqa sarflashni sinash"
                    >
                      +10 daq
                    </button>

                    <button
                      type="button"
                      className="btn-app-reset"
                      onClick={() => handleResetAppTime(app.id)}
                      title="Vaqtni nolga tushirish"
                    >
                      Nolga
                    </button>

                    {/* Delete for custom added apps */}
                    {app.id.startsWith('app_1') && (
                      <button
                        type="button"
                        className="btn-app-delete"
                        onClick={() => handleDeleteApp(app.id)}
                        title="O'chirish"
                      >
                        <IconTrash size={14} color="#EF4444" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          PORTAL MODALS: Rendered at document.body level for DEAD-CENTER positioning!
          ========================================================================= */}

      {/* 4. MODAL: ADD EXISTING / CUSTOM APP LIMIT */}
      {showAddModal && createPortal(
        <div className="control-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="control-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="control-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="control-icon-badge" style={{ width: '38px', height: '38px' }}>
                  <IconPlus size={18} color="var(--primary-accent)" />
                </div>
                <div>
                  <h3 className="control-modal-title">Mavjud Ilovani Qo'shish</h3>
                  <p className="control-modal-desc">Ilovani tanlang yoki o'z saytingiz havolasini kiriting</p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAddModal(false)}
              >
                &times;
              </button>
            </div>

            {/* Presets Grid */}
            <div className="modal-preset-section">
              <span className="preset-section-label">Mavjud mashhur ilovalardan tanlash:</span>
              <div className="preset-chips-grid">
                {APP_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    className={`preset-chip-btn ${selectedPreset === preset.name ? 'active' : ''}`}
                    onClick={() => handleSelectPreset(preset)}
                  >
                    {renderAppIcon(preset.icon, 18)}
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateApp} className="modal-body-form">
              <div className="form-group">
                <label>Ilova yoki Sayt Nomi</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Masalan: Instagram, Telegram, Twitter"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Ilova / Sayt Havolasi (URL)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="https://instagram.com"
                  value={newAppUrl}
                  onChange={(e) => setNewAppUrl(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Kategoriya</label>
                <select
                  className="form-control"
                  value={newAppCategory}
                  onChange={(e) => setNewAppCategory(e.target.value)}
                >
                  <option value="Ijtimoiy tarmoq">Ijtimoiy tarmoq</option>
                  <option value="Video & Ko'ngilochar">Video & Ko'ngilochar</option>
                  <option value="Messenjer & Aloqa">Messenjer & Aloqa</option>
                  <option value="O'yinlar">O'yinlar</option>
                  <option value="Internet & Qidiruv">Internet & Qidiruv</option>
                  <option value="Boshqa">Boshqa</option>
                </select>
              </div>

              <div className="form-group">
                <label>Kunlik Cheklov Me'yori (daqiqada)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="number"
                    min="5"
                    max="600"
                    step="5"
                    className="form-control"
                    value={newAppLimit}
                    onChange={(e) => setNewAppLimit(e.target.value)}
                  />
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', minWidth: '65px' }}>
                    {Math.floor(newAppLimit / 60) > 0 ? `${Math.floor(newAppLimit / 60)}s ${newAppLimit % 60}d` : `${newAppLimit} daq`}
                  </span>
                </div>
              </div>

              <div className="modal-actions-row" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="secondary-btn"
                  style={{ flex: 1 }}
                  onClick={() => setShowAddModal(false)}
                >
                  Bekor qilish
                </button>
                <button type="submit" className="primary-btn" style={{ flex: 1.5 }}>
                  Cheklovni Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* 5. MODAL: TARGET APP WAS FORCIBLY CLOSED / EXITED (User stays inside Intizomly!) */}
      {lockedOutApp && createPortal(
        <div className="control-modal-overlay" onClick={() => setLockedOutApp(null)}>
          <div className="control-modal-card target-app-lockout-card" onClick={(e) => e.stopPropagation()}>
            <div className="kickout-icon-pulse">
              <IconBan size={48} color="#EF4444" />
            </div>

            <h2 className="kickout-title" style={{ color: '#fff', fontSize: '22px' }}>
              {lockedOutApp.name} Ilovasidan Chiqarildi! ⏳
            </h2>

            <p className="kickout-desc">
              Siz <strong>{lockedOutApp.name}</strong> uchun belgilangan <strong>{lockedOutApp.limit} daqiqalik</strong> kunlik intizom me'yoridan oshib ketdingiz.
            </p>

            <div className="app-closed-notice">
              <IconCheck size={16} color="#10B981" />
              <span>{lockedOutApp.name} oynasi darhol yopildi va unga qayta kirish bloklandi. Intizomly profilingiz esa to'liq ochiq qoladi.</span>
            </div>

            <div className="kickout-actions">
              <button
                type="button"
                className="btn-kickout-now"
                onClick={() => setLockedOutApp(null)}
              >
                <span>Tushundim, Intizomga Amal Qilaman</span>
              </button>

              <button
                type="button"
                className="btn-kickout-emergency"
                onClick={() => {
                  setLockedOutApp(null);
                  handleChangeLimit(lockedOutApp.id, (lockedOutApp.limit || 30) + 15);
                  addToast("Limit +15 daqiqa oshirildi", `${lockedOutApp.name} uchun yangi limit o'rnatildi`, "info");
                }}
              >
                +15 daqiqa qo'shish va ochish
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 6. MODAL: ATTEMPTED TO LAUNCH BLOCKED APP */}
      {blockedAttemptApp && createPortal(
        <div className="control-modal-overlay" onClick={() => setBlockedAttemptApp(null)}>
          <div className="control-modal-card target-app-lockout-card" onClick={(e) => e.stopPropagation()}>
            <div className="kickout-icon-pulse" style={{ borderColor: 'rgba(239, 68, 68, 0.4)' }}>
              <IconShield size={44} color="#EF4444" />
            </div>

            <h2 className="kickout-title" style={{ color: '#fff', fontSize: '21px' }}>
              Kirish Taqiqlangan! ⛔
            </h2>

            <p className="kickout-desc">
              <strong>{blockedAttemptApp.name}</strong> ilovasi bugungi kunlik limitiga yetgan (<strong>{blockedAttemptApp.limit} daqiqa</strong>).
              Intizomni buzmaslik uchun unga kirish bloklandi!
            </p>

            <div className="kickout-actions">
              <button
                type="button"
                className="btn-kickout-now"
                onClick={() => setBlockedAttemptApp(null)}
              >
                <span>Tushundim</span>
              </button>

              <button
                type="button"
                className="btn-kickout-emergency"
                onClick={() => {
                  const currentApp = blockedAttemptApp;
                  setBlockedAttemptApp(null);
                  handleChangeLimit(currentApp.id, (currentApp.limit || 30) + 15);
                  addToast("Limit oshirildi", "Endi ilovaga kirishingiz mumkin", "success");
                }}
              >
                Limitni +15 daqiqaga oshirish
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default ControlPage;
