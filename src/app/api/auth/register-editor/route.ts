import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { recordAuditLog } from "@/lib/audit";
import { notifyAllAdmins } from "@/lib/notifications";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ valid: false, error: "Missing token" }, { status: 400 });
  }

  const invitation = await prisma.editorInvitation.findUnique({
    where: { token },
  });

  if (!invitation) {
    return NextResponse.json({ valid: false, error: "Invalid invitation token" }, { status: 404 });
  }

  if (invitation.usedAt) {
    return NextResponse.json({ valid: false, error: "This invitation link has already been used" }, { status: 410 });
  }

  if (invitation.revokedAt) {
    return NextResponse.json({ valid: false, error: "This invitation has been revoked by an administrator" }, { status: 410 });
  }

  if (new Date() > new Date(invitation.expiresAt)) {
    return NextResponse.json({ valid: false, error: "This invitation link has expired" }, { status: 410 });
  }

  return NextResponse.json({
    valid: true,
    email: invitation.email,
    name: invitation.name,
  });
}

export async function POST(req: Request) {
  try {
    const { token, name, password } = await req.json();

    if (!token || !password || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const invitation = await prisma.editorInvitation.findUnique({
      where: { token },
    });

    if (!invitation || invitation.usedAt || invitation.revokedAt || new Date() > new Date(invitation.expiresAt)) {
      return NextResponse.json({ error: "Invalid, expired, or already used invitation token" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists with this email address" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create user strictly with EDITOR role (Never allow ADMIN creation via registration)
    const newUser = await prisma.user.create({
      data: {
        email: invitation.email,
        name: name ? String(name).trim() : invitation.name || "Editor",
        passwordHash,
        role: "EDITOR",
        preferredLang: "EN",
      },
    });

    // Mark invitation as used
    await prisma.editorInvitation.update({
      where: { id: invitation.id },
      data: { usedAt: new Date() },
    });

    await recordAuditLog({
      userId: newUser.id,
      action: "EDITOR_REGISTER",
      meta: { email: newUser.email, role: "EDITOR" },
    });

    await notifyAllAdmins({
      type: "EDITOR_REGISTERED",
      payload: {
        editorName: newUser.name,
        editorEmail: newUser.email,
        registeredAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Editor account successfully created. You may now log in.",
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

