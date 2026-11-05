"use client";

import Image from "next/image";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid administrator credentials or access restricted.");
      setLoading(false);
    } else {
      router.push("/admin");
      router.refresh();
    }
  };

  return (
    <div className="container" style={{ maxWidth: 440, paddingTop: 64, paddingBottom: 64 }}>
      <div
        className="panel"
        style={{
          padding: 32,
          borderRadius: 16,
          border: "1px solid rgba(245, 158, 11, 0.3)",
          background: "var(--panel)",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 180,
              height: 58,
              marginBottom: 12,
            }}
          >
            <Image
              src="/StockTodayLogo.jpeg"
              alt="StockToday Logo"
              width={180}
              height={58}
              style={{ objectFit: "contain", width: "auto", height: "100%" }}
              priority
            />
          </div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)" }}>Administrator Portal</h1>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: 4 }}>
            System control, editor permissions, audit logs & publishing oversight.
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: "10px 14px",
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

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: 6, color: "var(--foreground)" }}>
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gmail.com"
              required
              autoComplete="email"
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--foreground)" }}>
                Admin Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--muted)",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
              autoComplete="current-password"
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
            disabled={loading}
            style={{
              padding: "11px 16px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg, #F59E0B, #D97706)",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: loading ? "wait" : "pointer",
              marginTop: 8,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Verifying..." : "Authorize Admin Access"}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: "center", borderTop: "1px solid var(--border-color)", paddingTop: 18 }}>
          <p style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
            Restricted area. All access attempts are recorded in immutable audit logs.
          </p>
          <div style={{ marginTop: 10 }}>
            <Link
              href="/editorial/login"
              style={{
                fontSize: "0.78rem",
                color: "var(--accent)",
                textDecoration: "underline",
              }}
            >
              ← Back to Editorial Desk Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

