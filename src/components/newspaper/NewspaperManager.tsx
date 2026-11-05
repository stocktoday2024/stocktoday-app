"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface NewspaperManagerProps {
  userRole: "ADMIN" | "EDITOR";
  userId: string;
}

export function NewspaperManager({ userRole, userId }: NewspaperManagerProps) {
  const [editions, setEditions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEdition, setEditingEdition] = useState<any | null>(null);

  // Form State
  const [titleEn, setTitleEn] = useState("");
  const [titleGu, setTitleGu] = useState("");
  const [titleHi, setTitleHi] = useState("");
  const [publishedAt, setPublishedAt] = useState(new Date().toISOString().split("T")[0]);
  const [language, setLanguage] = useState("EN");
  const [pageCount, setPageCount] = useState(1);
  const [isPublished, setIsPublished] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEditions = async () => {
    setLoading(true);
    try {
      const scope = userRole === "ADMIN" ? "all" : "my";
      const res = await fetch(`/api/newspapers?scope=${scope}`);
      if (res.ok) {
        const data = await res.json();
        setEditions(data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEditions();
  }, []);

  const openCreateModal = () => {
    setEditingEdition(null);
    setTitleEn("");
    setTitleGu("");
    setTitleHi("");
    setPublishedAt(new Date().toISOString().split("T")[0]);
    setLanguage("EN");
    setPageCount(1);
    setIsPublished(true);
    setFile(null);
    setPdfPreviewUrl(null);
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (edition: any) => {
    setEditingEdition(edition);
    let titles = { en: "", gu: "", hi: "" };
    try {
      titles = JSON.parse(edition.title);
    } catch {
      titles = { en: edition.title, gu: "", hi: "" };
    }
    setTitleEn(titles.en || "");
    setTitleGu(titles.gu || "");
    setTitleHi(titles.hi || "");
    setPublishedAt(edition.publishedAt ? new Date(edition.publishedAt).toISOString().split("T")[0] : "");
    setLanguage(edition.language || "EN");
    setPageCount(edition.pageCount || 1);
    setIsPublished(edition.isPublished);
    setFile(null);
    setPdfPreviewUrl(edition.pdfUrl);
    setError(null);
    setModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf" && !selectedFile.name.endsWith(".pdf")) {
        setError("Only valid PDF files are allowed.");
        return;
      }
      setFile(selectedFile);
      setPdfPreviewUrl(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn) {
      setError("English title is required.");
      return;
    }
    if (!editingEdition && !file) {
      setError("Please select a PDF file to upload.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    const titleJson = JSON.stringify({
      en: titleEn,
      gu: titleGu || titleEn,
      hi: titleHi || titleEn,
    });
    formData.append("title", titleJson);
    formData.append("publishedAt", publishedAt);
    formData.append("language", language);
    formData.append("pageCount", pageCount.toString());
    formData.append("isPublished", isPublished ? "true" : "false");

    if (file) {
      formData.append("file", file);
    }

    try {
      const url = editingEdition ? `/api/newspapers/${editingEdition.id}` : "/api/newspapers";
      const method = editingEdition ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save edition");
      }

      setModalOpen(false);
      fetchEditions();
    } catch (err: any) {
      setError(err.message || "Failed to save newspaper edition.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (edition: any) => {
    try {
      const res = await fetch(`/api/newspapers/${edition.id}`, {
        method: "PATCH",
        body: (() => {
          const fd = new FormData();
          fd.append("isPublished", edition.isPublished ? "false" : "true");
          return fd;
        })(),
      });
      if (res.ok) {
        fetchEditions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this newspaper edition?")) return;
    try {
      const res = await fetch(`/api/newspapers/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchEditions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ marginTop: 24 }}>
      {/* Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--text)" }}>
            Newspaper Editions Management
          </h3>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", margin: "4px 0 0" }}>
            Upload, preview, publish, and archive daily digital newspaper editions.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            background: "var(--accent)",
            color: "#0B1020",
            fontWeight: 700,
            fontSize: "0.85rem",
            border: "none",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          + Upload Newspaper PDF
        </button>
      </div>

      {/* Table of Editions */}
      {loading ? (
        <div style={{ padding: 32, textAlign: "center", color: "var(--muted)" }}>Loading newspaper editions...</div>
      ) : editions.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--muted)", background: "var(--panel)", borderRadius: 8, border: "1px solid var(--border)" }}>
          No newspaper editions uploaded yet. Click "+ Upload Newspaper PDF" to publish your first edition.
        </div>
      ) : (
        <div style={{ background: "var(--panel)", borderRadius: 8, border: "1px solid var(--border)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "rgba(255, 255, 255, 0.02)" }}>
                <th style={{ padding: "12px 16px" }}>Edition Title</th>
                <th style={{ padding: "12px 16px" }}>Date</th>
                <th style={{ padding: "12px 16px" }}>Lang</th>
                <th style={{ padding: "12px 16px" }}>Pages</th>
                <th style={{ padding: "12px 16px" }}>Status</th>
                <th style={{ padding: "12px 16px" }}>Author</th>
                <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {editions.map((ed) => {
                let parsedTitle = { en: ed.title };
                try {
                  parsedTitle = JSON.parse(ed.title);
                } catch {}
                const titleStr = parsedTitle.en || ed.title;

                const canManage = userRole === "ADMIN" || ed.authorId === userId;

                return (
                  <tr key={ed.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 600 }}>
                      <Link href={`/newspaper/${ed.slug}`} target="_blank" style={{ color: "var(--text)", textDecoration: "none" }}>
                        {titleStr}
                      </Link>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--muted)" }}>
                      {new Date(ed.publishedAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ padding: "2px 6px", borderRadius: 4, background: "rgba(245, 158, 11, 0.15)", color: "var(--accent)", fontSize: "0.75rem", fontWeight: 700 }}>
                        {ed.language}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--muted)" }}>{ed.pageCount}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: 12,
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          background: ed.isPublished ? "rgba(16, 185, 129, 0.15)" : "rgba(107, 114, 128, 0.15)",
                          color: ed.isPublished ? "#10B981" : "#9CA3AF",
                        }}
                      >
                        {ed.isPublished ? "PUBLISHED" : "DRAFT"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--muted)" }}>
                      {ed.author?.name || ed.author?.email || "Editor"}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      {canManage && (
                        <div style={{ display: "inline-flex", gap: 8 }}>
                          <button
                            onClick={() => handleTogglePublish(ed)}
                            style={{
                              padding: "4px 8px",
                              fontSize: "0.75rem",
                              borderRadius: 4,
                              background: "var(--bg)",
                              border: "1px solid var(--border)",
                              color: "var(--text)",
                              cursor: "pointer",
                            }}
                          >
                            {ed.isPublished ? "Unpublish" : "Publish"}
                          </button>
                          <button
                            onClick={() => openEditModal(ed)}
                            style={{
                              padding: "4px 8px",
                              fontSize: "0.75rem",
                              borderRadius: 4,
                              background: "var(--bg)",
                              border: "1px solid var(--border)",
                              color: "var(--text)",
                              cursor: "pointer",
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(ed.id)}
                            style={{
                              padding: "4px 8px",
                              fontSize: "0.75rem",
                              borderRadius: 4,
                              background: "rgba(239, 68, 68, 0.15)",
                              border: "1px solid rgba(239, 68, 68, 0.3)",
                              color: "#EF4444",
                              cursor: "pointer",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload/Edit Modal */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            className="panel"
            style={{
              width: "100%",
              maxWidth: 580,
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 28,
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--panel)",
            }}
          >
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 16 }}>
              {editingEdition ? "Edit Newspaper Edition" : "Upload New Newspaper Edition"}
            </h3>

            {error && (
              <div style={{ padding: "8px 12px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid #EF4444", color: "#EF4444", borderRadius: 6, fontSize: "0.85rem", marginBottom: 14 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--muted)", marginBottom: 4 }}>
                  Title (English) *
                </label>
                <input
                  type="text"
                  required
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="e.g. StockToday Financial Daily - Vol. 12"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "var(--muted)", marginBottom: 4 }}>
                    Title (Gujarati)
                  </label>
                  <input
                    type="text"
                    value={titleGu}
                    onChange={(e) => setTitleGu(e.target.value)}
                    placeholder="દા.ત. સ્ટોકટુડે દૈનિક અખબાર"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "var(--muted)", marginBottom: 4 }}>
                    Title (Hindi)
                  </label>
                  <input
                    type="text"
                    value={titleHi}
                    onChange={(e) => setTitleHi(e.target.value)}
                    placeholder="उदा. स्टॉकटुडे दैनिक अख़बार"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "var(--muted)", marginBottom: 4 }}>
                    Publication Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={publishedAt}
                    onChange={(e) => setPublishedAt(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "var(--muted)", marginBottom: 4 }}>
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" }}
                  >
                    <option value="EN">English</option>
                    <option value="GU">ગુજરાતી</option>
                    <option value="HI">हिन्दी</option>
                    <option value="MULTI">Multilingual</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "var(--muted)", marginBottom: 4 }}>
                    Page Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={pageCount}
                    onChange={(e) => setPageCount(parseInt(e.target.value, 10))}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" }}
                  />
                </div>
              </div>

              {/* PDF File Picker */}
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--muted)", marginBottom: 4 }}>
                  Newspaper PDF File {!editingEdition && "*"}
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  style={{ width: "100%", padding: "8px", borderRadius: 6, border: "1px dashed var(--border)", background: "var(--bg)", color: "var(--text)" }}
                />
                {file && (
                  <p style={{ fontSize: "0.75rem", color: "var(--accent)", margin: "4px 0 0" }}>
                    Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
              </div>

              {/* PDF Preview Frame */}
              {pdfPreviewUrl && (
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "var(--muted)", marginBottom: 4 }}>
                    Preview
                  </label>
                  <iframe
                    src={pdfPreviewUrl}
                    style={{ width: "100%", height: 180, borderRadius: 6, border: "1px solid var(--border)" }}
                    title="PDF Preview"
                  />
                </div>
              )}

              {/* Publishing Status */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  id="isPub"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                />
                <label htmlFor="isPub" style={{ fontSize: "0.85rem", color: "var(--text)" }}>
                  Publish immediately (accessible to normal public visitors)
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{ padding: "8px 14px", borderRadius: 6, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 6,
                    background: "var(--accent)",
                    color: "#0B1020",
                    fontWeight: 700,
                    border: "none",
                    cursor: submitting ? "not-allowed" : "pointer",
                  }}
                >
                  {submitting ? "Uploading..." : editingEdition ? "Update Edition" : "Upload & Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

