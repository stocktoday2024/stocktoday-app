// Application-level type constants matching Prisma String fields
// When we switch to PostgreSQL in production, these become Prisma enums

export const ROLES = ["ADMIN", "EDITOR", "READER"] as const;
export type Role = (typeof ROLES)[number];

export const LOCALES = ["EN", "GU", "HI"] as const;
export type Locale = (typeof LOCALES)[number];

export const EXCHANGES = ["NSE", "BSE"] as const;
export type Exchange = (typeof EXCHANGES)[number];

export const ARTICLE_STATUSES = ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"] as const;
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

export const SENTIMENTS = ["BULLISH", "BEARISH", "NEUTRAL"] as const;
export type Sentiment = (typeof SENTIMENTS)[number];

// Multilingual content wrapper
export interface MultiLang {
  en: string;
  gu: string;
  hi: string;
}

// Helper to parse a JSON multilingual field safely
export function parseMultiLang(raw: string | null | undefined): MultiLang {
  if (!raw) return { en: "", gu: "", hi: "" };
  try {
    const parsed = JSON.parse(raw);
    return {
      en: parsed.en ?? "",
      gu: parsed.gu ?? "",
      hi: parsed.hi ?? "",
    };
  } catch {
    return { en: raw, gu: "", hi: "" };
  }
}

// Get content for a locale with English fallback
export function getLocalised(
  ml: MultiLang,
  locale: Locale
): { text: string; isFallback: boolean } {
  const key = locale.toLowerCase() as keyof MultiLang;
  const text = ml[key];
  if (text && text.trim().length > 0) {
    return { text, isFallback: false };
  }
  return { text: ml.en, isFallback: true };
}

// Categories used across the site
export const CATEGORIES = [
  "Markets",
  "Earnings",
  "IPO",
  "Banking",
  "IT",
  "Auto",
  "Commodities",
  "Gujarat Pulse",
] as const;
export type Category = (typeof CATEGORIES)[number];
