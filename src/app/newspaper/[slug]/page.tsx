import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { NewspaperReader } from "@/components/newspaper/NewspaperReader";

export default async function NewspaperReaderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  const currentUserId = session?.user?.id;

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

  // Access control: drafts or unpublished editions can only be viewed by their author or an Admin
  if (!edition.isPublished && !isAdmin && edition.authorId !== currentUserId) {
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

