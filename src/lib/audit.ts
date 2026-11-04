import { prisma } from "@/lib/prisma";

export type AuditAction =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILURE"
  | "ARTICLE_CREATE"
  | "ARTICLE_EDIT"
  | "ARTICLE_PUBLISH"
  | "ARTICLE_UNPUBLISH"
  | "ARTICLE_DELETE"
  | "ARTICLE_EMERGENCY_REMOVE"
  | "ARTICLE_RESTORE"
  | "TRANSLATION_GENERATE"
  | "TRANSLATION_EDIT"
  | "EDITOR_INVITE"
  | "EDITOR_INVITE_REVOKE"
  | "EDITOR_REGISTER"
  | "ACCOUNT_ACTIVATE"
  | "ACCOUNT_DEACTIVATE"
  | "ADMIN_OVERRIDE";

export async function recordAuditLog({
  userId,
  action,
  entityType,
  entityId,
  ipAddress,
  meta,
}: {
  userId: string;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  ipAddress?: string;
  meta?: Record<string, unknown> | string;
}) {
  try {
    const metaString = typeof meta === "object" ? JSON.stringify(meta) : meta;
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        ipAddress: ipAddress || "127.0.0.1",
        meta: metaString,
      },
    });
  } catch (err) {
    console.error("Failed to record audit log:", err);
  }
}

