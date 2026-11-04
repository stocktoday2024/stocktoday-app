import { prisma } from "@/lib/prisma";
import { MarketsView } from "@/components/markets/MarketsView";

export default async function MarketsPage() {
  const marketArticles = await prisma.article.findMany({
    where: {
      status: "APPROVED",
      category: { in: ["Markets", "Banking", "IT", "Auto", "Commodities"] },
    },
    take: 8,
    orderBy: { publishAt: "desc" },
  });

  const serializedArticles = marketArticles.map((a) => ({
    id: a.id,
    slug: a.slug,
    category: a.category,
    sentiment: a.sentiment,
    isBreaking: a.isBreaking,
    publishAt: a.publishAt,
    title: a.title,
    summary: a.summary,
  }));

  return <MarketsView articles={serializedArticles} />;
}
