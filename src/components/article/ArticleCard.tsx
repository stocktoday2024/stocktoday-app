import Link from "next/link";
import { parseMultiLang, getLocalised, Locale } from "@/types";

interface ArticleCardProps {
  article: {
    id: string;
    slug: string;
    category: string;
    sentiment?: string | null;
    isBreaking?: boolean;
    publishAt?: Date | null;
    title: string;
    summary: string;
  };
  locale?: Locale;
}

export function ArticleCard({ article, locale = "EN" }: ArticleCardProps) {
  const parsedTitle = parseMultiLang(article.title);
  const parsedSummary = parseMultiLang(article.summary);

  const titleData = getLocalised(parsedTitle, locale);
  const summaryData = getLocalised(parsedSummary, locale);

  const sentimentTag = article.sentiment ? (
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
  ) : null;

  return (
    <article className="panel panel-interactive" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {article.isBreaking && <span className="tag tag-breaking">⚡ BREAKING</span>}
        <span className="tag tag-category">{article.category}</span>
        {sentimentTag}
        {titleData.isFallback && locale !== "EN" && (
          <span style={{ fontSize: "0.7rem", color: "var(--muted)", marginLeft: "auto" }}>
            EN Original
          </span>
        )}
      </div>

      <h3 style={{ fontSize: "1.1rem", marginBottom: 8, lineHeight: 1.4 }}>
        <Link href={`/article/${article.slug}`} style={{ color: "var(--text)" }}>
          {titleData.text}
        </Link>
      </h3>

      <p style={{ color: "var(--muted)", fontSize: "0.85rem", lineHeight: 1.5, marginBottom: 16, flex: 1 }}>
        {summaryData.text}
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid var(--border)",
          paddingTop: 10,
          marginTop: "auto",
          fontSize: "0.75rem",
          color: "var(--muted)",
        }}
      >
        <span>
          {article.publishAt ? new Date(article.publishAt).toLocaleDateString() : "Just now"}
        </span>
        <Link href={`/article/${article.slug}`} style={{ color: "var(--teal)", fontWeight: 600 }}>
          Read story →
        </Link>
      </div>
    </article>
  );
}
