import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";

import i18n, {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  getLanguageDir,
  isLanguageCode,
  type LanguageCode,
} from "./i18n";

export type { LanguageCode };

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  dir: "ltr" | "rtl";
};

const LanguageContext = createContext<LanguageContextValue>({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  dir: "ltr",
});

function readStoredLanguage(): LanguageCode | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isLanguageCode(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE);

  // Restore the persisted language after hydration to avoid SSR mismatches.
  useEffect(() => {
    const stored = readStoredLanguage();
    if (stored && stored !== i18n.language) {
      void i18n.changeLanguage(stored);
      setLanguageState(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = language;
    // RTL-ready: direction is derived from the language table, not hardcoded.
    document.documentElement.dir = getLanguageDir(language);
  }, [language]);

  const setLanguage = useCallback((code: LanguageCode) => {
    void i18n.changeLanguage(code);
    setLanguageState(code);
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    } catch {
      /* storage unavailable — language still applies for this session */
    }
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <LanguageContext.Provider value={{ language, setLanguage, dir: getLanguageDir(language) }}>
        {children}
      </LanguageContext.Provider>
    </I18nextProvider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
