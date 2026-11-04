"use client";

import { useLanguage } from "@/context/LanguageContext";
import type { Locale } from "@/types";

const LANGUAGES = [
  { code: "EN" as Locale, label: "EN" },
  { code: "GU" as Locale, label: "ગુજરાતી" },
  { code: "HI" as Locale, label: "हिन्दी" },
];

export function LanguageSwitch() {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      style={{
        display: "inline-flex",
        gap: 2,
        background: "var(--bg)",
        borderRadius: "var(--radius-pill)",
        padding: 2,
        border: "1px solid var(--border)",
      }}
    >
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLocale(lang.code)}
          aria-label={`Switch language to ${lang.label}`}
          aria-pressed={locale === lang.code}
          style={{
            padding: "3px 8px",
            borderRadius: "var(--radius-pill)",
            border: "none",
            background: locale === lang.code ? "var(--accent)" : "transparent",
            color: locale === lang.code ? "var(--bg)" : "var(--muted)",
            fontWeight: locale === lang.code ? 700 : 500,
            fontSize: "0.75rem",
            cursor: "pointer",
            transition: "all 0.15s ease",
            fontFamily: "var(--font-body)",
          }}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
