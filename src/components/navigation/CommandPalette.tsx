"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SearchResult {
  type: "company" | "article";
  title: string;
  subtitle: string;
  url: string;
  badge?: string;
}

export function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-search", handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-search", handleCustomOpen);
    };
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch {
        setResults([]);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(11, 16, 32, 0.75)",
        backdropFilter: "blur(6px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "15vh",
      }}
      onClick={() => setIsOpen(false)}
    >
      <div
        className="panel"
        style={{
          width: "100%",
          maxWidth: 580,
          padding: 0,
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            gap: 12,
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--muted)"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search companies (RELIANCE, TCS, INFY), sectors, or news..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: "var(--text)",
              fontSize: "1rem",
              outline: "none",
              fontFamily: "var(--font-body)",
            }}
          />
          <button
            onClick={() => setIsOpen(false)}
            style={{
              padding: "4px 10px",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--muted)",
              fontSize: "0.75rem",
              cursor: "pointer",
            }}
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: 360, overflowY: "auto", padding: 8 }}>
          {query.trim() === "" ? (
            <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--muted)", fontSize: "0.85rem" }}>
              Type a ticker like <strong style={{ color: "var(--teal)" }}>RELIANCE</strong>, <strong style={{ color: "var(--teal)" }}>INFY</strong>, or keyword like <strong style={{ color: "var(--accent)" }}>Gujarat</strong>...
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--muted)", fontSize: "0.85rem" }}>
              No matches found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            results.map((r, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setIsOpen(false);
                  router.push(r.url);
                }}
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--panel-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div>
                  <div style={{ fontWeight: 600, color: "var(--text)", fontSize: "0.9rem" }}>
                    {r.title}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                    {r.subtitle}
                  </div>
                </div>

                {r.badge && (
                  <span
                    className="tag"
                    style={{
                      background: r.type === "company" ? "rgba(45, 212, 191, 0.15)" : "var(--bg)",
                      color: r.type === "company" ? "var(--teal)" : "var(--muted)",
                      fontSize: "0.7rem",
                    }}
                  >
                    {r.badge}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
