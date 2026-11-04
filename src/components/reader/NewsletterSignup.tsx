"use client";

import { useState } from "react";
import { CustomSelect } from "@/components/ui/CustomSelect";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState<"EN" | "GU" | "HI">("EN");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please provide a valid email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, language, frequency }),
      });

      if (!res.ok) {
        throw new Error("Subscription failed");
      }

      setStatus("success");
      setMessage("Thank you! You are now subscribed to Stock Today Market Morning Digest.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Unable to subscribe at this moment. Please try again later.");
    }
  };

  return (
    <section
      className="panel"
      style={{
        marginTop: 48,
        padding: "32px 36px",
        background: "linear-gradient(135deg, var(--panel) 0%, rgba(251, 191, 36, 0.08) 100%)",
        borderColor: "var(--border)",
      }}
    >
      <div style={{ maxWidth: 640 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ color: "var(--accent)", fontSize: "1.2rem" }}>✉</span>
          <span style={{ fontSize: "0.8rem", color: "var(--accent)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Market Morning Digest
          </span>
        </div>

        <h3 style={{ fontSize: "1.4rem", marginBottom: 8, color: "var(--text)" }}>
          Morning Stock Intelligence in Your Preferred Language
        </h3>

        <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: 20 }}>
          Receive market opening previews, corporate earnings summaries, and GIFT City / Dholera updates delivered directly to your inbox before markets open at 9:15 AM.
        </p>

        {status === "success" ? (
          <div
            style={{
              padding: "12px 16px",
              background: "rgba(52, 211, 153, 0.15)",
              border: "1px solid var(--up)",
              color: "var(--up-text)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            ✓ {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                required
                style={{
                  flex: 1,
                  minWidth: 240,
                  padding: "10px 14px",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--text)",
                  fontSize: "0.9rem",
                }}
              />

              <div style={{ minWidth: 120 }}>
                <CustomSelect
                  options={[
                    { value: "EN", label: "English" },
                    { value: "GU", label: "ગુજરાતી" },
                    { value: "HI", label: "हिन्दी" },
                  ]}
                  value={language}
                  onChange={(val) => setLanguage(val as "EN" | "GU" | "HI")}
                />
              </div>

              <div style={{ minWidth: 150 }}>
                <CustomSelect
                  options={[
                    { value: "daily", label: "Daily Morning" },
                    { value: "weekly", label: "Weekend Wrap" },
                  ]}
                  value={frequency}
                  onChange={(val) => setFrequency(val as "daily" | "weekly")}
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                style={{
                  padding: "10px 20px",
                  background: "var(--accent)",
                  color: "var(--bg)",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                {status === "loading" ? "Subscribing..." : "Subscribe"}
              </button>
            </div>

            {status === "error" && (
              <p style={{ color: "var(--down)", fontSize: "0.8rem" }}>{message}</p>
            )}

            <p style={{ color: "var(--muted)", fontSize: "0.75rem" }}>
              Zero spam. Strictly market news & disclosures. Unsubscribe anytime with 1 click.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
