"use client";

import { useLanguage } from "@/context/LanguageContext";
import { parseMultiLang, getLocalised } from "@/types";
import Link from "next/link";
import { BookmarkButton } from "@/components/reader/BookmarkButton";

interface ArticleDetailData {
  id: string;
  slug: string;
  category: string;
  sentiment: string | null;
  isBreaking: boolean;
  publishAt: Date | null;
  title: string;
  summary: string;
  body: string;
  simpleExplain: string;
  keyTakeaways: string;
  authorName?: string;
  approvedByName?: string;
}

const UI_TEXT = {
  EN: {
    home: "Home",
    readTime: "4 min read",
    authorLabel: "Reported by",
    reviewedBy: "Reviewed by editorial desk",
    simpleExplainTitle: "In Simple Terms (Plain-Language Explanation)",
    keyTakeawaysTitle: "Key Takeaways & Market Impact",
    disclaimer: "Disclaimer: Market information published on StockToday is for informational and educational purposes only and does not constitute financial advice or investment recommendations. Consult a SEBI-registered financial advisor before trading.",
    backToNews: "← Back to Market Dispatches",
  },
  GU: {
    home: "હોમ",
    readTime: "4 મિનિટ વાંચન",
    authorLabel: "અહેવાલ",
    reviewedBy: "સંપાદકીય ડેસ્ક દ્વારા ચકાસાયેલ",
    simpleExplainTitle: "સરળ ભાષામાં સમજો (સામાન્ય રોકાણકારો માટે)",
    keyTakeawaysTitle: "મુખ્ય મુદ્દાઓ અને બજાર પર અસર",
    disclaimer: "ડિસ્ક્લેમર: StockToday પર પ્રકાશિત બજાર માહિતી ફક્ત માહિતી અને શૈક્ષણિક હેતુઓ માટે છે અને તે નાણાકીય સલાહ નથી. વેપાર કરતા પહેલા SEBI રજિસ્ટર્ડ નાણાકીય સલાહકારની સલાહ લો.",
    backToNews: "← બજાર સમાચારો પર પાછા જાઓ",
  },
  HI: {
    home: "होम",
    readTime: "4 मिनट पठन",
    authorLabel: "रिपोर्टर",
    reviewedBy: "संपादकीय डेस्क द्वारा सत्यापित",
    simpleExplainTitle: "सरल शब्दों में समझें (आम निवेशकों के लिए)",
    keyTakeawaysTitle: "मुख्य बिंदु और बाज़ार प्रभाव",
    disclaimer: "अस्वीकरण: StockToday पर प्रकाशित बाज़ार जानकारी केवल सूचनात्मक और शैक्षणिक उद्देश्यों के लिए है और यह वित्तीय सलाह नहीं है। निवेश करने से पहले SEBI पंजीकृत वित्तीय सलाहकार से परामर्श करें।",
    backToNews: "← बाज़ार समाचारों पर वापस जाएं",
  },
};

export function ArticleDetailView({ article }: { article: ArticleDetailData }) {
  const { locale } = useLanguage();
  const t = UI_TEXT[locale] || UI_TEXT.EN;

  const parsedTitle = parseMultiLang(article.title);
  const parsedSummary = parseMultiLang(article.summary);
  const parsedBody = parseMultiLang(article.body);
  const parsedSimpleExplain = parseMultiLang(article.simpleExplain);

  const titleText = getLocalised(parsedTitle, locale).text;
  const summaryText = getLocalised(parsedSummary, locale).text;
  const bodyText = getLocalised(parsedBody, locale).text;
  const simpleExplainText = getLocalised(parsedSimpleExplain, locale).text;

  let keyTakeawaysList: string[] = [];
  try {
    const rawTakeaways = parseMultiLang(article.keyTakeaways);
    const localizedRaw = getLocalised(rawTakeaways, locale).text;
    keyTakeawaysList = JSON.parse(localizedRaw || "[]");
  } catch {
    keyTakeawaysList = [];
  }

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 64, maxWidth: 960 }}>
      {/* Breadcrumb */}
      <nav style={{ display: "flex", gap: 8, fontSize: "0.85rem", color: "var(--muted)", marginBottom: 20 }}>
        <Link href="/" style={{ color: "var(--muted)" }}>{t.home}</Link>
        <span>/</span>
        <span style={{ color: "var(--teal)" }}>{article.category}</span>
        <span>/</span>
        <span style={{ color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {titleText}
        </span>
      </nav>

      {/* Header tags */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        {article.isBreaking && <span className="tag tag-breaking">⚡ BREAKING</span>}
        <span className="tag tag-category">{article.category}</span>
        {article.sentiment && (
          <span
            className={`tag ${
              article.sentiment === "BULLISH"
                ? "tag-up"
                : article.sentiment === "BEARISH"
                ? "tag-down"
                : "tag-neutral"
            }`}
          >
            {article.sentiment === "BULLISH" ? "▲ Bullish" : article.sentiment === "BEARISH" ? "▼ Bearish" : "● Neutral"}
          </span>
        )}
      </div>

      {/* Title */}
      <h1
        style={{
          fontSize: "2.3rem",
          lineHeight: 1.25,
          marginBottom: 16,
          fontFamily: "var(--font-heading)",
          fontWeight: 800,
        }}
      >
        {titleText}
      </h1>

      {/* Metadata Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          paddingBottom: 20,
          borderBottom: "1px solid var(--border)",
          marginBottom: 24,
          fontSize: "0.85rem",
          color: "var(--muted)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span>
            {t.authorLabel} <strong style={{ color: "var(--text)" }}>{article.authorName || "Editorial Desk"}</strong>
          </span>
          <span>·</span>
          <span>{article.publishAt ? new Date(article.publishAt).toLocaleDateString() : "Just now"}</span>
          <span>·</span>
          <span>{t.readTime}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <BookmarkButton articleId={article.id} />
        </div>
      </div>

      {/* Summary Lead In */}
      <div
        style={{
          fontSize: "1.15rem",
          lineHeight: 1.6,
          color: "var(--text)",
          fontWeight: 500,
          marginBottom: 28,
        }}
      >
        {summaryText}
      </div>

      {/* Key Takeaways Card */}
      {keyTakeawaysList.length > 0 && (
        <div
          className="panel"
          style={{
            padding: "20px 24px",
            marginBottom: 32,
            borderLeft: "4px solid var(--accent)",
            background: "rgba(251, 191, 36, 0.05)",
          }}
        >
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--accent)", marginBottom: 12 }}>
            ✦ {t.keyTakeawaysTitle}
          </div>
          <ul style={{ paddingLeft: 20, margin: 0, display: "flex", flexDirection: "column", gap: 8, fontSize: "0.95rem" }}>
            {keyTakeawaysList.map((item, idx) => (
              <li key={idx} style={{ color: "var(--text)" }}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Article Body */}
      <div
        style={{
          fontSize: "1.05rem",
          lineHeight: 1.8,
          color: "var(--text)",
          marginBottom: 36,
        }}
        dangerouslySetInnerHTML={{ __html: bodyText }}
      />

      {/* In Simple Terms Panel */}
      {simpleExplainText && (
        <div
          className="panel"
          style={{
            padding: "24px 28px",
            marginBottom: 36,
            background: "linear-gradient(135deg, var(--panel) 0%, rgba(45, 212, 191, 0.08) 100%)",
            border: "1px solid var(--teal)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ color: "var(--teal)", fontSize: "1.2rem" }}>💡</span>
            <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--teal)" }}>
              {t.simpleExplainTitle}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.6, color: "var(--text)" }}>
            {simpleExplainText}
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div
        style={{
          padding: 16,
          background: "var(--bg)",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border)",
          fontSize: "0.75rem",
          color: "var(--muted)",
          lineHeight: 1.5,
          marginBottom: 32,
        }}
      >
        {t.disclaimer}
      </div>

      <Link
        href="/markets"
        style={{
          display: "inline-block",
          fontSize: "0.9rem",
          color: "var(--teal)",
          fontWeight: 600,
        }}
      >
        {t.backToNews}
      </Link>
    </div>
  );
}

