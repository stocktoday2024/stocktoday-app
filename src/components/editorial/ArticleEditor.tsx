"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, SENTIMENTS } from "@/types";
import { VisualRichTextEditor } from "./VisualRichTextEditor";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { validateTargetScript } from "@/lib/translation";

interface ArticleEditorProps {
  initialData?: {
    id?: string;
    slug?: string;
    category?: string;
    sentiment?: string | null;
    isBreaking?: boolean;
    isFeatured?: boolean;
    coverImageUrl?: string | null;
    sourceUrl?: string | null;
    title?: { en: string; gu: string; hi: string };
    summary?: { en: string; gu: string; hi: string };
    body?: { en: string; gu: string; hi: string };
    simpleExplain?: { en: string; gu: string; hi: string };
    status?: string;
  };
  userRole?: string;
}

export function ArticleEditor({ initialData, userRole = "EDITOR" }: ArticleEditorProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"EN" | "GU" | "HI">("EN");

  // Metadata Fields
  const [category, setCategory] = useState(initialData?.category || "Markets");
  const [sentiment, setSentiment] = useState(initialData?.sentiment || "NEUTRAL");
  const [isBreaking, setIsBreaking] = useState(initialData?.isBreaking || false);
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.coverImageUrl || "");
  const [sourceUrl, setSourceUrl] = useState(initialData?.sourceUrl || "");
  const [slug, setSlug] = useState(initialData?.slug || "");

  // Content Fields
  const [title, setTitle] = useState(initialData?.title || { en: "", gu: "", hi: "" });
  const [summary, setSummary] = useState(initialData?.summary || { en: "", gu: "", hi: "" });
  const [body, setBody] = useState(initialData?.body || { en: "", gu: "", hi: "" });
  const [simpleExplain, setSimpleExplain] = useState(
    initialData?.simpleExplain || { en: "", gu: "", hi: "" }
  );

  // User manual edits tracking to prevent accidental overwrites
  const [hasManualEdit, setHasManualEdit] = useState<{ gu: boolean; hi: boolean; en: boolean }>({
    gu: Boolean(initialData?.title?.gu),
    hi: Boolean(initialData?.title?.hi),
    en: Boolean(initialData?.title?.en),
  });

  const [isReviewed, setIsReviewed] = useState<{ gu: boolean; hi: boolean }>({
    gu: Boolean(initialData?.title?.gu && initialData?.body?.gu),
    hi: Boolean(initialData?.title?.hi && initialData?.body?.hi),
  });

  const [translating, setTranslating] = useState(false);
  const [translationStatus, setTranslationStatus] = useState<{
    type: "success" | "warn" | "error";
    message: string;
    details?: string[];
  } | null>(null);

  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Precise Per-Language Field Completeness Checker
  const checkLanguageFields = (lang: "en" | "gu" | "hi") => {
    const tVal = (title[lang] || "").trim();
    const sVal = (summary[lang] || "").trim();
    const eVal = (simpleExplain[lang] || "").trim();
    const bVal = (body[lang] || "")
      .replace(/<p><\/p>/g, "")
      .replace(/<br\s*\/?>/g, "")
      .trim();

    // Check non-empty AND genuine script match (cannot be copy-pasted English in Gujarati/Hindi)
    const isLangScript = (val: string) => {
      if (!val) return false;
      const targetLang = lang.toUpperCase() as "EN" | "GU" | "HI";
      return validateTargetScript(val, targetLang);
    };

    const hasTitle = Boolean(tVal && isLangScript(tVal));
    const hasSummary = Boolean(sVal && isLangScript(sVal));
    const hasSimple = Boolean(eVal && isLangScript(eVal));
    const hasBody = Boolean(bVal && isLangScript(bVal));

    const completed = [hasTitle, hasSummary, hasSimple, hasBody].filter(Boolean).length;
    return {
      title: hasTitle,
      summary: hasSummary,
      simpleExplain: hasSimple,
      body: hasBody,
      completed,
      isFullyComplete: completed === 4,
    };
  };

  const enStats = checkLanguageFields("en");
  const guStats = checkLanguageFields("gu");
  const hiStats = checkLanguageFields("hi");

  // Mandatory Publication Requirements
  const requirements = [
    { id: "headline_en", label: "English Headline", met: enStats.title, tab: "EN" },
    { id: "summary_en", label: "English Summary", met: enStats.summary, tab: "EN" },
    { id: "simple_en", label: "English Simple Explanation", met: enStats.simpleExplain, tab: "EN" },
    { id: "body_en", label: "English Story Body", met: enStats.body, tab: "EN" },
    { id: "headline_gu", label: "Gujarati Headline (ગુજરાતી)", met: guStats.title, tab: "GU" },
    { id: "summary_gu", label: "Gujarati Summary (ગુજરાતી)", met: guStats.summary, tab: "GU" },
    { id: "simple_gu", label: "Gujarati Simple Explanation", met: guStats.simpleExplain, tab: "GU" },
    { id: "body_gu", label: "Gujarati Story Body (ગુજરાતી)", met: guStats.body, tab: "GU" },
    { id: "headline_hi", label: "Hindi Headline (हिन्दी)", met: hiStats.title, tab: "HI" },
    { id: "summary_hi", label: "Hindi Summary (हिन्दी)", met: hiStats.summary, tab: "HI" },
    { id: "simple_hi", label: "Hindi Simple Explanation", met: hiStats.simpleExplain, tab: "HI" },
    { id: "body_hi", label: "Hindi Story Body (हिन्दी)", met: hiStats.body, tab: "HI" },
    { id: "category", label: "Market Category", met: Boolean(category) },
    { id: "sentiment", label: "Market Sentiment", met: Boolean(sentiment) },
  ];

  const completedCount = requirements.filter((r) => r.met).length;
  const totalRequired = requirements.length;
  const progressPercent = Math.round((completedCount / totalRequired) * 100);
  const missingRequirements = requirements.filter((r) => !r.met);

  // Auto-Generate AI Translations
  const handleGenerateTranslations = async () => {
    const currentLangKey = activeTab.toLowerCase() as "en" | "gu" | "hi";
    const currentTitle = (title[currentLangKey] || "").trim();
    const currentSummary = (summary[currentLangKey] || "").trim();
    const currentSimple = (simpleExplain[currentLangKey] || "").trim();
    const currentBody = (body[currentLangKey] || "").trim();

    if (!currentTitle && !currentSummary && !currentBody) {
      setStatusMessage({
        type: "error",
        text: `Please enter at least the Headline and Summary in ${
          activeTab === "EN" ? "English" : activeTab === "GU" ? "Gujarati" : "Hindi"
        } before translating.`,
      });
      return;
    }

    // Protection check: if Gujarati or Hindi was already manually edited, confirm overwrite
    const targetKeys: ("gu" | "hi" | "en")[] = (["en", "gu", "hi"] as const).filter(
      (k) => k !== currentLangKey
    );
    const hasExistingTargetContent = targetKeys.some(
      (k) => hasManualEdit[k] && Boolean(title[k]?.trim())
    );

    if (hasExistingTargetContent) {
      const confirmOverwrite = window.confirm(
        "You have existing or manually edited translations in the other language tabs. Generating fresh translations will replace them. Do you want to proceed?"
      );
      if (!confirmOverwrite) return;
    }

    setTranslating(true);
    setTranslationStatus({
      type: "warn",
      message: `Translating all fields from ${
        activeTab === "EN" ? "English" : activeTab === "GU" ? "Gujarati" : "Hindi"
      } into the other two languages...`,
    });
    setStatusMessage(null);

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceLang: activeTab,
          fields: {
            title: currentTitle,
            summary: currentSummary,
            simpleExplain: currentSimple,
            body: currentBody,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Translation request failed.");
      }

      const translations = data.translations;
      if (!translations) {
        throw new Error("No translation payload received from server.");
      }

      let anyPopulated = false;

      // Update Gujarati
      if (translations.gu && activeTab !== "GU") {
        setTitle((prev) => ({ ...prev, gu: translations.gu.title || "" }));
        setSummary((prev) => ({ ...prev, gu: translations.gu.summary || "" }));
        setSimpleExplain((prev) => ({ ...prev, gu: translations.gu.simpleExplain || "" }));
        setBody((prev) => ({ ...prev, gu: translations.gu.body || "" }));
        setIsReviewed((prev) => ({ ...prev, gu: false }));
        setHasManualEdit((prev) => ({ ...prev, gu: false }));
        if (translations.gu.title || translations.gu.body) anyPopulated = true;
      }

      // Update Hindi
      if (translations.hi && activeTab !== "HI") {
        setTitle((prev) => ({ ...prev, hi: translations.hi.title || "" }));
        setSummary((prev) => ({ ...prev, hi: translations.hi.summary || "" }));
        setSimpleExplain((prev) => ({ ...prev, hi: translations.hi.simpleExplain || "" }));
        setBody((prev) => ({ ...prev, hi: translations.hi.body || "" }));
        setIsReviewed((prev) => ({ ...prev, hi: false }));
        setHasManualEdit((prev) => ({ ...prev, hi: false }));
        if (translations.hi.title || translations.hi.body) anyPopulated = true;
      }

      // Update English if Gujarati was the source
      if (translations.en && activeTab !== "EN") {
        setTitle((prev) => ({ ...prev, en: translations.en.title || "" }));
        setSummary((prev) => ({ ...prev, en: translations.en.summary || "" }));
        setSimpleExplain((prev) => ({ ...prev, en: translations.en.simpleExplain || "" }));
        setBody((prev) => ({ ...prev, en: translations.en.body || "" }));
        setHasManualEdit((prev) => ({ ...prev, en: false }));
        if (translations.en.title || translations.en.body) anyPopulated = true;
      }

      if (data.isComplete && anyPopulated) {
        setTranslationStatus({
          type: "success",
          message:
            "All fields were translated into native Gujarati and Hindi scripts! Please review both tabs before publishing.",
        });
      } else {
        const errorList = data.errors || data.missingFields || [];
        setTranslationStatus({
          type: "warn",
          message: `Translation partially completed. ${errorList.length} field(s) require attention:`,
          details: errorList,
        });
      }
    } catch (err: any) {
      setTranslationStatus({
        type: "error",
        message: err.message || "Failed to generate translations. Please check connection and retry.",
      });
    } finally {
      setTranslating(false);
    }
  };

  const handleSave = async (targetStatus: "DRAFT" | "APPROVED") => {
    if (targetStatus === "APPROVED") {
      if (missingRequirements.length > 0) {
        setStatusMessage({
          type: "error",
          text: `Cannot publish live: ${missingRequirements.length} mandatory requirement(s) missing. Review missing items banner.`,
        });
        return;
      }
    }

    setSaving(true);
    setStatusMessage(null);

    const generatedSlug =
      slug.trim() ||
      (title.en || title.gu || title.hi || "story")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const payload = {
      id: initialData?.id,
      slug: generatedSlug,
      category,
      sentiment,
      isBreaking,
      isFeatured,
      coverImageUrl,
      sourceUrl,
      status: targetStatus,
      title,
      summary,
      body,
      simpleExplain,
    };

    try {
      const isEdit = Boolean(initialData?.id);
      const res = await fetch("/api/articles", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to save article.");
      }

      setStatusMessage({
        type: "success",
        text: targetStatus === "APPROVED" ? "Story published live to StockToday!" : "Draft saved successfully.",
      });

      setTimeout(() => {
        router.push(userRole === "ADMIN" ? "/admin" : "/editorial");
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to save article." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", paddingBottom: 64 }}>
      {/* Top Header & Readiness Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>
            {initialData?.id ? "Edit Financial Article" : "Create Financial Story"}
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: 4 }}>
            Write in English or Gujarati, auto-translate with authentic native scripts, review, and publish.
          </p>
        </div>

        {/* Dynamic Publish Readiness Meter */}
        <div
          style={{
            background: "var(--panel)",
            border: "1px solid var(--border)",
            padding: "10px 18px",
            borderRadius: "var(--radius-sm)",
            minWidth: 260,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: 6 }}>
            <span style={{ color: "var(--muted)", fontWeight: 500 }}>Publish Readiness</span>
            <span
              style={{
                fontWeight: 700,
                color: progressPercent === 100 ? "var(--up)" : "var(--accent)",
              }}
            >
              {completedCount} of {totalRequired} ({progressPercent}%)
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: 7,
              background: "rgba(255,255,255,0.06)",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: "100%",
                background: progressPercent === 100 ? "var(--up)" : "var(--accent)",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      </div>

      {/* Missing Requirements Banner */}
      {missingRequirements.length > 0 && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "var(--radius-sm)",
            background: "rgba(251, 191, 36, 0.08)",
            border: "1px solid rgba(251, 191, 36, 0.25)",
            marginBottom: 20,
            fontSize: "0.82rem",
          }}
        >
          <div style={{ fontWeight: 600, color: "var(--accent)", marginBottom: 4 }}>
            Missing {missingRequirements.length} required field(s) for live publication:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {missingRequirements.map((req) => (
              <button
                key={req.id}
                type="button"
                onClick={() => {
                  if (req.tab) setActiveTab(req.tab as any);
                }}
                style={{
                  padding: "3px 8px",
                  borderRadius: 4,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                  fontSize: "0.75rem",
                  cursor: req.tab ? "pointer" : "default",
                }}
              >
                • {req.label} {req.tab ? `(${req.tab})` : ""}
              </button>
            ))}
          </div>
        </div>
      )}

      {statusMessage && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "var(--radius-sm)",
            marginBottom: 20,
            background:
              statusMessage.type === "success" ? "rgba(52, 211, 153, 0.12)" : "rgba(239, 68, 68, 0.12)",
            border: `1px solid ${
              statusMessage.type === "success" ? "rgba(52, 211, 153, 0.35)" : "rgba(239, 68, 68, 0.35)"
            }`,
            color: statusMessage.type === "success" ? "var(--up)" : "var(--down)",
            fontSize: "0.88rem",
            fontWeight: 500,
          }}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Language Navigation Tabs with Detailed Field Counts */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          padding: "12px 16px",
          background: "var(--panel)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          {/* English Tab */}
          <button
            type="button"
            onClick={() => setActiveTab("EN")}
            style={{
              padding: "8px 16px",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              border: activeTab === "EN" ? "1px solid var(--accent)" : "1px solid var(--border)",
              background: activeTab === "EN" ? "rgba(251, 191, 36, 0.15)" : "transparent",
              color: activeTab === "EN" ? "var(--accent)" : "var(--text)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>English</span>
            <span
              style={{
                fontSize: "0.72rem",
                padding: "1px 6px",
                borderRadius: 4,
                background: enStats.isFullyComplete ? "rgba(52, 211, 153, 0.2)" : "rgba(255,255,255,0.08)",
                color: enStats.isFullyComplete ? "var(--up)" : "var(--muted)",
              }}
            >
              {enStats.completed}/4
            </span>
          </button>

          {/* Gujarati Tab */}
          <button
            type="button"
            onClick={() => setActiveTab("GU")}
            style={{
              padding: "8px 16px",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              border: activeTab === "GU" ? "1px solid var(--accent)" : "1px solid var(--border)",
              background: activeTab === "GU" ? "rgba(251, 191, 36, 0.15)" : "transparent",
              color: activeTab === "GU" ? "var(--accent)" : "var(--text)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>ગુજરાતી (Gujarati)</span>
            <span
              style={{
                fontSize: "0.72rem",
                padding: "1px 6px",
                borderRadius: 4,
                background: guStats.isFullyComplete ? "rgba(52, 211, 153, 0.2)" : "rgba(255,255,255,0.08)",
                color: guStats.isFullyComplete ? "var(--up)" : "var(--muted)",
              }}
            >
              {guStats.completed}/4
            </span>
          </button>

          {/* Hindi Tab */}
          <button
            type="button"
            onClick={() => setActiveTab("HI")}
            style={{
              padding: "8px 16px",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              border: activeTab === "HI" ? "1px solid var(--accent)" : "1px solid var(--border)",
              background: activeTab === "HI" ? "rgba(251, 191, 36, 0.15)" : "transparent",
              color: activeTab === "HI" ? "var(--accent)" : "var(--text)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>हिन्दी (Hindi)</span>
            <span
              style={{
                fontSize: "0.72rem",
                padding: "1px 6px",
                borderRadius: 4,
                background: hiStats.isFullyComplete ? "rgba(52, 211, 153, 0.2)" : "rgba(255,255,255,0.08)",
                color: hiStats.isFullyComplete ? "var(--up)" : "var(--muted)",
              }}
            >
              {hiStats.completed}/4
            </span>
          </button>
        </div>

        {/* Translation Action Button */}
        <button
          type="button"
          onClick={handleGenerateTranslations}
          disabled={translating}
          style={{
            padding: "8px 18px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid rgba(45, 212, 191, 0.4)",
            background: "rgba(45, 212, 191, 0.12)",
            color: "var(--teal)",
            fontWeight: 700,
            fontSize: "0.85rem",
            cursor: translating ? "wait" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>✨</span>
          <span>
            {translating
              ? "Generating Translations..."
              : `Auto-Translate from ${
                  activeTab === "EN" ? "English" : activeTab === "GU" ? "Gujarati" : "Hindi"
                }`}
          </span>
        </button>
      </div>

      {/* Translation Alert & Details */}
      {translationStatus && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "var(--radius-sm)",
            marginBottom: 20,
            background:
              translationStatus.type === "success"
                ? "rgba(52, 211, 153, 0.12)"
                : translationStatus.type === "warn"
                ? "rgba(251, 191, 36, 0.1)"
                : "rgba(239, 68, 68, 0.12)",
            border: `1px solid ${
              translationStatus.type === "success"
                ? "rgba(52, 211, 153, 0.35)"
                : translationStatus.type === "warn"
                ? "rgba(251, 191, 36, 0.3)"
                : "rgba(239, 68, 68, 0.35)"
            }`,
            color:
              translationStatus.type === "success"
                ? "var(--up)"
                : translationStatus.type === "warn"
                ? "var(--accent)"
                : "var(--down)",
            fontSize: "0.85rem",
          }}
        >
          <div style={{ fontWeight: 600 }}>{translationStatus.message}</div>
          {translationStatus.details && translationStatus.details.length > 0 && (
            <ul style={{ margin: "6px 0 0 16px", fontSize: "0.8rem", color: "var(--text)" }}>
              {translationStatus.details.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Content Form Card */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            background: "var(--panel)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 18,
              paddingBottom: 14,
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>
                {activeTab === "EN"
                  ? "English Story"
                  : activeTab === "GU"
                  ? "ગુજરાતી આવૃત્તિ (Gujarati Edition)"
                  : "हिन्दी संस्करण (Hindi Edition)"}
              </h2>
              <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                {activeTab === "EN"
                  ? "Primary authoring language"
                  : isReviewed[activeTab.toLowerCase() as "gu" | "hi"]
                  ? "Status: Human Reviewed ✓"
                  : "Status: AI Generated · Needs Review"}
              </span>
            </div>

            {activeTab !== "EN" && (
              <button
                type="button"
                onClick={() => {
                  const key = activeTab.toLowerCase() as "gu" | "hi";
                  setIsReviewed((prev) => ({ ...prev, [key]: !prev[key] }));
                }}
                style={{
                  padding: "5px 12px",
                  borderRadius: 6,
                  border: isReviewed[activeTab.toLowerCase() as "gu" | "hi"]
                    ? "1px solid rgba(52, 211, 153, 0.4)"
                    : "1px solid var(--border)",
                  background: isReviewed[activeTab.toLowerCase() as "gu" | "hi"]
                    ? "rgba(52, 211, 153, 0.15)"
                    : "rgba(255, 255, 255, 0.04)",
                  color: isReviewed[activeTab.toLowerCase() as "gu" | "hi"] ? "var(--up)" : "var(--muted)",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {isReviewed[activeTab.toLowerCase() as "gu" | "hi"]
                  ? "✓ Mark as Reviewed"
                  : "Mark as Human Reviewed"}
              </button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Headline */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "var(--text)",
                  marginBottom: 6,
                }}
              >
                Article Headline <span style={{ color: "var(--down)" }}>*</span>
              </label>
              <input
                type="text"
                value={title[activeTab.toLowerCase() as keyof typeof title] || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  const langKey = activeTab.toLowerCase() as "en" | "gu" | "hi";
                  setTitle({ ...title, [langKey]: val });
                  setHasManualEdit((prev) => ({ ...prev, [langKey]: true }));
                }}
                placeholder={
                  activeTab === "EN"
                    ? "e.g. Tata Motors PV Sales Surge 14% as EV Adoption Accelerates"
                    : activeTab === "GU"
                    ? "દા.ત. ટાટા મોટર્સના વેચાણમાં ૧૪% નો ઉછાળો"
                    : "उदा. टाटा मोटर्स की बिक्री में १४% का उछाल"
                }
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                  background: "var(--panel)",
                  color: "var(--text)",
                  fontSize: "1rem",
                  fontWeight: 600,
                  outline: "none",
                }}
              />
            </div>

            {/* Summary */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "var(--text)",
                  marginBottom: 6,
                }}
              >
                Summary / Executive Brief <span style={{ color: "var(--down)" }}>*</span>
              </label>
              <textarea
                rows={3}
                value={summary[activeTab.toLowerCase() as keyof typeof summary] || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  const langKey = activeTab.toLowerCase() as "en" | "gu" | "hi";
                  setSummary({ ...summary, [langKey]: val });
                  setHasManualEdit((prev) => ({ ...prev, [langKey]: true }));
                }}
                placeholder="2-3 sentence financial overview of the market development..."
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                  background: "var(--panel)",
                  color: "var(--text)",
                  fontSize: "0.9rem",
                  lineHeight: 1.5,
                  resize: "vertical",
                  outline: "none",
                }}
              />
            </div>

            {/* Simple Explanation */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "var(--text)",
                  marginBottom: 6,
                }}
              >
                Simple Explanation (What this means for retail investors){" "}
                <span style={{ color: "var(--down)" }}>*</span>
              </label>
              <textarea
                rows={2}
                value={simpleExplain[activeTab.toLowerCase() as keyof typeof simpleExplain] || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  const langKey = activeTab.toLowerCase() as "en" | "gu" | "hi";
                  setSimpleExplain({ ...simpleExplain, [langKey]: val });
                  setHasManualEdit((prev) => ({ ...prev, [langKey]: true }));
                }}
                placeholder="Explain the market impact in simple terms without financial jargon..."
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                  background: "var(--panel)",
                  color: "var(--text)",
                  fontSize: "0.9rem",
                  lineHeight: 1.5,
                  resize: "vertical",
                  outline: "none",
                }}
              />
            </div>

            {/* Visual Rich-Text Story Body */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "var(--text)",
                  marginBottom: 6,
                }}
              >
                Detailed Story Body <span style={{ color: "var(--down)" }}>*</span>
              </label>
              <VisualRichTextEditor
                value={body[activeTab.toLowerCase() as keyof typeof body] || ""}
                onChange={(newVal) => {
                  const langKey = activeTab.toLowerCase() as "en" | "gu" | "hi";
                  setBody((prev) => ({ ...prev, [langKey]: newVal }));
                  setHasManualEdit((prev) => ({ ...prev, [langKey]: true }));
                }}
                placeholder="Write the full financial story. Use the visual toolbar above for bold, headings, and lists."
              />
            </div>
          </div>
        </div>

        {/* Metadata & Classification Card */}
        <div
          style={{
            background: "var(--panel)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: 24,
          }}
        >
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text)", margin: "0 0 16px 0" }}>
            Publishing Metadata & Classification
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            {/* Custom Accessible Category Dropdown */}
            <div>
              <CustomSelect
                label="Market Category"
                required
                options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                value={category}
                onChange={(val) => setCategory(val)}
              />
            </div>

            {/* Custom Accessible Sentiment Dropdown */}
            <div>
              <CustomSelect
                label="Market Sentiment"
                required
                options={SENTIMENTS.map((s) => ({ value: s, label: s }))}
                value={sentiment}
                onChange={(val) => setSentiment(val)}
              />
            </div>

            {/* Cover Image URL */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "var(--text)",
                  marginBottom: 6,
                }}
              >
                Cover Image URL
              </label>
              <input
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                  background: "var(--panel)",
                  color: "var(--text)",
                  fontSize: "0.9rem",
                  outline: "none",
                }}
              />
            </div>

            {/* Source URL */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "var(--text)",
                  marginBottom: 6,
                }}
              >
                Official Disclosure / Source Link
              </label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://bseindia.com/..."
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                  background: "var(--panel)",
                  color: "var(--text)",
                  fontSize: "0.9rem",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Toggles: Breaking & Featured */}
          <div
            style={{
              display: "flex",
              gap: 24,
              marginTop: 20,
              paddingTop: 16,
              borderTop: "1px solid var(--border)",
            }}
          >
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.85rem" }}>
              <input
                type="checkbox"
                checked={isBreaking}
                onChange={(e) => setIsBreaking(e.target.checked)}
                style={{ accentColor: "var(--down)" }}
              />
              <span style={{ fontWeight: 600, color: isBreaking ? "var(--down)" : "var(--text)" }}>
                🚨 Breaking News Flash
              </span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.85rem" }}>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                style={{ accentColor: "var(--accent)" }}
              />
              <span style={{ fontWeight: 600, color: isFeatured ? "var(--accent)" : "var(--text)" }}>
                ⭐ Feature on Top Hero
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div
        style={{
          marginTop: 28,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          background: "var(--panel)",
          border: "1px solid var(--border)",
          padding: "14px 20px",
          borderRadius: "var(--radius)",
        }}
      >
        <button
          type="button"
          onClick={() => router.push(userRole === "ADMIN" ? "/admin" : "/editorial")}
          style={{
            padding: "9px 18px",
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            color: "var(--muted)",
            fontSize: "0.88rem",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave("DRAFT")}
            style={{
              padding: "10px 18px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text)",
              fontWeight: 600,
              fontSize: "0.88rem",
              cursor: saving ? "wait" : "pointer",
            }}
          >
            Save as Draft
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave("APPROVED")}
            style={{
              padding: "10px 22px",
              background: "var(--accent)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              color: "#0B1020",
              fontWeight: 700,
              fontSize: "0.88rem",
              cursor: saving ? "wait" : "pointer",
              boxShadow: "0 2px 10px rgba(245, 158, 11, 0.25)",
            }}
          >
            {saving ? "Publishing..." : "Publish Article Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
