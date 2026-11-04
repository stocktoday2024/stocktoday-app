import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL || "https://stocktoday.co.in";

  // Static routes
  const staticRoutes = [
    "",
    "/markets",
    "/companies",
    "/ipos",
    "/gujarat-pulse",
    "/glossary",
    "/editorial-policy",
    "/disclaimer",
  ];

  // Fetch approved published articles
  const articles = await prisma.article.findMany({
    where: { status: "APPROVED" },
    select: { slug: true, updatedAt: true },
  });

  // Fetch listed companies
  const companies = await prisma.company.findMany({
    select: { ticker: true },
  });

  const urls: string[] = [];

  // Static URLs
  for (const route of staticRoutes) {
    urls.push(`
  <url>
    <loc>${baseUrl}${route}</loc>
    <changefreq>daily</changefreq>
    <priority>${route === "" ? "1.0" : "0.8"}</priority>
  </url>`);
  }

  // Article URLs
  for (const art of articles) {
    urls.push(`
  <url>
    <loc>${baseUrl}/article/${art.slug}</loc>
    <lastmod>${art.updatedAt.toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
  }

  // Company Profile URLs
  for (const c of companies) {
    urls.push(`
  <url>
    <loc>${baseUrl}/company/${c.ticker}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
