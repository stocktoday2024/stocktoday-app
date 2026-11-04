import { prisma } from "@/lib/prisma";
import { IPOsView } from "@/components/markets/IPOsView";

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

const VALID_IPOS: IPOCardData[] = [
  {
    company: "Swiggy Limited",
    issueSize: "₹11,327 Cr",
    priceBand: "₹371 - ₹390",
    dates: "Nov 06 - Nov 08, 2026",
    status: "Upcoming",
    gmp: "+₹12 (3.1%)",
    gainEst: "+3.08%",
    subscription: "Bidding Opens Soon",
    exchange: "NSE & BSE Mainboard",
    closeDate: "2026-11-08",
  },
  {
    company: "NTPC Green Energy Ltd",
    issueSize: "₹10,000 Cr",
    priceBand: "₹102 - ₹108",
    dates: "Nov 19 - Nov 22, 2026",
    status: "Upcoming",
    gmp: "+₹25 (23.1%)",
    gainEst: "+23.15%",
    subscription: "Awaiting",
    exchange: "NSE & BSE Mainboard",
    closeDate: "2026-11-22",
  },
  {
    company: "Gujarat CleanTech SME",
    issueSize: "₹48.5 Cr",
    priceBand: "₹115 - ₹122",
    dates: "Nov 12 - Nov 15, 2026",
    status: "Upcoming",
    gmp: "+₹38 (31.1%)",
    gainEst: "+31.15%",
    subscription: "Awaiting",
    exchange: "BSE SME",
    closeDate: "2026-11-15",
  },
  {
    company: "Afcons Infrastructure",
    issueSize: "₹5,430 Cr",
    priceBand: "₹440 - ₹463",
    dates: "Closed Oct 29, 2026",
    status: "Recently Closed",
    gmp: "+₹8 (1.7%)",
    gainEst: "+1.73%",
    subscription: "2.63x",
    exchange: "NSE & BSE Mainboard",
    closeDate: "2026-10-29",
  },
  {
    company: "Godavari Biorefineries",
    issueSize: "₹555 Cr",
    priceBand: "₹334 - ₹352",
    dates: "Closed Oct 25, 2026",
    status: "Recently Closed",
    gmp: "-₹4 (-1.1%)",
    gainEst: "-1.14%",
    subscription: "1.83x",
    exchange: "NSE & BSE Mainboard",
    closeDate: "2026-10-25",
  },
];

export default async function IPOsPage() {
  const events = await prisma.event.findMany({
    orderBy: { date: "asc" },
  });

  const ipoArticles = await prisma.article.findMany({
    where: {
      status: "APPROVED",
      category: "IPO",
    },
    take: 6,
    orderBy: { publishAt: "desc" },
  });

  const serializedArticles = ipoArticles.map((a) => ({
    id: a.id,
    slug: a.slug,
    category: a.category,
    sentiment: a.sentiment,
    isBreaking: a.isBreaking,
    publishAt: a.publishAt,
    title: a.title,
    summary: a.summary,
  }));

  return <IPOsView ipos={VALID_IPOS} events={events} articles={serializedArticles} />;
}
