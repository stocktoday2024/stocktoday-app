"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./MobileDrawer.module.css";
import { LanguageSwitch } from "./LanguageSwitch";
import { ThemeToggle } from "./ThemeToggle";
import { SavedStories } from "@/components/reader/SavedStories";

interface NavItem {
  href: string;
  label: string;
  badge?: string;
  isTeal?: boolean;
}

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  savedCount: number;
  formattedDate: string;
}

export function MobileDrawer({
  isOpen,
  onClose,
  navItems,
  savedCount,
  formattedDate,
}: MobileDrawerProps) {
  const pathname = usePathname();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className={styles.drawerOverlay}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={styles.drawerPanel}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
      >
        {/* Header with Logo + Close Button */}
        <div className={styles.drawerHeader}>
          <div className={styles.drawerLogoWrap}>
            <Image
              src="/StockTodayLogo.jpeg"
              alt="StockToday"
              width={120}
              height={38}
              style={{ objectFit: "contain", width: "auto", height: "100%" }}
            />
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Tools Bar: Theme, Language, Saved */}
        <div className={styles.drawerTools}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ThemeToggle />
            <SavedStories triggerOnlyIconCount={false} count={savedCount} />
          </div>
          <LanguageSwitch />
        </div>

        {/* Navigation Links */}
        <nav className={styles.drawerNavList}>
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href.split("#")[0]);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`${styles.drawerNavLink} ${
                  isActive ? styles.drawerNavLinkActive : ""
                } ${item.isTeal ? styles.drawerNavTeal : ""}`}
              >
                <span>{item.label}</span>
                {item.badge ? (
                  <span className={styles.drawerNavBadge}>{item.badge}</span>
                ) : (
                  <span className={styles.drawerNavArrow}>→</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer: Editor Desk Login & Date */}
        <div className={styles.drawerFooter}>
          <Link
            href="/editorial/login"
            onClick={onClose}
            className={styles.editorLoginBtn}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Editorial Desk Login</span>
          </Link>

          <div className={styles.drawerFooterMeta}>
            <span suppressHydrationWarning>{formattedDate}</span>
            <span style={{ color: "var(--teal)", fontWeight: 700 }}>● LIVE</span>
          </div>
        </div>
      </aside>
    </>
  );
}
