"use client";

import { useLanguage } from "@/context/LanguageContext";
import { ArticleCard } from "@/components/article/ArticleCard";

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
    kicker: "Regional Industrial Hub",
    title: "Gujarat Pulse: Dholera SIR & GIFT City",
    desc: "Dedicated intelligence covering Gujarat's international financial services center (GIFT IFSC), semiconductors and industrial corridors in Dholera SIR, Sanand EV hub, and coastal economic zones.",
    dispatches: "Gujarat Corridor Dispatches & Reports",
    clusters: [
      "GIFT City IFSC",
      "Dholera Semiconductor Node",
      "Sanand EV Hub",
      "Mundra Ports & SEZ",
      "Hazira Heavy Industry",
      "Khavda Renewable Energy Park",
    ],
  },
  GU: {
    kicker: "પ્રાદેશિક ઔદ્યોગિક કેન્દ્ર",
    title: "ગુજરાત પલ્સ: ધોલેરા SIR અને GIFT સિટી",
    desc: "ગુજરાતના ઇન્ટરનેશનલ ફાઇનાન્સિયલ સર્વિસ સેન્ટર (GIFT IFSC), ધોલેરા SIR માં સેમિકન્ડક્ટર પ્લાન્ટ્સ, સાણંદ EV હબ અને દરિયાકાંઠાના આર્થિક ઝોનનું વિશિષ્ટ કવરેજ.",
    dispatches: "ગુજરાત ઔદ્યોગિક અહેવાલો અને સમાચાર",
    clusters: [
      "GIFT સિટી IFSC",
      "ધોલેરા સેમિકન્ડક્ટર નોડ",
      "સાણંદ EV હબ",
      "મુન્દ્રા પોર્ટ અને SEZ",
      "હઝીરા ભારે ઉદ્યોગ",
      "ખાવડા રિન્યુએબલ એનર્જી પાર્ક",
    ],
  },
  HI: {
    kicker: "क्षेत्रीय औद्योगिक केंद्र",
    title: "गुजरात पल्स: धोलेरा SIR और GIFT सिटी",
    desc: "गुजरात के अंतर्राष्ट्रीय वित्तीय सेवा केंद्र (GIFT IFSC), धोलेरा SIR में सेमीकंडक्टर फैब, साणंद EV हब और तटीय आर्थिक क्षेत्रों की समर्पित कवरेज।",
    dispatches: "गुजरात औद्योगिक रिपोर्ट और समाचार",
    clusters: [
      "GIFT सिटी IFSC",
      "धोलेरा सेमीकंडक्टर नोड",
      "साणंद EV हब",
      "मुंद्रा पोर्ट और SEZ",
      "हज़ीरा भारी उद्योग",
      "खावड़ा नवीकरणीय ऊर्जा पार्क",
    ],
  },
};

export function GujaratPulseView({ articles }: { articles: ArticleData[] }) {
  const { locale } = useLanguage();
  const t = PAGE_TEXT[locale] || PAGE_TEXT.EN;

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
      {/* Hero Banner */}
      <div
        className="panel"
        style={{
          padding: "32px 36px",
          marginBottom: 36,
          background: "linear-gradient(135deg, rgba(20, 26, 51, 0.9) 0%, rgba(45, 212, 191, 0.1) 100%)",
          borderColor: "var(--teal)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <span style={{ color: "var(--teal)", fontSize: "1.3rem" }}>✦</span>
          <span
            style={{
              fontSize: "0.85rem",
              color: "var(--teal)",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {t.kicker}
          </span>
        </div>

        <h1 style={{ fontSize: "2rem", marginBottom: 8 }}>
          {t.title}
        </h1>

        <p style={{ color: "var(--muted)", fontSize: "0.95rem", maxWidth: 740, lineHeight: 1.6 }}>
          {t.desc}
        </p>

        {/* Focus Clusters */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
          {t.clusters.map((cluster) => (
            <span
              key={cluster}
              style={{
                fontSize: "0.75rem",
                padding: "4px 12px",
                borderRadius: "var(--radius-pill)",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                fontWeight: 600,
              }}
            >
              {cluster}
            </span>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: 20 }}>
        {t.dispatches}
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
  );
}

