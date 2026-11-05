import { prisma } from "@/lib/prisma";
import { NewspaperView } from "@/components/newspaper/NewspaperView";

export default async function NewspaperPage() {
  const editions = await prisma.newspaperEdition.findMany({
    where: {
      isPublished: true,
      deletedAt: null,
    },
    orderBy: { publishedAt: "desc" },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Serialize dates for Client Component
  const serialized = editions.map((ed) => ({
    ...ed,
    publishedAt: ed.publishedAt.toISOString(),
    createdAt: ed.createdAt.toISOString(),
    updatedAt: ed.updatedAt.toISOString(),
    deletedAt: ed.deletedAt ? ed.deletedAt.toISOString() : null,
  }));

  return <NewspaperView initialEditions={serialized} />;
}

