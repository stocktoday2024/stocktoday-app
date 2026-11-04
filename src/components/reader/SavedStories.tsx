"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SavedStory {
  id: string;
  title: string;
  slug: string;
}

interface SavedStoriesProps {
  triggerOnlyIconCount?: boolean;
  count?: number;
}

export function SavedStories({ triggerOnlyIconCount, count }: SavedStoriesProps = {}) {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [watchlistTickers, setWatchlistTickers] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const bm = JSON.parse(localStorage.getItem("st-bookmarks") || "[]");
      const wl = JSON.parse(localStorage.getItem("st-watchlist") || "[]");
      setBookmarkedIds(bm);
      setWatchlistTickers(wl);
    } catch {
      // ignore
    }
  }, [isOpen]);

  const totalCount = count !== undefined ? count : bookmarkedIds.length + watchlistTickers.length;

  return (
    <>
      {/* Trigger Button in Nav/Header */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="View saved bookmarks and watchlist"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: triggerOnlyIconCount ? "2px 6px" : "6px 12px",
          borderRadius: "var(--radius-sm)",
          border: triggerOnlyIconCount ? "none" : "1px solid var(--border)",
          background: triggerOnlyIconCount
            ? "transparent"
            : totalCount > 0
            ? "rgba(251, 191, 36, 0.15)"
            : "var(--panel)",
          color: totalCount > 0 ? "var(--accent)" : "var(--muted)",
          cursor: "pointer",
          fontSize: "0.8rem",
          fontWeight: 600,
        }}
      >
        <span style={{ fontSize: "14px" }}>★</span>
        <span>Saved {totalCount > 0 ? `(${totalCount})` : ""}</span>
      </button>

      {/* Slide-over Drawer Modal */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(11, 16, 32, 0.75)",
            backdropFilter: "blur(4px)",
            zIndex: 110,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="panel"
            style={{
              width: "100%",
              maxWidth: 420,
              height: "100%",
              borderRadius: 0,
              borderLeft: "1px solid var(--border)",
              borderTop: "none",
              borderRight: "none",
              borderBottom: "none",
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 20,
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "var(--accent)", fontSize: "1.2rem" }}>★</span>
                <h3 style={{ fontSize: "1.1rem", color: "var(--text)" }}>My Saved Intelligence</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--muted)",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {/* Watchlist Section */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <h4 style={{ fontSize: "0.85rem", color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Monitored Companies ({watchlistTickers.length})
                </h4>
                {watchlistTickers.length > 0 && (
                  <button
                    onClick={() => {
                      localStorage.setItem("st-watchlist", "[]");
                      setWatchlistTickers([]);
                    }}
                    style={{ background: "transparent", border: "none", color: "var(--muted)", fontSize: "0.7rem", cursor: "pointer" }}
                  >
                    Clear
                  </button>
                )}
              </div>

              {watchlistTickers.length === 0 ? (
                <div style={{ padding: 12, background: "var(--bg)", borderRadius: "var(--radius-sm)", fontSize: "0.8rem", color: "var(--muted)" }}>
                  No companies added yet. Click &ldquo;+ Add to Watchlist&rdquo; on any company profile.
                </div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {watchlistTickers.map((ticker) => (
                    <Link
                      key={ticker}
                      href={`/company/${ticker}`}
                      onClick={() => setIsOpen(false)}
                      style={{
                        padding: "6px 12px",
                        background: "var(--bg)",
                        border: "1px solid var(--teal)",
                        borderRadius: "var(--radius-sm)",
                        color: "var(--text)",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      {ticker} →
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Bookmarks Section */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <h4 style={{ fontSize: "0.85rem", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Saved Articles ({bookmarkedIds.length})
                </h4>
                {bookmarkedIds.length > 0 && (
                  <button
                    onClick={() => {
                      localStorage.setItem("st-bookmarks", "[]");
                      setBookmarkedIds([]);
                    }}
                    style={{ background: "transparent", border: "none", color: "var(--muted)", fontSize: "0.7rem", cursor: "pointer" }}
                  >
                    Clear
                  </button>
                )}
              </div>

              {bookmarkedIds.length === 0 ? (
                <div style={{ padding: 12, background: "var(--bg)", borderRadius: "var(--radius-sm)", fontSize: "0.8rem", color: "var(--muted)" }}>
                  No articles bookmarked yet. Click &ldquo;Bookmark Story&rdquo; on any dispatch to save for later reading.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {bookmarkedIds.map((id) => (
                    <div
                      key={id}
                      style={{
                        padding: "10px 12px",
                        background: "var(--bg)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.85rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ color: "var(--text)", fontWeight: 500 }}>Saved Article #{id.slice(0, 8)}...</span>
                      <Link
                        href="/"
                        onClick={() => setIsOpen(false)}
                        style={{ color: "var(--teal)", fontSize: "0.75rem", fontWeight: 600 }}
                      >
                        Read →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--border)", fontSize: "0.75rem", color: "var(--muted)" }}>
              🔒 Saved locally in your browser session for instantaneous offline retrieval.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
