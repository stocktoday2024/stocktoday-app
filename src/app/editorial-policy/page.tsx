import Link from "next/link";

export default function EditorialPolicyPage() {
  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 64, maxWidth: 880 }}>
      {/* Breadcrumb */}
      <nav style={{ display: "flex", gap: 8, fontSize: "0.85rem", color: "var(--muted)", marginBottom: 20 }}>
        <Link href="/" style={{ color: "var(--muted)" }}>Home</Link>
        <span>/</span>
        <span style={{ color: "var(--teal)" }}>Editorial Policy</span>
      </nav>

      <h1 style={{ fontSize: "2rem", marginBottom: 12 }}>Editorial Policy & Code of Conduct</h1>
      <p style={{ color: "var(--muted)", fontSize: "0.95rem", marginBottom: 32 }}>
        Standard operating guidelines, conflict-of-interest disclosures, and translation accuracy protocols for Stock Today journalists.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <section className="panel">
          <h2 style={{ fontSize: "1.2rem", marginBottom: 12, color: "var(--text)" }}>1. Unbiased Financial Reporting</h2>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--muted)" }}>
            Stock Today provides factual reporting on corporate earnings, regulatory filings with the Securities and Exchange Board of India (SEBI), stock exchanges (NSE & BSE), and economic data releases. We do not provide &ldquo;hot tips&rdquo;, guaranteed returns, or speculative price targets.
          </p>
        </section>

        <section className="panel">
          <h2 style={{ fontSize: "1.2rem", marginBottom: 12, color: "var(--text)" }}>2. Multilingual Integrity</h2>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--muted)" }}>
            Every story published in Gujarati and Hindi undergoes editorial verification to maintain technical accuracy. When financial terms lack direct regional translations, our &ldquo;In Simple Terms&rdquo; framework provides accurate conceptual explanations without distorting the underlying financial reality.
          </p>
        </section>

        <section className="panel">
          <h2 style={{ fontSize: "1.2rem", marginBottom: 12, color: "var(--text)" }}>3. Personal Trading Restrictions</h2>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--muted)" }}>
            Editorial staff members are prohibited from active day trading or holding speculative derivative positions in companies they cover. Any long-term personal equity investments held by contributing analysts are disclosed in bylines.
          </p>
        </section>

        <section className="panel">
          <h2 style={{ fontSize: "1.2rem", marginBottom: 12, color: "var(--text)" }}>4. Corrections & Transparency</h2>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--muted)" }}>
            If factual or computational errors occur, corrections are updated transparently with an editorial timestamp note at the top of the revised article.
          </p>
        </section>
      </div>
    </div>
  );
}
