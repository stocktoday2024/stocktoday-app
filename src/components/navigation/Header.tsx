"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./Header.module.css";
import { LanguageSwitch } from "./LanguageSwitch";
import { ThemeToggle } from "./ThemeToggle";
import { SavedStories } from "@/components/reader/SavedStories";
import { useLanguage } from "@/context/LanguageContext";

const NAV_ITEMS_BY_LOCALE = {
  EN: [
    { href: "/", label: "Home" },
    { href: "/markets", label: "Markets" },
    { href: "/companies", label: "Companies" },
    { href: "/ipos", label: "IPOs", badge: "HOT" },
    { href: "/newspaper", label: "Newspaper" },
    { href: "/gujarat-pulse", label: "Gujarat Pulse", isTeal: true },
    { href: "/glossary", label: "Learn" },
  ],
  GU: [
    { href: "/", label: "હોમ" },
    { href: "/markets", label: "માર્કેટ્સ" },
    { href: "/companies", label: "કંપનીઓ" },
    { href: "/ipos", label: "IPO", badge: "હોટ" },
    { href: "/newspaper", label: "અખબાર" },
    { href: "/gujarat-pulse", label: "ગુજરાત પલ્સ", isTeal: true },
    { href: "/glossary", label: "શીખો" },
  ],
  HI: [
    { href: "/", label: "होम" },
    { href: "/markets", label: "बाज़ार" },
    { href: "/companies", label: "कंपनियां" },
    { href: "/ipos", label: "IPO", badge: "हॉट" },
    { href: "/newspaper", label: "अख़बार" },
    { href: "/gujarat-pulse", label: "गुजरात पल्स", isTeal: true },
    { href: "/glossary", label: "सीखें" },
  ],
};

const HEADER_TEXT = {
  EN: {
    tagline: "Indian markets · EN ગુ हि",
    searchPlaceholder: "Search stocks, news & companies...",
    searchKbd: "⌘K",
    liveAutoUpdate: "LIVE AUTO-UPDATE",
  },
  GU: {
    tagline: "ભારતીય બજારો · EN ગુ हि",
    searchPlaceholder: "શેર, સમાચાર અને કંપનીઓ શોધો...",
    searchKbd: "⌘K",
    liveAutoUpdate: "લાઇવ ઓટો-અપડેટ",
  },
  HI: {
    tagline: "भारतीय बाज़ार · EN ગુ हि",
    searchPlaceholder: "शेयर, समाचार और कंपनियां खोजें...",
    searchKbd: "⌘K",
    liveAutoUpdate: "लाइव ऑटो-अपडेट",
  },
};

function formatCurrentDate(locale: string): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  const langTag = locale === "GU" ? "gu-IN" : locale === "HI" ? "hi-IN" : "en-IN";
  return now.toLocaleDateString(langTag, options);
}

export function Header() {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const [savedCount, setSavedCount] = useState<number>(0);

  const navItems = NAV_ITEMS_BY_LOCALE[locale] || NAV_ITEMS_BY_LOCALE.EN;
  const t = HEADER_TEXT[locale] || HEADER_TEXT.EN;
  const formattedDate = formatCurrentDate(locale);

  useEffect(() => {
    const updateCount = () => {
      try {
        const bm = JSON.parse(localStorage.getItem("st-bookmarks") || "[]");
        const wl = JSON.parse(localStorage.getItem("st-watchlist") || "[]");
        setSavedCount(bm.length + wl.length);
      } catch {
        setSavedCount(0);
      }
    };
    updateCount();
    window.addEventListener("storage", updateCount);
    return () => window.removeEventListener("storage", updateCount);
  }, []);

  return (
    <div className={styles.headerWrapper}>
      {/* ── ROW A (72px) ────────────────────────────────────────── */}
      <header className={styles.rowA}>
        <div className={styles.rowAInner}>
          {/* Logo */}
          <Link href="/" className={styles.brand} aria-label="StockToday Home">
            <div className={styles.brandBadge} style={{ overflow: "hidden", position: "relative" }}>
              <Image
                src="/StockTodayLogo.jpeg"
                alt="StockToday Logo"
                width={38}
                height={38}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
                priority
              />
            </div>
            <div className={styles.brandText}>
              <span className={styles.brandTitle}>StockToday</span>
              <span className={styles.brandTagline}>{t.tagline}</span>
            </div>
          </Link>

          {/* Centered Search Pill */}
          <button
            type="button"
            className={styles.searchPill}
            onClick={() => window.dispatchEvent(new CustomEvent("open-search"))}
            aria-label="Open search dialog"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <span className={styles.searchText}>{t.searchPlaceholder}</span>
            <kbd className={styles.searchKbd}>{t.searchKbd}</kbd>
          </button>

          {/* Actions: Editor Login + Theme Toggle + Language Switch */}
          <div className={styles.actions}>
            <Link
              href="/editorial/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12,
                fontWeight: 600,
                color: "var(--foreground)",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid var(--border-color)",
                padding: "6px 12px",
                borderRadius: 8,
                textDecoration: "none",
                transition: "all 0.15s ease",
              }}
              title="Editorial Desk Login"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span>Editor Login</span>
            </Link>
            <ThemeToggle />
            <LanguageSwitch />
          </div>
        </div>
      </header>

      {/* ── ROW B (44px) ────────────────────────────────────────── */}
      <nav className={styles.rowB} aria-label="Primary Navigation">
        <div className={styles.rowBInner}>
          {/* Navigation Links */}
          <div className={styles.navRow}>
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href.split("#")[0]);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""} ${
                    item.isTeal ? styles.tealText : ""
                  }`}
                >
                  {item.label}
                  {item.badge && <span className={styles.hotTag}>{item.badge}</span>}
                </Link>
              );
            })}
          </div>

          {/* Right Side: Saved + Date + Live Auto-Update Indicator */}
          <div className={styles.rowBRight}>
            <SavedStories triggerOnlyIconCount={true} count={savedCount} />
            <span>·</span>
            <span suppressHydrationWarning>{formattedDate}</span>
            <span>·</span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                color: "var(--teal)",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.03em",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "var(--teal)",
                  boxShadow: "0 0 8px var(--teal)",
                  display: "inline-block",
                  animation: "pulse 1.8s infinite ease-in-out",
                }}
              />
              {t.liveAutoUpdate}
            </span>
          </div>
        </div>
      </nav>
    </div>
  );
}
