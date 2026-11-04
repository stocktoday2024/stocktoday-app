export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL || "https://stocktoday.co.in";

  const robots = `User-agent: *
Allow: /
Disallow: /editorial/
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;

  return new Response(robots, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
