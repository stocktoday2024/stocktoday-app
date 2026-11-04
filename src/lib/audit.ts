import { prisma } from "@/lib/prisma";

export type AuditAction =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILURE"
  | "USER_LOGIN"
  | "ARTICLE_CREATE"
  | "ARTICLE_CREATED"
  | "ARTICLE_EDIT"
  | "ARTICLE_UPDATED"
  | "ARTICLE_PUBLISH"
  | "ARTICLE_PUBLISHED"
  | "ARTICLE_UNPUBLISH"
  | "ARTICLE_UNPUBLISHED"
  | "ARTICLE_DELETE"
  | "ARTICLE_SOFT_DELETED"
  | "ARTICLE_PERMANENTLY_DELETED"
  | "ARTICLE_EMERGENCY_REMOVE"
  | "ARTICLE_EMERGENCY_REMOVED"
  | "ARTICLE_RESTORE"
  | "ARTICLE_RESTORED"
  | "ARTICLE_VERSION_RESTORED"
  | "TRANSLATION_GENERATE"
  | "TRANSLATION_EDIT"
  | "EDITOR_INVITE"
  | "EDITOR_INVITATION_CREATED"
  | "EDITOR_INVITATION_ACCEPTED"
  | "EDITOR_INVITE_REVOKE"
  | "EDITOR_INVITATION_REVOKED"
  | "EDITOR_REGISTER"
  | "EDITOR_ACTIVATED"
  | "EDITOR_DEACTIVATED"
  | "EDITOR_PASSWORD_RESET"
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

