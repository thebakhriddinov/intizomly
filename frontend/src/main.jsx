import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { HabitsProvider } from './context/HabitsContext';
import { LanguageProvider } from './context/LanguageContext';
import { PWAProvider } from './context/PWAContext';
import { NotificationProvider } from './context/NotificationContext';
import { App } from './App';
import './index.css';

// iOS & PWA Standalone environment detection
if (typeof window !== 'undefined') {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isStandalone = Boolean(window.navigator.standalone) || 
    window.matchMedia('(display-mode: standalone)').matches;

  if (isIOS) {
    document.documentElement.classList.add('is-ios');
  }
  if (isStandalone) {
    document.documentElement.classList.add('is-standalone');
  }
  if (isIOS && isStandalone) {
    document.documentElement.classList.add('is-ios-pwa');
  }

  try {
    const standaloneMedia = window.matchMedia('(display-mode: standalone)');
    standaloneMedia.addEventListener?.('change', (e) => {
      if (e.matches) {
        document.documentElement.classList.add('is-standalone');
        if (isIOS) document.documentElement.classList.add('is-ios-pwa');
      } else {
        document.documentElement.classList.remove('is-standalone');
        document.documentElement.classList.remove('is-ios-pwa');
      }
    });
  } catch {}
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <HabitsProvider>
          <PWAProvider>
            <NotificationProvider>
              <App />
            </NotificationProvider>
          </PWAProvider>
        </HabitsProvider>
      </AuthProvider>
    </LanguageProvider>
  </React.StrictMode>
);

// PWA Service Worker Registration
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('[PWA] Service Worker registered with scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('[PWA] Service Worker registration failed:', err);
      });
  });
}

