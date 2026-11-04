import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseMultiLang } from "@/types";
import { redirect, notFound } from "next/navigation";
import { ArticleEditor } from "@/components/editorial/ArticleEditor";

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/editorial/login");
  }

  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
  });

  if (!article) {
    notFound();
  }

  // @ts-expect-error custom property from jwt session
  const userRole = session.user.role || "EDITOR";

  // Permission check: Editors can only edit their own stories unless ADMIN
  if (userRole === "EDITOR" && article.authorId !== session.user.id) {
    redirect("/editorial");
  }

  const initialData = {
    id: article.id,
    slug: article.slug,
    category: article.category,
    sentiment: article.sentiment,
    isBreaking: article.isBreaking,
    isFeatured: article.isFeatured,
    coverImageUrl: article.coverImageUrl,
    sourceUrl: article.sourceUrl,
    status: article.status,
    title: parseMultiLang(article.title),
    summary: parseMultiLang(article.summary),
    body: parseMultiLang(article.body),
    simpleExplain: parseMultiLang(article.simpleExplain),
  };

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 64, maxWidth: 1040 }}>
      <ArticleEditor initialData={initialData} userRole={userRole} />
    </div>
  );
}
