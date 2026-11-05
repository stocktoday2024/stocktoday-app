"use client";

import { useState } from "react";
import Link from "next/link";
import { SerializedNewspaperEdition } from "./NewspaperView";
import { parseMultiLang } from "@/types";
import { useLanguage } from "@/context/LanguageContext";

export function NewspaperReader({
  edition,
}: {
  edition: SerializedNewspaperEdition;
}) {
  const { locale } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const parsedTitle = parseMultiLang(edition.title);
  const displayTitle =
    locale === "GU"
      ? parsedTitle.gu || parsedTitle.en
      : locale === "HI"
      ? parsedTitle.hi || parsedTitle.en
      : parsedTitle.en;

  const totalPages = edition.pageCount || 1;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "calc(100vh - 120px)",
        background: "#080c16",
        color: "#fff",
      }}
    >
      {/* Top Toolbar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 24px",
          background: "#0d1322",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href="/newspaper"
            style={{
              color: "var(--accent)",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            ← Back to Newspaper Archive
          </Link>
          <span style={{ color: "rgba(255, 255, 255, 0.2)" }}>|</span>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "#fff" }}>
            {displayTitle}
          </h2>
        </div>

        {/* Reader Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Page Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem" }}>
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "6px 10px",
                cursor: currentPage <= 1 ? "not-allowed" : "pointer",
                opacity: currentPage <= 1 ? 0.4 : 1,
              }}
            >
              ◀
            </button>

            <span>
              Page {currentPage} of {totalPages}
            </span>

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "6px 10px",
                cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
                opacity: currentPage >= totalPages ? 0.4 : 1,
              }}
            >
              ▶
            </button>
          </div>

          <span style={{ color: "rgba(255, 255, 255, 0.2)" }}>|</span>

          {/* Zoom Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem" }}>
            <button
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "6px 10px",
                cursor: "pointer",
              }}
              title="Zoom Out"
            >
              −
            </button>

            <span style={{ width: 44, textAlign: "center" }}>{zoom}%</span>

            <button
              onClick={() => setZoom((z) => Math.min(200, z + 10))}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "6px 10px",
                cursor: "pointer",
              }}
              title="Zoom In"
            >
              +
            </button>

            <button
              onClick={() => setZoom(100)}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "6px 10px",
                cursor: "pointer",
                fontSize: "0.8rem",
              }}
              title="Fit to Width"
            >
              Fit
            </button>
          </div>

          <span style={{ color: "rgba(255, 255, 255, 0.2)" }}>|</span>

          {/* Actions */}
          <button
            onClick={toggleFullscreen}
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "6px 12px",
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>

          <button
            onClick={handlePrint}
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "6px 12px",
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            Print
          </button>

          <a
            href={edition.pdfUrl}
            download={`${edition.slug}.pdf`}
            target="_blank"
            rel="noreferrer"
            style={{
              background: "var(--accent)",
              color: "#0B1020",
              textDecoration: "none",
              fontWeight: 700,
              borderRadius: 4,
              padding: "6px 14px",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            Download PDF
          </a>
        </div>
      </div>

      {/* Main Reader Viewport */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
          overflow: "auto",
        }}
      >
        <div
          style={{
            width: `${zoom}%`,
            maxWidth: 1000,
            height: "82vh",
            background: "#fff",
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.6)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <iframe
            src={`${edition.pdfUrl}#page=${currentPage}&view=FitH`}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
            title={displayTitle}
          />
        </div>
      </div>
    </div>
  );
}

