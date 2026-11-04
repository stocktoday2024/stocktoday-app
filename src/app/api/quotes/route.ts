import { getMarketStatus } from "@/lib/marketData";
import { fetchLiveQuote } from "@/lib/realtimeQuotes";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// All Indian tickers used across the site
// Note: Tata Motors demerged into TMCV.NS (Commercial Vehicles/Holdco) and TMPV.NS (Passenger Vehicles)
const INDIAN_TICKERS = [
  { symbol: "^NSEI", display: "NIFTY 50" },
  { symbol: "^BSESN", display: "SENSEX" },
  { symbol: "^NSEBANK", display: "BANK NIFTY" },
  { symbol: "RELIANCE.NS", display: "RELIANCE" },
  { symbol: "TCS.NS", display: "TCS" },
  { symbol: "HDFCBANK.NS", display: "HDFC BANK" },
  { symbol: "INFY.NS", display: "INFY" },
  { symbol: "ICICIBANK.NS", display: "ICICI BANK" },
  { symbol: "SBIN.NS", display: "SBIN" },
  { symbol: "ADANIENT.NS", display: "ADANIENT" },
  { symbol: "TMCV.NS", display: "TATA MOTORS" },
  { symbol: "GUJGASLTD.NS", display: "GUJGASLTD" },
  { symbol: "BHARTIARTL.NS", display: "BHARTIARTL" },
  { symbol: "LT.NS", display: "L&T" },
  { symbol: "ITC.NS", display: "ITC" },
  { symbol: "AXISBANK.NS", display: "AXISBANK" },
  { symbol: "HINDUNILVR.NS", display: "HUL" },
  { symbol: "BAJFINANCE.NS", display: "BAJFINANCE" },
  { symbol: "MARUTI.NS", display: "MARUTI" },
  { symbol: "NTPC.NS", display: "NTPC" },
  { symbol: "TATASTEEL.NS", display: "TATASTEEL" },
  { symbol: "KOTAKBANK.NS", display: "KOTAKBANK" },
  { symbol: "SUNPHARMA.NS", display: "SUNPHARMA" },
  { symbol: "WIPRO.NS", display: "WIPRO" },
  { symbol: "HCLTECH.NS", display: "HCLTECH" },
  { symbol: "ULTRACEMCO.NS", display: "ULTRACEMCO" },
  { symbol: "ASIANPAINT.NS", display: "ASIANPAINT" },
  { symbol: "TITAN.NS", display: "TITAN" },
  { symbol: "BAJAJFINSV.NS", display: "BAJAJFINSV" },
  { symbol: "POWERGRID.NS", display: "POWERGRID" },
  { symbol: "NESTLEIND.NS", display: "NESTLEIND" },
  { symbol: "TECHM.NS", display: "TECHM" },
  { symbol: "ONGC.NS", display: "ONGC" },
  { symbol: "JSWSTEEL.NS", display: "JSWSTEEL" },
  { symbol: "INDUSINDBK.NS", display: "INDUSINDBK" },
  { symbol: "M%26M.NS", display: "M&M" },
  { symbol: "COALINDIA.NS", display: "COALINDIA" },
  { symbol: "DRREDDY.NS", display: "DRREDDY" },
  { symbol: "BRITANNIA.NS", display: "BRITANNIA" },
  { symbol: "CIPLA.NS", display: "CIPLA" },
  { symbol: "BPCL.NS", display: "BPCL" },
  { symbol: "EICHERMOT.NS", display: "EICHERMOT" },
  { symbol: "SHRIRAMFIN.NS", display: "SHRIRAMFIN" },
  { symbol: "DIVISLAB.NS", display: "DIVISLAB" },
  { symbol: "HEROMOTOCO.NS", display: "HEROMOTOCO" },
  { symbol: "APOLLOHOSP.NS", display: "APOLLOHOSP" },
  { symbol: "GRASIM.NS", display: "GRASIM" },
  { symbol: "HINDALCO.NS", display: "HINDALCO" },
  { symbol: "SBILIFE.NS", display: "SBILIFE" },
  { symbol: "TATACONSUM.NS", display: "TATACONSUM" },
  { symbol: "BEL.NS", display: "BEL" },
];

export async function GET() {
  const marketStatus = getMarketStatus();

  const quotePromises = INDIAN_TICKERS.map(async (item) => {
    const live = await fetchLiveQuote(item.symbol, item.display, false);
    if (live) return live;
    return null;
  });

  const results = (await Promise.all(quotePromises)).filter(Boolean);

  return NextResponse.json({
    timestamp: Date.now(),
    isMarketOpen: marketStatus.isOpen,
    marketStatus: marketStatus.statusText,
    sessionDescription: marketStatus.sessionDescription,
    tickers: results,
  });
}
