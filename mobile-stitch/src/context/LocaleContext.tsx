import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { Locale } from '../i18n/strings';
import { strings } from '../i18n/strings';

type Strings = (typeof strings)[Locale];

type LocaleContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Strings;
  isRTL: boolean;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: strings[locale],
      isRTL: locale === 'ar',
    }),
    [locale, setLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
