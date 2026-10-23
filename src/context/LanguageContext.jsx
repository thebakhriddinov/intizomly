import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TRANSLATIONS } from '../utils/translations';
import { storage } from '../utils/storage';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const s = storage.getSettings();
    return s.language || 'uz';
  });

  const setLanguage = useCallback((newLang) => {
    if (['uz', 'ru', 'en'].includes(newLang)) {
      setLangState(newLang);
      storage.saveSettings({ language: newLang });
      document.documentElement.setAttribute('lang', newLang);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const t = useCallback((key, fallback = '') => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.uz;
    return dict[key] !== undefined ? dict[key] : (TRANSLATIONS.uz[key] || fallback || key);
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
