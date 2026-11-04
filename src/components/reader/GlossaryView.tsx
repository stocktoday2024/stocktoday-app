"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { parseMultiLang, getLocalised } from "@/types";

interface TermData {
  id: string;
  slug: string;
  term: string;
  definition: string;
}

const UI_TEXT = {
  EN: {
    kicker: "Stock Market Knowledge & Glossary",
    desc: "Essential Indian financial terms and concepts translated and explained simply across English, Gujarati, and Hindi.",
    searchPlaceholder: "Search financial terms...",
    allTerms: "All Terms",
    empty: "No matching terms found.",
  },
  GU: {
    kicker: "શેરબજાર જ્ઞાન અને શબ્દકોશ",
    desc: "અંગ્રેજી, ગુજરાતી અને હિન્દીમાં સરળતાથી સમજાવેલા આવશ્યક ભારતીય નાણાકીય શબ્દો અને વિભાવનાઓ.",
    searchPlaceholder: "નાણાકીય શબ્દો શોધો...",
    allTerms: "બધા શબ્દો",
    empty: "કોઈ મેળ ખાતા શબ્દો મળ્યા નથી.",
  },
  HI: {
    kicker: "शेयर बाज़ार ज्ञान और शब्दावली",
    desc: "अंग्रेजी, गुजराती और हिंदी में सरलता से समझाए गए आवश्यक भारतीय वित्तीय शब्द और अवधारणाएं।",
    searchPlaceholder: "वित्तीय शब्द खोजें...",
    allTerms: "सभी शब्द",
    empty: "कोई मेल खाने वाला शब्द नहीं मिला।",
  },
};

export function GlossaryView({ terms }: { terms: TermData[] }) {
  const { locale } = useLanguage();
  const [query, setQuery] = useState("");
  const t = UI_TEXT[locale] || UI_TEXT.EN;

  const filtered = terms.filter((termItem) => {
    const term = parseMultiLang(termItem.term);
    const def = parseMultiLang(termItem.definition);
    const q = query.toLowerCase();
    return (
      term.en.toLowerCase().includes(q) ||
      term.gu.toLowerCase().includes(q) ||
      term.hi.toLowerCase().includes(q) ||
      def.en.toLowerCase().includes(q) ||
      def.gu.toLowerCase().includes(q) ||
      def.hi.toLowerCase().includes(q)
    );
  });

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "var(--accent)", fontSize: "1.2rem" }}>✦</span>
          <h1 style={{ fontSize: "1.8rem" }}>{t.kicker}</h1>
        </div>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginTop: 4 }}>
          {t.desc}
        </p>

        {/* Search */}
        <div style={{ marginTop: 20, maxWidth: 480 }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            style={{
              width: "100%",
              padding: "10px 16px",
              borderRadius: "var(--radius-pill)",
              background: "var(--panel)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              fontSize: "0.9rem",
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* Terms Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 20,
        }}
      >
        {filtered.map((tItem) => {
          const term = parseMultiLang(tItem.term);
          const def = parseMultiLang(tItem.definition);

          const mainTerm = locale === "GU" ? (term.gu || term.en) : locale === "HI" ? (term.hi || term.en) : term.en;
          const subTerm = locale === "GU" ? `${term.en} · ${term.hi}` : locale === "HI" ? `${term.en} · ${term.gu}` : `${term.gu} · ${term.hi}`;
          const mainDef = locale === "GU" ? (def.gu || def.en) : locale === "HI" ? (def.hi || def.en) : def.en;
          const altDef = locale !== "EN" && def.en !== mainDef ? def.en : null;

          return (
            <div key={tItem.id} className="panel" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ marginBottom: 12 }}>
                <h3 style={{ fontSize: "1.2rem", color: "var(--text)", marginBottom: 4 }}>
                  {mainTerm}
                </h3>
                <div style={{ fontSize: "0.85rem", color: "var(--accent)", fontWeight: 500 }}>
                  {subTerm}
                </div>
              </div>

              <p style={{ fontSize: "0.95rem", color: "var(--text)", lineHeight: 1.6, marginBottom: 12 }}>
                {mainDef}
              </p>

              {altDef && (
                <div
                  style={{
                    marginTop: "auto",
                    paddingTop: 10,
                    borderTop: "1px solid var(--border)",
                    fontSize: "0.8rem",
                    color: "var(--muted)",
                    lineHeight: 1.5,
                  }}
                >
                  <strong style={{ color: "var(--text)" }}>EN:</strong> {altDef}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
          {t.empty}
        </div>
      )}
    </div>
  );
}

