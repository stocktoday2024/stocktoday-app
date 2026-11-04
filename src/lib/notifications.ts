import { prisma } from "@/lib/prisma";

export async function createNotification({
  userId,
  type,
  payload,
}: {
  userId: string;
  type: string;
  payload: Record<string, unknown>;
}) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        payload: JSON.stringify(payload),
      },
    });
  } catch (err) {
    console.error("Failed to create notification:", err);
  }
}

export async function notifyAllAdmins({
  type,
  payload,
}: {
  type: string;
  payload: Record<string, unknown>;
}) {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN", disabledAt: null },
      select: { id: true },
    });

    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        type,
        payload,
      });
    }
  } catch (err) {
    console.error("Failed to notify admins:", err);
  }
}

