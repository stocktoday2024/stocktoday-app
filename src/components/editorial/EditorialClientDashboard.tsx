"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NewspaperManager } from "@/components/newspaper/NewspaperManager";

interface ArticleItem {
  id: string;
  slug: string;
  category: string;
  status: string;
  sentiment: string | null;
  title: string;
  publishAt: string | null;
  updatedAt: string;
  deletedAt: string | null;
  author: { id: string; name: string | null; email: string };
  _count?: { versions: number };
}

export function EditorialClientDashboard({ initialUser }: { initialUser: any }) {
  const router = useRouter();
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "APPROVED" | "DRAFT" | "TRASH" | "NEWSPAPERS">("ALL");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  // Emergency removal modal state
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);
  const [removalReason, setRemovalReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const includeDeleted = activeTab === "TRASH" ? "true" : "false";
      let statusParam = activeTab === "TRASH" ? "" : activeTab;
      const res = await fetch(
        `/api/articles?status=${statusParam}&includeDeleted=${includeDeleted}&search=${encodeURIComponent(search)}`
      );
      if (res.ok) {
        const data = await res.json();
        setArticles(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [activeTab, search]);

  const handleUnpublish = async (id: string) => {
    if (!confirm("Are you sure you want to unpublish this story back to Drafts?")) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/articles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "DRAFT" }),
      });
      if (res.ok) {
        setActionMessage({ type: "success", text: "Article successfully unpublished to Draft." });
        fetchArticles();
      } else {
        const d = await res.json();
        setActionMessage({ type: "error", text: d.error || "Failed to unpublish." });
      }
    } catch {
      setActionMessage({ type: "error", text: "Network error." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSoftDelete = async (id: string) => {
    if (!confirm("Move this draft to Trash?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/articles?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setActionMessage({ type: "success", text: "Article moved to trash." });
        fetchArticles();
      } else {
        const d = await res.json();
        setActionMessage({ type: "error", text: d.error || "Failed to delete." });
      }
    } catch {
      setActionMessage({ type: "error", text: "Network error." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEmergencyRemove = async () => {
    if (!selectedArticle) return;
    if (!removalReason.trim() || removalReason.trim().length < 5) {
      alert("A specific mandatory reason (min 5 chars) is required for emergency removal.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(
        `/api/articles?id=${selectedArticle.id}&emergency=true&reason=${encodeURIComponent(removalReason)}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setActionMessage({
          type: "success",
          text: `Emergency removal completed. Incident logged and administrator notified.`,
        });
        setEmergencyModalOpen(false);
        setRemovalReason("");
        setSelectedArticle(null);
        fetchArticles();
      } else {
        const d = await res.json();
        alert(d.error || "Failed emergency removal.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setActionLoading(false);
    }
  };

  const parseTitle = (raw: string) => {
    try {
      const parsed = JSON.parse(raw);
      return {
        en: parsed.en || "Untitled",
        gu: Boolean(parsed.gu?.trim()),
        hi: Boolean(parsed.hi?.trim()),
      };
    } catch {
      return { en: raw || "Untitled", gu: false, hi: false };
    }
  };

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 64, maxWidth: 1200 }}>
      {/* Top Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "var(--accent)", fontSize: "1.3rem" }}>✦</span>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: 0, color: "var(--foreground)" }}>
              Editorial Newsroom Desk
            </h1>
            <span
              style={{
                fontSize: "0.75rem",
                padding: "2px 8px",
                borderRadius: 20,
                background: "rgba(245, 158, 11, 0.15)",
                color: "var(--accent)",
                fontWeight: 700,
                border: "1px solid rgba(245, 158, 11, 0.3)",
              }}
            >
              Independent Publishing Desk
            </span>
          </div>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: 4 }}>
            Logged in as <strong style={{ color: "var(--foreground)" }}>{initialUser.name || initialUser.email}</strong>.
            Draft, review AI translations, publish instantly, and audit history.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <Link
            href="/editorial/new"
            style={{
              padding: "10px 18px",
              background: "var(--accent)",
              color: "#0B1020",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: "0.85rem",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>+</span> Compose New Story
          </Link>
        </div>
      </div>

      {actionMessage && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 8,
            marginBottom: 20,
            background: actionMessage.type === "success" ? "rgba(52, 211, 153, 0.1)" : "rgba(239, 68, 68, 0.1)",
            border: `1px solid ${actionMessage.type === "success" ? "rgba(52, 211, 153, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
            color: actionMessage.type === "success" ? "#34D399" : "#EF4444",
            fontSize: "0.85rem",
          }}
        >
          {actionMessage.text}
        </div>
      )}

      {/* Tabs & Search */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          background: "var(--panel)",
          border: "1px solid var(--border-color)",
          padding: "10px 16px",
          borderRadius: 12,
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          {(
            [
              { id: "ALL", label: "All Stories" },
              { id: "APPROVED", label: "Published Live" },
              { id: "DRAFT", label: "Drafts" },
              { id: "TRASH", label: "Recently Deleted" },
              { id: "NEWSPAPERS", label: "📰 E-Newspapers" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                border: activeTab === t.id ? "1px solid var(--accent)" : "1px solid transparent",
                background: activeTab === t.id ? "rgba(245, 158, 11, 0.15)" : "transparent",
                color: activeTab === t.id ? "var(--accent)" : "var(--muted)",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter stories..."
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            border: "1px solid var(--border-color)",
            background: "rgba(255,255,255,0.03)",
            color: "var(--foreground)",
            fontSize: "0.82rem",
            width: 220,
          }}
        />
      </div>

      {/* Newspapers Management View */}
      {activeTab === "NEWSPAPERS" ? (
        <NewspaperManager
          userRole={initialUser.role === "ADMIN" ? "ADMIN" : "EDITOR"}
          userId={initialUser.id}
        />
      ) : (
        /* Stories Table */
        <div
          style={{
            background: "var(--panel)",
            border: "1px solid var(--border-color)",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.02)", color: "var(--muted)", borderBottom: "1px solid var(--border-color)" }}>
                <th style={{ padding: "12px 16px" }}>Story Headline</th>
                <th style={{ padding: "12px 16px" }}>Category</th>
                <th style={{ padding: "12px 16px" }}>Languages</th>
                <th style={{ padding: "12px 16px" }}>Status</th>
                <th style={{ padding: "12px 16px" }}>Updated</th>
                <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
                    Loading stories...
                  </td>
                </tr>
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
                    No stories found in this section.
                  </td>
                </tr>
              ) : (
                articles.map((art) => {
                  const titleInfo = parseTitle(art.title);
                  return (
                    <tr
                      key={art.id}
                      style={{
                        borderBottom: "1px solid var(--border-color)",
                        opacity: art.deletedAt ? 0.6 : 1,
                      }}
                    >
                      <td style={{ padding: "14px 16px", maxWidth: 360 }}>
                        <div style={{ fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>
                          {titleInfo.en}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                          Slug: /{art.slug} · {art._count?.versions || 1} versions
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", color: "var(--muted)" }}>{art.category}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: "0.75rem", color: "#34D399" }}>EN</span>{" "}
                        <span style={{ fontSize: "0.75rem", color: titleInfo.gu ? "#34D399" : "var(--muted)" }}>
                          {titleInfo.gu ? "· GU" : "· ✗ GU"}
                        </span>{" "}
                        <span style={{ fontSize: "0.75rem", color: titleInfo.hi ? "#34D399" : "var(--muted)" }}>
                          {titleInfo.hi ? "· HI" : "· ✗ HI"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            fontSize: "0.72rem",
                            padding: "3px 8px",
                            borderRadius: 6,
                            fontWeight: 700,
                            background:
                              art.status === "APPROVED"
                                ? "rgba(52, 211, 153, 0.15)"
                                : art.status === "DRAFT"
                                ? "rgba(255, 255, 255, 0.08)"
                                : "rgba(239, 68, 68, 0.15)",
                            color:
                              art.status === "APPROVED"
                                ? "#34D399"
                                : art.status === "DRAFT"
                                ? "var(--muted)"
                                : "#EF4444",
                          }}
                        >
                          {art.status === "APPROVED" ? "LIVE" : art.status}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", color: "var(--muted)", fontSize: "0.78rem" }}>
                        {new Date(art.updatedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                          {/* Edit */}
                          <Link
                            href={`/editorial/edit/${art.id}`}
                            style={{
                              padding: "4px 10px",
                              borderRadius: 6,
                              border: "1px solid var(--border-color)",
                              color: "var(--foreground)",
                              fontSize: "0.75rem",
                              textDecoration: "none",
                              background: "rgba(255,255,255,0.03)",
                            }}
                          >
                            Edit
                          </Link>

                          {/* Preview Link if Live */}
                          {art.status === "APPROVED" && (
                            <Link
                              href={`/article/${art.slug}`}
                              target="_blank"
                              style={{
                                padding: "4px 8px",
                                borderRadius: 6,
                                border: "1px solid var(--border-color)",
                                color: "var(--teal)",
                                fontSize: "0.75rem",
                                textDecoration: "none",
                              }}
                            >
                              Live ↗
                            </Link>
                          )}

                          {/* Unpublish to Draft */}
                          {art.status === "APPROVED" && (
                            <button
                              type="button"
                              onClick={() => handleUnpublish(art.id)}
                              disabled={actionLoading}
                              style={{
                                padding: "4px 8px",
                                borderRadius: 6,
                                border: "1px solid var(--border-color)",
                                color: "var(--muted)",
                                fontSize: "0.75rem",
                                background: "none",
                                cursor: "pointer",
                              }}
                              title="Unpublish back to Draft"
                            >
                              Unpublish
                            </button>
                          )}

                          {/* Emergency Removal (Mandatory Reason) for Published Stories */}
                          {art.status === "APPROVED" && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedArticle(art);
                                setRemovalReason("");
                                setEmergencyModalOpen(true);
                              }}
                              style={{
                                padding: "4px 8px",
                                borderRadius: 6,
                                border: "1px solid rgba(239, 68, 68, 0.4)",
                                color: "#EF4444",
                                fontSize: "0.75rem",
                                background: "rgba(239, 68, 68, 0.08)",
                                cursor: "pointer",
                              }}
                              title="Emergency pull from public site"
                            >
                              Emergency Pull
                            </button>
                          )}

                          {/* Delete Draft */}
                          {art.status === "DRAFT" && !art.deletedAt && (
                            <button
                              type="button"
                              onClick={() => handleSoftDelete(art.id)}
                              disabled={actionLoading}
                              style={{
                                padding: "4px 8px",
                                borderRadius: 6,
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                color: "#EF4444",
                                fontSize: "0.75rem",
                                background: "none",
                                cursor: "pointer",
                              }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Emergency Removal Reason Modal */}
      {emergencyModalOpen && selectedArticle && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              background: "var(--panel)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              borderRadius: 16,
              padding: 24,
              maxWidth: 500,
              width: "100%",
            }}
          >
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#EF4444", margin: 0 }}>
              ⚠️ Emergency Article Removal
            </h3>
            <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: 8 }}>
              This will immediately retract the story from the live website. Administrator audit logs will record
              this incident and your stated justification.
            </p>

            <div style={{ marginTop: 16 }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>
                Mandatory Removal Justification / Reason:
              </label>
              <textarea
                rows={3}
                value={removalReason}
                onChange={(e) => setRemovalReason(e.target.value)}
                placeholder="e.g. Factual discrepancy in Q3 revenue figures reported, needs immediate correction..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border-color)",
                  background: "rgba(255,255,255,0.03)",
                  color: "var(--foreground)",
                  fontSize: "0.85rem",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
              <button
                type="button"
                onClick={() => setEmergencyModalOpen(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid var(--border-color)",
                  background: "transparent",
                  color: "var(--muted)",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEmergencyRemove}
                disabled={actionLoading || removalReason.trim().length < 5}
                style={{
                  padding: "8px 18px",
                  borderRadius: 8,
                  border: "none",
                  background: "#EF4444",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  opacity: removalReason.trim().length < 5 ? 0.5 : 1,
                }}
              >
                {actionLoading ? "Processing..." : "Confirm Emergency Pull"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

