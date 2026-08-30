import { NextResponse } from "next/server";
import { NotificationService } from "@/services/notificationService";
import { getServerSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ notifications: [] });
    }

    const notifications = await NotificationService.getUserNotifications(session.userId);
    return NextResponse.json({ notifications });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch notifications" }, { status: 500 });
  }
}
