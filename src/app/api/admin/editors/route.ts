import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordAuditLog } from "@/lib/audit";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// GET: list editors & users
export async function GET() {
  const session = await auth();
  if (!session?.user?.id || (session.user.role as string) !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const editors = await prisma.user.findMany({
      where: { role: { in: ["EDITOR", "ADMIN"] } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        disabledAt: true,
        createdAt: true,
        _count: {
          select: {
            articles: true,
          },
        },
      },
    });

    return NextResponse.json(editors);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// PATCH: activate / deactivate / reset password
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role as string) !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId, action, newPassword } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Protect master admin from disabling itself
    if (userId === session.user.id && (action === "deactivate" || action === "delete")) {
      return NextResponse.json({ error: "Cannot disable your own administrator account" }, { status: 400 });
    }

    if (action === "toggle_status") {
      const targetUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          disabledAt: targetUser.disabledAt ? null : new Date(),
        },
      });

      await recordAuditLog({
        userId: session.user.id,
        action: updated.disabledAt ? "EDITOR_DEACTIVATED" : "EDITOR_ACTIVATED",
        entityType: "USER",
        entityId: userId,
        meta: { targetEmail: targetUser.email },
      });

      return NextResponse.json({ success: true, user: updated });
    }

    if (action === "reset_password") {
      if (!newPassword || newPassword.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 chars" }, { status: 400 });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      });

      await recordAuditLog({
        userId: session.user.id,
        action: "EDITOR_PASSWORD_RESET",
        entityType: "USER",
        entityId: userId,
      });

      return NextResponse.json({ success: true, message: "Password reset successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

