import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useHabits } from './context/HabitsContext';
import { useLanguage } from './context/LanguageContext';
import { LiquidBackground } from './components/Background/LiquidBackground';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { MobileBottomNav } from './components/Layout/MobileBottomNav';
import { WeekStrip } from './components/Dashboard/WeekStrip';
import { StatsOverview } from './components/Dashboard/StatsOverview';
import { Heatmap } from './components/Dashboard/Heatmap';
import { HabitList } from './components/Dashboard/HabitList';
import { HabitModal } from './components/Modals/HabitModal';
import { ProfileSettingsModal } from './components/Modals/ProfileSettingsModal';
import { AdminModal } from './components/Modals/AdminModal';
import { AuthModal } from './components/Modals/AuthModal';
import { DynamicIslandBanner } from './components/Feedback/DynamicIslandBanner';
import { ToastContainer } from './components/Feedback/ToastContainer';

export function App() {
  const { t } = useLanguage();

  // Modals state
  const [habitModalOpen, setHabitModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState(null);

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileInitialTab, setProfileInitialTab] = useState('profile');

  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Global Liquid Water Ripple Effect on Pointer Down
  useEffect(() => {
    const handlePointerDown = (e) => {
      const target = e.target.closest(
        'button, .habit-card, .stat-card, .week-strip-card, .github-heatmap-card, ' +
        '.week-day-cell, .filter-chip, .sidebar-nav-item, .mob-nav-btn, .segmented-btn, ' +
        '.demo-user-btn, .theme-option-card, .admin-kpi-card, .brand-logo, .avatar-circle, .gh-square, .styled-reset-today-btn'
      );
      if (!target) return;

      const style = window.getComputedStyle(target);
      if (style.position === 'static') {
        target.style.position = 'relative';
      }

      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const size = Math.max(rect.width, rect.height) * 2;

      const ripple = document.createElement('span');
      ripple.className = 'liquid-ripple-drop';
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      target.appendChild(ripple);
      setTimeout(() => {
        ripple.remove();
      }, 700);
    };

    document.addEventListener('pointerdown', handlePointerDown, { passive: true });
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  const handleOpenAddHabit = () => {
    setHabitToEdit(null);
    setHabitModalOpen(true);
  };

  const handleEditHabit = (habit) => {
    setHabitToEdit(habit);
    setHabitModalOpen(true);
  };

  const handleOpenProfile = () => {
    setProfileInitialTab('profile');
    setProfileModalOpen(true);
  };

  const handleOpenSettings = () => {
    setProfileInitialTab('settings');
    setProfileModalOpen(true);
  };

  return (
    <>
      {/* 1. Dynamic Liquid Morphing Blobs Layer */}
      <LiquidBackground />

      <div className="app-layout">
        {/* 2. Desktop Sidebar */}
        <Sidebar
          onOpenProfile={handleOpenProfile}
          onOpenAdmin={() => setAdminModalOpen(true)}
          onOpenAuth={() => setAuthModalOpen(true)}
        />

        {/* 3. Main Layout Wrapper */}
        <div className="app-main-wrapper">
          <Header
            onOpenProfile={handleOpenProfile}
            onOpenAdmin={() => setAdminModalOpen(true)}
            onOpenAuth={() => setAuthModalOpen(true)}
          />

          <main className="app-main">
            <WeekStrip />
            <StatsOverview />
            <Heatmap />
            <HabitList
              onOpenAddHabit={handleOpenAddHabit}
              onEditHabit={handleEditHabit}
            />
          </main>

          {/* 4. Footer */}
          <footer className="app-footer">
            <div className="footer-content">
              <span>&copy; 2026 {t('appName')} — {t('tagline')}</span>
              <div className="footer-links">
                <button type="button" className="link-btn" onClick={handleOpenSettings}>
                  {t('tabSettings')}
                </button>
                <span>&bull;</span>
                <button type="button" className="link-btn" onClick={() => setAuthModalOpen(true)}>
                  {t('authLoginTitle')}
                </button>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* 5. Mobile Bottom Navigation */}
      <MobileBottomNav onOpenProfile={handleOpenProfile} />

      {/* 6. Modals */}
      <HabitModal
        isOpen={habitModalOpen}
        onClose={() => setHabitModalOpen(false)}
        habitToEdit={habitToEdit}
      />

      <ProfileSettingsModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        initialTab={profileInitialTab}
        onOpenAuth={() => {
          setProfileModalOpen(false);
          setAuthModalOpen(true);
        }}
      />

      <AdminModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* 7. Feedback Elements */}
      <DynamicIslandBanner />
      <ToastContainer />
    </>
  );
}
