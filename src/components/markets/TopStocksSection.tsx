"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./TopStocksSection.module.css";
import { useQuotes, QuoteData } from "@/context/QuotesContext";
import { useLanguage } from "@/context/LanguageContext";

interface StockCardData {
  ticker: string;
  displayTicker: string;
  name: string;
  sector: string;
  initial: string;
  sectorColor: string;
  isGujarat?: boolean;
  defaultPrice: number;
  defaultChangePct: number;
  defaultLow: number;
  defaultHigh: number;
  defaultVol: string;
}

const STOCK_META: Record<string, StockCardData[]> = {
  gainers: [
    { ticker: "RELIANCE", displayTicker: "RELIANCE", name: "Reliance Industries", sector: "Energy", initial: "R", sectorColor: "#2DD4BF", defaultPrice: 1311.0, defaultChangePct: 0.24, defaultLow: 1302, defaultHigh: 1320, defaultVol: "4.8 Cr" },
    { ticker: "SBIN", displayTicker: "SBIN", name: "State Bank of India", sector: "Banking", initial: "S", sectorColor: "#34D399", defaultPrice: 982.5, defaultChangePct: 1.47, defaultLow: 968, defaultHigh: 990, defaultVol: "3.5 Cr" },
    { ticker: "HDFC BANK", displayTicker: "HDFC BANK", name: "HDFC Bank Ltd", sector: "Banking", initial: "H", sectorColor: "#FBBF24", defaultPrice: 704.5, defaultChangePct: 0.85, defaultLow: 695, defaultHigh: 710, defaultVol: "3.2 Cr" },
    { ticker: "TATA MOTORS", displayTicker: "TATA MOTORS", name: "Tata Motors Ltd", sector: "Auto", initial: "T", sectorColor: "#60A5FA", defaultPrice: 402.8, defaultChangePct: 0.42, defaultLow: 398, defaultHigh: 409, defaultVol: "2.8 Cr" },
  ],
  losers: [
    { ticker: "INFY", displayTicker: "INFY", name: "Infosys Limited", sector: "IT Services", initial: "I", sectorColor: "#A78BFA", defaultPrice: 1165.0, defaultChangePct: -1.2, defaultLow: 1150, defaultHigh: 1180, defaultVol: "2.2 Cr" },
    { ticker: "TCS", displayTicker: "TCS", name: "Tata Consultancy", sector: "IT Services", initial: "T", sectorColor: "#60A5FA", defaultPrice: 2436.0, defaultChangePct: -2.52, defaultLow: 2420, defaultHigh: 2510, defaultVol: "1.4 Cr" },
    { ticker: "ICICI BANK", displayTicker: "ICICI BANK", name: "ICICI Bank Ltd", sector: "Banking", initial: "I", sectorColor: "#34D399", defaultPrice: 1380.0, defaultChangePct: -0.45, defaultLow: 1365, defaultHigh: 1395, defaultVol: "2.1 Cr" },
    { ticker: "HCLTECH", displayTicker: "HCLTECH", name: "HCL Technologies", sector: "IT Services", initial: "H", sectorColor: "#A78BFA", defaultPrice: 1810.0, defaultChangePct: -0.9, defaultLow: 1795, defaultHigh: 1835, defaultVol: "90 L" },
  ],
  active: [
    { ticker: "RELIANCE", displayTicker: "RELIANCE", name: "Reliance Industries", sector: "Energy", initial: "R", sectorColor: "#F59E0B", defaultPrice: 1311.0, defaultChangePct: 0.24, defaultLow: 1302, defaultHigh: 1320, defaultVol: "4.8 Cr" },
    { ticker: "SBIN", displayTicker: "SBIN", name: "State Bank of India", sector: "Banking", initial: "S", sectorColor: "#34D399", defaultPrice: 982.5, defaultChangePct: 1.47, defaultLow: 968, defaultHigh: 990, defaultVol: "3.5 Cr" },
    { ticker: "HDFC BANK", displayTicker: "HDFC BANK", name: "HDFC Bank Ltd", sector: "Banking", initial: "H", sectorColor: "#34D399", defaultPrice: 704.5, defaultChangePct: 0.85, defaultLow: 695, defaultHigh: 710, defaultVol: "3.2 Cr" },
    { ticker: "TATA MOTORS", displayTicker: "TATA MOTORS", name: "Tata Motors Ltd", sector: "Auto", initial: "T", sectorColor: "#60A5FA", defaultPrice: 402.8, defaultChangePct: 0.42, defaultLow: 398, defaultHigh: 409, defaultVol: "2.8 Cr" },
  ],
  gujarat: [
    { ticker: "ADANIENT", displayTicker: "ADANIENT", name: "Adani Enterprises", sector: "Ahmedabad HQ / Infra", initial: "A", sectorColor: "#2DD4BF", isGujarat: true, defaultPrice: 2650.0, defaultChangePct: 1.4, defaultLow: 2580, defaultHigh: 2680, defaultVol: "98 L" },
    { ticker: "TATA MOTORS", displayTicker: "TATA MOTORS", name: "Tata Motors (Sanand)", sector: "Sanand EV Hub", initial: "T", sectorColor: "#2DD4BF", isGujarat: true, defaultPrice: 402.8, defaultChangePct: 0.42, defaultLow: 398, defaultHigh: 409, defaultVol: "2.8 Cr" },
    { ticker: "RELIANCE", displayTicker: "RELIANCE", name: "Reliance (Jamnagar)", sector: "Jamnagar Refinery", initial: "R", sectorColor: "#2DD4BF", isGujarat: true, defaultPrice: 1311.0, defaultChangePct: 0.24, defaultLow: 1302, defaultHigh: 1320, defaultVol: "4.8 Cr" },
    { ticker: "GUJGASLTD", displayTicker: "GUJGASLTD", name: "Gujarat Gas Limited", sector: "City Gas Distrib.", initial: "G", sectorColor: "#2DD4BF", isGujarat: true, defaultPrice: 542.4, defaultChangePct: 1.56, defaultLow: 530, defaultHigh: 548, defaultVol: "18 L" },
  ],
};

const SECTION_TEXT = {
  EN: { title: "Top stocks today", subtitle: "Biggest large-cap movers · Live auto-updating data", gainers: "Gainers", losers: "Losers", active: "Most active", gujarat: "Gujarat", viewAll: "View all stocks →" },
  GU: { title: "આજના ટોપ શેર", subtitle: "સૌથી મોટા લાર્જ-કેપ મૂવર્સ · લાઇવ ઓટો-અપડેટિંગ ડેટા", gainers: "ગેઈનર્સ", losers: "લૂઝર્સ", active: "સૌથી સક્રિય", gujarat: "ગુજરાત", viewAll: "બધા શેર જુઓ →" },
  HI: { title: "आज के टॉप शेयर", subtitle: "सबसे बड़े लार्ज-कैप मूवर्स · लाइव ऑटो-अपडेटिंग डेटा", gainers: "गेनर्स", losers: "लूज़र्स", active: "सबसे सक्रिय", gujarat: "गुजरात", viewAll: "सभी शेयर देखें →" },
};

function MiniSparkline({ data, isUp }: { data: number[]; isUp: boolean }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 240;
  const height = 56;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * (width - 10) + 5;
      const y = height - 6 - ((val - min) / range) * (height - 14);
      return `${x},${y}`;
    })
    .join(" ");

  const color = isUp ? "var(--up)" : "var(--down)";

  return (
    <div style={{ width: "100%", height: 56, overflow: "hidden" }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "100%", display: "block" }} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`fill-${isUp ? "up" : "down"}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <polygon points={`5,${height} ${points} ${width - 5},${height}`} fill={`url(#fill-${isUp ? "up" : "down"})`} />
        <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
      </svg>
    </div>
  );
}

function makeSparkline(price: number, changePct: number): number[] {
  const base = price / (1 + changePct / 100);
  return Array.from({ length: 7 }, (_, i) => base + (price - base) * (i / 6) + (Math.random() - 0.5) * price * 0.003);
}

export function TopStocksSection() {
  const [activeTab, setActiveTab] = useState<"gainers" | "losers" | "active" | "gujarat">("gainers");
  const { quotes } = useQuotes();
  const { locale } = useLanguage();
  const t = SECTION_TEXT[locale] || SECTION_TEXT.EN;
  const items = STOCK_META[activeTab] || STOCK_META.gainers;

  return (
    <section className={styles.sectionWrapper} aria-labelledby="top-stocks-title">
      <div className={styles.headerRow}>
        <div>
          <h2 id="top-stocks-title" className={styles.heading}>{t.title}</h2>
          <p className={styles.subtitle}>{t.subtitle}</p>
        </div>
        <div className={styles.tabList} role="tablist">
          {(["gainers", "losers", "active", "gujarat"] as const).map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ""} ${tab === "gujarat" ? styles.gujaratTab : ""} ${tab === "gujarat" && activeTab === tab ? styles.gujaratTabActive : ""}`}
            >
              {t[tab]}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.grid}>
        {items.map((stock) => {
          const q: QuoteData | undefined =
            quotes[stock.displayTicker] ||
            quotes[stock.ticker] ||
            quotes[stock.ticker.replace(/\s+/g, "")];

          const price = q?.price && q.price > 0 ? q.price : stock.defaultPrice;
          const changePct = q?.changePct ?? stock.defaultChangePct;
          const high = q?.high && q.high > 0 ? q.high : stock.defaultHigh;
          const low = q?.low && q.low > 0 ? q.low : stock.defaultLow;
          const volume = q?.volume && q.volume !== "—" ? q.volume : stock.defaultVol;
          const isUp = changePct >= 0;
          const sparkline = makeSparkline(price, changePct);

          return (
            <Link key={`${stock.ticker}-${stock.sector}`} href={`/company/${stock.ticker.replace(/\s+/g, "")}`} className={styles.card} tabIndex={0}>
              <div className={styles.cardHeader}>
                <div className={styles.initialBadge} style={{ background: stock.sectorColor, color: "#0B1020" }}>
                  {stock.initial}
                </div>
                <div style={{ overflow: "hidden" }}>
                  <div className={styles.cardTicker}>{stock.ticker}</div>
                  <div className={styles.cardName}>{stock.name}</div>
                </div>
              </div>

              <div className={styles.priceValue}>
                ₹{price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>

              <div className={`${styles.changePill} ${isUp ? styles.changeUp : styles.changeDown}`}>
                {isUp ? "▲ +" : "▼ "}{changePct.toFixed(2)}%
              </div>

              <div className={styles.sparklineWrap}>
                <MiniSparkline data={sparkline} isUp={isUp} />
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.footerGroup}>
                  <span className={styles.footerLabel}>Day range</span>
                  <span className={styles.footerVal}>{low.toFixed(0)} – {high.toFixed(0)}</span>
                </div>
                <div className={styles.footerGroup} style={{ textAlign: "right" }}>
                  <span className={styles.footerLabel}>Volume</span>
                  <span className={styles.footerVal}>{volume}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className={styles.bottomLinkRow}>
        <Link href="/companies" className={styles.viewAllLink}>{t.viewAll}</Link>
      </div>
    </section>
  );
}
