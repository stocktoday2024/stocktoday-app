// Free Real-Time Quotes Fetcher via Yahoo Finance public API
// Supports 24/7 assets (e.g. BTC-USD, ETH-USD) & Indian market symbols (NSE/BSE)

export interface LiveQuote {
  symbol: string;
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  high: number;
  low: number;
  volume: string;
  is24x7?: boolean;
  currency?: string;
  lastUpdated: string;
}

// In-memory cache to avoid rate limits
const quoteCache: Record<string, { data: LiveQuote; timestamp: number }> = {};
const CACHE_TTL_MS = 15000; // 15 seconds

export async function fetchLiveQuote(symbol: string, displayName?: string, is24x7 = false): Promise<LiveQuote | null> {
  const now = Date.now();
  if (quoteCache[symbol] && now - quoteCache[symbol].timestamp < CACHE_TTL_MS) {
    return quoteCache[symbol].data;
  }

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
      next: { revalidate: 15 },
    });

    if (!res.ok) return null;
    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result?.meta) return null;

    const meta = result.meta;
    const price = meta.regularMarketPrice ?? meta.fulldayPrice ?? 0;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const change = Number((price - prevClose).toFixed(2));
    const changePct = prevClose > 0 ? Number(((change / prevClose) * 100).toFixed(2)) : 0;
    const high = meta.regularMarketDayHigh ?? price;
    const low = meta.regularMarketDayLow ?? price;
    const rawVol = meta.regularMarketVolume ?? 0;

    let volume = "0";
    if (rawVol >= 10000000) {
      volume = `${(rawVol / 10000000).toFixed(2)} Cr`;
    } else if (rawVol >= 100000) {
      volume = `${(rawVol / 100000).toFixed(2)} L`;
    } else if (rawVol > 0) {
      volume = rawVol.toLocaleString("en-IN");
    }

    const liveQuote: LiveQuote = {
      symbol,
      ticker: displayName || meta.shortName || meta.symbol || symbol,
      name: meta.longName || meta.shortName || symbol,
      price: Number(price.toFixed(2)),
      change,
      changePct,
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      volume,
      is24x7,
      currency: meta.currency || "INR",
      lastUpdated: new Date().toISOString(),
    };

    quoteCache[symbol] = { data: liveQuote, timestamp: now };
    return liveQuote;
  } catch (err) {
    console.error(`Failed to fetch quote for ${symbol}:`, err);
    return null;
  }
}

export const LIVE_TICKERS_CONFIG = [
  { symbol: "^NSEI", display: "NIFTY 50", is24x7: false },
  { symbol: "^BSESN", display: "SENSEX", is24x7: false },
  { symbol: "^NSEBANK", display: "BANK NIFTY", is24x7: false },
  { symbol: "RELIANCE.NS", display: "RELIANCE", is24x7: false },
  { symbol: "TCS.NS", display: "TCS", is24x7: false },
  { symbol: "HDFCBANK.NS", display: "HDFC BANK", is24x7: false },
  { symbol: "INFY.NS", display: "INFY", is24x7: false },
  { symbol: "TATAMOTORS.NS", display: "TATA MOTORS", is24x7: false },
  { symbol: "BTC-USD", display: "BITCOIN 24/7", is24x7: true },
  { symbol: "ETH-USD", display: "ETHEREUM 24/7", is24x7: true },
];
