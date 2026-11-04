import { prisma } from "@/lib/prisma";
import { CompaniesExplorerView } from "@/components/companies/CompaniesExplorerView";

export const metadata = {
  title: "Top 50 Indian Companies & Market Explorer | StockToday",
  description:
    "Explore India's leading listed companies, compare sector performance and discover market movements across NSE and BSE.",
};

export default async function CompaniesPage() {
  const articles = await prisma.article.findMany({
    where: {
      status: "APPROVED",
      category: { in: ["Earnings", "Markets", "IT", "Banking", "Auto", "Infrastructure"] },
    },
    take: 6,
    orderBy: { publishAt: "desc" },
  });

  const serializedArticles = articles.map((a) => ({
    id: a.id,
    slug: a.slug,
    category: a.category,
    sentiment: a.sentiment,
    isBreaking: a.isBreaking,
    publishAt: a.publishAt,
    title: a.title,
    summary: a.summary,
  }));

  return <CompaniesExplorerView articles={serializedArticles} />;
}
