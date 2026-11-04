"use client";

import { useEffect, useState } from "react";
import styles from "./TickerTape.module.css";
import { getMarketStatus } from "@/lib/marketData";

interface TickerQuote {
  symbol: string;
  ticker: string;
  price: number;
  changePct: number;
  change: number;
}

// Indian indices and large caps only
const INITIAL_INDIAN_TICKERS: TickerQuote[] = [
  { symbol: "^NSEI", ticker: "NIFTY 50", price: 23440.8, changePct: 1.68, change: 387.7 },
  { symbol: "^BSESN", ticker: "SENSEX", price: 75692.78, changePct: 1.66, change: 1233.25 },
  { symbol: "^NSEBANK", ticker: "BANK NIFTY", price: 55002.2, changePct: 0.58, change: 315.25 },
  { symbol: "RELIANCE.NS", ticker: "RELIANCE", price: 1300.0, changePct: 11.6, change: 135.1 },
  { symbol: "TCS.NS", ticker: "TCS", price: 2501.7, changePct: -0.04, change: -0.9 },
  { symbol: "HDFCBANK.NS", ticker: "HDFC BANK", price: 700.0, changePct: 1.04, change: 7.2 },
  { symbol: "INFY.NS", ticker: "INFY", price: 1161.0, changePct: -2.03, change: -24.0 },
];

export function TickerTape() {
  const [quotes, setQuotes] = useState<TickerQuote[]>(INITIAL_INDIAN_TICKERS);
  const [marketStatus, setMarketStatus] = useState(getMarketStatus());
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Hide ticker when page is scrolled down (> 40px)
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadLiveQuotes() {
      try {
        const res = await fetch("/api/quotes", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted) return;

        if (data?.marketStatus) {
          setMarketStatus({
            isOpen: data.isMarketOpen,
            statusText: data.marketStatus,
            sessionDescription: data.sessionDescription,
          });
        }

        if (data?.tickers && Array.isArray(data.tickers) && data.tickers.length > 0) {
          // Filter to Indian tickers only just in case
          const filtered = data.tickers.filter(
            (t: { ticker: string }) => !t.ticker.includes("BITCOIN") && !t.ticker.includes("ETHEREUM")
          );
          if (filtered.length > 0) {
            setQuotes(filtered);
          }
        }
      } catch (err) {
        console.error("Failed to load ticker tape:", err);
      }
    }

    loadLiveQuotes();
    const interval = setInterval(loadLiveQuotes, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Content duplicated once for seamless loop
  const loopQuotes = [...quotes, ...quotes];

  if (isScrolled) {
    return null; // Ticker hides on scroll
  }

  return (
    <aside
      className={styles.tickerContainer}
      aria-label="Indian stock market live quotes ticker"
      role="region"
    >
      {/* Fixed Left Badge */}
      <div className={styles.statusBadge}>
        <div
          className={`${styles.statusPill} ${
            marketStatus.isOpen ? styles.pillOpen : styles.pillClosed
          }`}
        >
          <span
            className={`${styles.statusDot} ${
              marketStatus.isOpen ? styles.dotOpen : styles.dotClosed
            }`}
          />
          {marketStatus.isOpen ? "MARKET OPEN" : "MARKET CLOSED"}
        </div>
        <span className={styles.statusSubtitle}>
          {marketStatus.isOpen ? "Live till 3:30 PM IST" : "Opens 9:15 AM IST"}
        </span>
      </div>

      {/* CSS-only Marquee */}
      <div className={styles.marqueeWrapper}>
        <div className={styles.track}>
          {loopQuotes.map((item, idx) => {
            const formattedPrice = item.price.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });

            return (
              <span key={`${item.symbol || item.ticker}-${idx}`} className={styles.item}>
                <span className={styles.itemName}>{item.ticker}</span>
                <span className={styles.itemPrice}>₹{formattedPrice}</span>
                <span className={item.changePct >= 0 ? styles.itemChangeUp : styles.itemChangeDown}>
                  {item.changePct >= 0 ? "▲" : "▼"} {Math.abs(item.changePct).toFixed(2)}%
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
