"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface AdminDashboardProps {
  currentUser: any;
}

export function AdminClientDashboard({ currentUser }: AdminDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "OVERVIEW" | "ARTICLES" | "EDITORS" | "INVITATIONS" | "AUDIT"
  >("OVERVIEW");

  // Metrics
  const [metrics, setMetrics] = useState({
    totalArticles: 0,
    publishedCount: 0,
    draftCount: 0,
    emergencyCount: 0,
    editorCount: 0,
    pendingInvites: 0,
  });

  // Articles state
  const [articles, setArticles] = useState<any[]>([]);
  const [articleSearch, setArticleSearch] = useState("");
  const [articleStatus, setArticleStatus] = useState("ALL");

  // Editors state
  const [editors, setEditors] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [newInviteLink, setNewInviteLink] = useState<string | null>(null);

  // Audit state
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditFilter, setAuditFilter] = useState("ALL");

  // Loading & Feedback
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load Data
  const loadOverview = async () => {
    try {
      const [artRes, edRes, invRes] = await Promise.all([
        fetch("/api/articles?includeDeleted=true"),
        fetch("/api/admin/editors"),
        fetch("/api/admin/invitations"),
      ]);

      const arts = artRes.ok ? await artRes.json() : [];
      const eds = edRes.ok ? await edRes.json() : [];
      const invs = invRes.ok ? await invRes.json() : [];

      setArticles(arts);
      setEditors(eds);
      setInvitations(invs);

      setMetrics({
        totalArticles: arts.length,
        publishedCount: arts.filter((a: any) => a.status === "APPROVED" && !a.deletedAt).length,
        draftCount: arts.filter((a: any) => a.status === "DRAFT" && !a.deletedAt).length,
        emergencyCount: arts.filter((a: any) => a.status === "REJECTED" || a.deletedAt).length,
        editorCount: eds.length,
        pendingInvites: invs.filter((i: any) => !i.usedAt && !i.revokedAt).length,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const res = await fetch(`/api/admin/audit-logs?action=${auditFilter}&limit=100`);
      if (res.ok) {
        setAuditLogs(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  useEffect(() => {
    if (activeTab === "AUDIT") {
      loadAuditLogs();
    }
  }, [activeTab, auditFilter]);

  // Invite Editor Handler
  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setLoading(true);
    setAlert(null);
    setNewInviteLink(null);

    try {
      const res = await fetch("/api/admin/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, name: inviteName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAlert({ type: "error", text: data.error || "Failed to create invitation." });
      } else {
        setAlert({ type: "success", text: "Invitation token generated successfully!" });
        setNewInviteLink(data.registrationUrl);
        setInviteEmail("");
        setInviteName("");
        loadOverview();
      }
    } catch {
      setAlert({ type: "error", text: "Network error." });
    } finally {
      setLoading(false);
    }
  };

  // Toggle Editor Status
  const handleToggleEditor = async (userId: string) => {
    try {
      const res = await fetch("/api/admin/editors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "toggle_status" }),
      });
      if (res.ok) {
        setAlert({ type: "success", text: "Editor account status updated." });
        loadOverview();
      } else {
        const d = await res.json();
        setAlert({ type: "error", text: d.error || "Failed." });
      }
    } catch {
      setAlert({ type: "error", text: "Error updating editor." });
    }
  };

  // Admin Override: Unpublish or Restore Article
  const handleArticleOverride = async (id: string, action: "unpublish" | "restore" | "permanent_delete") => {
    if (action === "permanent_delete" && !confirm("PERMANENT DELETE: This cannot be undone. Are you sure?")) {
      return;
    }

    try {
      if (action === "unpublish") {
        await fetch("/api/articles", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status: "DRAFT" }),
        });
      } else if (action === "restore") {
        await fetch("/api/articles", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status: "DRAFT", restore: true }),
        });
      } else if (action === "permanent_delete") {
        await fetch(`/api/articles?id=${id}&permanent=true`, { method: "DELETE" });
      }

      setAlert({ type: "success", text: `Action [${action}] applied successfully.` });
      loadOverview();
    } catch {
      setAlert({ type: "error", text: "Failed to apply override." });
    }
  };

  const parseArticleTitle = (raw: string) => {
    try {
      return JSON.parse(raw).en || raw;
    } catch {
      return raw || "Untitled";
    }
  };

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 64, maxWidth: 1240 }}>
      {/* Top Admin Header */}
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
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "rgba(245, 158, 11, 0.2)",
                color: "var(--accent)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
              }}
            >
              🛡️
            </span>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: 0, color: "var(--foreground)" }}>
              StockToday Admin Control System
            </h1>
          </div>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: 4 }}>
            Full system governance, editorial access invitation tokens, complete audit logs, and override controls.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link
            href="/editorial"
            style={{
              padding: "9px 16px",
              borderRadius: 8,
              border: "1px solid var(--border-color)",
              background: "rgba(255, 255, 255, 0.04)",
              color: "var(--foreground)",
              fontSize: "0.85rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            ← Editorial Newsroom Desk
          </Link>
          <Link
            href="/editorial/new"
            style={{
              padding: "9px 16px",
              borderRadius: 8,
              border: "none",
              background: "var(--accent)",
              color: "#0B1020",
              fontSize: "0.85rem",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            + Compose Story
          </Link>
        </div>
      </div>

      {alert && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 8,
            marginBottom: 20,
            background: alert.type === "success" ? "rgba(52, 211, 153, 0.1)" : "rgba(239, 68, 68, 0.1)",
            border: `1px solid ${alert.type === "success" ? "rgba(52, 211, 153, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
            color: alert.type === "success" ? "#34D399" : "#EF4444",
            fontSize: "0.85rem",
          }}
        >
          {alert.text}
        </div>
      )}

      {/* Admin Nav Tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          borderBottom: "1px solid var(--border-color)",
          marginBottom: 24,
          overflowX: "auto",
        }}
      >
        {(
          [
            { id: "OVERVIEW", label: "Overview & Metrics" },
            { id: "ARTICLES", label: "Content Oversight" },
            { id: "EDITORS", label: "Editor Accounts" },
            { id: "INVITATIONS", label: "Editor Invitations" },
            { id: "AUDIT", label: "Immutable Audit Trail" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 16px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === tab.id ? "2px solid var(--accent)" : "2px solid transparent",
              color: activeTab === tab.id ? "var(--accent)" : "var(--muted)",
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: "0.88rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & METRICS */}
      {activeTab === "OVERVIEW" && (
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: 16,
              marginBottom: 32,
            }}
          >
            <div className="panel" style={{ padding: 20 }}>
              <div style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: 4 }}>Published Live</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#34D399" }}>
                {metrics.publishedCount}
              </div>
            </div>
            <div className="panel" style={{ padding: 20 }}>
              <div style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: 4 }}>Drafts in Progress</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--accent)" }}>
                {metrics.draftCount}
              </div>
            </div>
            <div className="panel" style={{ padding: 20 }}>
              <div style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: 4 }}>Retracted / Pulled</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#EF4444" }}>
                {metrics.emergencyCount}
              </div>
            </div>
            <div className="panel" style={{ padding: 20 }}>
              <div style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: 4 }}>Total Tracked Articles</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--foreground)" }}>
                {metrics.totalArticles}
              </div>
            </div>
            <div className="panel" style={{ padding: 20 }}>
              <div style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: 4 }}>Staff & Editors</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--teal)" }}>
                {metrics.editorCount}
              </div>
            </div>
            <div className="panel" style={{ padding: 20 }}>
              <div style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: 4 }}>Pending Invitations</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--accent)" }}>
                {metrics.pendingInvites}
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 20,
            }}
          >
            <div className="panel" style={{ padding: 24 }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--foreground)", margin: "0 0 12px 0" }}>
                Quick Invite Editor
              </h3>
              <p style={{ color: "var(--muted)", fontSize: "0.82rem", marginBottom: 16 }}>
                Generate a single-use secure link with 48h expiration for a qualified financial journalist.
              </p>
              <form onSubmit={handleCreateInvite} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input
                  type="email"
                  placeholder="journalist@financialpress.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  style={{
                    padding: "9px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--border-color)",
                    background: "rgba(255,255,255,0.03)",
                    color: "var(--foreground)",
                    fontSize: "0.85rem",
                  }}
                />
                <input
                  type="text"
                  placeholder="Full Name / Pen Name (Optional)"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  style={{
                    padding: "9px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--border-color)",
                    background: "rgba(255,255,255,0.03)",
                    color: "var(--foreground)",
                    fontSize: "0.85rem",
                  }}
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "10px",
                    borderRadius: 8,
                    border: "none",
                    background: "var(--accent)",
                    color: "#0B1020",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  Generate Invitation Token
                </button>
              </form>

              {newInviteLink && (
                <div
                  style={{
                    marginTop: 14,
                    padding: 12,
                    background: "rgba(245, 158, 11, 0.1)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    borderRadius: 8,
                  }}
                >
                  <div style={{ fontSize: "0.75rem", color: "var(--accent)", fontWeight: 700, marginBottom: 4 }}>
                    INVITATION LINK GENERATED:
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={newInviteLink}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      fontSize: "0.75rem",
                      background: "rgba(0,0,0,0.4)",
                      border: "none",
                      color: "#FFFFFF",
                      borderRadius: 4,
                    }}
                  />
                  <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 4 }}>
                    Share this link with the editor. Valid for 48 hours.
                  </div>
                </div>
              )}
            </div>

            <div className="panel" style={{ padding: 24 }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--foreground)", margin: "0 0 12px 0" }}>
                System Status & Policies
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "0.82rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-color)" }}>
                  <span style={{ color: "var(--muted)" }}>Publishing Governance:</span>
                  <span style={{ color: "#34D399", fontWeight: 600 }}>Independent Editor Publishing (Active)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-color)" }}>
                  <span style={{ color: "var(--muted)" }}>Multilingual Model:</span>
                  <span style={{ color: "var(--foreground)", fontWeight: 600 }}>EN + GU + HI Auto-Engine</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-color)" }}>
                  <span style={{ color: "var(--muted)" }}>Audit Logging:</span>
                  <span style={{ color: "var(--teal)", fontWeight: 600 }}>Append-Only Immutable Active</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                  <span style={{ color: "var(--muted)" }}>Administrator Interventions:</span>
                  <span style={{ color: "var(--accent)", fontWeight: 600 }}>Always Authorized</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONTENT OVERSIGHT */}
      {activeTab === "ARTICLES" && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", gap: 8 }}>
              {["ALL", "APPROVED", "DRAFT", "TRASH"].map((st) => (
                <button
                  key={st}
                  onClick={() => setArticleStatus(st)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    border: articleStatus === st ? "1px solid var(--accent)" : "1px solid var(--border-color)",
                    background: articleStatus === st ? "rgba(245, 158, 11, 0.15)" : "transparent",
                    color: articleStatus === st ? "var(--accent)" : "var(--muted)",
                  }}
                >
                  {st}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Search across all articles..."
              value={articleSearch}
              onChange={(e) => setArticleSearch(e.target.value)}
              style={{
                padding: "7px 12px",
                borderRadius: 8,
                border: "1px solid var(--border-color)",
                background: "rgba(255,255,255,0.03)",
                color: "var(--foreground)",
                fontSize: "0.82rem",
                width: 260,
              }}
            />
          </div>

          <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.83rem", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.02)", color: "var(--muted)", borderBottom: "1px solid var(--border-color)" }}>
                    <th style={{ padding: "12px 16px" }}>Title & Slug</th>
                    <th style={{ padding: "12px 16px" }}>Author</th>
                    <th style={{ padding: "12px 16px" }}>Category</th>
                    <th style={{ padding: "12px 16px" }}>Status</th>
                    <th style={{ padding: "12px 16px" }}>Updated</th>
                    <th style={{ padding: "12px 16px", textAlign: "right" }}>Admin Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles
                    .filter((a) => {
                      if (articleStatus === "TRASH") return Boolean(a.deletedAt);
                      if (articleStatus !== "ALL" && a.status !== articleStatus) return false;
                      if (articleStatus !== "TRASH" && a.deletedAt) return false;
                      if (!articleSearch) return true;
                      return (
                        a.slug.toLowerCase().includes(articleSearch.toLowerCase()) ||
                        parseArticleTitle(a.title).toLowerCase().includes(articleSearch.toLowerCase())
                      );
                    })
                    .map((art) => (
                      <tr key={art.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                        <td style={{ padding: "12px 16px", maxWidth: 320 }}>
                          <div style={{ fontWeight: 600, color: "var(--foreground)" }}>
                            {parseArticleTitle(art.title)}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>/{art.slug}</div>
                        </td>
                        <td style={{ padding: "12px 16px", color: "var(--muted)" }}>
                          {art.author?.name || art.author?.email}
                        </td>
                        <td style={{ padding: "12px 16px", color: "var(--muted)" }}>{art.category}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span
                            style={{
                              fontSize: "0.72rem",
                              padding: "2px 6px",
                              borderRadius: 4,
                              fontWeight: 700,
                              background: art.status === "APPROVED" ? "rgba(52, 211, 153, 0.15)" : "rgba(255,255,255,0.08)",
                              color: art.status === "APPROVED" ? "#34D399" : "var(--muted)",
                            }}
                          >
                            {art.status}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", color: "var(--muted)", fontSize: "0.75rem" }}>
                          {new Date(art.updatedAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: 6 }}>
                            <Link
                              href={`/editorial/edit/${art.id}`}
                              style={{
                                padding: "3px 8px",
                                borderRadius: 4,
                                border: "1px solid var(--border-color)",
                                color: "var(--foreground)",
                                fontSize: "0.72rem",
                                textDecoration: "none",
                              }}
                            >
                              Edit
                            </Link>

                            {art.status === "APPROVED" && (
                              <button
                                type="button"
                                onClick={() => handleArticleOverride(art.id, "unpublish")}
                                style={{
                                  padding: "3px 8px",
                                  borderRadius: 4,
                                  border: "1px solid var(--border-color)",
                                  background: "none",
                                  color: "var(--muted)",
                                  fontSize: "0.72rem",
                                  cursor: "pointer",
                                }}
                              >
                                Unpublish
                              </button>
                            )}

                            {art.deletedAt && (
                              <button
                                type="button"
                                onClick={() => handleArticleOverride(art.id, "restore")}
                                style={{
                                  padding: "3px 8px",
                                  borderRadius: 4,
                                  border: "1px solid rgba(52, 211, 153, 0.3)",
                                  background: "rgba(52, 211, 153, 0.1)",
                                  color: "#34D399",
                                  fontSize: "0.72rem",
                                  cursor: "pointer",
                                }}
                              >
                                Restore
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleArticleOverride(art.id, "permanent_delete")}
                              style={{
                                padding: "3px 8px",
                                borderRadius: 4,
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                background: "rgba(239, 68, 68, 0.1)",
                                color: "#EF4444",
                                fontSize: "0.72rem",
                                cursor: "pointer",
                              }}
                            >
                              Destroy
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EDITOR ACCOUNTS */}
      {activeTab === "EDITORS" && (
        <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-color)" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "var(--foreground)" }}>
              Editorial Staff Directory
            </h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.83rem", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.02)", color: "var(--muted)", borderBottom: "1px solid var(--border-color)" }}>
                  <th style={{ padding: "12px 16px" }}>Editor Name</th>
                  <th style={{ padding: "12px 16px" }}>Email</th>
                  <th style={{ padding: "12px 16px" }}>Role</th>
                  <th style={{ padding: "12px 16px" }}>Stories Authored</th>
                  <th style={{ padding: "12px 16px" }}>Status</th>
                  <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {editors.map((ed) => (
                  <tr key={ed.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--foreground)" }}>
                      {ed.name || "Unnamed"}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--muted)" }}>{ed.email}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          padding: "2px 6px",
                          borderRadius: 4,
                          fontWeight: 700,
                          background: ed.role === "ADMIN" ? "rgba(245, 158, 11, 0.15)" : "rgba(45, 212, 191, 0.15)",
                          color: ed.role === "ADMIN" ? "var(--accent)" : "var(--teal)",
                        }}
                      >
                        {ed.role}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--muted)" }}>{ed._count?.articles || 0}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ color: ed.disabledAt ? "#EF4444" : "#34D399", fontWeight: 600, fontSize: "0.75rem" }}>
                        {ed.disabledAt ? "Disabled" : "Active"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      {ed.role !== "ADMIN" && (
                        <button
                          type="button"
                          onClick={() => handleToggleEditor(ed.id)}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 6,
                            border: `1px solid ${ed.disabledAt ? "rgba(52, 211, 153, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                            background: "transparent",
                            color: ed.disabledAt ? "#34D399" : "#EF4444",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                          }}
                        >
                          {ed.disabledAt ? "Reactivate" : "Deactivate"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: INVITATIONS */}
      {activeTab === "INVITATIONS" && (
        <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "var(--foreground)" }}>
              Editor Invitation Tokens & Links
            </h3>
            <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
              All registration requires a single-use token created by Admin
            </span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.83rem", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.02)", color: "var(--muted)", borderBottom: "1px solid var(--border-color)" }}>
                  <th style={{ padding: "12px 16px" }}>Invited Email</th>
                  <th style={{ padding: "12px 16px" }}>Name</th>
                  <th style={{ padding: "12px 16px" }}>Token</th>
                  <th style={{ padding: "12px 16px" }}>Expires</th>
                  <th style={{ padding: "12px 16px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {invitations.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "30px", textAlign: "center", color: "var(--muted)" }}>
                      No active invitations. Create one from the Overview tab.
                    </td>
                  </tr>
                ) : (
                  invitations.map((inv) => (
                    <tr key={inv.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--foreground)" }}>
                        {inv.email}
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--muted)" }}>{inv.name || "-"}</td>
                      <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: "0.72rem", color: "var(--muted)" }}>
                        {inv.token.slice(0, 16)}...
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--muted)", fontSize: "0.75rem" }}>
                        {new Date(inv.expiresAt).toLocaleString()}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span
                          style={{
                            fontSize: "0.72rem",
                            padding: "2px 6px",
                            borderRadius: 4,
                            fontWeight: 700,
                            background: inv.usedAt
                              ? "rgba(52, 211, 153, 0.15)"
                              : inv.revokedAt
                              ? "rgba(239, 68, 68, 0.15)"
                              : "rgba(245, 158, 11, 0.15)",
                            color: inv.usedAt ? "#34D399" : inv.revokedAt ? "#EF4444" : "var(--accent)",
                          }}
                        >
                          {inv.usedAt ? "ACCEPTED" : inv.revokedAt ? "REVOKED" : "PENDING"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === "AUDIT" && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "center", minWidth: 240 }}>
              <span style={{ fontSize: "0.8rem", color: "var(--muted)", whiteSpace: "nowrap" }}>Action Filter:</span>
              <div style={{ flex: 1 }}>
                <CustomSelect
                  options={[
                    { value: "ALL", label: "All Actions" },
                    { value: "USER_LOGIN", label: "User Logins" },
                    { value: "ARTICLE_PUBLISHED", label: "Article Publications" },
                    { value: "ARTICLE_UNPUBLISHED", label: "Unpublished" },
                    { value: "ARTICLE_EMERGENCY_REMOVED", label: "Emergency Removals" },
                    { value: "INVITATION_CREATED", label: "Invitations Created" },
                    { value: "INVITATION_ACCEPTED", label: "Invitations Accepted" },
                  ]}
                  value={auditFilter}
                  onChange={(val) => setAuditFilter(val)}
                />
              </div>
            </div>

            <a
              href="/api/admin/audit-logs?format=csv"
              style={{
                padding: "7px 14px",
                borderRadius: 8,
                border: "1px solid var(--border-color)",
                background: "rgba(255,255,255,0.04)",
                color: "var(--foreground)",
                fontSize: "0.82rem",
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>📥</span> Export Audit Log (CSV)
            </a>
          </div>

          <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.02)", color: "var(--muted)", borderBottom: "1px solid var(--border-color)" }}>
                    <th style={{ padding: "12px 16px" }}>Timestamp</th>
                    <th style={{ padding: "12px 16px" }}>Operator</th>
                    <th style={{ padding: "12px 16px" }}>Action</th>
                    <th style={{ padding: "12px 16px" }}>Target Entity</th>
                    <th style={{ padding: "12px 16px" }}>Details / Metadata</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: "30px", textAlign: "center", color: "var(--muted)" }}>
                        No audit records matching filter.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                        <td style={{ padding: "10px 16px", color: "var(--muted)", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td style={{ padding: "10px 16px" }}>
                          <div style={{ fontWeight: 600, color: "var(--foreground)" }}>
                            {log.user?.name || log.user?.email}
                          </div>
                          <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{log.user?.role}</div>
                        </td>
                        <td style={{ padding: "10px 16px" }}>
                          <span
                            style={{
                              fontSize: "0.7rem",
                              padding: "2px 6px",
                              borderRadius: 4,
                              fontWeight: 700,
                              background: log.action.includes("EMERGENCY")
                                ? "rgba(239, 68, 68, 0.2)"
                                : log.action.includes("PUBLISH")
                                ? "rgba(52, 211, 153, 0.15)"
                                : "rgba(255, 255, 255, 0.06)",
                              color: log.action.includes("EMERGENCY")
                                ? "#EF4444"
                                : log.action.includes("PUBLISH")
                                ? "#34D399"
                                : "var(--foreground)",
                            }}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td style={{ padding: "10px 16px", color: "var(--muted)", fontSize: "0.75rem" }}>
                          {log.entityType ? `${log.entityType} (${log.entityId?.slice(0, 8)}...)` : "-"}
                        </td>
                        <td style={{ padding: "10px 16px", color: "var(--muted)", fontSize: "0.73rem", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {log.meta || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

