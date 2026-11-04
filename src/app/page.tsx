import { prisma } from "@/lib/prisma";
import { NewsletterSignup } from "@/components/reader/NewsletterSignup";
import { HomeHero } from "@/components/home/HomeHero";
import { TopStocksSection } from "@/components/markets/TopStocksSection";
import { BreakingSection } from "@/components/home/BreakingSection";
import { ArticlesGrid } from "@/components/home/ArticlesGrid";

export default async function HomePage() {
  const articles = await prisma.article.findMany({
    where: { status: "APPROVED" },
    orderBy: { publishAt: "desc" },
    take: 8,
  });

  const breakingNews = articles.find((a) => a.isBreaking) || articles[0];
  const regularArticles = articles.filter((a) => a.id !== breakingNews?.id);

  // Serialize dates for client components
  const serializedArticles = regularArticles.map((a) => ({
    ...a,
    publishAt: a.publishAt ? new Date(a.publishAt) : null,
    createdAt: new Date(a.createdAt),
    updatedAt: new Date(a.updatedAt),
  }));

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
      {/* 1. HERO SECTION */}
      <HomeHero />

      {/* 2. TOP STOCKS SECTION */}
      <TopStocksSection />

      {/* 3. BREAKING COVERAGE */}
      {breakingNews && <BreakingSection article={breakingNews} />}

      {/* 4. MAIN ARTICLES - now with language support */}
      <ArticlesGrid articles={serializedArticles} />

      {/* 5. NEWSLETTER SIGNUP */}
      <NewsletterSignup />
    </div>
  );
}
