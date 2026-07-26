import { createContext, useContext, useEffect, useState } from 'react';
import {
  DEFAULT_LANGUAGE,
  STORAGE_KEY,
  findLanguage,
} from '../lib/languages';

const LanguageContext = createContext(null);

// App-wide language preference. Persisted to localStorage so the choice
// survives reloads, and mirrored onto <html lang> for a11y and Intl.
export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANGUAGE;
    } catch {
      return DEFAULT_LANGUAGE;
    }
  });

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      /* private mode — keep the in-memory choice */
    }
  }, [language]);

  const setLanguage = (code) => setLanguageState(findLanguage(code).code);

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, current: findLanguage(language) }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  return useContext(LanguageContext);
}
