import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "12", 10)));
    const categoryParam = searchParams.get("category");

    const skip = (page - 1) * limit;

    const where: any = {
      status: "APPROVED",
      deletedAt: null,
    };

    if (categoryParam) {
      const cats = categoryParam.split(",").map((c) => c.trim());
      where.category = { in: cats };
    } else {
      where.category = { in: ["Markets", "Banking", "IT", "Auto", "Commodities", "IPO", "Economy", "Gujarat Pulse"] };
    }

    const [articles, totalCount] = await Promise.all([
      prisma.article.findMany({
        where,
        take: limit,
        skip,
        orderBy: { publishAt: "desc" },
        select: {
          id: true,
          slug: true,
          category: true,
          sentiment: true,
          isBreaking: true,
          publishAt: true,
          title: true,
          summary: true,
        },
      }),
      prisma.article.count({ where }),
    ]);

    const hasMore = skip + articles.length < totalCount;

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore,
      },
    });
  } catch (error: any) {
    console.error("GET /api/public-articles error:", error);
    return NextResponse.json({ error: error.message || "Failed to load articles" }, { status: 500 });
  }
}
