import { prisma } from "@/lib/prisma";
import { parseMultiLang } from "@/types";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";

  if (!q) {
    return NextResponse.json([]);
  }

  // Find matching companies
  const companies = await prisma.company.findMany({
    where: {
      OR: [
        { ticker: { contains: q } },
        { name_en: { contains: q } },
        { name_gu: { contains: q } },
        { name_hi: { contains: q } },
        { sector: { contains: q } },
      ],
    },
    take: 5,
  });

  // Find matching articles
  const articles = await prisma.article.findMany({
    where: {
      status: "APPROVED",
      OR: [
        { title: { contains: q } },
        { summary: { contains: q } },
        { category: { contains: q } },
      ],
    },
    take: 5,
  });

  const results = [
    ...companies.map((c) => ({
      type: "company",
      title: `${c.ticker} — ${c.name_en}`,
      subtitle: `${c.exchange} · ${c.sector} Sector`,
      url: `/company/${c.ticker}`,
      badge: "COMPANY",
    })),
    ...articles.map((a) => {
      const title = parseMultiLang(a.title);
      return {
        type: "article",
        title: title.en,
        subtitle: `${a.category} · ${a.publishAt ? new Date(a.publishAt).toLocaleDateString() : "Recent"}`,
        url: `/article/${a.slug}`,
        badge: a.category.toUpperCase(),
      };
    }),
  ];

  return NextResponse.json(results);
}
