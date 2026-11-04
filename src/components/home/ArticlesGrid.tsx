"use client";

import { ArticleCard } from "@/components/article/ArticleCard";
import { useLanguage } from "@/context/LanguageContext";
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

const SECTION_TEXT = {
  EN: { title: "Latest Dispatches", subtitle: "Verified corporate disclosures, filings & regional market reports", allStories: "All Stories", markets: "Markets", gujaratPulse: "Gujarat Pulse" },
  GU: { title: "તાજા સમાચાર", subtitle: "ચકાસાયેલ કોર્પોરેટ જાહેરાતો, ફાઇલિંગ્સ અને પ્રાદેશિક બજાર અહેવાલો", allStories: "બધી વાર્તાઓ", markets: "માર્કેટ્સ", gujaratPulse: "ગુજરાત પલ્સ" },
  HI: { title: "ताज़ा समाचार", subtitle: "सत्यापित कॉर्पोरेट प्रकटीकरण, फाइलिंग और क्षेत्रीय बाज़ार रिपोर्ट", allStories: "सभी कहानियाँ", markets: "बाज़ार", gujaratPulse: "गुजरात पल्स" },
};

export function ArticlesGrid({ articles }: { articles: ArticleData[] }) {
  const { locale } = useLanguage();
  const t = SECTION_TEXT[locale];

  return (
    <section style={{ marginTop: 56 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text)" }}>
            {t.title}
          </h2>
          <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: 2 }}>
            {t.subtitle}
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link
            href="/"
            style={{
              fontSize: "12px",
              fontWeight: 700,
              padding: "5px 14px",
              borderRadius: "var(--radius-pill)",
              background: "var(--accent)",
              color: "#0B1020",
              textDecoration: "none",
            }}
          >
            {t.allStories}
          </Link>
          <Link
            href="/markets"
            style={{
              fontSize: "12px",
              fontWeight: 600,
              padding: "5px 14px",
              borderRadius: "var(--radius-pill)",
              background: "var(--panel)",
              border: "1px solid var(--border)",
              color: "var(--muted)",
              textDecoration: "none",
              transition: "all 0.15s ease",
            }}
          >
            {t.markets}
          </Link>
          <Link
            href="/gujarat-pulse"
            style={{
              fontSize: "12px",
              fontWeight: 600,
              padding: "5px 14px",
              borderRadius: "var(--radius-pill)",
              background: "rgba(45, 212, 191, 0.12)",
              border: "1px solid rgba(45, 212, 191, 0.3)",
              color: "var(--teal)",
              textDecoration: "none",
              transition: "all 0.15s ease",
            }}
          >
            {t.gujaratPulse}
          </Link>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(280px, 100%), 1fr))",
          gap: 24,
        }}
      >
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} locale={locale} />
        ))}
      </div>
    </section>
  );
}

