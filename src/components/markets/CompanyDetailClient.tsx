"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useQuotes } from "@/context/QuotesContext";
import { ArticleCard } from "@/components/article/ArticleCard";
import Link from "next/link";
import { WatchlistButton } from "@/components/reader/WatchlistButton";
import { SparklineChart } from "@/components/charts/SparklineChart";

interface CompanyData {
  id: string;
  ticker: string;
  name_en: string;
  name_gu: string;
  name_hi: string;
  exchange: string;
  sector: string;
  description_en?: string | null;
  description_gu?: string | null;
  description_hi?: string | null;
  logoUrl?: string | null;
}

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

const UI_TEXT = {
  EN: {
    home: "Home",
    companies: "Companies",
    listed: "LISTED",
    sector: "Sector",
    dayRange: "Day Range",
    volume: "Volume",
    marketCap: "Est. Market Cap",
    pe: "P/E Ratio",
    coverage: "Coverage & Company Dispatches",
    disclaimer: "Market data is updated in real time via Yahoo Finance. Past performance is no guarantee of future returns.",
    liveTag: "LIVE QUOTE",
  },
  GU: {
    home: "હોમ",
    companies: "કંપનીઓ",
    listed: "લિસ્ટેડ",
    sector: "ક્ષેત્ર",
    dayRange: "દિવસની રેન્જ",
    volume: "વોલ્યુમ",
    marketCap: "અંદાજિત માર્કેટ કેપ",
    pe: "P/E રેશિયો",
    coverage: "કવરેજ અને કંપની સમાચાર",
    disclaimer: "બજાર ડેટા Yahoo Finance દ્વારા રીઅલ-ટાઇમમાં અપડેટ થાય છે. પાછલી કામગીરી ભવિષ્યના વળતરની કોઈ ગેરંટી નથી.",
    liveTag: "લાઇવ ભાવ",
  },
  HI: {
    home: "होम",
    companies: "कंपनियां",
    listed: "सूचीबद्ध",
    sector: "क्षेत्र",
    dayRange: "दिन की रेंज",
    volume: "वॉल्यूम",
    marketCap: "अनुमानित मार्केट कैप",
    pe: "P/E अनुपात",
    coverage: "कवरेज और कंपनी समाचार",
    disclaimer: "बाज़ार डेटा Yahoo Finance के माध्यम से रियल-टाइम में अपडेट किया जाता है। पिछला प्रदर्शन भविष्य के रिटर्न की गारंटी नहीं है।",
    liveTag: "लाइव भाव",
  },
};

export function CompanyDetailClient({
  company,
  articles,
}: {
  company: CompanyData;
  articles: ArticleData[];
}) {
  const { locale } = useLanguage();
  const { quotes } = useQuotes();
  const t = UI_TEXT[locale] || UI_TEXT.EN;

  const live = quotes[company.ticker] || quotes[company.ticker.replace(/\s+/g, "")] || {
    price: 1000,
    change: 0,
    changePct: 0,
    high: 1010,
    low: 990,
    volume: "1.2 Cr",
  };

  const isUp = live.changePct >= 0;

  const companyName =
    locale === "GU"
      ? company.name_gu || company.name_en
      : locale === "HI"
      ? company.name_hi || company.name_en
      : company.name_en;

  const companyDesc =
    locale === "GU"
      ? company.description_gu || company.description_en
      : locale === "HI"
      ? company.description_hi || company.description_en
      : company.description_en;

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
      {/* Breadcrumb */}
      <nav style={{ display: "flex", gap: 8, fontSize: "0.85rem", color: "var(--muted)", marginBottom: 20 }}>
        <Link href="/" style={{ color: "var(--muted)" }}>{t.home}</Link>
        <span>/</span>
        <Link href="/companies" style={{ color: "var(--muted)" }}>{t.companies}</Link>
        <span>/</span>
        <span style={{ color: "var(--teal)" }}>{company.ticker}</span>
      </nav>

      {/* Company Header Banner */}
      <div
        className="panel"
        style={{
          padding: 32,
          marginBottom: 32,
          background: "linear-gradient(135deg, var(--panel) 0%, rgba(20, 26, 51, 0.8) 100%)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <h1 style={{ fontSize: "2.2rem", fontFamily: "var(--font-heading)" }}>
                {company.ticker}
              </h1>
              <span
                style={{
                  fontSize: "0.8rem",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--teal)",
                  fontWeight: 600,
                }}
              >
                {company.exchange} {t.listed}
              </span>
              <span className="tag tag-category">{company.sector} {t.sector}</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontSize: "1.2rem", fontWeight: 600, color: "var(--text)" }}>
                {companyName}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <WatchlistButton ticker={company.ticker} />
          </div>
        </div>

        {/* Live Market Price Block */}
        <div
          style={{
            marginTop: 24,
            paddingTop: 24,
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "baseline",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: "2.4rem", fontWeight: 800, fontFamily: "var(--font-heading)" }}>
              ₹{live.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--teal)", fontWeight: 700 }}>
              ● {t.liveTag}
            </span>
          </div>

          <div
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: isUp ? "var(--up)" : "var(--down)",
            }}
          >
            {isUp ? "▲ +" : "▼ "}
            {live.change?.toFixed(2)} ({isUp ? "+" : ""}{live.changePct?.toFixed(2)}%)
          </div>
        </div>
      </div>

      {/* Grid: Stats and Sparkline */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginBottom: 32 }}>
        {/* Key Metrics */}
        <div className="panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: 16, color: "var(--text)" }}>
            Trading Statistics
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: "0.9rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>{t.dayRange}</span>
              <span style={{ fontWeight: 600 }}>₹{live.low?.toFixed(2)} – ₹{live.high?.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>{t.volume}</span>
              <span style={{ fontWeight: 600 }}>{live.volume}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>{t.sector}</span>
              <span style={{ fontWeight: 600 }}>{company.sector}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>Exchange</span>
              <span style={{ fontWeight: 600 }}>{company.exchange}</span>
            </div>
          </div>
        </div>

        {/* Intraday Chart */}
        <div className="panel" style={{ padding: 24, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: "1.1rem", color: "var(--text)" }}>Price Trajectory</h3>
            <span style={{ fontSize: "0.8rem", color: "var(--teal)", fontWeight: 600 }}>1D Session</span>
          </div>
          <div style={{ flex: 1, minHeight: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <SparklineChart data={[live.low || live.price * 0.99, live.price * 0.995, live.high || live.price * 1.01, live.price]} isPositive={isUp} />
          </div>
        </div>
      </div>

      {/* Description */}
      {companyDesc && (
        <div className="panel" style={{ padding: 24, marginBottom: 32 }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: 12, color: "var(--text)" }}>Company Profile</h3>
          <p style={{ color: "var(--text)", lineHeight: 1.7, fontSize: "0.95rem", margin: 0 }}>
            {companyDesc}
          </p>
        </div>
      )}

      {/* Related News Coverage */}
      <div>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: 20 }}>
          {t.coverage}
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

