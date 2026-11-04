import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordAuditLog } from "@/lib/audit";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const article = await prisma.article.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const role = session.user.role as string;
    if (role === "EDITOR" && article.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const versions = await prisma.articleVersion.findMany({
      where: { articleId: id },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(versions);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const role = session.user.role as string;

  try {
    const { versionId } = await req.json();
    if (!versionId) {
      return NextResponse.json({ error: "Version ID required" }, { status: 400 });
    }

    const article = await prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    if (role === "EDITOR" && article.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const version = await prisma.articleVersion.findUnique({
      where: { id: versionId },
    });

    if (!version || version.articleId !== id) {
      return NextResponse.json({ error: "Invalid version" }, { status: 404 });
    }

    const snapshot = JSON.parse(version.data);

    const updated = await prisma.article.update({
      where: { id },
      data: {
        title: snapshot.title || article.title,
        summary: snapshot.summary || article.summary,
        body: snapshot.body || article.body,
        simpleExplain: snapshot.simpleExplain || article.simpleExplain,
        keyTakeaways: snapshot.keyTakeaways || article.keyTakeaways,
        category: snapshot.category || article.category,
        sentiment: snapshot.sentiment || article.sentiment,
        coverImageUrl: snapshot.coverImageUrl ?? article.coverImageUrl,
        sourceUrl: snapshot.sourceUrl ?? article.sourceUrl,
      },
    });

    // Create a new version indicating rollback
    await prisma.articleVersion.create({
      data: {
        articleId: id,
        authorId: session.user.id,
        data: JSON.stringify({
          ...snapshot,
          action: `RESTORED_FROM_${version.id.slice(0, 8)}`,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    await recordAuditLog({
      userId: session.user.id,
      action: "ARTICLE_VERSION_RESTORED",
      entityType: "ARTICLE",
      entityId: id,
      meta: { restoredFromVersionId: versionId },
    });

    return NextResponse.json({ success: true, article: updated });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

