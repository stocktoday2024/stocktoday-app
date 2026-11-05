import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const isAdmin = session?.user?.role === "ADMIN";
    const currentUserId = session?.user?.id;

    const edition = await prisma.newspaperEdition.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        deletedAt: null,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    if (!edition) {
      return NextResponse.json({ error: "Edition not found" }, { status: 404 });
    }

    // Access control: drafts or unpublished editions can only be accessed by their author or an Admin
    if (!edition.isPublished && !isAdmin && edition.authorId !== currentUserId) {
      return NextResponse.json({ error: "Edition not found or access restricted" }, { status: 404 });
    }

    return NextResponse.json(edition);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.newspaperEdition.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Edition not found" }, { status: 404 });
    }

    const isAdmin = session.user.role === "ADMIN";
    const isOwner = existing.authorId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Forbidden: You can only edit your own editions" }, { status: 403 });
    }

    const formData = await req.formData();
    const updateData: any = {};

    const title = formData.get("title") as string | null;
    const description = formData.get("description") as string | null;
    const publishedAtStr = formData.get("publishedAt") as string | null;
    const language = formData.get("language") as string | null;
    const pageCountStr = formData.get("pageCount") as string | null;
    const isPublishedStr = formData.get("isPublished") as string | null;
    const file = formData.get("file") as File | null;

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (publishedAtStr) updateData.publishedAt = new Date(publishedAtStr);
    if (language) updateData.language = language;
    if (pageCountStr) updateData.pageCount = parseInt(pageCountStr, 10);
    if (isPublishedStr !== null) updateData.isPublished = isPublishedStr === "true";

    if (file) {
      // 1. Enforce size limit (max 25MB)
      const MAX_FILE_SIZE = 25 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "File exceeds maximum permitted size of 25MB" }, { status: 400 });
      }

      // 2. MIME type & extension validation
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        return NextResponse.json({ error: "Only PDF files allowed" }, { status: 400 });
      }

      // 3. Magic Number Validation: check %PDF- signature (0x25, 0x50, 0x44, 0x46)
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const headerStr = buffer.slice(0, 5).toString("ascii");
      if (!headerStr.startsWith("%PDF-")) {
        return NextResponse.json({ error: "Invalid PDF file signature. Uploaded file is not a valid PDF." }, { status: 400 });
      }

      updateData.fileSize = file.size;

      // 4. Safe randomized filename preventing path traversal
      const safeRandomName = `edition_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.pdf`;

      if (process.env.BLOB_READ_WRITE_TOKEN) {
        const blob = await put(`newspapers/${safeRandomName}`, buffer, {
          access: "public",
          contentType: "application/pdf",
        });
        updateData.pdfUrl = blob.url;
      } else {
        updateData.pdfUrl = `data:application/pdf;base64,${buffer.toString("base64")}`;
      }
    }

    const updated = await prisma.newspaperEdition.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.newspaperEdition.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Edition not found" }, { status: 404 });
    }

    const isAdmin = session.user.role === "ADMIN";
    const isOwner = existing.authorId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Soft delete
    const deleted = await prisma.newspaperEdition.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true, deleted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

