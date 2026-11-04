"use client";

import { useLanguage } from "@/context/LanguageContext";
import { ArticleCard } from "@/components/article/ArticleCard";
import { parseMultiLang, getLocalised } from "@/types";

interface IPOCardData {
  company: string;
  issueSize: string;
  priceBand: string;
  dates: string;
  status: "Open" | "Upcoming" | "Recently Closed" | "Listed";
  gmp: string;
  gainEst: string;
  subscription: string;
  exchange: "NSE & BSE Mainboard" | "BSE SME" | "NSE Emerge";
  closeDate: string;
}

interface EventData {
  id: string;
  type: string;
  title: string;
  date: Date;
  description: string;
}

interface ArticleData {
  id: string;
  slug: string;
  category: string;
  sentiment?: string | null;
  isBreaking?: boolean;
  publishAt?: Date | null;
  title: string;
  summary: string;
}

const UI_TEXT = {
  EN: {
    kicker: "Primary Market Intelligence",
    title: "India IPO Dashboard & Mainboard Tracker",
    desc: "Complete tracker for mainboard and SME initial public offerings across NSE and BSE. Filter active bidding, check grey market premiums (GMP), and verify red-herring prospectus details.",
    currentOpen: "Currently Open for Bidding",
    upcoming: "Upcoming IPOs",
    recentlyClosed: "Recently Closed IPOs (Past 10 Days)",
    issueSize: "Issue Size",
    priceBand: "Price Band",
    biddingCloses: "Bidding Closes",
    subscription: "Subscription",
    gmp: "Estimated GMP",
    gainEst: "Gain Est",
    calendarTitle: "Official Corporate & IPO Calendar",
    dispatchesTitle: "IPO News & Analysis",
    openBadge: "BIDDING OPEN",
    upcomingBadge: "UPCOMING",
    closedBadge: "CLOSED",
  },
  GU: {
    kicker: "પ્રાથમિક બજાર ઇન્ટેલિજન્સ",
    title: "ભારત IPO ડેશબોર્ડ અને મેઇનબોર્ડ ટ્રેકર",
    desc: "NSE અને BSE પર મેઇનબોર્ડ અને SME પબ્લિક ઓફરિંગ્સ માટે સંપૂર્ણ ટ્રેકર. ગ્રે માર્કેટ પ્રીમિયમ (GMP) અને પ્રોસ્પેક્ટસ વિગતો તપાસો.",
    currentOpen: "હાલમાં બિડિંગ માટે ખૂલેલા",
    upcoming: "આગામી IPO",
    recentlyClosed: "તાજેતરમાં બંધ થયેલા IPO (છેલ્લા 10 દિવસ)",
    issueSize: "ઇશ્યૂ સાઇઝ",
    priceBand: "પ્રાઇસ બેન્ડ",
    biddingCloses: "બિડિંગ બંધ તારીખ",
    subscription: "સબસ્ક્રિપ્શન",
    gmp: "અંદાજિત GMP",
    gainEst: "અંદાજિત નફો",
    calendarTitle: "સત્તાવાર કોર્પોરેટ અને IPO કેલેન્ડર",
    dispatchesTitle: "IPO સમાચાર અને વિશ્લેષણ",
    openBadge: "બિડિંગ ચાલુ",
    upcomingBadge: "આગામી",
    closedBadge: "બંધ થયેલ",
  },
  HI: {
    kicker: "प्राथमिक बाज़ार इंटेलिजेंस",
    title: "भारत IPO डैशबोर्ड और मेनबोर्ड ट्रैकर",
    desc: "NSE और BSE पर मेनबोर्ड और SME इनिशियल पब्लिक ऑफरिंग्स के लिए संपूर्ण ट्रैकर। ग्रे मार्केट प्रीमियम (GMP) और प्रॉस्पेक्टस विवरण देखें।",
    currentOpen: "वर्तमान में बोली के लिए खुले",
    upcoming: "आगामी IPO",
    recentlyClosed: "हाल ही में बंद हुए IPO (पिछले 10 दिन)",
    issueSize: "इश्यू साइज",
    priceBand: "प्राइस बैंड",
    biddingCloses: "बोली समापन तिथि",
    subscription: "सब्सक्रिप्शन",
    gmp: "अनुमानित GMP",
    gainEst: "अनुमानित लाभ",
    calendarTitle: "आधिकारिक कॉर्पोरेट और IPO कैलेंडर",
    dispatchesTitle: "IPO समाचार और विश्लेषण",
    openBadge: "बिडिंग चालू",
    upcomingBadge: "आगामी",
    closedBadge: "समाप्त",
  },
};

export function IPOsView({
  ipos,
  events,
  articles,
}: {
  ipos: IPOCardData[];
  events: EventData[];
  articles: ArticleData[];
}) {
  const { locale } = useLanguage();
  const t = UI_TEXT[locale] || UI_TEXT.EN;

  const openIpos = ipos.filter((i) => i.status === "Open");
  const upcomingIpos = ipos.filter((i) => i.status === "Upcoming");
  const closedIpos = ipos.filter((i) => i.status === "Recently Closed");

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "var(--accent)", fontSize: "1.2rem" }}>✦</span>
          <h1 style={{ fontSize: "1.8rem" }}>{t.title}</h1>
        </div>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginTop: 4 }}>
          {t.desc}
        </p>
      </div>

      {/* ── 1. CURRENTLY OPEN IPOS ─────────────────────────────────── */}
      {openIpos.length > 0 && (
        <div style={{ marginBottom: 44 }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>
            {t.currentOpen} ({openIpos.length})
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
            {openIpos.map((ipo, idx) => (
              <div key={idx} className="panel" style={{ borderLeft: "4px solid var(--up)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                      {ipo.exchange}
                    </span>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text)", marginTop: 2 }}>
                      {ipo.company}
                    </h3>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 800, padding: "3px 8px", borderRadius: 4, background: "rgba(52, 211, 153, 0.15)", color: "var(--up)" }}>
                    ● {t.openBadge}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, background: "rgba(255, 255, 255, 0.02)", padding: 12, borderRadius: 8, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--muted)" }}>{t.issueSize}</div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>{ipo.issueSize}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--muted)" }}>{t.priceBand}</div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>{ipo.priceBand}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--muted)" }}>{t.biddingCloses}</div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{ipo.dates}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--muted)" }}>{t.subscription}</div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--teal)" }}>{ipo.subscription}</div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <span>{t.gmp}: <strong style={{ color: "var(--up)" }}>{ipo.gmp}</strong></span>
                  <span style={{ color: "var(--muted)" }}>{t.gainEst}: {ipo.gainEst}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 2. UPCOMING IPOS ─────────────────────────────────────── */}
      <div style={{ marginBottom: 44 }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>
          {t.upcoming} ({upcomingIpos.length})
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
          {upcomingIpos.map((ipo, idx) => (
            <div key={idx} className="panel">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                    {ipo.exchange}
                  </span>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text)", marginTop: 2 }}>
                    {ipo.company}
                  </h3>
                </div>
                <span style={{ fontSize: "11px", fontWeight: 800, padding: "3px 8px", borderRadius: 4, background: "rgba(251, 191, 36, 0.15)", color: "var(--accent)" }}>
                  {t.upcomingBadge}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, background: "rgba(255, 255, 255, 0.02)", padding: 12, borderRadius: 8, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--muted)" }}>{t.issueSize}</div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>{ipo.issueSize}</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--muted)" }}>{t.priceBand}</div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>{ipo.priceBand}</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--muted)" }}>{t.biddingCloses}</div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{ipo.dates}</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--muted)" }}>{t.subscription}</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--teal)" }}>{ipo.subscription}</div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                <span>{t.gmp}: <strong style={{ color: "var(--up)" }}>{ipo.gmp}</strong></span>
                <span style={{ color: "var(--muted)" }}>{t.gainEst}: {ipo.gainEst}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. RECENTLY CLOSED IPOS ───────────────────────────────── */}
      {closedIpos.length > 0 && (
        <div style={{ marginBottom: 44 }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>
            {t.recentlyClosed} ({closedIpos.length})
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
            {closedIpos.map((ipo, idx) => (
              <div key={idx} className="panel" style={{ opacity: 0.9 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                      {ipo.exchange}
                    </span>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text)", marginTop: 2 }}>
                      {ipo.company}
                    </h3>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 800, padding: "3px 8px", borderRadius: 4, background: "rgba(165, 176, 214, 0.15)", color: "var(--muted)" }}>
                    {t.closedBadge}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, background: "rgba(255, 255, 255, 0.02)", padding: 12, borderRadius: 8, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--muted)" }}>{t.issueSize}</div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>{ipo.issueSize}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--muted)" }}>{t.priceBand}</div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>{ipo.priceBand}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--muted)" }}>{t.biddingCloses}</div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{ipo.dates}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--muted)" }}>{t.subscription}</div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--teal)" }}>{ipo.subscription}</div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <span>{t.gmp}: <strong style={{ color: "var(--up)" }}>{ipo.gmp}</strong></span>
                  <span style={{ color: "var(--muted)" }}>{t.gainEst}: {ipo.gainEst}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. CALENDAR ───────────────────────────────────────────── */}
      {events.length > 0 && (
        <div id="calendar" style={{ marginBottom: 44 }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>
            {t.calendarTitle}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {events.map((ev) => {
              const parsedDesc = parseMultiLang(ev.description);
              const desc = getLocalised(parsedDesc, locale).text;
              return (
                <div key={ev.id} className="panel" style={{ padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span className="tag tag-category">{ev.type}</span>
                    <span style={{ fontSize: "12px", color: "var(--accent)", fontWeight: 700 }}>
                      {new Date(ev.date).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 6 }}>{ev.title}</h4>
                  <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 5. ARTICLES ───────────────────────────────────────────── */}
      <div>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>
          {t.dispatchesTitle}
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} locale={locale} />
          ))}
        </div>
      </div>
    </div>
  );
}

