"use client";

import { useEffect, useState } from "react";

interface BookmarkButtonProps {
  articleId: string;
  articleTitle: string;
}

export function BookmarkButton({ articleId, articleTitle }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("st-bookmarks") || "[]");
      setIsBookmarked(stored.includes(articleId));
    } catch {
      setIsBookmarked(false);
    }
  }, [articleId]);

  const toggleBookmark = () => {
    try {
      const stored: string[] = JSON.parse(localStorage.getItem("st-bookmarks") || "[]");
      let updated: string[];
      if (stored.includes(articleId)) {
        updated = stored.filter((id) => id !== articleId);
        setIsBookmarked(false);
      } else {
        updated = [...stored, articleId];
        setIsBookmarked(true);
      }
      localStorage.setItem("st-bookmarks", JSON.stringify(updated));
    } catch {
      // Fallback
    }
  };

  return (
    <button
      onClick={toggleBookmark}
      aria-label={isBookmarked ? `Remove ${articleTitle} from bookmarks` : `Bookmark ${articleTitle}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        borderRadius: "var(--radius-sm)",
        border: `1px solid ${isBookmarked ? "var(--accent)" : "var(--border)"}`,
        background: isBookmarked ? "rgba(251, 191, 36, 0.15)" : "var(--panel)",
        color: isBookmarked ? "var(--accent)" : "var(--muted)",
        fontSize: "0.8rem",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
    >
      <span>{isBookmarked ? "★" : "☆"}</span>
      <span>{isBookmarked ? "Bookmarked" : "Bookmark Story"}</span>
    </button>
  );
}
