import React, { useState, useCallback, lazy, Suspense } from 'react';
import { useAuth } from './context/AuthContext';
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
import { DynamicIslandBanner } from './components/Feedback/DynamicIslandBanner';
import { ToastContainer } from './components/Feedback/ToastContainer';
import { EnvWarningBanner } from './components/Feedback/EnvWarningBanner';

// Code-split modals so they don't bloat the initial mobile download
const HabitModal = lazy(() => import('./components/Modals/HabitModal').then(m => ({ default: m.HabitModal })));
const ProfileSettingsModal = lazy(() => import('./components/Modals/ProfileSettingsModal').then(m => ({ default: m.ProfileSettingsModal })));
const AdminModal = lazy(() => import('./components/Modals/AdminModal').then(m => ({ default: m.AdminModal })));
const AuthModal = lazy(() => import('./components/Modals/AuthModal').then(m => ({ default: m.AuthModal })));
const UpgradeModal = lazy(() => import('./components/Modals/UpgradeModal').then(m => ({ default: m.UpgradeModal })));

export function App() {
  const { t } = useLanguage();
  const { currentUser, authLoading } = useAuth();

  // Modals state
  const [habitModalOpen, setHabitModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState(null);

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileInitialTab, setProfileInitialTab] = useState('profile');

  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const handleOpenAddHabit = useCallback(() => {
    setHabitToEdit(null);
    setHabitModalOpen(true);
  }, []);

  const handleEditHabit = useCallback((habit) => {
    setHabitToEdit(habit);
    setHabitModalOpen(true);
  }, []);

  const handleOpenProfile = useCallback(() => {
    setProfileInitialTab('profile');
    setProfileModalOpen(true);
  }, []);

  const handleOpenSettings = useCallback(() => {
    setProfileInitialTab('settings');
    setProfileModalOpen(true);
  }, []);

  const handleOpenUpgrade = useCallback(() => {
    setUpgradeModalOpen(true);
  }, []);

  // 1. Initial Auth Loading Screen
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#080B11',
        gap: '16px'
      }}>
        <div className="logo-icon-wrapper large-logo">
          <svg className="logo-svg" viewBox="0 0 32 32" fill="none">
            <path d="M16 2C13.5 7.5 9 11.5 9 18C9 24.075 12.134 28 16 28C19.866 28 23 24.075 23 18C23 14 20.5 10 16 2Z" fill="#B6F36B" />
            <path d="M11 18.5L14.5 22L21 14.5" stroke="#0B0D0F" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px' }}>Intizomly yuklanmoqda...</span>
      </div>
    );
  }

  // 2. Auth Gate: If user is not logged in, ask for login or new account
  if (!currentUser) {
    return (
      <>
        <LiquidBackground />
        <Suspense fallback={null}>
          <AuthModal
            isOpen={true}
            isAuthGate={true}
            onLoginSuccess={(user) => {
              if (user?.role === 'admin') {
                setAdminModalOpen(true);
              }
            }}
          />
        </Suspense>
        <ToastContainer />
      </>
    );
  }

  // 3. Authenticated App Layout
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
          onOpenUpgrade={handleOpenUpgrade}
        />

        {/* 3. Main Layout Wrapper */}
        <div className="app-main-wrapper">
          <Header
            onOpenProfile={handleOpenProfile}
            onOpenAdmin={() => setAdminModalOpen(true)}
            onOpenAuth={() => setAuthModalOpen(true)}
            onOpenUpgrade={handleOpenUpgrade}
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
                <button type="button" className="link-btn" onClick={handleOpenProfile}>
                  {t('tabProfile')}
                </button>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* 5. Mobile Bottom Navigation */}
      <MobileBottomNav onOpenProfile={handleOpenProfile} />

      {/* 6. Lazy-Loaded Modals with Zero-Overhead when closed */}
      <Suspense fallback={null}>
        {habitModalOpen && (
          <HabitModal
            isOpen={habitModalOpen}
            onClose={() => setHabitModalOpen(false)}
            habitToEdit={habitToEdit}
          />
        )}

        {profileModalOpen && (
          <ProfileSettingsModal
            isOpen={profileModalOpen}
            onClose={() => setProfileModalOpen(false)}
            initialTab={profileInitialTab}
            onOpenAuth={() => {
              setProfileModalOpen(false);
              setAuthModalOpen(true);
            }}
            onOpenUpgrade={handleOpenUpgrade}
          />
        )}

        {adminModalOpen && (
          <AdminModal
            isOpen={adminModalOpen}
            onClose={() => setAdminModalOpen(false)}
          />
        )}

        {authModalOpen && (
          <AuthModal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
            onLoginSuccess={(user) => {
              setAuthModalOpen(false);
              if (user?.role === 'admin') {
                setAdminModalOpen(true);
              }
            }}
            isAuthGate={false}
          />
        )}

        {upgradeModalOpen && (
          <UpgradeModal
            isOpen={upgradeModalOpen}
            onClose={() => setUpgradeModalOpen(false)}
          />
        )}
      </Suspense>

      {/* 7. Feedback Elements */}
      <DynamicIslandBanner />
      <ToastContainer />
    </>
  );
}
