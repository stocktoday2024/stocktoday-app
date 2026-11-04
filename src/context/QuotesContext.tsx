"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface QuoteData {
  symbol?: string;
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  high: number;
  low: number;
  volume: string;
  lastUpdated: string;
}

interface QuotesContextValue {
  quotes: Record<string, QuoteData>;
  rawList: QuoteData[];
  isLoading: boolean;
  lastUpdated: string | null;
  isMarketOpen: boolean;
  marketStatus: string;
  refresh: () => Promise<void>;
}

const QuotesContext = createContext<QuotesContextValue>({
  quotes: {},
  rawList: [],
  isLoading: true,
  lastUpdated: null,
  isMarketOpen: false,
  marketStatus: "Market Closed",
  refresh: async () => {},
});

export function QuotesProvider({ children }: { children: ReactNode }) {
  const [quotes, setQuotes] = useState<Record<string, QuoteData>>({});
  const [rawList, setRawList] = useState<QuoteData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [marketStatus, setMarketStatus] = useState("Market Closed");

  const fetchQuotes = useCallback(async () => {
    try {
      const res = await fetch("/api/quotes", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();

      if (data?.tickers && Array.isArray(data.tickers)) {
        const map: Record<string, QuoteData> = {};
        const list: QuoteData[] = [];

        for (const t of data.tickers) {
          const item: QuoteData = {
            symbol: t.symbol,
            ticker: t.ticker,
            name: t.name || t.ticker,
            price: Number(t.price) || 0,
            change: Number(t.change) || 0,
            changePct: Number(t.changePct) || 0,
            high: Number(t.high) || t.price || 0,
            low: Number(t.low) || t.price || 0,
            volume: t.volume || "—",
            lastUpdated: t.lastUpdated || new Date().toISOString(),
          };

          list.push(item);

          // Index by exact ticker
          map[t.ticker] = item;
          // Index by uppercase
          map[t.ticker.toUpperCase()] = item;
          // Index without spaces
          map[t.ticker.replace(/\s+/g, "").toUpperCase()] = item;

          // Index by symbol if available
          if (t.symbol) {
            map[t.symbol] = item;
            const cleanSym = t.symbol.replace(/\.NS|\.BO|\^/g, "").toUpperCase();
            map[cleanSym] = item;
          }
        }

        // Special aliases for Tata Motors
        if (map["TATA MOTORS"] || map["TMCV"]) {
          const tm = map["TATA MOTORS"] || map["TMCV"];
          map["TATAMOTORS"] = tm;
          map["TATA MOTORS"] = tm;
        }

        setQuotes(map);
        setRawList(list);
        setLastUpdated(new Date().toISOString());
      }

      if (data?.isMarketOpen !== undefined) setIsMarketOpen(data.isMarketOpen);
      if (data?.marketStatus) setMarketStatus(data.marketStatus);
    } catch (err) {
      console.error("Failed to fetch live quotes:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotes();
    // Auto-refresh every 10 seconds for real-time live market updates
    const interval = setInterval(fetchQuotes, 10000);
    return () => clearInterval(interval);
  }, [fetchQuotes]);

  return (
    <QuotesContext.Provider value={{ quotes, rawList, isLoading, lastUpdated, isMarketOpen, marketStatus, refresh: fetchQuotes }}>
      {children}
    </QuotesContext.Provider>
  );
}

export function useQuotes() {
  return useContext(QuotesContext);
}
