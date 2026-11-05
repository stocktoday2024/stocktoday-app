"use client";

import Image from "next/image";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditorialLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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
      setError("Invalid editorial credentials or account disabled.");
      setLoading(false);
    } else {
      router.push("/editorial");
      router.refresh();
    }
  };

  return (
    <div className="container" style={{ maxWidth: 440, paddingTop: 64, paddingBottom: 64 }}>
      <div className="panel" style={{ padding: 32, borderRadius: 16, border: "1px solid var(--border-color)", background: "var(--panel)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 180, height: 58, position: "relative" }}>
              <Image
                src="/StockTodayLogo.jpeg"
                alt="StockToday Logo"
                width={180}
                height={58}
                style={{ objectFit: "contain", width: "auto", height: "100%" }}
                priority
              />
            </div>
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.1rem", color: "var(--foreground)" }}>
              StockToday Newsroom
            </span>
          </div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)" }}>Editorial Desk Login</h1>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: 4 }}>
            Sign in to create, edit, translate and publish market intelligence.
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
              Editorial Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="editor1@gmail.com"
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
                Password
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
              placeholder="Enter your password"
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

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", color: "var(--muted)" }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: "var(--accent)" }}
              />
              Remember me
            </label>
            <span style={{ color: "var(--muted)", fontSize: "0.75rem" }}>
              Forgot password? Contact Administrator
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "11px 16px",
              borderRadius: 8,
              border: "none",
              background: "var(--accent)",
              color: "#0B1020",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: loading ? "wait" : "pointer",
              marginTop: 8,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Authenticating..." : "Sign in to Editorial Desk"}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: "center", borderTop: "1px solid var(--border-color)", paddingTop: 18 }}>
          <p style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
            Don&apos;t have an account?{" "}
            <span style={{ color: "var(--foreground)", fontWeight: 500 }}>
              Editor access is by Admin invitation only.
            </span>
          </p>
          <div style={{ marginTop: 12 }}>
            <Link
              href="/admin/login"
              style={{
                fontSize: "0.78rem",
                color: "var(--muted)",
                textDecoration: "underline",
              }}
            >
              Administrator Login Portal →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

