import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const session = await auth();
    const isAdmin = session?.user?.role === "ADMIN";
    const isEditor = session?.user?.role === "EDITOR";
    const editorId = session?.user?.id;

    // Normal public visitors only see published editions
    const language = searchParams.get("language");
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const search = searchParams.get("search");

    const where: any = {
      deletedAt: null,
    };

    if (!isAdmin) {
      if (isEditor && searchParams.get("scope") === "my") {
        where.authorId = editorId;
      } else {
        where.isPublished = true;
      }
    }

    if (language && language !== "ALL") {
      where.language = language;
    }

    if (year) {
      const startYear = new Date(`${year}-01-01T00:00:00.000Z`);
      const endYear = new Date(`${parseInt(year) + 1}-01-01T00:00:00.000Z`);
      where.publishedAt = {
        gte: startYear,
        lt: endYear,
      };
    }

    const editions = await prisma.newspaperEdition.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(editions);
  } catch (error: any) {
    console.error("GET /api/newspapers error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch newspapers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) || "{}";
    const publishedAtStr = formData.get("publishedAt") as string;
    const language = (formData.get("language") as string) || "EN";
    const pageCount = parseInt((formData.get("pageCount") as string) || "1", 10);
    const isPublished = formData.get("isPublished") === "true";

    if (!title || !publishedAtStr) {
      return NextResponse.json({ error: "Title and publication date are required" }, { status: 400 });
    }

    let pdfUrl = formData.get("pdfUrl") as string;
    let fileSize = 0;

    if (file) {
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        return NextResponse.json({ error: "Only PDF files are permitted" }, { status: 400 });
      }

      fileSize = file.size;

      // Use Vercel Blob if token available, or base64 data URI fallback for local dev
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        const blob = await put(`newspapers/${Date.now()}-${file.name}`, file, {
          access: "public",
        });
        pdfUrl = blob.url;
      } else {
        // Fallback: convert file to Base64 data URI for safe serverless storage in DB
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        pdfUrl = `data:application/pdf;base64,${buffer.toString("base64")}`;
      }
    }

    if (!pdfUrl) {
      return NextResponse.json({ error: "A valid PDF file or PDF URL is required" }, { status: 400 });
    }

    const slug = `edition-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const edition = await prisma.newspaperEdition.create({
      data: {
        slug,
        title,
        description,
        publishedAt: new Date(publishedAtStr),
        language,
        pageCount: isNaN(pageCount) ? 1 : pageCount,
        pdfUrl,
        fileSize,
        isPublished,
        authorId: session.user.id,
      },
    });

    return NextResponse.json(edition, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/newspapers error:", error);
    return NextResponse.json({ error: error.message || "Failed to create newspaper edition" }, { status: 500 });
  }
}

