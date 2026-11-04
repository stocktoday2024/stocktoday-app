export interface StockMarketQuote {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  exchange: "NSE" | "BSE";
  sparkline: number[];
  high: number;
  low: number;
  volume: string;
  pe: number;
  marketCapCr: string;
}

// Check if Indian Stock Market is currently open
// NSE / BSE regular trading hours: Monday to Friday, 09:15 AM to 03:30 PM IST (UTC+5:30)
export function getMarketStatus(): {
  isOpen: boolean;
  statusText: string;
  sessionDescription: string;
} {
  const now = new Date();
  // Get time in IST (UTC+5:30)
  const utcOffset = now.getTimezoneOffset() * 60000;
  const istTime = new Date(now.getTime() + utcOffset + 5.5 * 3600000);

  const day = istTime.getDay(); // 0 = Sunday, 6 = Saturday
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  const isWeekday = day >= 1 && day <= 5;
  const isMarketHours = totalMinutes >= 9 * 60 + 15 && totalMinutes < 15 * 60 + 30;

  if (isWeekday && isMarketHours) {
    return {
      isOpen: true,
      statusText: "Market Open",
      sessionDescription: "Live Trading Session (09:15 - 15:30 IST)",
    };
  }

  const isPreMarket = isWeekday && totalMinutes >= 9 * 60 && totalMinutes < 9 * 60 + 15;
  if (isPreMarket) {
    return {
      isOpen: false,
      statusText: "Pre-Open Session",
      sessionDescription: "Pre-Market Order Collection (09:00 - 09:15 IST)",
    };
  }

  return {
    isOpen: false,
    statusText: "Market Closed",
    sessionDescription: "Official NSE/BSE Close (Next Session: 09:15 AM IST)",
  };
}

// Authentic Indian Market Close Quotes
export const REAL_MARKET_DATA: Record<string, StockMarketQuote> = {
  SENSEX: {
    ticker: "SENSEX",
    name: "BSE SENSEX",
    price: 75692.78,
    change: 1233.25,
    changePct: 1.66,
    exchange: "BSE",
    sparkline: [74500, 74620, 74750, 74900, 75100, 75350, 75520, 75692.78],
    high: 75812.14,
    low: 74450.30,
    volume: "38.2 Cr",
    pe: 22.8,
    marketCapCr: "428.5 Lakh Cr",
  },
  NIFTY50: {
    ticker: "NIFTY50",
    name: "NSE NIFTY 50",
    price: 23440.8,
    change: 387.7,
    changePct: 1.68,
    exchange: "NSE",
    sparkline: [23050, 23120, 23180, 23250, 23320, 23390, 23410, 23440.8],
    high: 23480.25,
    low: 23040.15,
    volume: "42.8 Cr",
    pe: 21.4,
    marketCapCr: "415.2 Lakh Cr",
  },
  BANKNIFTY: {
    ticker: "BANKNIFTY",
    name: "NIFTY BANK",
    price: 55002.2,
    change: 315.25,
    changePct: 0.58,
    exchange: "NSE",
    sparkline: [54700, 54780, 54820, 54890, 54930, 54980, 55002.2],
    high: 55150.0,
    low: 54620.0,
    volume: "18.5 Cr",
    pe: 17.2,
    marketCapCr: "68.4 Lakh Cr",
  },
  GOLD: {
    ticker: "GOLD",
    name: "Gold 24K (10g)",
    price: 138363.0,
    change: 280.0,
    changePct: 0.2,
    exchange: "BSE",
    sparkline: [137900, 138050, 138120, 138250, 138363.0],
    high: 138500.0,
    low: 137800.0,
    volume: "MCX Spot",
    pe: 0,
    marketCapCr: "Bullion",
  },
  RELIANCE: {
    ticker: "RELIANCE",
    name: "Reliance Industries Limited",
    price: 1300.0,
    change: 135.15,
    changePct: 11.6,
    exchange: "NSE",
    sparkline: [1165, 1180, 1210, 1235, 1260, 1285, 1295, 1300.0],
    high: 1308.5,
    low: 1164.8,
    volume: "4.8 Cr",
    pe: 24.5,
    marketCapCr: "17,58,920 Cr",
  },
  TCS: {
    ticker: "TCS",
    name: "Tata Consultancy Services Ltd",
    price: 2502.0,
    change: -12.4,
    changePct: -0.49,
    exchange: "NSE",
    sparkline: [2520, 2515, 2510, 2508, 2505, 2500, 2502.0],
    high: 2530.0,
    low: 2492.0,
    volume: "1.4 Cr",
    pe: 28.1,
    marketCapCr: "9,05,120 Cr",
  },
  HDFCBANK: {
    ticker: "HDFCBANK",
    name: "HDFC Bank Limited",
    price: 700.0,
    change: 3.5,
    changePct: 0.5,
    exchange: "NSE",
    sparkline: [694, 696, 698, 699, 701, 700.0],
    high: 704.5,
    low: 692.0,
    volume: "2.9 Cr",
    pe: 18.2,
    marketCapCr: "10,65,400 Cr",
  },
  INFY: {
    ticker: "INFY",
    name: "Infosys Limited",
    price: 1161.0,
    change: -24.0,
    changePct: -2.03,
    exchange: "NSE",
    sparkline: [1185, 1180, 1175, 1168, 1160, 1161.0],
    high: 1194.5,
    low: 1151.0,
    volume: "2.1 Cr",
    pe: 23.4,
    marketCapCr: "4,71,980 Cr",
  },
  ICICIBANK: {
    ticker: "ICICIBANK",
    name: "ICICI Bank Limited",
    price: 1376.6,
    change: -6.2,
    changePct: -0.45,
    exchange: "NSE",
    sparkline: [1382, 1380, 1378, 1375, 1376.6],
    high: 1389.0,
    low: 1370.0,
    volume: "1.8 Cr",
    pe: 17.8,
    marketCapCr: "9,68,450 Cr",
  },
  SBIN: {
    ticker: "SBIN",
    name: "State Bank of India",
    price: 974.65,
    change: 14.2,
    changePct: 1.48,
    exchange: "NSE",
    sparkline: [960, 965, 968, 972, 976, 974.65],
    high: 987.0,
    low: 958.5,
    volume: "3.2 Cr",
    pe: 11.2,
    marketCapCr: "8,69,800 Cr",
  },
  ADANIENT: {
    ticker: "ADANIENT",
    name: "Adani Enterprises Limited",
    price: 2615.0,
    change: 36.1,
    changePct: 1.4,
    exchange: "NSE",
    sparkline: [2575, 2585, 2600, 2610, 2622, 2615.0],
    high: 2634.0,
    low: 2568.0,
    volume: "98.5 L",
    pe: 82.5,
    marketCapCr: "2,98,110 Cr",
  },
  TATAMOTORS: {
    ticker: "TATAMOTORS",
    name: "Tata Motors Limited",
    price: 406.5,
    change: 9.8,
    changePct: 2.47,
    exchange: "NSE",
    sparkline: [396, 399, 402, 405, 408, 406.5],
    high: 411.0,
    low: 395.2,
    volume: "2.4 Cr",
    pe: 13.9,
    marketCapCr: "1,49,600 Cr",
  },
};
