import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { HabitsProvider } from './context/HabitsContext';
import { LanguageProvider } from './context/LanguageContext';
import { App } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <HabitsProvider>
          <App />
        </HabitsProvider>
      </AuthProvider>
    </LanguageProvider>
  </React.StrictMode>
);
