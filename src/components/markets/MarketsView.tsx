"use client";

import { useState } from "react";
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
  publishAt?: Date | string | null;
  title: string;
  summary: string;
}

interface MarketsViewProps {
  initialArticles: ArticleData[];
  initialTotalCount: number;
  initialHasMore: boolean;
  pageSize?: number;
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
    loadMore: "Load More Stories",
    loading: "Loading more stories...",
    showing: "Showing",
    of: "of",
    allLoaded: "You have reached the end of market dispatches.",
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
    loadMore: "વધુ વાર્તાઓ જુઓ",
    loading: "વાર્તાઓ લોડ થઈ રહી છે...",
    showing: "દર્શાવેલ",
    of: "માંથી",
    allLoaded: "તમે બધી બજાર વાર્તાઓ જોઈ લીધી છે.",
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
    loadMore: "और समाचार लोड करें",
    loading: "समाचार लोड हो रहे हैं...",
    showing: "प्रदर्शित",
    of: "कुल",
    allLoaded: "आप सभी बाज़ार समाचार देख चुके हैं।",
  },
};

export function MarketsView({
  initialArticles,
  initialTotalCount,
  initialHasMore,
  pageSize = 12,
}: MarketsViewProps) {
  const { locale } = useLanguage();
  const { quotes, isMarketOpen } = useQuotes();
  const t = PAGE_TEXT[locale] || PAGE_TEXT.EN;

  const [articles, setArticles] = useState<ArticleData[]>(initialArticles);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(initialTotalCount);

  const handleLoadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/public-articles?page=${nextPage}&limit=${pageSize}`);
      if (!res.ok) throw new Error("Failed to fetch more articles");

      const data = await res.json();
      const newArticles: ArticleData[] = data.articles || [];

      setArticles((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        const filteredNew = newArticles.filter((a) => !existingIds.has(a.id));
        return [...prev, ...filteredNew];
      });

      setPage(nextPage);
      setHasMore(data.pagination?.hasMore ?? false);
      if (data.pagination?.totalCount) {
        setTotalCount(data.pagination.totalCount);
      }
    } catch (err) {
      console.error("Error loading more articles:", err);
    } finally {
      setLoading(false);
    }
  };

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
      {/* Page Title & Realtime Badge */}
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <span
            style={{
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "var(--accent)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              display: "block",
              marginBottom: 4,
            }}
          >
            {t.kicker}
          </span>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", fontWeight: 800 }}>
            {t.benchmarks}
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "0.95rem", maxWidth: 680, marginTop: 6, lineHeight: 1.5 }}>
            {t.desc}
          </p>
        </div>

        {/* Live Market Status Pill */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: "var(--radius-pill)",
              background: isMarketOpen ? "rgba(34, 197, 94, 0.12)" : "rgba(239, 68, 68, 0.12)",
              border: `1px solid ${isMarketOpen ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: isMarketOpen ? "var(--up)" : "var(--down)",
                display: "inline-block",
                boxShadow: isMarketOpen ? "0 0 8px var(--up)" : "none",
              }}
            />
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: isMarketOpen ? "var(--up)" : "var(--down)",
                letterSpacing: "0.05em",
              }}
            >
              {isMarketOpen ? t.openStatus : t.closedStatus}
            </span>
          </div>

          <span
            style={{
              fontSize: "0.72rem",
              padding: "6px 12px",
              borderRadius: "var(--radius-pill)",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid var(--border)",
              color: "var(--muted)",
              fontWeight: 600,
            }}
          >
            ⚡ {t.liveBadge}
          </span>
        </div>
      </div>

      {/* Benchmark Indices Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {indices.map((item) => {
          const isUp = (item.quote.change || 0) >= 0;
          return (
            <div
              key={item.name}
              className="panel"
              style={{
                padding: "16px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                borderLeft: `3px solid ${isUp ? "var(--up)" : "var(--down)"}`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text)" }}>
                  {item.name}
                </span>
                <span
                  style={{
                    fontSize: "0.68rem",
                    padding: "2px 6px",
                    borderRadius: 4,
                    background: "rgba(255,255,255,0.06)",
                    color: "var(--muted)",
                    fontWeight: 600,
                  }}
                >
                  {item.exchange}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "1.45rem",
                    fontWeight: 700,
                    color: "var(--text)",
                  }}
                >
                  ₹{item.quote.price?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: isUp ? "var(--up)" : "var(--down)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {isUp ? "+" : ""}
                  {item.quote.change?.toFixed(2)} ({isUp ? "+" : ""}
                  {item.quote.changePct?.toFixed(2)}%)
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.72rem",
                  color: "var(--muted)",
                  paddingTop: 4,
                  borderTop: "1px solid var(--border)",
                }}
              >
                <span>{t.dayRange}</span>
                <span style={{ fontFamily: "var(--font-mono)" }}>
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

      {/* Dispatches / Articles Header */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700 }}>
            {t.stories}
          </h2>
          <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
            {t.showing} {articles.length} {t.of} {totalCount}
          </span>
        </div>

        {/* Articles Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {articles.map((article) => {
            const normalizedArticle = {
              ...article,
              publishAt: article.publishAt ? new Date(article.publishAt) : null,
            };
            return (
              <ArticleCard key={article.id} article={normalizedArticle} locale={locale} />
            );
          })}
        </div>

        {/* Pagination / Load More Controls */}
        <div style={{ marginTop: 40, textAlign: "center" }}>
          {hasMore ? (
            <button
              onClick={handleLoadMore}
              disabled={loading}
              style={{
                padding: "12px 32px",
                borderRadius: "var(--radius-pill)",
                background: "var(--accent)",
                color: "#0B1020",
                fontSize: "0.95rem",
                fontWeight: 700,
                border: "none",
                cursor: loading ? "wait" : "pointer",
                boxShadow: "0 4px 12px rgba(245, 158, 11, 0.25)",
                transition: "transform 0.15s, opacity 0.15s",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? t.loading : t.loadMore}
            </button>
          ) : (
            <p style={{ color: "var(--muted)", fontSize: "0.85rem", fontStyle: "italic" }}>
              ✓ {t.allLoaded}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
