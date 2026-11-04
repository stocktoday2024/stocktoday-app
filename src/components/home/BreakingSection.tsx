"use client";

import Link from "next/link";
import styles from "./BreakingSection.module.css";
import { parseMultiLang, getLocalised } from "@/types";
import { useLanguage } from "@/context/LanguageContext";

interface ArticleData {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  sentiment: string | null;
  publishAt: Date | null;
}

interface BreakingSectionProps {
  article: ArticleData;
}

const UI_TEXT = {
  EN: { breaking: "Breaking coverage", breakingBadge: "BREAKING", bullish: "▲ Bullish", bearish: "▼ Bearish", neutral: "● Neutral", readStory: "Read story", liveFeed: "Live feed", gujaratPulse: "Gujarat Pulse", gujaratSub: "Local companies, GIFT City and regional market stories." },
  GU: { breaking: "બ્રેકિંગ કવરેજ", breakingBadge: "બ્રેકિંગ", bullish: "▲ તેજી", bearish: "▼ મંદી", neutral: "● તટસ્થ", readStory: "વાર્તા વાંચો", liveFeed: "લાઇવ ફીડ", gujaratPulse: "ગુજરાત પલ્સ", gujaratSub: "સ્થાનિક કંપનીઓ, GIFT City અને પ્રાદેશિક બજાર વાર્તાઓ." },
  HI: { breaking: "ब्रेकिंग कवरेज", breakingBadge: "ब्रेकिंग", bullish: "▲ तेजी", bearish: "▼ मंदी", neutral: "● तटस्थ", readStory: "कहानी पढ़ें", liveFeed: "लाइव फीड", gujaratPulse: "गुजरात पल्स", gujaratSub: "स्थानीय कंपनियां, GIFT City और क्षेत्रीय बाज़ार की कहानियां।" },
};

const LIVE_FEED_ITEMS = [
  { time: "10:42", text: { EN: "Three IPOs set to open next week", GU: "ત્રણ IPO આવતા અઠવાડિયે ખૂલશે", HI: "तीन IPO अगले हफ्ते खुलेंगे" }, color: "#2DD4BF" },
  { time: "10:15", text: { EN: "Crude rally pressures auto stocks", GU: "ક્રૂડ તેજીથી ઓટો શેરો પર દબાણ", HI: "क्रूड रैली से ऑटो शेयरों पर दबाव" }, color: "#FBBF24" },
  { time: "09:50", text: { EN: "Big companies report results next week", GU: "મોટી કંપનીઓ આવતા અઠવાડિયે પરિણામો જાહેર કરશે", HI: "बड़ी कंपनियां अगले हफ्ते नतीजे देंगी" }, color: "#F472B6" },
];

export function BreakingSection({ article }: BreakingSectionProps) {
  const { locale } = useLanguage();
  const t = UI_TEXT[locale];

  const parsedTitle = parseMultiLang(article.title);
  const parsedSummary = parseMultiLang(article.summary);
  const titleText = getLocalised(parsedTitle, locale).text || "Breaking news";
  const summaryText = getLocalised(parsedSummary, locale).text || "";

  const sentimentLabel = article.sentiment === "BULLISH" ? t.bullish : article.sentiment === "BEARISH" ? t.bearish : t.neutral;

  return (
    <section className={styles.sectionWrapper} aria-label="Breaking coverage">
      <div className={styles.sectionHeader}>
        <span className={styles.headerDot}>●</span>
        <h2 className={styles.headerTitle}>{t.breaking}</h2>
      </div>

      <div className={styles.breakingGrid}>
        <Link href={`/article/${article.slug}`} className={styles.breakingCard}>
          <div>
            <div className={styles.cardTopRow}>
              <span className={styles.breakingBadge}>{t.breakingBadge}</span>
              <span className={styles.categoryBadge}>{article.category || "Markets"}</span>
              <span className={styles.sentimentBadge}>{sentimentLabel}</span>
            </div>
            <h3 className={styles.cardTitle}>{titleText}</h3>
            <p className={styles.cardExcerpt}>{summaryText}</p>
          </div>
          <div className={styles.cardMeta}>
            <span>{article.publishAt ? new Date(article.publishAt).toLocaleDateString() : "Just now"} · 4 min read</span>
            <span className={styles.readMoreBtn}>{t.readStory} <span>→</span></span>
          </div>
        </Link>

        <div className={styles.sideCol}>
          <div className={styles.feedPanel}>
            <div className={styles.feedTitle}>{t.liveFeed}</div>
            <div className={styles.feedList}>
              {LIVE_FEED_ITEMS.map((item, idx) => (
                <div key={idx} className={styles.feedItem}>
                  <span className={styles.feedTime} style={{ color: item.color }}>{item.time}</span>
                  <span className={styles.feedText}>{item.text[locale]}</span>
                </div>
              ))}
            </div>
          </div>
          <Link href="/gujarat-pulse" className={styles.gujaratPanel}>
            <div className={styles.gujaratTitle}>{t.gujaratPulse}</div>
            <div className={styles.gujaratSub}>{t.gujaratSub}</div>
          </Link>
        </div>
      </div>
    </section>
  );
}
