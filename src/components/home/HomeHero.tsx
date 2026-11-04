"use client";

import Link from "next/link";
import styles from "./HomeHero.module.css";
import { useQuotes } from "@/context/QuotesContext";
import { useLanguage } from "@/context/LanguageContext";

const HERO_TEXT = {
  EN: {
    kicker: "Indian Equity & Financial Digest",
    heading: (
      <>Daily stock news in <span className={styles.langEn}>English</span>,{" "}
        <span className={styles.langGu}>ગુજરાતી</span>, and{" "}
        <span className={styles.langHi}>हिन्दी</span>.</>
    ),
    supporting: "Clear coverage of Indian markets, company news and Gujarat business. Every story is reviewed by editors and links to its source.",
    digestBtn: "Read today\u0027s digest →",
    ipoBtn: "Explore IPOs",
    trustLine: "Source linked · Reviewed by editors · Not investment advice",
    snapshotTitle: "Market snapshot",
    delayedTag: "Live · Auto-Refresh",
    moodLabel: "Market mood",
  },
  GU: {
    kicker: "ભારતીય ઇક્વિટી અને ફાઇનાન્સિયલ ડાઇજેસ્ટ",
    heading: (
      <>દૈનિક શેરબજારના સમાચાર <span className={styles.langEn}>English</span>,{" "}
        <span className={styles.langGu}>ગુજરાતી</span>, અને{" "}
        <span className={styles.langHi}>हिन्दी</span> માં.</>
    ),
    supporting: "ભારતીય બજારો, કંપની સમાચાર અને ગુજરાત બિઝનેસનું સ્પષ્ટ કવરેજ. દરેક વાર્તા એડિટર દ્વારા ચકાસાયેલ છે.",
    digestBtn: "આજનું ડાઇજેસ્ટ વાંચો →",
    ipoBtn: "IPO શોધો",
    trustLine: "સ્ત્રોત લિંક્ડ · એડિટર ચકાસિત · રોકાણ સલાહ નથી",
    snapshotTitle: "બજાર સ્નેપશોટ",
    delayedTag: "લાઇવ · ઓટો-અપડેટ",
    moodLabel: "બજારનો મૂડ",
  },
  HI: {
    kicker: "भारतीय इक्विटी और फाइनेंशियल डाइजेस्ट",
    heading: (
      <>दैनिक शेयर बाज़ार समाचार <span className={styles.langEn}>English</span>,{" "}
        <span className={styles.langGu}>ગુજરાતી</span>, और{" "}
        <span className={styles.langHi}>हिन्दी</span> में.</>
    ),
    supporting: "भारतीय बाजारों, कंपनी समाचार और गुजरात बिजनेस की स्पष्ट कवरेज। हर खबर संपादक द्वारा जांची गई है।",
    digestBtn: "आज का डाइजेस्ट पढ़ें →",
    ipoBtn: "IPO देखें",
    trustLine: "स्रोत लिंक्ड · संपादक द्वारा जांचा · निवेश सलाह नहीं",
    snapshotTitle: "बाज़ार स्नैपशॉट",
    delayedTag: "लाइव · ऑटो-अपडेट",
    moodLabel: "बाज़ार का मूड",
  },
};

function IndexSparkline({ points, color, id }: { points: number[]; color: string; id: string }) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const width = 80;
  const height = 32;

  const coords = points.map((val, idx) => {
    const x = (idx / (points.length - 1)) * (width - 6) + 3;
    const y = height - 4 - ((val - min) / range) * (height - 8);
    return { x, y };
  });

  const polylinePoints = coords.map((c) => `${c.x},${c.y}`).join(" ");
  const polygonPoints = `3,${height} ${polylinePoints} ${width - 3},${height}`;

  return (
    <svg
      className={styles.indexSvg}
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: "80px", height: "32px", flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <polygon points={polygonPoints} fill={`url(#grad-${id})`} />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={polylinePoints}
      />
    </svg>
  );
}

function formatPrice(price: number): string {
  return price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function HomeHero() {
  const { quotes, isLoading } = useQuotes();
  const { locale } = useLanguage();
  const t = HERO_TEXT[locale];

  const sensex = quotes["SENSEX"];
  const nifty = quotes["NIFTY 50"];
  const bankNifty = quotes["BANK NIFTY"];

  // Generate fake sparklines from price if we have it
  const makeSparkline = (price: number, changePct: number) => {
    const base = price / (1 + changePct / 100);
    return Array.from({ length: 6 }, (_, i) => base + (price - base) * (i / 5) + (Math.random() - 0.5) * price * 0.002);
  };

  const indices = [
    {
      name: "SENSEX",
      val: sensex ? formatPrice(sensex.price) : "—",
      pct: sensex ? sensex.changePct : 0,
      sparkline: sensex ? makeSparkline(sensex.price, sensex.changePct) : [0],
      color: "#2DD4BF",
      id: "sensex",
    },
    {
      name: "NIFTY 50",
      val: nifty ? formatPrice(nifty.price) : "—",
      pct: nifty ? nifty.changePct : 0,
      sparkline: nifty ? makeSparkline(nifty.price, nifty.changePct) : [0],
      color: "#FBBF24",
      id: "nifty",
    },
    {
      name: "BANK NIFTY",
      val: bankNifty ? formatPrice(bankNifty.price) : "—",
      pct: bankNifty ? bankNifty.changePct : 0,
      sparkline: bankNifty ? makeSparkline(bankNifty.price, bankNifty.changePct) : [0],
      color: "#F472B6",
      id: "banknifty",
    },
  ];

  return (
    <section className={styles.heroGrid} aria-label="Introduction and Market Snapshot">
      {/* ── Left Column ─────────────────────────────────── */}
      <div className={styles.leftCol}>
        <div className={styles.kicker}>
          <span className={styles.kickerSpark}>✦</span>
          <span>{t.kicker}</span>
        </div>

        <h1 className={styles.heading}>{t.heading}</h1>

        <p className={styles.supportingText}>{t.supporting}</p>

        <div className={styles.buttonRow}>
          <Link href="/markets" className={styles.digestBtn}>
            {t.digestBtn}
          </Link>
          <Link href="/ipos" className={styles.exploreIposBtn}>
            {t.ipoBtn}
          </Link>
        </div>

        <div className={styles.trustLine}>
          <span>{t.trustLine}</span>
        </div>
      </div>

      {/* ── Right Column: Market snapshot ───────────────── */}
      <div className={styles.snapshotPanel}>
        <div className={styles.snapshotHeader}>
          <div className={styles.snapshotTitle}>{t.snapshotTitle}</div>
          <span className={styles.delayedTag}>{isLoading ? "Loading…" : t.delayedTag}</span>
        </div>

        {/* Mood Bar */}
        <div className={styles.moodSection}>
          <div className={styles.moodTopRow}>
            <span className={styles.moodLabel}>{t.moodLabel}</span>
            <span className={styles.moodStatus}>▲ Bullish</span>
          </div>
          <div className={styles.moodBarTrack}>
            <div className={styles.moodBarFill} />
          </div>
        </div>

        {/* Index Rows — live from API */}
        <div className={styles.indexList}>
          {indices.map((idx) => {
            const isUp = idx.pct >= 0;
            return (
              <div className={styles.indexRow} key={idx.id}>
                <div className={styles.indexInfo}>
                  <span className={styles.indexName}>{idx.name}</span>
                  <span className={styles.indexVal}>{idx.val}</span>
                </div>
                {idx.sparkline.length > 1 && (
                  <IndexSparkline points={idx.sparkline} color={idx.color} id={idx.id} />
                )}
                <div className={isUp ? styles.indexChangeUp : styles.indexChangeDown}>
                  {isUp ? "▲" : "▼"} {Math.abs(idx.pct).toFixed(2)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
