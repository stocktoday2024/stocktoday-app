import Link from "next/link";

export default function DisclaimerPage() {
  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 64, maxWidth: 880 }}>
      {/* Breadcrumb */}
      <nav style={{ display: "flex", gap: 8, fontSize: "0.85rem", color: "var(--muted)", marginBottom: 20 }}>
        <Link href="/" style={{ color: "var(--muted)" }}>Home</Link>
        <span>/</span>
        <span style={{ color: "var(--accent)" }}>Disclaimer</span>
      </nav>

      <h1 style={{ fontSize: "2rem", marginBottom: 12 }}>Regulatory Disclaimers & Compliance</h1>
      <p style={{ color: "var(--muted)", fontSize: "0.95rem", marginBottom: 32 }}>
        Statutory disclosures pursuant to SEBI regulations and Indian securities laws.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <section
          className="panel"
          style={{
            borderColor: "var(--accent)",
            background: "rgba(251, 191, 36, 0.05)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--accent)", fontWeight: 700, marginBottom: 8 }}>
            <span>⚠️</span>
            <span>NOT SEBI REGISTERED INVESTMENT ADVISORS</span>
          </div>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--text)" }}>
            Stock Today (stocktoday.co.in) is a financial journalism and news publishing portal. We are <strong>NOT</strong> registered as Research Analysts or Investment Advisors with the Securities and Exchange Board of India (SEBI).
          </p>
        </section>

        <section className="panel">
          <h2 style={{ fontSize: "1.2rem", marginBottom: 12, color: "var(--text)" }}>Educational & News Purpose Only</h2>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--muted)" }}>
            All information published on this platform, including market indices, company summaries, corporate disclosures, and IPO tracker data, is strictly for educational, informational, and news reporting purposes. Nothing on this website should be construed as investment advice, a portfolio recommendation, or an offer to buy or sell securities.
          </p>
        </section>

        <section className="panel">
          <h2 style={{ fontSize: "1.2rem", marginBottom: 12, color: "var(--text)" }}>Market Risks</h2>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--muted)" }}>
            Investment in securities markets involves risk, including the loss of principal capital. Past performance indicators are not indicative of future market returns. Always consult a certified, SEBI-registered financial planner before executing trades or making investment commitments.
          </p>
        </section>

        <section className="panel">
          <h2 style={{ fontSize: "1.2rem", marginBottom: 12, color: "var(--text)" }}>Data Delay Notice</h2>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--muted)" }}>
            Market ticker figures and index values displayed on Stock Today may be delayed or sourced from last closing session data. These should not be used for direct trading execution and may not reflect real-time exchange prices.
          </p>
        </section>
      </div>
    </div>
  );
}
