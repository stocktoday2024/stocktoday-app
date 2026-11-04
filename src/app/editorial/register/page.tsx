"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function RegisterEditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [validating, setValidating] = useState(true);
  const [tokenData, setTokenData] = useState<{ email: string; name?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("No invitation token provided. Please use the link provided by the administrator.");
      setValidating(false);
      return;
    }

    const checkToken = async () => {
      try {
        const res = await fetch(`/api/auth/register-editor?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Invalid or expired invitation token.");
        } else {
          setTokenData(data);
          if (data.name) setName(data.name);
        }
      } catch (err: any) {
        setError("Network error verifying invitation token.");
      } finally {
        setValidating(false);
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register-editor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          name,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to complete editor registration.");
        setSubmitting(false);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/editorial/login");
        }, 2000);
      }
    } catch (err: any) {
      setError("Failed to register. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 460, paddingTop: 64, paddingBottom: 64 }}>
      <div className="panel" style={{ padding: 32, borderRadius: 16, border: "1px solid var(--border-color)", background: "var(--panel)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ color: "var(--accent)", fontSize: "1.5rem" }}>◆</span>
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.3rem", color: "var(--foreground)" }}>
              StockToday Newsroom
            </span>
          </div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)" }}>Editor Registration</h1>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: 4 }}>
            Complete your profile using your secure administrator invitation.
          </p>
        </div>

        {validating && (
          <div style={{ textAlign: "center", padding: "30px 0", color: "var(--muted)" }}>
            Verifying invitation token security credentials...
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "12px 14px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: 8,
              color: "#EF4444",
              fontSize: "0.85rem",
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              padding: "16px",
              background: "rgba(52, 211, 153, 0.1)",
              border: "1px solid rgba(52, 211, 153, 0.3)",
              borderRadius: 8,
              color: "#34D399",
              fontSize: "0.9rem",
              textAlign: "center",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Account Created Successfully!</div>
            Redirecting you to the Editorial Desk Login...
          </div>
        )}

        {!validating && tokenData && !success && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: 6, color: "var(--foreground)" }}>
                Invited Email Address
              </label>
              <input
                type="email"
                value={tokenData.email}
                disabled
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border-color)",
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "var(--muted)",
                  fontSize: "0.9rem",
                  cursor: "not-allowed",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: 6, color: "var(--foreground)" }}>
                Full Name / Pen Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Mehta"
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border-color)",
                  background: "rgba(255, 255, 255, 0.03)",
                  color: "var(--foreground)",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: 6, color: "var(--foreground)" }}>
                Password (min 8 chars)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a strong password"
                required
                minLength={8}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border-color)",
                  background: "rgba(255, 255, 255, 0.03)",
                  color: "var(--foreground)",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: 6, color: "var(--foreground)" }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                minLength={8}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border-color)",
                  background: "rgba(255, 255, 255, 0.03)",
                  color: "var(--foreground)",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "11px 16px",
                borderRadius: 8,
                border: "none",
                background: "var(--accent)",
                color: "#0B1020",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: submitting ? "wait" : "pointer",
                marginTop: 8,
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? "Activating Editor Account..." : "Create Editor Account"}
            </button>
          </form>
        )}

        <div style={{ marginTop: 24, textAlign: "center", borderTop: "1px solid var(--border-color)", paddingTop: 18 }}>
          <Link
            href="/editorial/login"
            style={{
              fontSize: "0.8rem",
              color: "var(--muted)",
              textDecoration: "underline",
            }}
          >
            ← Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterEditorPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: 60 }}>Loading registration...</div>}>
      <RegisterEditorContent />
    </Suspense>
  );
}

