import { prisma } from "@/lib/prisma";
import { GlossaryView } from "@/components/reader/GlossaryView";

export default async function GlossaryPage() {
  const terms = await prisma.glossaryTerm.findMany({
    orderBy: { slug: "asc" },
  });

  return <GlossaryView terms={terms} />;
}
