import { db, DBNotification } from "@/db/client";

export class NotificationService {
  public static async getUserNotifications(userId: string): Promise<DBNotification[]> {
    return db.listNotificationsByUserId(userId);
  }

  public static async emitNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: DBNotification["type"];
    link?: string;
  }): Promise<DBNotification> {
    return db.createNotification(data);
  }
}

export class AuditLogService {
  public static async logAction(data: {
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    details?: string;
  }): Promise<void> {
    console.log(`[AUDIT] ${new Date().toISOString()} | Action: ${data.action} | Entity: ${data.entityType}:${data.entityId || "N/A"} | User: ${data.userId || "anonymous"}`);
  }
}
