import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { HabitsProvider } from './context/HabitsContext';
import { LanguageProvider } from './context/LanguageContext';
import { PWAProvider } from './context/PWAContext';
import { App } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <HabitsProvider>
          <PWAProvider>
            <App />
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

