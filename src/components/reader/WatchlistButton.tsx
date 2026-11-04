"use client";

import { useEffect, useState } from "react";

interface WatchlistButtonProps {
  ticker: string;
}

export function WatchlistButton({ ticker }: WatchlistButtonProps) {
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("st-watchlist") || "[]");
      setIsInWatchlist(stored.includes(ticker));
    } catch {
      setIsInWatchlist(false);
    }
  }, [ticker]);

  const toggleWatchlist = () => {
    try {
      const stored: string[] = JSON.parse(localStorage.getItem("st-watchlist") || "[]");
      let updated: string[];
      if (stored.includes(ticker)) {
        updated = stored.filter((t) => t !== ticker);
        setIsInWatchlist(false);
      } else {
        updated = [...stored, ticker];
        setIsInWatchlist(true);
      }
      localStorage.setItem("st-watchlist", JSON.stringify(updated));
    } catch {
      // Fallback
    }
  };

  return (
    <button
      onClick={toggleWatchlist}
      aria-label={isInWatchlist ? `Remove ${ticker} from watchlist` : `Add ${ticker} to watchlist`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 14px",
        borderRadius: "var(--radius-sm)",
        border: `1px solid ${isInWatchlist ? "var(--teal)" : "var(--border)"}`,
        background: isInWatchlist ? "rgba(45, 212, 191, 0.15)" : "var(--bg)",
        color: isInWatchlist ? "var(--teal)" : "var(--text)",
        fontSize: "0.8rem",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
    >
      <span>{isInWatchlist ? "✓" : "+"}</span>
      <span>{isInWatchlist ? "In Watchlist" : "Add to Watchlist"}</span>
    </button>
  );
}
