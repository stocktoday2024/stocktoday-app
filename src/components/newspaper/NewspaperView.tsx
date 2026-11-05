"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { parseMultiLang } from "@/types";

export interface SerializedNewspaperEdition {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  publishedAt: string;
  language: string;
  pageCount: number;
  pdfUrl: string;
  coverImageUrl: string | null;
  fileSize: number;
  isPublished: boolean;
  downloads: number;
  views: number;
  author: {
    id: string;
    name: string | null;
    email: string;
  };
}

const UI_TEXT = {
  EN: {
    title: "StockToday Financial E-Newspaper",
    subtitle: "Daily digital financial newspaper editions covering NSE, BSE, commodities, policy reforms, and corporate earnings.",
    latestBadge: "LATEST PUBLISHED EDITION",
    readOnline: "Read Newspaper Online →",
    downloadPdf: "Download PDF",
    pages: "pages",
    filterLang: "Language",
    filterYear: "Year",
    searchPlaceholder: "Search newspaper editions...",
    allLanguages: "All Languages",
    allYears: "All Years",
    noEditions: "No newspaper editions found matching your criteria.",
    archiveTitle: "Previous Editions & Archive",
    publishedOn: "Published on",
  },
  GU: {
    title: "સ્ટોકટુડે ફાયનાન્સિયલ ઈ-અખબાર",
    subtitle: "NSE, BSE, કોમોડિટીઝ, પોલિસી સુધારા અને કોર્પોરેટ પરિણામો આવરી લેતી દૈનિક ડિજિટલ અખબાર આવૃત્તિઓ.",
    latestBadge: "તાજેતરની પ્રકાશિત આવૃત્તિ",
    readOnline: "ઓનલાઈન અખબાર વાંચો →",
    downloadPdf: "PDF ડાઉનલોડ કરો",
    pages: "પાના",
    filterLang: "ભાષા",
    filterYear: "વર્ષ",
    searchPlaceholder: "અખબાર આવૃત્તિઓ શોધો...",
    allLanguages: "બધી ભાષાઓ",
    allYears: "બધા વર્ષો",
    noEditions: "કોઈ મેળ ખાતી અખબાર આવૃત્તિઓ મળી નથી.",
    archiveTitle: "અગાઉની આવૃત્તિઓ અને આર્કાઇવ",
    publishedOn: "પ્રકાશિત તારીખ",
  },
  HI: {
    title: "स्टॉकटुडे फाइनेंशियल ई-अख़बार",
    subtitle: "NSE, BSE, कमोडिटी, नीति सुधार और कॉर्पोरेट आय को कवर करने वाले दैनिक डिजिटल वित्तीय समाचार पत्र संस्करण।",
    latestBadge: "नवीनतम प्रकाशित संस्करण",
    readOnline: "ऑनलाइन अख़बार पढ़ें →",
    downloadPdf: "पीडीएफ डाउनलोड करें",
    pages: "पृष्ठ",
    filterLang: "भाषा",
    filterYear: "वर्ष",
    searchPlaceholder: "अख़बार संस्करण खोजें...",
    allLanguages: "सभी भाषाएं",
    allYears: "सभी वर्ष",
    noEditions: "कोई अख़बार संस्करण नहीं मिला।",
    archiveTitle: "पिछले संस्करण एवं अभिलेखागार",
    publishedOn: "प्रकाशित तिथि",
  },
};

export function NewspaperView({
  initialEditions,
}: {
  initialEditions: SerializedNewspaperEdition[];
}) {
  const { locale } = useLanguage();
  const t = UI_TEXT[locale] || UI_TEXT.EN;

  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");

  const latestEdition = initialEditions[0] || null;

  const years = useMemo(() => {
    const set = new Set<string>();
    initialEditions.forEach((ed) => {
      const y = new Date(ed.publishedAt).getFullYear().toString();
      set.add(y);
    });
    return Array.from(set).sort().reverse();
  }, [initialEditions]);

  const filteredEditions = useMemo(() => {
    return initialEditions.filter((ed) => {
      if (langFilter !== "ALL" && ed.language !== langFilter) return false;
      if (yearFilter !== "ALL") {
        const y = new Date(ed.publishedAt).getFullYear().toString();
        if (y !== yearFilter) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const titleObj = parseMultiLang(ed.title);
        const descObj = ed.description ? parseMultiLang(ed.description) : { en: "", gu: "", hi: "" };
        const matches =
          titleObj.en.toLowerCase().includes(q) ||
          titleObj.gu.toLowerCase().includes(q) ||
          titleObj.hi.toLowerCase().includes(q) ||
          descObj.en.toLowerCase().includes(q) ||
          descObj.gu.toLowerCase().includes(q) ||
          descObj.hi.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [initialEditions, langFilter, yearFilter, search]);

  const archiveEditions = filteredEditions.filter((ed) => ed.id !== latestEdition?.id);

  const getLocalizedTitle = (raw: string) => {
    const parsed = parseMultiLang(raw);
    return locale === "GU" ? (parsed.gu || parsed.en) : locale === "HI" ? (parsed.hi || parsed.en) : (parsed.en || parsed.gu || parsed.hi);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(locale === "GU" ? "gu-IN" : locale === "HI" ? "hi-IN" : "en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
      {/* Newspaper Masthead */}
      <div style={{ textAlign: "center", marginBottom: 40, borderBottom: "2px solid var(--border)", paddingBottom: 28 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{ width: 42, height: 42, borderRadius: 8, overflow: "hidden", position: "relative" }}>
            <Image
              src="/StockTodayLogo.jpeg"
              alt="StockToday Logo"
              width={42}
              height={42}
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />
          </div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2.4rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
            {t.title}
          </h1>
        </div>
        <p style={{ color: "var(--muted)", maxWidth: 650, margin: "0 auto", fontSize: "0.95rem", lineHeight: 1.5 }}>
          {t.subtitle}
        </p>
      </div>

      {/* Featured / Latest Edition */}
      {latestEdition && (
        <div
          className="panel"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(280px, 340px) 1fr",
            gap: 36,
            padding: 32,
            borderRadius: 16,
            border: "1px solid rgba(245, 158, 11, 0.35)",
            background: "linear-gradient(135deg, rgba(245, 158, 11, 0.04), rgba(11, 16, 32, 0.6))",
            marginBottom: 48,
          }}
        >
          {/* Newspaper Cover / Preview */}
          <div
            style={{
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid var(--border)",
              boxShadow: "0 12px 32px rgba(0, 0, 0, 0.3)",
              background: "#0d1322",
              aspectRatio: "3/4",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
              textAlign: "center",
              position: "relative",
            }}
          >
            <div style={{ position: "absolute", top: 12, right: 12, background: "var(--accent)", color: "#000", fontWeight: 700, fontSize: "0.75rem", padding: "4px 8px", borderRadius: 4 }}>
              PDF
            </div>
            <div style={{ width: 64, height: 64, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
              <Image src="/StockTodayLogo.jpeg" alt="Logo" width={64} height={64} style={{ objectFit: "cover" }} />
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 8, color: "var(--text)" }}>
              {getLocalizedTitle(latestEdition.title)}
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
              {formatDate(latestEdition.publishedAt)}
            </p>
            <span style={{ marginTop: 12, fontSize: "0.8rem", color: "var(--accent)", border: "1px solid rgba(245,158,11,0.3)", padding: "3px 10px", borderRadius: 12 }}>
              {latestEdition.pageCount} {t.pages} · {latestEdition.language}
            </span>
          </div>

          {/* Details & Actions */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ display: "inline-block", background: "rgba(245, 158, 11, 0.15)", color: "var(--accent)", fontWeight: 700, fontSize: "0.75rem", padding: "4px 12px", borderRadius: 20, width: "fit-content", marginBottom: 16 }}>
              ✦ {t.latestBadge}
            </div>

            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 12, color: "var(--text)" }}>
              {getLocalizedTitle(latestEdition.title)}
            </h2>

            <p style={{ color: "var(--muted)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: 20 }}>
              {latestEdition.description ? getLocalizedTitle(latestEdition.description) : t.subtitle}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: "0.9rem", color: "var(--muted)", marginBottom: 28 }}>
              <span>📅 {formatDate(latestEdition.publishedAt)}</span>
              <span>📄 {latestEdition.pageCount} {t.pages}</span>
              <span>🌐 {latestEdition.language}</span>
              {latestEdition.fileSize > 0 && (
                <span>💾 {(latestEdition.fileSize / (1024 * 1024)).toFixed(1)} MB</span>
              )}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
              <Link
                href={`/newspaper/${latestEdition.slug}`}
                style={{
                  padding: "12px 24px",
                  borderRadius: 8,
                  background: "var(--accent)",
                  color: "#0B1020",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 4px 14px rgba(245, 158, 11, 0.3)",
                }}
              >
                {t.readOnline}
              </Link>

              <a
                href={latestEdition.pdfUrl}
                download={`${latestEdition.slug}.pdf`}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: "12px 20px",
                  borderRadius: 8,
                  background: "var(--panel)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                📥 {t.downloadPdf}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: 16 }}>
          {t.archiveTitle}
        </h3>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", background: "var(--panel)", padding: "16px 20px", borderRadius: 12, border: "1px solid var(--border)" }}>
          {/* Search Input */}
          <div style={{ flex: 1, minWidth: 240 }}>
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 14px",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--text)",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
          </div>

          {/* Language filter */}
          <div>
            <select
              value={langFilter}
              onChange={(e) => setLangFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--text)",
                fontSize: "0.85rem",
              }}
            >
              <option value="ALL">{t.allLanguages}</option>
              <option value="EN">English (EN)</option>
              <option value="GU">ગુજરાતી (GU)</option>
              <option value="HI">हिन्दी (HI)</option>
              <option value="MULTI">Multilingual</option>
            </select>
          </div>

          {/* Year filter */}
          {years.length > 0 && (
            <div>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                style={{
                  padding: "8px 12px",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  color: "var(--text)",
                  fontSize: "0.85rem",
                }}
              >
                <option value="ALL">{t.allYears}</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Grid of Editions */}
      {archiveEditions.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 24,
          }}
        >
          {archiveEditions.map((ed) => (
            <div
              key={ed.id}
              className="panel"
              style={{
                display: "flex",
                flexDirection: "column",
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid var(--border)",
                transition: "transform 0.2s, border-color 0.2s",
              }}
            >
              {/* Card preview */}
              <div
                style={{
                  aspectRatio: "16/9",
                  background: "#0B1020",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderBottom: "1px solid var(--border)",
                  position: "relative",
                  padding: 16,
                  textAlign: "center",
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 8, overflow: "hidden" }}>
                  <Image src="/StockTodayLogo.jpeg" alt="Logo" width={44} height={44} style={{ objectFit: "cover" }} />
                </div>
                <span
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    background: "rgba(245, 158, 11, 0.2)",
                    color: "var(--accent)",
                    fontSize: "0.7rem",
                    padding: "2px 8px",
                    borderRadius: 4,
                    fontWeight: 700,
                  }}
                >
                  {ed.language}
                </span>
              </div>

              {/* Card body */}
              <div style={{ padding: 18, display: "flex", flexDirection: "column", flex: 1 }}>
                <span style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: 6 }}>
                  {formatDate(ed.publishedAt)} · {ed.pageCount} {t.pages}
                </span>

                <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text)", marginBottom: 16, lineHeight: 1.4 }}>
                  {getLocalizedTitle(ed.title)}
                </h4>

                <div style={{ marginTop: "auto", display: "flex", gap: 10 }}>
                  <Link
                    href={`/newspaper/${ed.slug}`}
                    style={{
                      flex: 1,
                      padding: "8px 14px",
                      borderRadius: 6,
                      background: "var(--accent)",
                      color: "#0B1020",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      textAlign: "center",
                      textDecoration: "none",
                    }}
                  >
                    Read
                  </Link>

                  <a
                    href={ed.pdfUrl}
                    download={`${ed.slug}.pdf`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "8px 12px",
                      borderRadius: 6,
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                      fontSize: "0.85rem",
                      textDecoration: "none",
                    }}
                  >
                    📥
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: 48, textAlign: "center", color: "var(--muted)" }}>
          {t.noEditions}
        </div>
      )}
    </div>
  );
}

