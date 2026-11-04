"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Locale } from "@/types";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: "EN",
  setLocale: () => {},
});

function getCookieLocale(): Locale {
  if (typeof document === "undefined") return "EN";
  const match = document.cookie.match(/st-lang=(EN|GU|HI)/);
  return (match?.[1] as Locale) ?? "EN";
}

export function LanguageProvider({
  children,
  initialLocale = "EN",
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    const c = getCookieLocale();
    if (c && c !== locale) {
      setLocaleState(c);
    }
  }, []);

  const setLocale = (code: Locale) => {
    setLocaleState(code);
    document.cookie = `st-lang=${code};path=/;max-age=${365 * 24 * 60 * 60}`;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
