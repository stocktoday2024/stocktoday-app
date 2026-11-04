"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const FOOTER_TEXT = {
  EN: {
    desc: "Multilingual Indian financial journalism for modern investors and enthusiasts across English, Gujarati, and Hindi.",
    col1Title: "Markets & Coverage",
    indices: "NSE & BSE Indices",
    companies: "Top Listed Companies",
    ipos: "Upcoming IPOs",
    gujarat: "Gujarat Pulse (Dholera / GIFT)",
    col2Title: "Knowledge & Resources",
    glossary: "Stock Market Glossary",
    editorial: "Editorial Guidelines",
    disclaimer: "Regulatory Disclaimers",
    col3Title: "Editorial Portal",
    editorialDesc: "Authorized contributors, reporters and editorial desk sign in.",
    signin: "Editorial Sign In →",
    copyright: "StockToday · Real-Time Multilingual Financial Intelligence · NSE / BSE / GIFT City",
  },
  GU: {
    desc: "અંગ્રેજી, ગુજરાતી અને હિન્દીમાં આધુનિક રોકાણકારો માટે બહુભાષી ભારતીય નાણાકીય પત્રકારત્વ.",
    col1Title: "બજારો અને કવરેજ",
    indices: "NSE અને BSE ઇન્ડેક્સ",
    companies: "ટોચની લિસ્ટેડ કંપનીઓ",
    ipos: "આગામી IPO",
    gujarat: "ગુજરાત પલ્સ (ધોલેરા / GIFT)",
    col2Title: "જ્ઞાન અને સંસાધનો",
    glossary: "શેરબજાર શબ્દકોશ",
    editorial: "સંપાદકીય માર્ગદર્શિકા",
    disclaimer: "નિયમનકારી ડિસ્ક્લેમર",
    col3Title: "સંપાદકીય પોર્ટલ",
    editorialDesc: "અધિકૃત યોગદાનકર્તાઓ અને સંપાદકીય ડેસ્ક સાઇન ઇન.",
    signin: "સંપાદકીય સાઇન ઇન →",
    copyright: "StockToday · વાસ્તવિક સમય બહુભાષી નાણાકીય બુદ્ધિમત્તા · NSE / BSE / GIFT City",
  },
  HI: {
    desc: "अंग्रेजी, गुजराती और हिंदी में आधुनिक निवेशकों के लिए बहुभाषी भारतीय वित्तीय पत्रकारिता।",
    col1Title: "बाज़ार और कवरेज",
    indices: "NSE और BSE सूचकांक",
    companies: "शीर्ष सूचीबद्ध कंपनियां",
    ipos: "आगामी IPO",
    gujarat: "गुजरात पल्स (धोलेरा / GIFT)",
    col2Title: "ज्ञान और संसाधन",
    glossary: "शेयर बाज़ार शब्दावली",
    editorial: "संपादकीय दिशानिर्देश",
    disclaimer: "नियामक अस्वीकरण",
    col3Title: "संपादकीय पोर्टल",
    editorialDesc: "अधिकृत योगदानकर्ता और संपादकीय डेस्क साइन इन करें।",
    signin: "संपादकीय साइन इन →",
    copyright: "StockToday · रियल-टाइम बहुभाषी वित्तीय इंटेलिजेंस · NSE / BSE / GIFT City",
  },
};

export function Footer() {
  const { locale } = useLanguage();
  const t = FOOTER_TEXT[locale] || FOOTER_TEXT.EN;

  return (
    <footer
      style={{
        background: "var(--panel)",
        borderTop: "1px solid var(--border)",
        marginTop: "auto",
        padding: "40px var(--page-px) 24px var(--page-px)",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 32,
          marginBottom: 32,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ color: "var(--accent)", fontSize: "1.25rem", fontWeight: 700 }}>◆</span>
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.1rem" }}>
              Stock Today
            </span>
          </div>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", lineHeight: 1.6 }}>
            {t.desc}
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: "0.9rem", marginBottom: 12, color: "var(--text)" }}>{t.col1Title}</h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, fontSize: "0.85rem" }}>
            <li><Link href="/markets" style={{ color: "var(--muted)" }}>{t.indices}</Link></li>
            <li><Link href="/companies" style={{ color: "var(--muted)" }}>{t.companies}</Link></li>
            <li><Link href="/ipos" style={{ color: "var(--muted)" }}>{t.ipos}</Link></li>
            <li><Link href="/gujarat-pulse" style={{ color: "var(--teal)" }}>{t.gujarat}</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: "0.9rem", marginBottom: 12, color: "var(--text)" }}>{t.col2Title}</h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, fontSize: "0.85rem" }}>
            <li><Link href="/glossary" style={{ color: "var(--muted)" }}>{t.glossary}</Link></li>
            <li><Link href="/editorial-policy" style={{ color: "var(--muted)" }}>{t.editorial}</Link></li>
            <li><Link href="/disclaimer" style={{ color: "var(--muted)" }}>{t.disclaimer}</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: "0.9rem", marginBottom: 12, color: "var(--text)" }}>{t.col3Title}</h4>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: 12 }}>
            {t.editorialDesc}
          </p>
          <Link
            href="/signin"
            style={{
              display: "inline-block",
              padding: "6px 14px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              fontSize: "0.8rem",
              color: "var(--text)",
              background: "var(--bg)",
            }}
          >
            {t.signin}
          </Link>
        </div>
      </div>

      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          paddingTop: 20,
          borderTop: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          fontSize: "0.75rem",
          color: "var(--muted)",
        }}
      >
        <span>© 2026 StockToday · {t.copyright}</span>
        <div style={{ display: "flex", gap: 16 }}>
          <Link href="/disclaimer" style={{ color: "var(--muted)" }}>{t.disclaimer}</Link>
          <Link href="/editorial-policy" style={{ color: "var(--muted)" }}>{t.editorial}</Link>
        </div>
      </div>
    </footer>
  );
}
