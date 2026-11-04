import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordAuditLog } from "@/lib/audit";
import { notifyAllAdmins, createNotification } from "@/lib/notifications";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role as string;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const authorId = searchParams.get("authorId");
  const includeDeleted = searchParams.get("includeDeleted") === "true";
  const search = searchParams.get("search");

  try {
    const where: any = {};

    // Editors can only view their own drafts or articles unless admin
    if (role === "EDITOR") {
      where.authorId = session.user.id;
      if (!includeDeleted) {
        where.deletedAt = null;
      }
    } else if (role === "ADMIN") {
      if (authorId) where.authorId = authorId;
      if (!includeDeleted) {
        where.deletedAt = null;
      }
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    const articles = await prisma.article.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        author: { select: { id: true, name: true, email: true, role: true } },
        approvedBy: { select: { id: true, name: true, email: true } },
        _count: { select: { versions: true } },
      },
    });

    let filtered = articles;
    if (search) {
      const q = search.toLowerCase();
      filtered = articles.filter((a) => {
        try {
          const t = JSON.parse(a.title || "{}");
          return (
            (t.en && t.en.toLowerCase().includes(q)) ||
            (t.gu && t.gu.toLowerCase().includes(q)) ||
            (t.hi && t.hi.toLowerCase().includes(q)) ||
            a.slug.toLowerCase().includes(q) ||
            a.category.toLowerCase().includes(q)
          );
        } catch {
          return a.slug.toLowerCase().includes(q) || a.title.toLowerCase().includes(q);
        }
      });
    }

    return NextResponse.json(filtered);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role as string;
  if (role !== "ADMIN" && role !== "EDITOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await req.json();

    // Auto-generate or sanitize slug
    let baseSlug = data.slug;
    if (!baseSlug) {
      try {
        const titleObj = typeof data.title === "string" ? JSON.parse(data.title) : data.title;
        baseSlug = (titleObj.en || "story")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");
      } catch {
        baseSlug = "story-" + Date.now();
      }
    }
    const finalSlug = `${baseSlug}-${Date.now().toString().slice(-6)}`;

    const titleStr = typeof data.title === "object" ? JSON.stringify(data.title) : data.title || "{}";
    const summaryStr = typeof data.summary === "object" ? JSON.stringify(data.summary) : data.summary || "{}";
    const bodyStr = typeof data.body === "object" ? JSON.stringify(data.body) : data.body || "{}";
    const simpleExplainStr = typeof data.simpleExplain === "object" ? JSON.stringify(data.simpleExplain) : data.simpleExplain || "{}";
    const keyTakeawaysStr = typeof data.keyTakeaways === "object" ? JSON.stringify(data.keyTakeaways) : data.keyTakeaways || "{}";

    // Independent publishing: Editors can publish directly (status: APPROVED)
    const isPublishing = data.status === "APPROVED";

    const article = await prisma.article.create({
      data: {
        slug: finalSlug,
        category: data.category || "Markets",
        sentiment: data.sentiment || "NEUTRAL",
        isBreaking: Boolean(data.isBreaking),
        isFeatured: Boolean(data.isFeatured),
        coverImageUrl: data.coverImageUrl || null,
        sourceUrl: data.sourceUrl || null,
        status: data.status || "DRAFT",
        title: titleStr,
        summary: summaryStr,
        body: bodyStr,
        simpleExplain: simpleExplainStr,
        keyTakeaways: keyTakeawaysStr,
        authorId: session.user.id,
        publishAt: isPublishing ? new Date() : null,
        approvedById: isPublishing ? session.user.id : null,
      },
    });

    // Save initial version snapshot
    await prisma.articleVersion.create({
      data: {
        articleId: article.id,
        authorId: session.user.id,
        data: JSON.stringify({
          title: titleStr,
          summary: summaryStr,
          body: bodyStr,
          simpleExplain: simpleExplainStr,
          keyTakeaways: keyTakeawaysStr,
          category: article.category,
          sentiment: article.sentiment,
          isBreaking: article.isBreaking,
          coverImageUrl: article.coverImageUrl,
          sourceUrl: article.sourceUrl,
          status: article.status,
          action: isPublishing ? "PUBLISHED_INITIAL" : "DRAFT_CREATED",
          timestamp: new Date().toISOString(),
        }),
      },
    });

    // Record audit log
    await recordAuditLog({
      userId: session.user.id,
      action: isPublishing ? "ARTICLE_PUBLISHED" : "ARTICLE_CREATED",
      entityType: "ARTICLE",
      entityId: article.id,
      meta: { title: titleStr, status: article.status, role },
    });

    // Notify admins if published by editor
    if (isPublishing && role === "EDITOR") {
      await notifyAllAdmins({
        type: "ARTICLE_PUBLISHED",
        payload: {
          articleId: article.id,
          slug: article.slug,
          authorName: session.user.name || session.user.email,
        },
      });
    }

    return NextResponse.json(article);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role as string;
  if (role !== "ADMIN" && role !== "EDITOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await req.json();
    if (!data.id) {
      return NextResponse.json({ error: "Missing article ID" }, { status: 400 });
    }

    const existing = await prisma.article.findUnique({
      where: { id: data.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Permission check: Editors can only modify their own articles unless ADMIN
    if (role === "EDITOR" && existing.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: You do not own this article" }, { status: 403 });
    }

    const titleStr = data.title !== undefined ? (typeof data.title === "object" ? JSON.stringify(data.title) : data.title) : existing.title;
    const summaryStr = data.summary !== undefined ? (typeof data.summary === "object" ? JSON.stringify(data.summary) : data.summary) : existing.summary;
    const bodyStr = data.body !== undefined ? (typeof data.body === "object" ? JSON.stringify(data.body) : data.body) : existing.body;
    const simpleExplainStr = data.simpleExplain !== undefined ? (typeof data.simpleExplain === "object" ? JSON.stringify(data.simpleExplain) : data.simpleExplain) : existing.simpleExplain;
    const keyTakeawaysStr = data.keyTakeaways !== undefined ? (typeof data.keyTakeaways === "object" ? JSON.stringify(data.keyTakeaways) : data.keyTakeaways) : existing.keyTakeaways;

    const isNowPublishing = data.status === "APPROVED" && existing.status !== "APPROVED";
    const isUnpublishing = data.status === "DRAFT" && existing.status === "APPROVED";

    const updatePayload: any = {
      category: data.category !== undefined ? data.category : existing.category,
      sentiment: data.sentiment !== undefined ? data.sentiment : existing.sentiment,
      isBreaking: data.isBreaking !== undefined ? Boolean(data.isBreaking) : existing.isBreaking,
      isFeatured: data.isFeatured !== undefined ? Boolean(data.isFeatured) : existing.isFeatured,
      coverImageUrl: data.coverImageUrl !== undefined ? data.coverImageUrl : existing.coverImageUrl,
      sourceUrl: data.sourceUrl !== undefined ? data.sourceUrl : existing.sourceUrl,
      title: titleStr,
      summary: summaryStr,
      body: bodyStr,
      simpleExplain: simpleExplainStr,
      keyTakeaways: keyTakeawaysStr,
    };

    if (data.status) {
      updatePayload.status = data.status;
      if (isNowPublishing) {
        updatePayload.publishAt = new Date();
        updatePayload.approvedById = session.user.id;
      }
    }

    // Restore from deleted if explicitly requested by Admin
    if (data.restore && role === "ADMIN") {
      updatePayload.deletedAt = null;
    }

    const updated = await prisma.article.update({
      where: { id: data.id },
      data: updatePayload,
    });

    // Save version snapshot
    await prisma.articleVersion.create({
      data: {
        articleId: updated.id,
        authorId: session.user.id,
        data: JSON.stringify({
          title: titleStr,
          summary: summaryStr,
          body: bodyStr,
          simpleExplain: simpleExplainStr,
          keyTakeaways: keyTakeawaysStr,
          category: updated.category,
          sentiment: updated.sentiment,
          isBreaking: updated.isBreaking,
          coverImageUrl: updated.coverImageUrl,
          sourceUrl: updated.sourceUrl,
          status: updated.status,
          action: isNowPublishing ? "PUBLISHED" : isUnpublishing ? "UNPUBLISHED" : "EDITED",
          timestamp: new Date().toISOString(),
        }),
      },
    });

    // Audit log
    let auditAction: "ARTICLE_UPDATED" | "ARTICLE_PUBLISHED" | "ARTICLE_UNPUBLISHED" | "ARTICLE_RESTORED" = "ARTICLE_UPDATED";
    if (isNowPublishing) auditAction = "ARTICLE_PUBLISHED";
    if (isUnpublishing) auditAction = "ARTICLE_UNPUBLISHED";
    if (data.restore) auditAction = "ARTICLE_RESTORED";

    await recordAuditLog({
      userId: session.user.id,
      action: auditAction,
      entityType: "ARTICLE",
      entityId: updated.id,
      meta: { status: updated.status, role, isNowPublishing, isUnpublishing },
    });

    // In-app notifications
    if (isNowPublishing && role === "EDITOR") {
      await notifyAllAdmins({
        type: "ARTICLE_PUBLISHED",
        payload: {
          articleId: updated.id,
          slug: updated.slug,
          authorName: session.user.name || session.user.email,
        },
      });
    } else if (isUnpublishing && role === "EDITOR") {
      await notifyAllAdmins({
        type: "ARTICLE_UNPUBLISHED",
        payload: {
          articleId: updated.id,
          slug: updated.slug,
          authorName: session.user.name || session.user.email,
        },
      });
    }

    return NextResponse.json(updated);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role as string;
  if (role !== "ADMIN" && role !== "EDITOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const emergency = searchParams.get("emergency") === "true";
    const reason = searchParams.get("reason") || "";
    const permanent = searchParams.get("permanent") === "true";

    if (!id) {
      return NextResponse.json({ error: "Missing article ID" }, { status: 400 });
    }

    const article = await prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Permission check
    if (role === "EDITOR" && article.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: You do not own this article" }, { status: 403 });
    }

    // Emergency removal of published article
    if (emergency) {
      if (!reason || reason.trim().length < 5) {
        return NextResponse.json({ error: "Mandatory removal reason required (min 5 chars)" }, { status: 400 });
      }

      const updated = await prisma.article.update({
        where: { id },
        data: {
          status: "REJECTED", // or withdrawn
          deletedAt: new Date(),
        },
      });

      await recordAuditLog({
        userId: session.user.id,
        action: "ARTICLE_EMERGENCY_REMOVED",
        entityType: "ARTICLE",
        entityId: article.id,
        meta: { reason, previousStatus: article.status, authorId: article.authorId },
      });

      // Always notify admins on emergency removal
      await notifyAllAdmins({
        type: "ARTICLE_EMERGENCY_REMOVED",
        payload: {
          articleId: article.id,
          slug: article.slug,
          reason,
          removedBy: session.user.name || session.user.email,
        },
      });

      return NextResponse.json({ success: true, message: "Article emergency removed", article: updated });
    }

    // Permanent hard delete (Admin only)
    if (permanent && role === "ADMIN") {
      await prisma.articleVersion.deleteMany({ where: { articleId: id } });
      await prisma.articleCompany.deleteMany({ where: { articleId: id } });
      await prisma.reviewComment.deleteMany({ where: { articleId: id } });
      await prisma.bookmark.deleteMany({ where: { articleId: id } });
      await prisma.article.delete({ where: { id } });

      await recordAuditLog({
        userId: session.user.id,
        action: "ARTICLE_PERMANENTLY_DELETED",
        entityType: "ARTICLE",
        entityId: id,
        meta: { title: article.title },
      });

      return NextResponse.json({ success: true, message: "Article permanently deleted" });
    }

    // Soft delete
    const softDeleted = await prisma.article.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: article.status === "APPROVED" ? "DRAFT" : article.status,
      },
    });

    await recordAuditLog({
      userId: session.user.id,
      action: "ARTICLE_SOFT_DELETED",
      entityType: "ARTICLE",
      entityId: article.id,
      meta: { previousStatus: article.status },
    });

    return NextResponse.json({ success: true, message: "Article moved to trash", article: softDeleted });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
