import { prisma } from "@/lib/prisma";
import { MarketsView } from "@/components/markets/MarketsView";

const INITIAL_LIMIT = 12;

export default async function MarketsPage() {
  const [marketArticles, totalCount] = await Promise.all([
    prisma.article.findMany({
      where: {
        status: "APPROVED",
        deletedAt: null,
        category: { in: ["Markets", "Banking", "IT", "Auto", "Commodities", "IPO", "Economy", "Gujarat Pulse"] },
      },
      take: INITIAL_LIMIT,
      orderBy: { publishAt: "desc" },
    }),
    prisma.article.count({
      where: {
        status: "APPROVED",
        deletedAt: null,
        category: { in: ["Markets", "Banking", "IT", "Auto", "Commodities", "IPO", "Economy", "Gujarat Pulse"] },
      },
    }),
  ]);

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

  const initialHasMore = totalCount > INITIAL_LIMIT;

  return (
    <MarketsView
      initialArticles={serializedArticles}
      initialTotalCount={totalCount}
      initialHasMore={initialHasMore}
      pageSize={INITIAL_LIMIT}
    />
  );
}
