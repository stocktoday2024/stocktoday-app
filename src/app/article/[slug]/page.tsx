import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArticleDetailView } from "@/components/article/ArticleDetailView";

interface ArticleDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { slug } = await params;

  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      author: { select: { name: true, role: true } },
      approvedBy: { select: { name: true } },
    },
  });

  if (!article || article.status !== "APPROVED") {
    notFound();
  }

  const serializedArticle = {
    id: article.id,
    slug: article.slug,
    category: article.category,
    sentiment: article.sentiment,
    isBreaking: article.isBreaking,
    publishAt: article.publishAt,
    title: article.title,
    summary: article.summary,
    body: article.body,
    simpleExplain: article.simpleExplain,
    keyTakeaways: article.keyTakeaways,
    authorName: article.author?.name || undefined,
    approvedByName: article.approvedBy?.name || undefined,
  };

  return <ArticleDetailView article={serializedArticle} />;
}
