import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CompanyDetailClient } from "@/components/markets/CompanyDetailClient";

interface CompanyDetailPageProps {
  params: Promise<{ ticker: string }>;
}

export default async function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  const { ticker } = await params;
  const decodedTicker = decodeURIComponent(ticker).toUpperCase();

  const company = await prisma.company.findUnique({
    where: { ticker: decodedTicker },
  });

  if (!company) {
    notFound();
  }

  const relatedArticles = await prisma.article.findMany({
    where: {
      status: "APPROVED",
      category: { in: [company.sector, "Markets", "Earnings", "Gujarat Pulse"] },
    },
    take: 6,
    orderBy: { publishAt: "desc" },
  });

  const serializedArticles = relatedArticles.map((a) => ({
    id: a.id,
    slug: a.slug,
    category: a.category,
    sentiment: a.sentiment,
    isBreaking: a.isBreaking,
    publishAt: a.publishAt,
    title: a.title,
    summary: a.summary,
  }));

  return <CompanyDetailClient company={company} articles={serializedArticles} />;
}
