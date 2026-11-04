"use client";

import { ReactNode } from "react";
import { LanguageProvider } from "@/context/LanguageContext";
import { QuotesProvider } from "@/context/QuotesContext";
import type { Locale } from "@/types";

export function ClientProviders({
  children,
  initialLocale = "EN",
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  return (
    <LanguageProvider initialLocale={initialLocale}>
      <QuotesProvider>
        {children}
      </QuotesProvider>
    </LanguageProvider>
  );
}
