import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { NewspaperReader } from "@/components/newspaper/NewspaperReader";

export default async function NewspaperReaderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const edition = await prisma.newspaperEdition.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
      deletedAt: null,
    },
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

  if (!edition) {
    notFound();
  }

  // Increment view count asynchronously
  await prisma.newspaperEdition.update({
    where: { id: edition.id },
    data: { views: { increment: 1 } },
  }).catch(() => {});

  const serialized = {
    ...edition,
    publishedAt: edition.publishedAt.toISOString(),
    createdAt: edition.createdAt.toISOString(),
    updatedAt: edition.updatedAt.toISOString(),
    deletedAt: edition.deletedAt ? edition.deletedAt.toISOString() : null,
  };

  return <NewspaperReader edition={serialized} />;
}

