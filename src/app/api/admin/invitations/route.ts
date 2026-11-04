import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordAuditLog } from "@/lib/audit";
import { notifyAllAdmins } from "@/lib/notifications";
import crypto from "crypto";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  // @ts-expect-error role check
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin access only" }, { status: 403 });
  }

  try {
    const invitations = await prisma.editorInvitation.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        invitedBy: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json(invitations);
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  // @ts-expect-error role check
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin access only" }, { status: 403 });
  }

  try {
    const { email, name } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const cleanEmail = String(email).toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: "A user with this email address already exists" }, { status: 400 });
    }

    // Generate single-use secure cryptographic token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days expiration

    const invitation = await prisma.editorInvitation.create({
      data: {
        email: cleanEmail,
        name: name ? String(name).trim() : null,
        token,
        invitedById: session.user.id,
        expiresAt,
      },
    });

    await recordAuditLog({
      userId: session.user.id,
      action: "EDITOR_INVITE",
      meta: { invitedEmail: cleanEmail, invitationId: invitation.id },
    });

    await notifyAllAdmins({
      type: "INVITATION_SENT",
      payload: {
        invitedEmail: cleanEmail,
        invitedBy: session.user.name || session.user.email,
        date: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      invitation,
      invitationLink: `/editorial/register?token=${token}`,
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  // @ts-expect-error role check
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin access only" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Invitation ID required" }, { status: 400 });
    }

    const updated = await prisma.editorInvitation.update({
      where: { id },
      data: { revokedAt: new Date() },
    });

    await recordAuditLog({
      userId: session.user.id,
      action: "EDITOR_INVITE_REVOKE",
      meta: { invitationId: id, email: updated.email },
    });

    return NextResponse.json({ success: true, updated });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

