"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useQuotes } from "@/context/QuotesContext";
import { ArticleCard } from "@/components/article/ArticleCard";
import Link from "next/link";

interface ArticleData {
  id: string;
  slug: string;
  category: string;
  sentiment?: string | null;
  isBreaking?: boolean;
  publishAt?: Date | null;
  title: string;
  summary: string;
}

const PAGE_TEXT = {
  EN: {
    kicker: "Indian Equity Markets & Key Benchmarks",
    desc: "Live figures and benchmark index movements from National Stock Exchange (NSE) and Bombay Stock Exchange (BSE) with automatic real-time updates.",
    benchmarks: "Key Benchmark Indices",
    gainersLosers: "Sector Movers & Leaders",
    stories: "Market Dispatches & Insights",
    dayRange: "Day Range",
    viewCompanies: "Explore All Top 50 Companies →",
    openStatus: "MARKET ACTIVE",
    closedStatus: "MARKET CLOSED",
    liveBadge: "LIVE AUTO-UPDATE",
  },
  GU: {
    kicker: "ભારતીય ઇક્વિટી બજારો અને મુખ્ય બેન્ચમાર્ક્સ",
    desc: "નેશનલ સ્ટોક એક્સચેન્જ (NSE) અને બોમ્બે સ્ટોક એક્સચેન્જ (BSE) ના લાઇવ આંકડા અને ઇન્ડેક્સ મૂવમેન્ટ્સ રીઅલ-ટાઇમ ઓટો અપડેટ સાથે.",
    benchmarks: "મુખ્ય બેન્ચમાર્ક ઇન્ડેક્સ",
    gainersLosers: "સેક્ટર મૂવર્સ અને લીડર્સ",
    stories: "બજાર સમાચાર અને વિશ્લેષણ",
    dayRange: "દિવસની રેન્જ",
    viewCompanies: "બધી ટોપ 50 કંપનીઓ જુઓ →",
    openStatus: "બજાર ચાલુ",
    closedStatus: "બજાર બંધ",
    liveBadge: "લાઇવ ઓટો-અપડેટ",
  },
  HI: {
    kicker: "भारतीय इक्विटी बाज़ार और प्रमुख बेंचमार्क",
    desc: "नेशनल स्टॉक एक्सचेंज (NSE) और बॉम्बे स्टॉक एक्सचेंज (BSE) के लाइव आंकड़े और सूचकांक मूवमेंट्स रियल-टाइम ऑटो अपडेट के साथ।",
    benchmarks: "प्रमुख बेंचमार्क सूचकांक",
    gainersLosers: "सेक्टर मूवर्स और लीडर्स",
    stories: "बाज़ार समाचार और विश्लेषण",
    dayRange: "दिन की रेंज",
    viewCompanies: "सभी टॉप 50 कंपनियां देखें →",
    openStatus: "बाज़ार चालू",
    closedStatus: "बाज़ार बंद",
    liveBadge: "लाइव ऑटो-अपडेट",
  },
};

export function MarketsView({ articles }: { articles: ArticleData[] }) {
  const { locale } = useLanguage();
  const { quotes, isMarketOpen } = useQuotes();
  const t = PAGE_TEXT[locale] || PAGE_TEXT.EN;

  const sensex = quotes["SENSEX"] || { price: 77301.4, change: 383.55, changePct: 0.5, high: 77500, low: 76950 };
  const nifty = quotes["NIFTY 50"] || { price: 23960.6, change: 149.75, changePct: 0.63, high: 24050, low: 23820 };
  const bankNifty = quotes["BANK NIFTY"] || { price: 55913.6, change: 250.2, changePct: 0.45, high: 56100, low: 55700 };
  const reliance = quotes["RELIANCE"] || { price: 1311.0, change: 3.15, changePct: 0.24, high: 1320, low: 1302 };
  const tcs = quotes["TCS"] || { price: 2436.0, change: -63.0, changePct: -2.52, high: 2510, low: 2420 };
  const sbin = quotes["SBIN"] || { price: 982.5, change: 14.2, changePct: 1.47, high: 990, low: 968 };

  const indices = [
    { name: "BSE SENSEX", quote: sensex, exchange: "BSE" },
    { name: "NSE NIFTY 50", quote: nifty, exchange: "NSE" },
    { name: "NIFTY BANK", quote: bankNifty, exchange: "NSE" },
    { name: "RELIANCE IND", quote: reliance, exchange: "NSE" },
    { name: "TCS LTD", quote: tcs, exchange: "NSE" },
    { name: "STATE BANK (SBI)", quote: sbin, exchange: "NSE" },
  ];

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "var(--teal)", fontSize: "1.2rem" }}>✦</span>
            <h1 style={{ fontSize: "1.8rem" }}>{t.kicker}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: "0.75rem",
                padding: "4px 10px",
                borderRadius: "var(--radius-pill)",
                background: isMarketOpen ? "rgba(52, 211, 153, 0.15)" : "rgba(165, 176, 214, 0.15)",
                color: isMarketOpen ? "var(--up)" : "var(--muted)",
                fontWeight: 700,
              }}
            >
              {isMarketOpen ? t.openStatus : t.closedStatus}
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                padding: "4px 10px",
                borderRadius: "var(--radius-pill)",
                background: "rgba(45, 212, 191, 0.15)",
                color: "var(--teal)",
                fontWeight: 700,
              }}
            >
              ● {t.liveBadge}
            </span>
          </div>
        </div>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginTop: 4 }}>
          {t.desc}
        </p>
      </div>

      {/* Indices Grid with Live Auto-Updated Prices */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16,
          marginBottom: 40,
        }}
      >
        {indices.map((item) => {
          const isUp = item.quote.changePct >= 0;
          return (
            <div key={item.name} className="panel panel-interactive" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 600 }}>
                  {item.name}
                </span>
                <span
                  style={{
                    fontSize: "0.65rem",
                    padding: "2px 6px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    color: "var(--teal)",
                    fontWeight: 700,
                  }}
                >
                  {item.exchange}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: "1.45rem", fontWeight: 700, fontFamily: "var(--font-heading)" }}>
                  {item.quote.price ? item.quote.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
                </span>
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: isUp ? "var(--up)" : "var(--down)",
                  }}
                >
                  {isUp ? "▲ +" : "▼ "}
                  {item.quote.changePct.toFixed(2)}%
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.75rem",
                  color: "var(--muted)",
                  borderTop: "1px solid var(--border)",
                  paddingTop: 8,
                }}
              >
                <span>{t.dayRange}</span>
                <span style={{ color: "var(--text)", fontWeight: 600 }}>
                  {item.quote.low?.toFixed(0)} – {item.quote.high?.toFixed(0)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Link to Top 50 Companies */}
      <div style={{ marginBottom: 40, textAlign: "right" }}>
        <Link
          href="/companies"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "var(--accent)",
            fontWeight: 700,
            fontSize: "0.95rem",
            textDecoration: "none",
          }}
        >
          {t.viewCompanies}
        </Link>
      </div>

      {/* Dispatches / Articles */}
      <div>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: 20 }}>
          {t.stories}
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} locale={locale} />
          ))}
        </div>
      </div>
    </div>
  );
}

