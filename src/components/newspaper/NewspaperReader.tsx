"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { SerializedNewspaperEdition } from "./NewspaperView";
import { parseMultiLang } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./NewspaperReader.module.css";

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export function NewspaperReader({
  edition,
}: {
  edition: SerializedNewspaperEdition;
}) {
  const { locale } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(edition.pageCount || 1);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<number[]>([]);
  const [showThumbnails, setShowThumbnails] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pdfDocRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);

  const parsedTitle = parseMultiLang(edition.title);
  const displayTitle =
    locale === "GU"
      ? parsedTitle.gu || parsedTitle.en
      : locale === "HI"
      ? parsedTitle.hi || parsedTitle.en
      : parsedTitle.en;

  // Load PDF.js script dynamically
  useEffect(() => {
    let isMounted = true;

    const loadPdfScript = async () => {
      if (!window.pdfjsLib) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "/pdfjs/pdf.min.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load PDF.js engine"));
          document.head.appendChild(script);
        });
      }

      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js";
      }

      try {
        setLoading(true);
        setError(null);
        const loadingTask = window.pdfjsLib.getDocument({
          url: edition.pdfUrl,
          cMapUrl: "https://unpkg.com/pdfjs-dist@3.11.174/cmaps/",
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (!isMounted) return;

        pdfDocRef.current = doc;
        setTotalPages(doc.numPages);
        setThumbnails(Array.from({ length: doc.numPages }, (_, i) => i + 1));
        setLoading(false);
      } catch (err: any) {
        if (!isMounted) return;
        console.error("PDF load error:", err);
        setError("Unable to render PDF document: " + (err.message || "File could not be loaded."));
        setLoading(false);
      }
    };

    loadPdfScript();

    return () => {
      isMounted = false;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [edition.pdfUrl]);

  // Render Page on Canvas
  const renderPage = useCallback(
    async (pageNumber: number) => {
      if (!pdfDocRef.current || !canvasRef.current) return;

      try {
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const page = await pdfDocRef.current.getPage(pageNumber);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const baseViewport = page.getViewport({ scale: 1.0 });
        const scale = (zoom / 100) * 1.5; // High-DPI crisp scale
        const viewport = page.getViewport({ scale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width / 1.5}px`;
        canvas.style.height = `${viewport.height / 1.5}px`;

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        const task = page.render(renderContext);
        renderTaskRef.current = task;
        await task.promise;
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          console.error("Page render error:", err);
        }
      }
    },
    [zoom]
  );

  useEffect(() => {
    if (!loading && !error && pdfDocRef.current) {
      renderPage(currentPage);
    }
  }, [currentPage, zoom, loading, error, renderPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        setCurrentPage((p) => Math.min(totalPages, p + 1));
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        setCurrentPage((p) => Math.max(1, p - 1));
      } else if (e.key === "+" || e.key === "=") {
        setZoom((z) => Math.min(250, z + 15));
      } else if (e.key === "-") {
        setZoom((z) => Math.max(50, z - 15));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [totalPages]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className={styles.readerContainer}>
      {/* Top Professional Reader Header */}
      <header className={styles.readerHeader}>
        {/* Left: Branding & Back Button */}
        <div className={styles.headerLeft}>
          <Link
            href="/newspaper"
            className={styles.backBtn}
          >
            ← Archive
          </Link>

          <div className={styles.headerLogo}>
            <Image
              src="/StockTodayLogo.jpeg"
              alt="StockToday Logo"
              width={100}
              height={32}
              style={{ objectFit: "contain", width: "auto", height: "100%" }}
              priority
            />
          </div>

          <span style={{ color: "rgba(255, 255, 255, 0.2)" }}>|</span>

          <h2 className={styles.titleText}>
            {displayTitle}
          </h2>
        </div>

        {/* Center: Controls Toolbar */}
        <div className={styles.toolbarCluster}>
          {/* Thumbnails toggle */}
          <button
            onClick={() => setShowThumbnails((v) => !v)}
            className={styles.toolBtn}
            style={{
              background: showThumbnails ? "rgba(245, 158, 11, 0.2)" : "rgba(255, 255, 255, 0.08)",
              color: showThumbnails ? "var(--accent)" : "#fff",
            }}
          >
            Pages
          </button>

          {/* Page navigation (desktop & tablet) */}
          <div className={`${styles.toolGroup} ${styles.desktopOnlyTool}`}>
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={{
                background: "none",
                color: "#fff",
                border: "none",
                cursor: currentPage <= 1 ? "not-allowed" : "pointer",
                opacity: currentPage <= 1 ? 0.3 : 1,
                fontSize: "0.9rem",
                padding: "2px 6px",
              }}
            >
              ◀
            </button>

            <span style={{ fontSize: "0.82rem", fontWeight: 600, minWidth: 70, textAlign: "center" }}>
              {currentPage} / {totalPages}
            </span>

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={{
                background: "none",
                color: "#fff",
                border: "none",
                cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
                opacity: currentPage >= totalPages ? 0.3 : 1,
                fontSize: "0.9rem",
                padding: "2px 6px",
              }}
            >
              ▶
            </button>
          </div>

          {/* Zoom controls */}
          <div className={styles.toolGroup}>
            <button
              onClick={() => setZoom((z) => Math.max(50, z - 15))}
              style={{ background: "none", color: "#fff", border: "none", cursor: "pointer", fontSize: "1rem", padding: "0 6px" }}
              title="Zoom out"
            >
              −
            </button>
            <span style={{ fontSize: "0.82rem", minWidth: 40, textAlign: "center" }}>{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(250, z + 15))}
              style={{ background: "none", color: "#fff", border: "none", cursor: "pointer", fontSize: "1rem", padding: "0 6px" }}
              title="Zoom in"
            >
              +
            </button>
            <button
              onClick={() => setZoom(100)}
              style={{ background: "none", color: "var(--accent)", border: "none", cursor: "pointer", fontSize: "0.78rem", padding: "0 6px", fontWeight: 700 }}
              title="Fit standard"
            >
              Fit
            </button>
          </div>

          {/* Fullscreen (desktop) */}
          <button
            onClick={toggleFullscreen}
            className={`${styles.toolBtn} ${styles.desktopOnlyTool}`}
          >
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>

          {/* Print (desktop) */}
          <button
            onClick={() => window.print()}
            className={`${styles.toolBtn} ${styles.desktopOnlyTool}`}
          >
            Print
          </button>
        </div>

        {/* Right: Download PDF action */}
        <div>
          <a
            href={edition.pdfUrl}
            download={`${edition.slug}.pdf`}
            className={styles.downloadPdfBtn}
          >
            <span>📥 Download</span> PDF
          </a>
        </div>
      </header>

      {/* Main Workspace: Sidebar Thumbnails + High-res Canvas */}
      <div style={{ flex: 1, display: "flex", position: "relative", overflow: "hidden" }}>
        {/* Left Thumbnails Strip */}
        {showThumbnails && (
          <aside className={styles.sidebar}>
            {thumbnails.map((num) => (
              <button
                key={num}
                onClick={() => {
                  setCurrentPage(num);
                  if (typeof window !== "undefined" && window.innerWidth <= 600) {
                    setShowThumbnails(false);
                  }
                }}
                style={{
                  background: currentPage === num ? "rgba(245, 158, 11, 0.2)" : "rgba(255, 255, 255, 0.03)",
                  border: currentPage === num ? "2px solid var(--accent)" : "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: 6,
                  padding: "8px 4px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  color: currentPage === num ? "var(--accent)" : "#9CA3AF",
                  transition: "all 0.15s ease",
                }}
              >
                <div
                  style={{
                    width: 70,
                    height: 90,
                    background: "#141c2e",
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                  }}
                >
                  P.{num}
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>Page {num}</span>
              </button>
            ))}
          </aside>
        )}

        {/* Center Canvas Viewport */}
        <main className={styles.canvasViewport}>
          {loading && (
            <div style={{ marginTop: 80, textAlign: "center" }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  border: "4px solid rgba(245, 158, 11, 0.2)",
                  borderTopColor: "var(--accent)",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 16px",
                }}
              />
              <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Loading newspaper document...</p>
            </div>
          )}

          {error && (
            <div
              style={{
                marginTop: 80,
                maxWidth: 480,
                textAlign: "center",
                padding: 24,
                borderRadius: 8,
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#EF4444",
              }}
            >
              <h4 style={{ fontSize: "1.1rem", marginBottom: 8 }}>Rendering Notice</h4>
              <p style={{ fontSize: "0.85rem", lineHeight: 1.5, marginBottom: 16 }}>{error}</p>
              <a
                href={edition.pdfUrl}
                download
                style={{
                  display: "inline-block",
                  padding: "8px 16px",
                  borderRadius: 6,
                  background: "#EF4444",
                  color: "#fff",
                  fontWeight: 700,
                  textDecoration: "none",
                  fontSize: "0.85rem",
                }}
              >
                Download PDF to View
              </a>
            </div>
          )}

          {/* Canvas Rendering Element */}
          <div
            style={{
              display: loading || error ? "none" : "block",
              background: "#ffffff",
              boxShadow: "0 12px 48px rgba(0, 0, 0, 0.8)",
              borderRadius: 4,
              overflow: "hidden",
              maxWidth: "100%",
            }}
          >
            <canvas ref={canvasRef} style={{ display: "block", maxWidth: "100%", height: "auto" }} />
          </div>
        </main>
      </div>

      {/* Floating Bottom Nav for Mobile Viewports (<= 600px) */}
      <div className={styles.mobileFloatingNav}>
        <button
          className={styles.mobileNavBtn}
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        >
          ◀ Prev Page
        </button>
        <span className={styles.mobilePageIndicator}>
          {currentPage} / {totalPages}
        </span>
        <button
          className={styles.mobileNavBtn}
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        >
          Next Page ▶
        </button>
      </div>
    </div>
  );
}
