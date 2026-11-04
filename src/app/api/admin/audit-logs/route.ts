import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role as string) !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const actionFilter = searchParams.get("action");
  const limit = parseInt(searchParams.get("limit") || "100", 10);
  const format = searchParams.get("format");

  try {
    const where: any = {};
    if (actionFilter && actionFilter !== "ALL") {
      where.action = actionFilter;
    }

    const logs = await prisma.auditLog.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    if (format === "csv") {
      const csvHeader = "ID,Timestamp,User,Email,Role,Action,EntityType,EntityId,Meta\n";
      const csvRows = logs.map((l) => {
        const safeMeta = (l.meta || "").replace(/"/g, '""');
        return `"${l.id}","${l.createdAt.toISOString()}","${l.user.name || ""}","${l.user.email}","${l.user.role}","${l.action}","${l.entityType || ""}","${l.entityId || ""}","${safeMeta}"`;
      });
      const csv = csvHeader + csvRows.join("\n");
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename=stocktoday-audit-logs-${Date.now()}.csv`,
        },
      });
    }

    return NextResponse.json(logs);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

