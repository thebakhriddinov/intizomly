import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useHabits } from './context/HabitsContext';
import { useLanguage } from './context/LanguageContext';
import { LiquidBackground } from './components/Background/LiquidBackground';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { MobileBottomNav } from './components/Layout/MobileBottomNav';
import { DateNavigator } from './components/Dashboard/DateNavigator';
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
import { EnvWarningBanner } from './components/Feedback/EnvWarningBanner';

export function App() {
  const { t } = useLanguage();

  // Modals state
  const [habitModalOpen, setHabitModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState(null);

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileInitialTab, setProfileInitialTab] = useState('profile');

  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

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

          <EnvWarningBanner />

          <main className="app-main">
            {/* Mobile Date Navigator (Visible only on mobile/phone screens) */}
            <DateNavigator className="mobile-date-bar" />
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
