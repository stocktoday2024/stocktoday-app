"use client";

import { useLanguage } from "@/context/LanguageContext";
import type { Locale } from "@/types";
import styles from "./LanguageSwitch.module.css";

const LANGUAGES = [
  { code: "EN" as Locale, label: "EN" },
  { code: "GU" as Locale, label: "ગુજરાતી" },
  { code: "HI" as Locale, label: "हिन्दी" },
];

export function LanguageSwitch() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className={styles.langContainer}>
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLocale(lang.code)}
          aria-label={`Switch language to ${lang.label}`}
          aria-pressed={locale === lang.code}
          className={`${styles.langBtn} ${
            locale === lang.code ? styles.langBtnActive : ""
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
