import { prisma } from "@/lib/prisma";
import { GujaratPulseView } from "@/components/markets/GujaratPulseView";

export default async function GujaratPulsePage() {
  const articles = await prisma.article.findMany({
    where: {
      status: "APPROVED",
      category: { in: ["Gujarat Pulse", "Markets", "Auto", "Energy"] },
    },
    take: 8,
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

  return <GujaratPulseView articles={serializedArticles} />;
}
