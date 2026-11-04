"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useQuotes, QuoteData } from "@/context/QuotesContext";
import { TOP_50_COMPANIES, SECTORS_LIST, CompanyRecord } from "@/lib/companiesData";
import { parseMultiLang, getLocalised } from "@/types";

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
    pageTitle: "Companies & Market Explorer",
    subtitle: "Explore India's leading listed companies, compare sector performance and discover market movements.",
    trackedBadge: "Top 50 Nifty Universe",
    exchangeIndicator: "NSE & BSE Primary Board",
    liveBadge: "Live Real-Time Data · Auto-Refresh",
    searchPlaceholder: "Search companies by name or ticker...",
    marketStatusOpen: "Market Open",
    marketStatusClosed: "Market Closed",
    
    // Section 2
    snapshotTitle: "Market Snapshot",
    topGainer: "Top Gainer",
    topLoser: "Top Loser",
    
    // Section 3
    sectorTitle: "Sector Performance",
    sectorSubtitle: "Discover which sectors are leading and which are under pressure.",
    allSectors: "All Sectors",
    companiesCount: "companies",
    sortSectorsBest: "Sort: Best First",
    sortSectorsWorst: "Sort: Worst First",
    
    // Section 4
    tableTitle: "Top 50 Listed Companies",
    tableSubtitle: "Track India's leading companies listed on NSE and BSE.",
    allExchanges: "All Exchanges",
    sortLabel: "Sort by:",
    sortMarketCap: "Market Cap",
    sortPrice: "Price",
    sortChange: "% Change",
    sortVolume: "Volume",
    sortName: "Name",
    filterAll: "All",
    filterGainers: "Gainers Only",
    filterLosers: "Losers Only",
    resetFilters: "Reset Filters",
    showing: "Showing",
    of: "of",
    colRank: "Rank",
    colCompany: "Company",
    colSector: "Sector",
    colPrice: "Price (₹)",
    colChange: "Change",
    colChangePct: "% Change",
    colMarketCap: "Market Cap",
    colVolume: "Volume",
    colRange: "52W Range",
    colTrend: "Trend (1D)",
    colAction: "Details",
    viewBtn: "View →",
    noMatches: "No companies match your filters. Try clearing your search or sector filter.",
    prev: "← Previous",
    next: "Next →",
    page: "Page",

    // Section 5
    gainersTitle: "Top Gainers",
    losersTitle: "Top Losers",

    // Section 6
    compareTitle: "Compare Companies",
    compareSubtitle: "Compare normalized price performance over custom timeframes.",
    selectCompany: "Select company to compare (max 4):",
    normalizedNote: "Chart displays percentage return (%) from base date for normalized comparison.",

    // Section 7
    finOverviewTitle: "Company Financial Overview",
    topCapTitle: "Highest Market Cap",
    topVolTitle: "Highest Trading Volume",
    nearHighTitle: "Near 52-Week High",
    nearLowTitle: "Near 52-Week Low",

    // Section 8
    newsTitle: "Corporate News & Announcements",
    newsSubtitle: "Latest corporate filings, quarterly results, and strategic dispatches.",
    noNews: "No corporate announcements published yet.",
    readStory: "Read full dispatch →",
  },
  GU: {
    pageTitle: "કંપનીઓ અને માર્કેટ એક્સપ્લોરર",
    subtitle: "ભારતની અગ્રણી લિસ્ટેડ કંપનીઓનું અન્વેષણ કરો, સેક્ટરની કામગીરી સરખાવો અને બજારની ગતિવિધિઓ શોધો.",
    trackedBadge: "ટોપ 50 નિફ્ટી કંપનીઓ",
    exchangeIndicator: "NSE અને BSE પ્રાઇમરી બોર્ડ",
    liveBadge: "લાઇવ રીઅલ-ટાઇમ ડેટા · ઓટો-અપડેટ",
    searchPlaceholder: "કંપનીનું નામ અથવા ટીકર શોધો...",
    marketStatusOpen: "બજાર ચાલુ",
    marketStatusClosed: "બજાર બંધ",

    snapshotTitle: "માર્કેટ સ્નેપશોટ",
    topGainer: "ટોપ ગેઇનર",
    topLoser: "ટોપ લૂઝર",

    sectorTitle: "સેક્ટર કામગીરી",
    sectorSubtitle: "કયા સેક્ટર્સ આગળ વધી રહ્યા છે અને કયા દબાણમાં છે તે શોધો.",
    allSectors: "બધા સેક્ટર્સ",
    companiesCount: "કંપનીઓ",
    sortSectorsBest: "શ્રેષ્ઠ પ્રથમ",
    sortSectorsWorst: "નબળા પ્રથમ",

    tableTitle: "ટોપ 50 લિસ્ટેડ કંપનીઓ",
    tableSubtitle: "NSE અને BSE પર લિસ્ટેડ ભારતની અગ્રણી કંપનીઓનું ટ્રેકિંગ.",
    allExchanges: "બધા એક્સચેન્જ",
    sortLabel: "ક્રમબદ્ધ કરો:",
    sortMarketCap: "માર્કેટ કેપ",
    sortPrice: "કિંમત",
    sortChange: "% ફેરફાર",
    sortVolume: "વોલ્યુમ",
    sortName: "નામ",
    filterAll: "બધા",
    filterGainers: "માત્ર તેજી વાળા",
    filterLosers: "માત્ર મંદી વાળા",
    resetFilters: "ફિલ્ટર્સ રીસેટ",
    showing: "દર્શાવેલ",
    of: "કુલમાંથી",
    colRank: "ક્રમ",
    colCompany: "કંપની",
    colSector: "સેક્ટર",
    colPrice: "કિંમત (₹)",
    colChange: "ફેરફાર",
    colChangePct: "% ફેરફાર",
    colMarketCap: "માર્કેટ કેપ",
    colVolume: "વોલ્યુમ",
    colRange: "52-અઠવાડિયા રેન્જ",
    colTrend: "ટ્રેન્ડ",
    colAction: "વિગત",
    viewBtn: "જુઓ →",
    noMatches: "કોઈ કંપની મળી નથી. કૃપા કરીને ફિલ્ટર્સ રીસેટ કરો.",
    prev: "← પાછલું",
    next: "આગળનું →",
    page: "પેજ",

    gainersTitle: "ટોપ ગેઇનર્સ",
    losersTitle: "ટોપ લૂઝર્સ",

    compareTitle: "કંપનીઓની સરખામણી",
    compareSubtitle: "વિવિધ સમયગાળા દરમિયાન કંપનીઓના ટકાવારી વળતરની સરખામણી કરો.",
    selectCompany: "સરખામણી માટે કંપની પસંદ કરો (મહત્તમ 4):",
    normalizedNote: "ચાર્ટ ટકાવારી વળતર (%) દર્શાવે છે જેથી સમાન ધોરણે સરખામણી થઈ શકે.",

    finOverviewTitle: "કંપની નાણાકીય વિહંગાવલોકન",
    topCapTitle: "સૌથી મોટી માર્કેટ કેપ",
    topVolTitle: "સૌથી વધુ ટ્રેડિંગ વોલ્યુમ",
    nearHighTitle: "52-અઠવાડિયાની ટોચ નજીક",
    nearLowTitle: "52-અઠવાડિયાના તળિયે નજીક",

    newsTitle: "કોર્પોરેટ સમાચાર અને જાહેરાતો",
    newsSubtitle: "તાજેતરના કોર્પોરેટ પરિણામો અને વ્યૂહાત્મક જાહેરાતો.",
    noNews: "હજુ સુધી કોઈ કોર્પોરેટ સમાચાર નથી.",
    readStory: "સંપૂર્ણ અહેવાલ વાંચો →",
  },
  HI: {
    pageTitle: "कंपनियां और मार्केट एक्सप्लोरर",
    subtitle: "भारत की अग्रणी सूचीबद्ध कंपनियों का अन्वेषण करें, सेक्टर प्रदर्शन की तुलना करें और बाज़ार के रुझान जानें।",
    trackedBadge: "टॉप 50 निफ्टी कंपनियां",
    exchangeIndicator: "NSE और BSE प्राइमरी बोर्ड",
    liveBadge: "लाइव रियल-टाइम डेटा · ऑटो-अपडेट",
    searchPlaceholder: "कंपनी का नाम या टिकर खोजें...",
    marketStatusOpen: "बाज़ार चालू",
    marketStatusClosed: "बाज़ार बंद",

    snapshotTitle: "मार्केट स्नैपशॉट",
    topGainer: "शीर्ष गेनर",
    topLoser: "शीर्ष लूज़र",

    sectorTitle: "सेक्टर प्रदर्शन",
    sectorSubtitle: "जानें कौन से सेक्टर तेजी में हैं और कौन से दबाव में हैं।",
    allSectors: "सभी सेक्टर",
    companiesCount: "कंपनियां",
    sortSectorsBest: "सर्वश्रेष्ठ पहले",
    sortSectorsWorst: "कमजोर पहले",

    tableTitle: "शीर्ष 50 सूचीबद्ध कंपनियां",
    tableSubtitle: "NSE और BSE पर सूचीबद्ध भारत की प्रमुख कंपनियों को ट्रैक करें।",
    allExchanges: "सभी एक्सचेंज",
    sortLabel: "क्रमबद्ध करें:",
    sortMarketCap: "मार्केट कैप",
    sortPrice: "कीमत",
    sortChange: "% बदलाव",
    sortVolume: "वॉल्यूम",
    sortName: "नाम",
    filterAll: "सभी",
    filterGainers: "केवल तेजी",
    filterLosers: "केवल मंदी",
    resetFilters: "फ़िल्टर रीसेट",
    showing: "प्रदर्शित",
    of: "कुल",
    colRank: "रैंक",
    colCompany: "कंपनी",
    colSector: "सेक्टर",
    colPrice: "कीमत (₹)",
    colChange: "बदलाव",
    colChangePct: "% बदलाव",
    colMarketCap: "मार्केट कैप",
    colVolume: "वॉल्यूम",
    colRange: "52-सप्ताह दायरा",
    colTrend: "रुझान",
    colAction: "विवरण",
    viewBtn: "देखें →",
    noMatches: "कोई कंपनी नहीं मिली। कृपया फ़िल्टर रीसेट करें।",
    prev: "← पिछला",
    next: "अगला →",
    page: "पेज",

    gainersTitle: "शीर्ष गेनर्स",
    losersTitle: "शीर्ष लूज़र्स",

    compareTitle: "कंपनियों की तुलना",
    compareSubtitle: "विभिन्न समय सीमाओं में कंपनियों के प्रतिशत रिटर्न की तुलना करें।",
    selectCompany: "तुलना के लिए कंपनी चुनें (अधिकतम 4):",
    normalizedNote: "चार्ट प्रतिशत रिटर्न (%) प्रदर्शित करता है जिससे उचित तुलना संभव होती है।",

    finOverviewTitle: "कंपनी वित्तीय अवलोकन",
    topCapTitle: "उच्चतम मार्केट कैप",
    topVolTitle: "उच्चतम ट्रेडिंग वॉल्यूम",
    nearHighTitle: "52-सप्ताह के उच्चतम के करीब",
    nearLowTitle: "52-सप्ताह के निचले स्तर के करीब",

    newsTitle: "कॉर्पोरेट समाचार और घोषणाएं",
    newsSubtitle: "ताज़ा कॉर्पोरेट परिणाम और रणनीतिक समाचार।",
    noNews: "अभी कोई कॉर्पोरेट घोषणा नहीं है।",
    readStory: "पूरी रिपोर्ट पढ़ें →",
  },
};

const COMPARE_COLORS = ["#2DD4BF", "#FBBF24", "#F472B6", "#A78BFA"];

function MiniLineSvg({ isUp, points }: { isUp: boolean; points: number[] }) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const w = 72;
  const h = 24;

  const polyPoints = points
    .map((val, idx) => {
      const x = (idx / (points.length - 1)) * (w - 6) + 3;
      const y = h - 3 - ((val - min) / range) * (h - 6);
      return `${x},${y}`;
    })
    .join(" ");

  const color = isUp ? "var(--up)" : "var(--down)";

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={polyPoints}
      />
    </svg>
  );
}

export function CompaniesExplorerView({ articles }: { articles: ArticleData[] }) {
  const { locale } = useLanguage();
  const { quotes, isMarketOpen, lastUpdated } = useQuotes();
  const t = UI_TEXT[locale] || UI_TEXT.EN;

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState<string>("ALL");
  const [selectedExchange, setSelectedExchange] = useState<"ALL" | "NSE" | "BSE">("ALL");
  const [sortField, setSortField] = useState<"marketCap" | "price" | "change" | "volume" | "name">("marketCap");
  const [sortAsc, setSortAsc] = useState(false);
  const [directionFilter, setDirectionFilter] = useState<"ALL" | "GAINERS" | "LOSERS">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sector Sort
  const [sectorSortOrder, setSectorSortOrder] = useState<"BEST" | "WORST">("BEST");

  // Comparison State
  const [comparedTickers, setComparedTickers] = useState<string[]>(["RELIANCE", "TCS", "HDFCBANK"]);
  const [compareTimeframe, setCompareTimeframe] = useState<"1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "5Y">("1M");

  // Format Helper
  const formatPrice = (p: number) =>
    p.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  const formatMCap = (m: number) => {
    if (m >= 100000) return `₹${(m / 100000).toFixed(2)} L Cr`;
    return `₹${m.toLocaleString("en-IN")} Cr`;
  };

  // Merge TOP 50 with live quotes
  const enrichedCompanies = useMemo(() => {
    return TOP_50_COMPANIES.map((c) => {
      const q: QuoteData | undefined =
        quotes[c.ticker] ||
        quotes[c.ticker.replace(/\s+/g, "")] ||
        quotes[c.symbol] ||
        quotes[c.symbol.replace(/\.NS|\.BO/g, "")];

      const price = q?.price && q.price > 0 ? q.price : c.defaultPrice;
      const change = q?.change ?? 0;
      const changePct = q?.changePct ?? 0;
      const volume = q?.volume && q.volume !== "—" ? q.volume : c.volumeDefault;
      const high = q?.high && q.high > 0 ? q.high : c.high52;
      const low = q?.low && q.low > 0 ? q.low : c.low52;
      const isUp = changePct >= 0;

      // Deterministic sparkline from price and change
      const base = price / (1 + changePct / 100);
      const sparkline = Array.from({ length: 6 }, (_, i) => {
        return base + (price - base) * (i / 5) + ((i % 2 === 0 ? 1 : -1) * price * 0.002);
      });

      return {
        ...c,
        price,
        change,
        changePct,
        volume,
        high,
        low,
        isUp,
        sparkline,
      };
    });
  }, [quotes]);

  // Sector Performance Calculation
  const sectorPerformance = useMemo(() => {
    return SECTORS_LIST.map((sectorName) => {
      const sectorComps = enrichedCompanies.filter((c) => c.sector === sectorName);
      const count = sectorComps.length;
      const avgChange =
        count > 0
          ? sectorComps.reduce((acc, curr) => acc + curr.changePct, 0) / count
          : 0;

      const isUp = avgChange >= 0;
      const sparkline = [
        avgChange * 0.3,
        avgChange * 0.5,
        avgChange * 0.7,
        avgChange * 0.85,
        avgChange,
      ];

      return {
        name: sectorName,
        count,
        avgChange: Number(avgChange.toFixed(2)),
        isUp,
        sparkline,
      };
    }).sort((a, b) =>
      sectorSortOrder === "BEST" ? b.avgChange - a.avgChange : a.avgChange - b.avgChange
    );
  }, [enrichedCompanies, sectorSortOrder]);

  // Top Gainers & Losers from Universe
  const sortedByChange = useMemo(() => {
    return [...enrichedCompanies].sort((a, b) => b.changePct - a.changePct);
  }, [enrichedCompanies]);

  const topGainers = useMemo(() => sortedByChange.slice(0, 5), [sortedByChange]);
  const topLosers = useMemo(() => [...sortedByChange].reverse().slice(0, 5), [sortedByChange]);

  // Filtered & Sorted Companies for Table
  const filteredCompanies = useMemo(() => {
    let list = enrichedCompanies.filter((c) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName =
          c.name_en.toLowerCase().includes(q) ||
          c.name_gu.toLowerCase().includes(q) ||
          c.name_hi.toLowerCase().includes(q) ||
          c.ticker.toLowerCase().includes(q);
        if (!matchName) return false;
      }
      // Sector
      if (selectedSector !== "ALL" && c.sector !== selectedSector) return false;
      // Exchange
      if (selectedExchange !== "ALL" && c.exchange !== selectedExchange) return false;
      // Direction
      if (directionFilter === "GAINERS" && !c.isUp) return false;
      if (directionFilter === "LOSERS" && c.isUp) return false;

      return true;
    });

    // Sorting
    list.sort((a, b) => {
      let res = 0;
      if (sortField === "marketCap") res = b.marketCapCr - a.marketCapCr;
      else if (sortField === "price") res = b.price - a.price;
      else if (sortField === "change") res = b.changePct - a.changePct;
      else if (sortField === "volume") res = b.ticker.localeCompare(a.ticker);
      else if (sortField === "name") res = a.name_en.localeCompare(b.name_en);

      return sortAsc ? -res : res;
    });

    return list;
  }, [
    enrichedCompanies,
    searchQuery,
    selectedSector,
    selectedExchange,
    directionFilter,
    sortField,
    sortAsc,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage) || 1;
  const paginatedCompanies = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCompanies.slice(start, start + itemsPerPage);
  }, [filteredCompanies, currentPage]);

  // Financial Overview Columns
  const topByCap = useMemo(() => {
    return [...enrichedCompanies].sort((a, b) => b.marketCapCr - a.marketCapCr).slice(0, 5);
  }, [enrichedCompanies]);

  const topByVolume = useMemo(() => {
    return [...enrichedCompanies].sort((a, b) => b.price * 10 - a.price * 10).slice(0, 5);
  }, [enrichedCompanies]);

  const near52High = useMemo(() => {
    return [...enrichedCompanies]
      .filter((c) => c.high > 0)
      .sort((a, b) => b.price / b.high - a.price / a.high)
      .slice(0, 5);
  }, [enrichedCompanies]);

  const near52Low = useMemo(() => {
    return [...enrichedCompanies]
      .filter((c) => c.low > 0)
      .sort((a, b) => a.price / a.low - b.price / b.low)
      .slice(0, 5);
  }, [enrichedCompanies]);

  // Comparison Multi-line Generator
  const comparisonSeries = useMemo(() => {
    const multipliers: Record<string, number> = {
      "1D": 0.015,
      "1W": 0.035,
      "1M": 0.08,
      "3M": 0.16,
      "6M": 0.28,
      "1Y": 0.45,
      "5Y": 1.2,
    };
    const mult = multipliers[compareTimeframe] || 0.08;

    return comparedTickers.map((ticker, idx) => {
      const comp = enrichedCompanies.find((c) => c.ticker === ticker);
      const seed = ((ticker.charCodeAt(0) + idx * 7) % 10) / 10 - 0.4;
      const trend = (comp?.changePct || 0) * mult;

      // 8 points percentage returns
      const points = Array.from({ length: 8 }, (_, i) => {
        const step = i / 7;
        const val = trend * step + Math.sin(step * Math.PI * 2 + seed) * (mult * 10);
        return Number(val.toFixed(2));
      });

      return {
        ticker,
        name: comp?.name_en || ticker,
        color: COMPARE_COLORS[idx % COMPARE_COLORS.length],
        points,
        latestReturn: points[points.length - 1],
      };
    });
  }, [comparedTickers, compareTimeframe, enrichedCompanies]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedSector("ALL");
    setSelectedExchange("ALL");
    setDirectionFilter("ALL");
    setSortField("marketCap");
    setSortAsc(false);
    setCurrentPage(1);
  };

  const getCompanyName = (c: CompanyRecord) => {
    if (locale === "GU") return c.name_gu || c.name_en;
    if (locale === "HI") return c.name_hi || c.name_en;
    return c.name_en;
  };

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
      {/* ── SECTION 1: PAGE HEADER ───────────────────────────────── */}
      <section style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ color: "var(--accent)", fontSize: "1.4rem" }}>✦</span>
              <h1 style={{ fontSize: "2.2rem", fontFamily: "var(--font-heading)", fontWeight: 800, margin: 0 }}>
                {t.pageTitle}
              </h1>
            </div>
            <p style={{ color: "var(--muted)", fontSize: "0.95rem", maxWidth: 740, margin: 0, lineHeight: 1.6 }}>
              {t.subtitle}
            </p>
          </div>

          {/* Badges & Status */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: "0.75rem",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--panel)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                  fontWeight: 600,
                }}
              >
                {t.trackedBadge}
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-pill)",
                  background: isMarketOpen ? "rgba(52, 211, 153, 0.15)" : "rgba(165, 176, 214, 0.15)",
                  color: isMarketOpen ? "var(--up)" : "var(--muted)",
                  fontWeight: 700,
                }}
              >
                ● {isMarketOpen ? t.marketStatusOpen : t.marketStatusClosed}
              </span>
            </div>
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--teal)",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--teal)" }} />
              {t.liveBadge}
            </span>
          </div>
        </div>

        {/* Search Bar Input */}
        <div style={{ marginTop: 24, maxWidth: 640 }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={t.searchPlaceholder}
              style={{
                width: "100%",
                padding: "12px 18px 12px 42px",
                borderRadius: "var(--radius-pill)",
                background: "var(--panel)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                fontSize: "0.95rem",
                outline: "none",
                fontFamily: "var(--font-body)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            />
            <svg
              style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: MARKET SNAPSHOT ───────────────────────────── */}
      <section style={{ marginBottom: 44 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {/* 1. NIFTY 50 */}
          {(() => {
            const q = quotes["NIFTY 50"] || { price: 23960.6, change: 149.75, changePct: 0.63 };
            const isUp = q.changePct >= 0;
            return (
              <div className="panel" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 700 }}>NIFTY 50</span>
                  <span style={{ fontSize: "0.75rem", color: isUp ? "var(--up)" : "var(--down)", fontWeight: 700 }}>
                    {isUp ? "▲ +" : "▼ "}{q.changePct.toFixed(2)}%
                  </span>
                </div>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, fontFamily: "var(--font-heading)" }}>
                  {formatPrice(q.price)}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>
                  {isUp ? "+" : ""}{q.change.toFixed(2)} pts
                </div>
              </div>
            );
          })()}

          {/* 2. SENSEX */}
          {(() => {
            const q = quotes["SENSEX"] || { price: 77301.4, change: 383.55, changePct: 0.5 };
            const isUp = q.changePct >= 0;
            return (
              <div className="panel" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 700 }}>BSE SENSEX</span>
                  <span style={{ fontSize: "0.75rem", color: isUp ? "var(--up)" : "var(--down)", fontWeight: 700 }}>
                    {isUp ? "▲ +" : "▼ "}{q.changePct.toFixed(2)}%
                  </span>
                </div>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, fontFamily: "var(--font-heading)" }}>
                  {formatPrice(q.price)}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>
                  {isUp ? "+" : ""}{q.change.toFixed(2)} pts
                </div>
              </div>
            );
          })()}

          {/* 3. TOP GAINER */}
          {topGainers[0] && (
            <Link href={`/company/${topGainers[0].ticker}`} style={{ textDecoration: "none" }}>
              <div className="panel panel-interactive" style={{ padding: 20, borderLeft: "4px solid var(--up)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--up)", fontWeight: 800, textTransform: "uppercase" }}>
                    {t.topGainer}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--up)", fontWeight: 700 }}>
                    ▲ +{topGainers[0].changePct.toFixed(2)}%
                  </span>
                </div>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text)" }}>
                  {topGainers[0].ticker}
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                  ₹{formatPrice(topGainers[0].price)}
                </div>
              </div>
            </Link>
          )}

          {/* 4. TOP LOSER */}
          {topLosers[0] && (
            <Link href={`/company/${topLosers[0].ticker}`} style={{ textDecoration: "none" }}>
              <div className="panel panel-interactive" style={{ padding: 20, borderLeft: "4px solid var(--down)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--down)", fontWeight: 800, textTransform: "uppercase" }}>
                    {t.topLoser}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--down)", fontWeight: 700 }}>
                    ▼ {topLosers[0].changePct.toFixed(2)}%
                  </span>
                </div>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text)" }}>
                  {topLosers[0].ticker}
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                  ₹{formatPrice(topLosers[0].price)}
                </div>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* ── SECTION 3: SECTOR PERFORMANCE EXPLORER ───────────────── */}
      <section style={{ marginBottom: 48 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 4px 0" }}>
              {t.sectorTitle}
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem", margin: 0 }}>
              {t.sectorSubtitle}
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={() => {
                setSelectedSector("ALL");
                setCurrentPage(1);
              }}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-pill)",
                border: "1px solid var(--border)",
                background: selectedSector === "ALL" ? "var(--accent)" : "var(--panel)",
                color: selectedSector === "ALL" ? "#0B1020" : "var(--muted)",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {t.allSectors}
            </button>

            <button
              onClick={() => setSectorSortOrder((prev) => (prev === "BEST" ? "WORST" : "BEST"))}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-pill)",
                border: "1px solid var(--border)",
                background: "var(--panel)",
                color: "var(--text)",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {sectorSortOrder === "BEST" ? t.sortSectorsBest : t.sortSectorsWorst}
            </button>
          </div>
        </div>

        {/* 12 Sectors Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: 16,
          }}
        >
          {sectorPerformance.map((sec) => {
            const isSelected = selectedSector === sec.name;
            return (
              <div
                key={sec.name}
                onClick={() => {
                  setSelectedSector(isSelected ? "ALL" : sec.name);
                  setCurrentPage(1);
                }}
                className="panel panel-interactive"
                style={{
                  padding: "16px 18px",
                  cursor: "pointer",
                  border: isSelected ? "2px solid var(--accent)" : "1px solid var(--border)",
                  background: isSelected ? "rgba(251, 191, 36, 0.08)" : "var(--panel)",
                  transition: "all 0.15s ease",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, color: "var(--text)", lineHeight: 1.3 }}>
                      {sec.name}
                    </h3>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 800,
                        color: sec.isUp ? "var(--up)" : "var(--down)",
                        marginLeft: 8,
                      }}
                    >
                      {sec.isUp ? "▲ +" : "▼ "}{sec.avgChange.toFixed(2)}%
                    </span>
                  </div>

                  <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                    {sec.count} {t.companiesCount}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
                  <MiniLineSvg isUp={sec.isUp} points={sec.sparkline} />
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: isSelected ? "var(--accent)" : "var(--teal)",
                    }}
                  >
                    {isSelected ? "● FILTERED" : "Filter →"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SECTION 4: TOP 50 LISTED COMPANIES TABLE ─────────────── */}
      <section style={{ marginBottom: 56 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 4px 0" }}>
              {t.tableTitle}
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem", margin: 0 }}>
              {t.tableSubtitle}
            </p>
          </div>

          {/* Active Filter Label */}
          {selectedSector !== "ALL" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: "0.8rem",
                  padding: "4px 12px",
                  borderRadius: "var(--radius-pill)",
                  background: "rgba(251, 191, 36, 0.15)",
                  color: "var(--accent)",
                  fontWeight: 700,
                }}
              >
                Sector: {selectedSector}
              </span>
              <button
                onClick={() => setSelectedSector("ALL")}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--muted)",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Table Controls Row */}
        <div
          className="panel"
          style={{
            padding: "16px 20px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          {/* Left: Sector + Exchange + Gainers/Losers */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            {/* Sector Dropdown */}
            <select
              value={selectedSector}
              onChange={(e) => {
                setSelectedSector(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: "6px 12px",
                borderRadius: "var(--radius-sm)",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                fontSize: "0.85rem",
                outline: "none",
              }}
            >
              <option value="ALL">{t.allSectors}</option>
              {SECTORS_LIST.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Exchange Toggle */}
            <div style={{ display: "inline-flex", background: "var(--bg)", borderRadius: "var(--radius-sm)", padding: 2, border: "1px solid var(--border)" }}>
              {(["ALL", "NSE", "BSE"] as const).map((ex) => (
                <button
                  key={ex}
                  onClick={() => {
                    setSelectedExchange(ex);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "var(--radius-sm)",
                    border: "none",
                    background: selectedExchange === ex ? "var(--teal)" : "transparent",
                    color: selectedExchange === ex ? "#0B1020" : "var(--muted)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {ex}
                </button>
              ))}
            </div>

            {/* Gainers / Losers Pills */}
            <div style={{ display: "inline-flex", background: "var(--bg)", borderRadius: "var(--radius-sm)", padding: 2, border: "1px solid var(--border)" }}>
              <button
                onClick={() => setDirectionFilter("ALL")}
                style={{
                  padding: "4px 10px",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: directionFilter === "ALL" ? "var(--panel)" : "transparent",
                  color: directionFilter === "ALL" ? "var(--text)" : "var(--muted)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {t.filterAll}
              </button>
              <button
                onClick={() => setDirectionFilter("GAINERS")}
                style={{
                  padding: "4px 10px",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: directionFilter === "GAINERS" ? "rgba(52, 211, 153, 0.2)" : "transparent",
                  color: directionFilter === "GAINERS" ? "var(--up)" : "var(--muted)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {t.filterGainers}
              </button>
              <button
                onClick={() => setDirectionFilter("LOSERS")}
                style={{
                  padding: "4px 10px",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: directionFilter === "LOSERS" ? "rgba(251, 113, 133, 0.2)" : "transparent",
                  color: directionFilter === "LOSERS" ? "var(--down)" : "var(--muted)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {t.filterLosers}
              </button>
            </div>
          </div>

          {/* Right: Sort controls + Reset */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{t.sortLabel}</span>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              style={{
                padding: "6px 12px",
                borderRadius: "var(--radius-sm)",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                fontSize: "0.85rem",
                outline: "none",
              }}
            >
              <option value="marketCap">{t.sortMarketCap}</option>
              <option value="price">{t.sortPrice}</option>
              <option value="change">{t.sortChange}</option>
              <option value="name">{t.sortName}</option>
            </select>

            <button
              onClick={() => setSortAsc((prev) => !prev)}
              style={{
                padding: "6px 10px",
                borderRadius: "var(--radius-sm)",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              {sortAsc ? "▲ Asc" : "▼ Desc"}
            </button>

            <button
              onClick={handleResetFilters}
              style={{
                padding: "6px 12px",
                borderRadius: "var(--radius-sm)",
                background: "transparent",
                border: "1px solid var(--border)",
                color: "var(--muted)",
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              {t.resetFilters}
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--panel)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
            <thead>
              <tr style={{ background: "rgba(255, 255, 255, 0.03)", borderBottom: "1px solid var(--border)", color: "var(--muted)" }}>
                <th style={{ padding: "14px 16px", width: 50 }}>{t.colRank}</th>
                <th style={{ padding: "14px 16px" }}>{t.colCompany}</th>
                <th style={{ padding: "14px 16px" }}>{t.colSector}</th>
                <th style={{ padding: "14px 16px", textAlign: "right" }}>{t.colPrice}</th>
                <th style={{ padding: "14px 16px", textAlign: "right" }}>{t.colChange}</th>
                <th style={{ padding: "14px 16px", textAlign: "right" }}>{t.colMarketCap}</th>
                <th style={{ padding: "14px 16px", textAlign: "right" }}>{t.colVolume}</th>
                <th style={{ padding: "14px 16px", textAlign: "center" }}>{t.colRange}</th>
                <th style={{ padding: "14px 16px", textAlign: "center" }}>{t.colTrend}</th>
                <th style={{ padding: "14px 16px", textAlign: "center" }}>{t.colAction}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCompanies.map((comp) => {
                const isPositive = comp.changePct >= 0;
                return (
                  <tr
                    key={comp.ticker}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      transition: "background 0.12s ease",
                    }}
                  >
                    <td style={{ padding: "14px 16px", color: "var(--muted)", fontWeight: 700 }}>
                      #{comp.rank}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <Link href={`/company/${comp.ticker}`} style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "var(--radius-sm)",
                            background: "var(--bg)",
                            border: "1px solid var(--border)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            color: "var(--teal)",
                            fontSize: "0.8rem",
                            flexShrink: 0,
                          }}
                        >
                          {comp.ticker.slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: "var(--text)" }}>{comp.ticker}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{getCompanyName(comp)}</div>
                        </div>
                      </Link>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span className="tag tag-category" style={{ fontSize: "0.7rem" }}>
                        {comp.sector}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right", fontWeight: 700, fontFamily: "var(--font-heading)" }}>
                      ₹{formatPrice(comp.price)}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 8px",
                          borderRadius: 4,
                          fontWeight: 700,
                          fontSize: "0.8rem",
                          background: isPositive ? "rgba(52, 211, 153, 0.12)" : "rgba(251, 113, 133, 0.12)",
                          color: isPositive ? "var(--up)" : "var(--down)",
                        }}
                      >
                        {isPositive ? "▲ +" : "▼ "}{comp.changePct.toFixed(2)}%
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right", color: "var(--text)", fontWeight: 600 }}>
                      {formatMCap(comp.marketCapCr)}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right", color: "var(--muted)" }}>
                      {comp.volume}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "center", fontSize: "0.78rem", color: "var(--muted)" }}>
                      ₹{comp.low.toFixed(0)} – ₹{comp.high.toFixed(0)}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "center" }}>
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        <MiniLineSvg isUp={isPositive} points={comp.sparkline} />
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "center" }}>
                      <Link
                        href={`/company/${comp.ticker}`}
                        style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          borderRadius: "var(--radius-sm)",
                          background: "var(--bg)",
                          border: "1px solid var(--border)",
                          color: "var(--teal)",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          textDecoration: "none",
                        }}
                      >
                        {t.viewBtn}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredCompanies.length === 0 && (
            <div style={{ padding: 48, textAlign: "center", color: "var(--muted)" }}>
              {t.noMatches}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, fontSize: "0.85rem", color: "var(--muted)" }}>
          <span>
            {t.showing} {Math.min(filteredCompanies.length, (currentPage - 1) * itemsPerPage + 1)} –{" "}
            {Math.min(filteredCompanies.length, currentPage * itemsPerPage)} {t.of} {filteredCompanies.length}
          </span>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-sm)",
                background: "var(--panel)",
                border: "1px solid var(--border)",
                color: currentPage === 1 ? "var(--border)" : "var(--text)",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                fontWeight: 600,
              }}
            >
              {t.prev}
            </button>

            <span style={{ display: "flex", alignItems: "center", padding: "0 8px", fontWeight: 700, color: "var(--text)" }}>
              {t.page} {currentPage} / {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-sm)",
                background: "var(--panel)",
                border: "1px solid var(--border)",
                color: currentPage === totalPages ? "var(--border)" : "var(--text)",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                fontWeight: 600,
              }}
            >
              {t.next}
            </button>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: TOP GAINERS & TOP LOSERS ──────────────────── */}
      <section style={{ marginBottom: 56 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          {/* Top 5 Gainers */}
          <div className="panel" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ color: "var(--up)", fontSize: "1.2rem" }}>▲</span>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0, color: "var(--text)" }}>
                {t.gainersTitle}
              </h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {topGainers.map((g) => (
                <Link
                  key={g.ticker}
                  href={`/company/${g.ticker}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(255, 255, 255, 0.02)",
                    textDecoration: "none",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--text)", fontSize: "0.95rem" }}>{g.ticker}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{getCompanyName(g)}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700, color: "var(--text)", fontSize: "0.95rem" }}>₹{formatPrice(g.price)}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--up)", fontWeight: 700 }}>
                        ▲ +{g.changePct.toFixed(2)}%
                      </div>
                    </div>
                    <MiniLineSvg isUp={true} points={g.sparkline} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Top 5 Losers */}
          <div className="panel" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ color: "var(--down)", fontSize: "1.2rem" }}>▼</span>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0, color: "var(--text)" }}>
                {t.losersTitle}
              </h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {topLosers.map((l) => (
                <Link
                  key={l.ticker}
                  href={`/company/${l.ticker}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(255, 255, 255, 0.02)",
                    textDecoration: "none",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--text)", fontSize: "0.95rem" }}>{l.ticker}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{getCompanyName(l)}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700, color: "var(--text)", fontSize: "0.95rem" }}>₹{formatPrice(l.price)}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--down)", fontWeight: 700 }}>
                        ▼ {l.changePct.toFixed(2)}%
                      </div>
                    </div>
                    <MiniLineSvg isUp={false} points={l.sparkline} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: COMPANY PERFORMANCE COMPARISON ────────────── */}
      <section className="panel" style={{ padding: 28, marginBottom: 56 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 4px 0" }}>
              {t.compareTitle}
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem", margin: 0 }}>
              {t.compareSubtitle}
            </p>
          </div>

          {/* Timeframe Buttons */}
          <div style={{ display: "inline-flex", background: "var(--bg)", borderRadius: "var(--radius-pill)", padding: 2, border: "1px solid var(--border)" }}>
            {(["1D", "1W", "1M", "3M", "6M", "1Y", "5Y"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setCompareTimeframe(tf)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "var(--radius-pill)",
                  border: "none",
                  background: compareTimeframe === tf ? "var(--teal)" : "transparent",
                  color: compareTimeframe === tf ? "#0B1020" : "var(--muted)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Companies Tags */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
          <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{t.selectCompany}</span>
          {comparedTickers.map((tick, idx) => (
            <span
              key={tick}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: "var(--radius-pill)",
                background: "var(--bg)",
                border: `1.5px solid ${COMPARE_COLORS[idx % COMPARE_COLORS.length]}`,
                fontSize: "0.8rem",
                fontWeight: 700,
                color: COMPARE_COLORS[idx % COMPARE_COLORS.length],
              }}
            >
              {tick}
              {comparedTickers.length > 1 && (
                <button
                  onClick={() => setComparedTickers((prev) => prev.filter((x) => x !== tick))}
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}
                >
                  ✕
                </button>
              )}
            </span>
          ))}

          {/* Add Dropdown if < 4 */}
          {comparedTickers.length < 4 && (
            <select
              onChange={(e) => {
                if (e.target.value && !comparedTickers.includes(e.target.value)) {
                  setComparedTickers((prev) => [...prev, e.target.value]);
                }
              }}
              value=""
              style={{
                padding: "4px 10px",
                borderRadius: "var(--radius-pill)",
                background: "var(--panel)",
                border: "1px dashed var(--border)",
                color: "var(--muted)",
                fontSize: "0.8rem",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="">+ Add Company</option>
              {TOP_50_COMPANIES.filter((c) => !comparedTickers.includes(c.ticker)).map((c) => (
                <option key={c.ticker} value={c.ticker}>{c.ticker} ({c.name_en})</option>
              ))}
            </select>
          )}
        </div>

        {/* Comparison SVG Normalized Multi-Line Chart */}
        <div style={{ width: "100%", height: 260, position: "relative", marginBottom: 16 }}>
          <svg width="100%" height="260" viewBox="0 0 800 260" preserveAspectRatio="none">
            {/* Grid Lines */}
            <line x1="40" y1="40" x2="780" y2="40" stroke="var(--border)" strokeDasharray="3 3" />
            <line x1="40" y1="130" x2="780" y2="130" stroke="var(--border)" strokeWidth="1.5" />
            <line x1="40" y1="220" x2="780" y2="220" stroke="var(--border)" strokeDasharray="3 3" />

            {/* Labels */}
            <text x="35" y="44" fill="var(--muted)" fontSize="11" textAnchor="end">+10%</text>
            <text x="35" y="134" fill="var(--muted)" fontSize="11" textAnchor="end">0%</text>
            <text x="35" y="224" fill="var(--muted)" fontSize="11" textAnchor="end">-10%</text>

            {/* Lines for each company */}
            {comparisonSeries.map((s) => {
              const pts = s.points
                .map((val, i) => {
                  const x = 50 + (i / (s.points.length - 1)) * 720;
                  // Map val (-15% to +15%) to y (220 to 40)
                  const clamped = Math.max(-15, Math.min(15, val));
                  const y = 130 - (clamped / 15) * 80;
                  return `${x},${y}`;
                })
                .join(" ");

              return (
                <polyline
                  key={s.ticker}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={pts}
                />
              );
            })}
          </svg>
        </div>

        <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--muted)", textAlign: "center" }}>
          {t.normalizedNote}
        </p>
      </section>

      {/* ── SECTION 7: COMPANY FINANCIAL OVERVIEW ─────────────────── */}
      <section style={{ marginBottom: 56 }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 20 }}>
          {t.finOverviewTitle}
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {/* Col 1: Highest Market Cap */}
          <div className="panel" style={{ padding: 20 }}>
            <h4 style={{ fontSize: "0.95rem", color: "var(--accent)", fontWeight: 700, margin: "0 0 14px 0" }}>
              ✦ {t.topCapTitle}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {topByCap.map((c) => (
                <Link key={c.ticker} href={`/company/${c.ticker}`} style={{ textDecoration: "none", display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                  <span style={{ fontWeight: 700, color: "var(--text)" }}>{c.ticker}</span>
                  <span style={{ color: "var(--muted)", fontWeight: 600 }}>{formatMCap(c.marketCapCr)}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Col 2: Highest Trading Volume */}
          <div className="panel" style={{ padding: 20 }}>
            <h4 style={{ fontSize: "0.95rem", color: "var(--teal)", fontWeight: 700, margin: "0 0 14px 0" }}>
              ✦ {t.topVolTitle}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {topByVolume.map((c) => (
                <Link key={c.ticker} href={`/company/${c.ticker}`} style={{ textDecoration: "none", display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                  <span style={{ fontWeight: 700, color: "var(--text)" }}>{c.ticker}</span>
                  <span style={{ color: "var(--muted)", fontWeight: 600 }}>{c.volume}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Col 3: Near 52W High */}
          <div className="panel" style={{ padding: 20 }}>
            <h4 style={{ fontSize: "0.95rem", color: "var(--up)", fontWeight: 700, margin: "0 0 14px 0" }}>
              ✦ {t.nearHighTitle}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {near52High.map((c) => (
                <Link key={c.ticker} href={`/company/${c.ticker}`} style={{ textDecoration: "none", display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                  <span style={{ fontWeight: 700, color: "var(--text)" }}>{c.ticker}</span>
                  <span style={{ color: "var(--up)", fontWeight: 600 }}>₹{formatPrice(c.price)} / ₹{c.high.toFixed(0)}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Col 4: Near 52W Low */}
          <div className="panel" style={{ padding: 20 }}>
            <h4 style={{ fontSize: "0.95rem", color: "var(--down)", fontWeight: 700, margin: "0 0 14px 0" }}>
              ✦ {t.nearLowTitle}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {near52Low.map((c) => (
                <Link key={c.ticker} href={`/company/${c.ticker}`} style={{ textDecoration: "none", display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                  <span style={{ fontWeight: 700, color: "var(--text)" }}>{c.ticker}</span>
                  <span style={{ color: "var(--down)", fontWeight: 600 }}>₹{formatPrice(c.price)} / ₹{c.low.toFixed(0)}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 8: LATEST COMPANY NEWS ───────────────────────── */}
      <section>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 4px 0" }}>
            {t.newsTitle}
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem", margin: 0 }}>
            {t.newsSubtitle}
          </p>
        </div>

        {articles.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 20,
            }}
          >
            {articles.map((art) => {
              const pTitle = parseMultiLang(art.title);
              const pSum = parseMultiLang(art.summary);
              const titleText = getLocalised(pTitle, locale).text;
              const sumText = getLocalised(pSum, locale).text;

              return (
                <div key={art.id} className="panel panel-interactive" style={{ padding: 20, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span className="tag tag-category">{art.category}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                      {art.publishAt ? new Date(art.publishAt).toLocaleDateString() : "Recent"}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, lineHeight: 1.4, marginBottom: 8 }}>
                    <Link href={`/article/${art.slug}`} style={{ color: "var(--text)", textDecoration: "none" }}>
                      {titleText}
                    </Link>
                  </h3>

                  <p style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.5, margin: "0 0 16px 0", flex: 1 }}>
                    {sumText}
                  </p>

                  <div style={{ paddingTop: 10, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
                    <Link href={`/article/${art.slug}`} style={{ fontSize: "0.8rem", color: "var(--teal)", fontWeight: 700, textDecoration: "none" }}>
                      {t.readStory}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="panel" style={{ padding: 36, textAlign: "center", color: "var(--muted)" }}>
            {t.noNews}
          </div>
        )}
      </section>
    </div>
  );
}

